import { FieldPoint } from "../point.js";
import * as tf from "@tensorflow/tfjs"
import { FieldPointTensor } from "./tensor.js";
import { FieldPointType } from "../type.js";

export interface FieldPointTensorFactory<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
        TensorT extends tf.Tensor<R> = tf.Tensor<R>,
        FieldPointTensorT extends FieldPointTensor<T, R, TensorT> = FieldPointTensor<T, R, TensorT>,
    > {
    factory(
        type: FieldPointType<T>,
        shape: tf.ShapeMap[R]
    ): FieldPointTensorT
}