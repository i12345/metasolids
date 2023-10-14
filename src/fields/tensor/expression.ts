import { FieldPoint } from "../point.js"
import { FieldPointType } from "../type.js"
import * as tf from '@tensorflow/tfjs'
import { FieldPointTensor } from "./tensor.js"
import { FieldPointTensorVariableMap } from "./variable.js"
import { FieldPointTensorContextWithSpaceTopologies, FieldPointTensorTopology } from "./topology.js"

export interface FieldPointTensorExpressionContext extends FieldPointTensorContextWithSpaceTopologies {
    variables: FieldPointTensorVariableMap
}

export interface FieldPointTensorExpression<
    T extends FieldPoint = FieldPoint,
    R extends tf.Rank = tf.Rank
> {
    type: FieldPointType<T>
    topology: FieldPointTensorTopology<R>

    init(context: FieldPointTensorExpressionContext): void
    dispose(): void

    eval(context: FieldPointTensorExpressionContext): FieldPointTensor<T, R>
}
