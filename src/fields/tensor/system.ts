import * as tf from '@tensorflow/tfjs'
import { extract, intract } from "../../paradigm/trees/index.js"
import { FieldPointTensorStatement, FieldPointTensorStatementContext } from "./statement.js"
import { FieldPointTensor, field_point_tensor_map } from "./tensor.js"
import { FieldPointTensorExpression } from "./expression.js"
import { FieldPointTensorVariable, FieldPointTensorVariableInitializationContext, FieldPointTensorVariableInstance, FieldPointTensorVariableMap } from "./variable.js"
import { FieldPointType } from "../type.js"
import { FieldPointTensorFactory } from "./tensor-factory.js"
import { FieldPointTensorSpace, FieldPointTensorTopologyProjectorFactory, field_point_tensor_topology_instance } from './topology.js'
import { FieldsPoint } from '../point.js'
import { unique } from '../../utils/unique.js'

export interface FieldPointTensorSystemParameters extends FieldsPoint {
    dt: number
}

export class FieldPointTensorSystem {
    constructor(
        public spaces: FieldPointTensorSpace[],
        public variables: FieldPointTensorVariable[],
        public statement: FieldPointTensorStatement,
        public end: FieldPointTensorExpression<boolean, tf.Rank.R0>
    ) { }

    get parametersType(): FieldPointType<FieldPointTensorSystemParameters> {
        const types: FieldPointType<FieldPointTensorSystemParameters> = {
            dt: Number,
        }

        for (const variable of this.variables)
            for (const parameter of variable.space.shape.values())
                if (parameter instanceof Array)
                    intract(types, parameter, Number)
        
        return types
    }

    instance(
            parameters: FieldPointTensorSystemParameters,
            initializers: Map<FieldPointTensorVariable, FieldPointTensorFactory>,
            topologyProjectors: Map<FieldPointTensorSpace, FieldPointTensorTopologyProjectorFactory>,
        ): FieldPointTensorSystemRunner {
        return new FieldPointTensorSystemRunner(this, parameters, initializers, topologyProjectors)
    }
}

export interface FieldPointTensorSystemRunnerContext
    extends
    FieldPointTensorStatementContext,
    FieldPointTensorVariableInitializationContext {
    runner: FieldPointTensorSystemRunner
}

export class FieldPointTensorSystemRunner {
    readonly context: FieldPointTensorSystemRunnerContext
    readonly variables = new Map<FieldPointTensorVariable, FieldPointTensorVariableInstance>()

    private iteration = 0

    constructor(
        public readonly system: FieldPointTensorSystem,
        public readonly parameters: FieldPointTensorSystemParameters,
        public readonly initializers: Map<FieldPointTensorVariable, FieldPointTensorFactory>,
        public readonly topologyProjectors: Map<FieldPointTensorSpace, FieldPointTensorTopologyProjectorFactory>,
    ) {
        for (const variable of system.variables)
            this.variables.set(variable, variable.instance(initializers.get(variable)))

        this.context = {
            parameters,
            topologies: new Map(),
            runner: this,
            variables: new FieldPointTensorVariableMap(this.variables)
        }

        for (const space of system.spaces)
            this.context.topologies.set(space, field_point_tensor_topology_instance(space, parameters, topologyProjectors))
    }

    init() {
        this.context.variables.init(this.context)
        this.system.statement.init(this.context)
        this.system.end.init(this.context)
    }

    update() {
        return tf.tidy(() => {
            console.log(`starting iteration ${this.iteration++}`)
            
            const result = this.system.statement.update(this.context)

            const dt = tf.scalar(this.parameters.dt)

            if (result.differentials) {
                for (const [variable, differential] of result.differentials) {
                    if (differential.length === 0) continue
                    const differential_sum = field_point_tensor_map(
                        variable.type,
                        differential[0],
                        (_, path) => tf.addN(differential.map(differential => extract(differential, path)))
                    )
                    
                    const projector = this.context.topologies.get(variable.space)!.projector

                    const differential_projected = projector ? field_point_tensor_map(
                        variable.type,
                        differential_sum,
                        raw => projector.project_delta(raw)
                    ) : differential_sum

                    const currentValue = this.context.variables.get(variable)!
                    
                    const newValue = field_point_tensor_map(
                        variable.type,
                        currentValue,
                        (raw, path) => tf.add(raw, tf.mul(dt, extract<tf.Tensor>(differential_projected, path)))
                    )

                    this.context.variables.set(variable, newValue)
                }
            }

            if (result.values)
                for (const [buffer, value] of result.values)
                    this.context.variables.set(buffer, value)

            const complete = this.system.end.eval(this.context).dataSync()[0] !== 0

            return {
                complete,
            }
        })
    }

    dispose() {
        this.context.variables.dispose()
        this.system.statement.dispose()
        this.system.end.dispose()
    }
}
