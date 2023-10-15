import { FieldPoint } from "../../point.js";
import * as tf from '@tensorflow/tfjs'
import { FieldPointTensorExpression, FieldPointTensorExpressionContext } from "../expression.js";
import { FieldPointTensorVariable } from "../variable.js";
import { FieldPointTensor } from "../tensor.js";
import { FieldPointTensorTopology } from "../topology.js";

export class FieldPointTensorExpressionVariable<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank
    > implements
    FieldPointTensorExpression<T, R> {
    private _topology!: FieldPointTensorTopology<R>
    
    get type() {
        return this.variable.type
    }

    get topology() {
        return this._topology
    }
    
    constructor(public readonly variable: FieldPointTensorVariable<T, R>) { }
    
    init(context: FieldPointTensorExpressionContext): void {
        this._topology = <FieldPointTensorTopology<R>>context.topologies.get(this.variable.space)!
    }

    dispose(): void {
    }

    eval(context: FieldPointTensorExpressionContext): FieldPointTensor<T, R> {
        return context.variables.get(this.variable)!
    }
}