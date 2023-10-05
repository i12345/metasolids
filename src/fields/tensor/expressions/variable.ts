import { FieldPoint } from "../../point.js";
import * as tf from '@tensorflow/tfjs'
import { FieldPointTensorExpression, FieldPointTensorExpressionContext } from "../expression.js";
import { FieldPointTensorVariable } from "../variable.js";
import { FieldPointTensor } from "../tensor.js";

export class FieldPointTensorExpressionVariable<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank
    > implements
    FieldPointTensorExpression<T, R> {
    get type() {
        return this.variable.type
    }

    get rank() {
        return this.variable.rank
    }
    
    constructor(public readonly variable: FieldPointTensorVariable<T, R>) { }
    
    init(context: FieldPointTensorExpressionContext): void {
    }

    dispose(): void {
    }

    eval(context: FieldPointTensorExpressionContext): FieldPointTensor<T, R> {
        return context.variables.get(this.variable)!
    }
}