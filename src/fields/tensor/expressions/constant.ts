import { FieldPoint } from "../../point.js";
import { FieldPointType } from "../../type.js";
import { FieldPointVector } from "../../vectorized/point.js";
import { FieldPointTensorExpression, FieldPointTensorExpressionContext } from "../expression.js";
import * as tf from "@tensorflow/tfjs"
import { FieldPointTensor, field_point_tensor_dispose, field_point_tensor_encode } from "../tensor.js";
import { TensorShape, rankOfShape } from "../../../utils/tf-rank.js";
import { FieldPointTensorSpace, FieldPointTensorTopology } from "../topology.js";

export class FieldPointTensorExpressionConstant<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank
    >
    implements FieldPointTensorExpression<T, R> {
    private tensor!: FieldPointTensor<T, R>
    private _topology!: FieldPointTensorTopology<R>
    
    get topology() {
        return this._topology
    }

    constructor(
        public readonly type: FieldPointType<T>,
        public readonly space: FieldPointTensorSpace<R>,
        public readonly data: FieldPointVector<T>,
        public readonly dtype?: tf.NumericDataType
    ) { }

    init(context: FieldPointTensorExpressionContext): void {
        this._topology = <FieldPointTensorTopology<R>>context.topologies.get(this.space)!
        this.tensor = field_point_tensor_encode(this.type, this.topology.shape, this.dtype, this.data)
    }

    dispose(): void {
        field_point_tensor_dispose(this.type, this.tensor)
    }

    eval(context: FieldPointTensorExpressionContext): FieldPointTensor<T, R> {
        return this.tensor
    }
}