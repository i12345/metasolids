import * as tf from '@tensorflow/tfjs'
import { extract, intract } from "../../paradigm/trees/index.js"
import { FieldPointTensorStatement, FieldPointTensorStatementContext } from "./statement.js"
import { FieldPointTensor, field_point_tensor_map } from "./tensor.js"
import { FieldPointTensorExpression } from "./expression.js"
import { FieldPointTensorVariable, FieldPointTensorVariableInitializationContext, FieldPointTensorVariableMap } from "./variable.js"
import { FieldPointType } from "../type.js"
import { FieldPointTensorFactory } from "./factory.js"

export type FieldPointTensorSystemParameters = {
    dt: number
}

export class FieldPointTensorSystem {
    constructor(
        public variables: FieldPointTensorVariable[],
        public statement: FieldPointTensorStatement,
        public end: FieldPointTensorExpression<boolean, tf.Rank.R0>
    ) { }

    get parametersType(): FieldPointType<FieldPointTensorSystemParameters> {
        const types: FieldPointType<FieldPointTensorSystemParameters> = {
            dt: Number,
        }

        for (const variable of this.variables)
            for (const parameter of variable.topology.shape.values())
                if (parameter instanceof Array)
                    intract(types, parameter, Number)
        
        return types
    }

    instance(parameters: FieldPointTensorSystemParameters, initializers: Map<FieldPointTensorVariable, FieldPointTensorFactory>): FieldPointTensorSystemRunner {
        return new FieldPointTensorSystemRunner(this, parameters, initializers)
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

    constructor(
        public readonly system: FieldPointTensorSystem,
        public readonly parameters: FieldPointTensorSystemParameters,
        public readonly initializers: Map<FieldPointTensorVariable, FieldPointTensorFactory>
    ) {
        this.context = {
            parameters,
            toplogies: new Map(),
            runner: this,
            variables: new FieldPointTensorVariableMap(system.variables.map(variable => variable.instance(initializers.get(variable))))
        }
    }

    init() {
        this.context.variables.init(this.context)
        this.system.statement.init(this.context)
        this.system.end.init(this.context)
    }

    update() {
        return tf.tidy(() => {
            const result = this.system.statement.update(this.context)

            const dt = tf.scalar(this.parameters.dt)

            if (result.differentials) {
                for (const [buffer, differential] of result.differentials) {
                    const currentValue = this.context.variables.get(buffer)!
                    const newValue = <FieldPointTensor>field_point_tensor_map(
                        buffer.type,
                        currentValue,
                        (raw, path) => <any>tf.add(raw, extract<tf.Tensor>(differential, path).mul(dt))
                    )
                    this.context.variables.set(buffer, newValue)
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
