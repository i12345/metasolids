import { FieldPoint } from "../point.js"
import { FieldPointType } from "../type.js"
import * as tf from '@tensorflow/tfjs'
import { PerRank } from "../../utils/tf-rank.js"
import { PropertyPath } from "../../paradigm/trees/path.js"
import { extract } from "../../paradigm/trees/index.js"
import { FieldPointTensor, field_point_tensor_encode, field_point_tensor_map } from "./tensor.js"
import { FieldPointTensorFactory } from "./factory.js"
import { field_point_vectorized_new } from "../vectorized/point.js"

export class FieldPointTensorVariable<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
    > {
    get rank() {
        return <R>[tf.Rank.R0, tf.Rank.R1, tf.Rank.R2, tf.Rank.R3, tf.Rank.R4, tf.Rank.R5, tf.Rank.R6][this.shape.length]
    }
    
    constructor(
        public type: FieldPointType<T>,
        public shape: PerRank<number | PropertyPath, R>,
        public name?: string
    ) { }

    realShape(parameters: FieldPoint): PerRank<number, R> {
        return <PerRank<number, R>>this.shape.map(semantic => typeof semantic === 'number' ?
            semantic :
            extract<number>(parameters, semantic)
        )
    }

    instance(factory?: FieldPointTensorFactory<T, R>) {
        return new FieldPointTensorVariableInstance(this, factory)
    }
}

export interface FieldPointTensorVariableInitializationContext {
    parameters: FieldPoint
}

export class FieldPointTensorVariableInstance<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
        Item = any,
        Context = any,
    > {
    register!: FieldPointTensor<T, R, tf.Variable<R>>

    constructor(
        public readonly definition: FieldPointTensorVariable<T, R>,
        public readonly factory?: FieldPointTensorFactory<T, R>
    ) {}

    init(context: FieldPointTensorVariableInitializationContext) {
        const shape = this.definition.realShape(context.parameters)
        const initialData =
            this.factory ?
                this.factory.factory(
                        this.definition.type,
                        shape
                    ) :
                field_point_tensor_encode(
                        this.definition.type,
                        shape,
                        undefined,
                        field_point_vectorized_new(
                            this.definition.type,
                            shape.reduce((acc, value) => acc * value, 1),
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
            public readonly variableInstances: FieldPointTensorVariableInstance[]
        ) {
        super()
    }
    
    init(context: FieldPointTensorVariableInitializationContext) {
        for (const variableInstance of this.variableInstances) {
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

        field_point_tensor_map(
            variable.type,
            this.get(variable)!,
            (raw, path) => {
                const variable = <tf.Variable<R>>raw
                const change_value = extract<tf.Tensor<R>>(value, path)
                variable.assign(change_value)
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
            this.variableInstances.splice(this.variableInstances.findIndex(variableInstance => variableInstance.definition === variable), 1)

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
        for (const variableInstance of this.variableInstances)
            this.delete(variableInstance.definition)
    }
}