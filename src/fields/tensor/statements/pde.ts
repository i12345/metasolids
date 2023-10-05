import { FieldPoint } from "../../point.js"
import * as tf from "@tensorflow/tfjs"
import { FieldPointTensorStatement, FieldPointTensorStatementContext, FieldPointTensorStatementResult } from "../statement.js"
import { FieldPointTensorExpression } from "../expression.js"
import { FieldPointTensorVariable } from "../variable.js"

export class FieldPointTensorStatementPDE<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank
    > implements FieldPointTensorStatement {
    constructor(
        public readonly variable: FieldPointTensorVariable<T, R>,
        public readonly differential: FieldPointTensorExpression<T, R>,
    ) { }
    
    init(context: FieldPointTensorStatementContext): void {
        this.differential.init(context)
    }

    dispose(): void {
        this.differential.dispose()
    }

    update(context: FieldPointTensorStatementContext): FieldPointTensorStatementResult {
        return {
            differentials: new Map([
                [
                    <FieldPointTensorVariable>this.variable,
                    [this.differential.eval(context)]
                ]
            ])
        }
    }
}