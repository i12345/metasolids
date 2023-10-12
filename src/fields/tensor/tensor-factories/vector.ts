import { FieldPoint } from "../../point.js";
import * as tf from "@tensorflow/tfjs"
import { FieldPointTensorEncoding, FieldPointTensorFactory } from "../tensor-factory.js";
import { TensorShape, rankOfShape } from "../../../utils/tf-rank.js";
import { FieldPointType, field_point_type_contains } from "../../type.js";
import { FieldPointTensor, field_point_tensor_decode, field_point_tensor_encode } from "../tensor.js";
import { FieldPointVector, FieldPointVectorContainer, field_point_vector_is } from "../../vectorized/point.js";
import { arrayEq } from "../../../utils/array-eq.js";
import { NumberTypedArray } from "../../../utils/typed-array.js";

export class FieldPointTensorFactoryVector<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>
    >
    implements FieldPointTensorFactory<T, R> {
    constructor(
        public readonly type: FieldPointType<T>,
        public readonly rank: R,
        public readonly data: FieldPointVector<T, Container>,
    ) { }
    
    init(
            type: FieldPointType<T>,
            shape: TensorShape<R>
        ): FieldPointTensor<T, R> {
        if (rankOfShape(shape) !== this.rank)
            throw new Error("shape invalid")

        if (!field_point_type_contains(this.type, type))
            throw new Error("type invalid")
        
        return field_point_tensor_encode(
            this.type,
            shape,
        )
    }
}

export class FieldPointTensorEncodingVector<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
    >
    implements FieldPointTensorEncoding<T, R, tf.Tensor<R>, FieldPointTensor<T, R>, FieldPointVector<T>> {
    decode(
            type: FieldPointType<T>,
            rank: R,
            item: FieldPointVector<T>,
            context: any
        ): FieldPointTensorFactory<T, R> | undefined {
        if (!field_point_vector_is(type, item))
            return undefined

        return new FieldPointTensorFactoryVector(type, rank, item)
    }

    encode(
            type: FieldPointType<T>,
            shape: TensorShape<R>,
            tensor: FieldPointTensor<T, R>
        ): FieldPointVector<T> {
        const decoded = field_point_tensor_decode(type, tensor)
        if (!arrayEq(decoded.shape, shape))
            throw new Error()

        return decoded.vector
    }

    private constructor() { }
    static readonly instance = new this()
}