import { FieldPoint, FieldPointMapped, field_point_is, field_point_map } from "../../point.js";
import { FieldPointNumbers, field_point_numbers_decode, field_point_numbers_type } from "../../numbers.js";
import { field_point_numbers_encode } from "../../numbers.js";
import * as tf from "@tensorflow/tfjs"
import { FieldPointTensorEncoding, FieldPointTensorFactory } from "../tensor-factory.js";
import { TensorShape } from "../../../utils/tf-rank.js";
import { FieldPointType, field_point_type_contains, field_point_type_default } from "../../type.js";
import { FieldPointTensor, field_point_tensor_encode, field_point_tensor_map } from "../tensor.js";
import { extract } from "../../../paradigm/trees/tree.js";
import { field_point_vectorized_new } from "../../vectorized/point.js";

export class FieldPointTensorFactoryConstant<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank
    >
    implements FieldPointTensorFactory<T, R> {
    constructor(
        public readonly type: FieldPointType<T>,
        public readonly rank: R,
        public readonly value: T
    ) { }
    
    init(
            type: FieldPointType<T>,
            shape: TensorShape<R>
        ): FieldPointTensor<T, R> {
        if (!field_point_type_contains(this.type, type))
            throw new Error("invalid type")
        
        const numbers = field_point_numbers_encode(this.value)
        
        return field_point_tensor_map(
            type,
            undefined!,
            (_, path) => tf.scalar(extract(numbers, path), extract(type, path) === Boolean ? 'bool' : 'float32').broadcastTo(shape)
        )
    }
}

export class FieldPointTensorEncodingConstant<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank
    >
    implements FieldPointTensorEncoding<
        T,
        R,
        tf.Tensor<R>,
        FieldPointTensor<T, R>,
        T
    > {
    decode(
            type: FieldPointType<T>,
            rank: R,
            item: T,
            context: any
        ): FieldPointTensorFactory<T, R> | undefined {
        if (!field_point_is(item) ||
            !field_point_type_contains(field_point_type_default(item), type))
            return undefined

        return new FieldPointTensorFactoryConstant(type, rank, item)
    }

    encode(
            type: FieldPointType<T>,
            shape: TensorShape<R>,
            tensor: FieldPointTensor<T, R>
        ): T | undefined {
        if (shape.reduce((acc, x) => acc * x, 1) !== 1)
            return undefined

        const numbers = <FieldPointNumbers<T>><unknown>field_point_tensor_map(
            type,
            tensor,
            raw => raw.dataSync()[0]
        )

        return field_point_numbers_decode(type, numbers)
    }

    private constructor() { }
    static readonly instance = new this()
}