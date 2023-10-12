import { FieldPoint, FieldsPoint } from "../point.js"
import { FieldPointType } from "../type.js"
import * as tf from '@tensorflow/tfjs'
import { extract } from "../../paradigm/trees/index.js"
import { FieldPointTensor, field_point_tensor_encode, field_point_tensor_map } from "./tensor.js"
import { FieldPointTensorFactory } from "./tensor-factory.js"
import { field_point_vectorized_new } from "../vectorized/point.js"
import { FieldPointTensorSpace, FieldPointTensorTopology, FieldPointTensorTopologyProjectorFactory, field_point_tensor_topology_instance } from "./topology.js"

export class FieldPointTensorVariable<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
    > {
    get rank() {
        return <R>[tf.Rank.R0, tf.Rank.R1, tf.Rank.R2, tf.Rank.R3, tf.Rank.R4, tf.Rank.R5, tf.Rank.R6][this.space.shape.length]
    }
    
    constructor(
        public type: FieldPointType<T>,
        public space: FieldPointTensorSpace<R>,
        public name?: string
    ) { }

    instance(factory?: FieldPointTensorFactory<T, R>) {
        return new FieldPointTensorVariableInstance(this, factory)
    }
}

export interface FieldPointTensorVariableInitializationContext {
    parameters: FieldsPoint
    toplogies: Map<FieldPointTensorSpace, FieldPointTensorTopology>
}

export class FieldPointTensorVariableInstance<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
    > {
    register!: FieldPointTensor<T, R, tf.Variable<R>>

    topology!: FieldPointTensorTopology<R>

    constructor(
        public readonly definition: FieldPointTensorVariable<T, R>,
        public readonly factory?: FieldPointTensorFactory<T, R>
    ) {}

    init(context: FieldPointTensorVariableInitializationContext) {
        this.topology = <FieldPointTensorTopology<R>>context.toplogies.get(this.definition.space)
        context.toplogies.set(this.definition.space, this.topology)

        const initialData =
            this.factory ?
                this.factory.init(
                    this.definition.type,
                    this.topology.shape
                ) :
                field_point_tensor_encode(
                        this.definition.type,
                        this.topology.shape,
                        undefined,
                        field_point_vectorized_new(
                            this.definition.type,
                            this.topology.shape.reduce((acc, value) => acc * value, 1),
                            false
                        )
                    )
        
        this.register = field_point_tensor_map(
            this.definition.type,
            initialData,
            raw => tf.variable(raw)
        )
    }
}

export class FieldPointTensorVariableMap extends Map<FieldPointTensorVariable, FieldPointTensor> {
    constructor(
            public readonly variableInstances: Map<FieldPointTensorVariable, FieldPointTensorVariableInstance>
        ) {
        super()
    }
    
    init(context: FieldPointTensorVariableInitializationContext) {
        for (const variableInstance of this.variableInstances.values()) {
            variableInstance.init(context)
            super.set(variableInstance.definition, variableInstance.register)
        }
    }

    get<
            T extends FieldPoint = FieldPoint,
            R extends tf.Rank = tf.Rank
        >(variable: FieldPointTensorVariable<T, R>): FieldPointTensor<T, R> | undefined {
        return <FieldPointTensor<T, R>>super.get(<FieldPointTensorVariable>variable)
    }

    set<
            T extends FieldPoint = FieldPoint,
            R extends tf.Rank = tf.Rank
        >(
            variable: FieldPointTensorVariable<T, R>,
            value: FieldPointTensor<T, R>
        ): this {
        if (!this.has(variable))
            throw new Error()
        
        const variableInstance = <FieldPointTensorVariableInstance<T, R>>this.variableInstances.get(variable)!
        const projector = variableInstance.topology.projector

        field_point_tensor_map(
            variable.type,
            this.get(variable)!,
            (raw, path) => {
                const variable = <tf.Variable<R>>raw
                const newValue = extract<tf.Tensor<R>>(value, path)
                const newValue_projected = projector ? projector.project_update(newValue) : newValue
                variable.assign(newValue_projected)
            }
        )
        return this
    }

    has<
            T extends FieldPoint = FieldPoint,
            R extends tf.Rank = tf.Rank
        >(variable: FieldPointTensorVariable<T, R>): boolean {
        return super.has(<FieldPointTensorVariable>variable)
    }

    delete<
            T extends FieldPoint = FieldPoint,
            R extends tf.Rank = tf.Rank
        >(variable: FieldPointTensorVariable<T, R>): boolean {
        const register = this.get(variable)
        if (register) {
            this.variableInstances.delete(variable)

            field_point_tensor_map(
                variable.type,
                register!,
                raw => {
                    const variable = <tf.Variable<R>>raw
                    variable.dispose()
                }
            )
        }

        return super.delete(<FieldPointTensorVariable>variable)
    }

    dispose() {
        for (const variable of this.variableInstances.keys())
            this.delete(variable)
    }
}