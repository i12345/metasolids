import { FieldPoint } from "../../point.js";
import { FieldPointType } from "../../type.js";
import { FieldPointVector } from "../../vectorized/point.js";
import { FieldPointTensorExpression, FieldPointTensorExpressionContext } from "../expression.js";
import * as tf from "@tensorflow/tfjs"
import { FieldPointTensor, field_point_tensor_dispose, field_point_tensor_encode } from "../tensor.js";
import { rankOfShape } from "../../../utils/tf-rank.js";

export class FieldPointTensorExpressionConstant<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank
    >
    implements FieldPointTensorExpression<T, R> {
    private tensor!: FieldPointTensor<T, R>
    
    get rank(): R {
        return rankOfShape(this.shape)
    }
    
    constructor(
        public readonly type: FieldPointType<T>,
        public readonly shape: tf.ShapeMap[R],
        public readonly data: FieldPointVector<T>,
        public readonly dtype?: tf.NumericDataType
    ) { }

    init(context: FieldPointTensorExpressionContext): void {
        this.tensor = field_point_tensor_encode(this.type, this.shape, this.dtype, this.data)
    }

    dispose(): void {
        field_point_tensor_dispose(this.type, this.tensor)
    }

    eval(context: FieldPointTensorExpressionContext): FieldPointTensor<T, R> {
        return this.tensor
    }
}