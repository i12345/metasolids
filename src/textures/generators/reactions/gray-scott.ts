// https://arxiv.org/pdf/patt-sol/9304003.pdf
// mrob.com/pub/comp/xmorphia/pearson-classes.html
//https://math.libretexts.org/Bookshelves/Scientific_Computing_Simulations_and_Modeling/Book%3A_Introduction_to_the_Modeling_and_Analysis_of_Complex_Systems_(Sayama)/13%3A_Continuous_Field_Models_I__Modeling/13.06%3A_Reaction-Diffusion_Systems

import * as tf from "@tensorflow/tfjs"
import { GeneratorBuffer, GeneratorValue, Generator, GeneratorContext, GeneratorResult } from "../../generator.js"

export class GrayScottReaction<
        R extends tf.Rank = tf.Rank
    > implements Generator {
    constructor(
        public readonly u: GeneratorBuffer<number, R>,
        public readonly v: GeneratorBuffer<number, R>,
        public readonly F: GeneratorValue<number, R>,
        public readonly k: GeneratorValue<number, R>,
    ) { }

    init(context: GeneratorContext): void {
        this.F.init(context)
        this.k.init(context)
    }

    update(context: GeneratorContext): GeneratorResult {
        const F = this.F.eval(context)
        const k = this.k.eval(context)

        const u = context.buffers.get(this.u)!
        const v = context.buffers.get(this.v)!

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
                [<GeneratorBuffer>this.u, [du]],
                [<GeneratorBuffer>this.v, [dv]],
            ])
        }
    }
}