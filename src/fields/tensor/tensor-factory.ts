import { FieldPoint } from "../point.js";
import * as tf from "@tensorflow/tfjs"
import { FieldPointTensor } from "./tensor.js";
import { FieldPointType } from "../type.js";
import { TensorShape } from "../../utils/tf-rank.js";

export interface FieldPointTensorFactory<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
        TensorT extends tf.Tensor<R> = tf.Tensor<R>,
        FieldPointTensorT extends FieldPointTensor<T, R, TensorT> = FieldPointTensor<T, R, TensorT>
    > {
    init(
        type: FieldPointType<T>,
        shape: TensorShape<R>
    ): FieldPointTensorT
}

export interface FieldPointTensorEncoding<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
        TensorT extends tf.Tensor<R> = tf.Tensor<R>,
        FieldPointTensorT extends FieldPointTensor<T, R, TensorT> = FieldPointTensor<T, R, TensorT>,
        Item = any,
        Context = any
    > {
    decode(
        type: FieldPointType<T>,
        rank: R,
        item: Item,
        context: Context
    ): FieldPointTensorFactory<
        T,
        R,
        TensorT,
        FieldPointTensorT
    > | undefined

    encode(
        type: FieldPointType<T>,
        shape: TensorShape<R>,
        tensor: FieldPointTensorT
    ): Item | undefined
}