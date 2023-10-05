// https://arxiv.org/pdf/patt-sol/9304003.pdf
// mrob.com/pub/comp/xmorphia/pearson-classes.html
//https://math.libretexts.org/Bookshelves/Scientific_Computing_Simulations_and_Modeling/Book%3A_Introduction_to_the_Modeling_and_Analysis_of_Complex_Systems_(Sayama)/13%3A_Continuous_Field_Models_I__Modeling/13.06%3A_Reaction-Diffusion_Systems

import * as tf from "@tensorflow/tfjs"
import { FieldPointTensorStatement, FieldPointTensorStatementContext, FieldPointTensorStatementResult } from "../../statement.js"
import { FieldPointTensorVariable } from "../../variable.js"
import { FieldPointTensorExpression } from "../../expression.js"

export class FieldPointTensorStatementReactionGrayScott<
        R extends tf.Rank = tf.Rank
    > implements FieldPointTensorStatement {
    constructor(
        public readonly u: FieldPointTensorVariable<number, R>,
        public readonly v: FieldPointTensorVariable<number, R>,
        public readonly F: FieldPointTensorExpression<number, R>,
        public readonly k: FieldPointTensorExpression<number, R>,
    ) { }

    init(context: FieldPointTensorStatementContext): void {
        this.F.init(context)
        this.k.init(context)
    }

    dispose(): void {
        this.F.dispose()
        this.k.dispose()
    }

    update(context: FieldPointTensorStatementContext): FieldPointTensorStatementResult {
        const F = this.F.eval(context)
        const k = this.k.eval(context)

        const u = context.variables.get(this.u)!
        const v = context.variables.get(this.v)!

        const uv2 = tf.mul(u, v.square())

        const du = tf.sub(
            F.mul(tf.sub(1, u)),
            uv2
        )

        const dv = tf.add(
            tf.neg(tf.add(F, k)).mul(v),
            uv2
        )

        return {
            differentials: new Map([
                [<FieldPointTensorVariable>this.u, [du]],
                [<FieldPointTensorVariable>this.v, [dv]],
            ])
        }
    }
}