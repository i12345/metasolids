import { FieldPoint } from "../../fields/point.js";
import * as tf from "@tensorflow/tfjs"
import { Generator, GeneratorBuffer, GeneratorContext, GeneratorResult, GeneratorValue } from "../generator.js";

export class PDEGenerator<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank
    > implements Generator {
    constructor(
        public readonly variable: GeneratorBuffer<T, R>,
        public readonly differential: GeneratorValue<T, R>,
    ) { }
    
    init(context: GeneratorContext): void {
        this.differential.init(context)
    }

    update(context: GeneratorContext): GeneratorResult {
        return {
            differentials: new Map([
                [
                    <GeneratorBuffer>this.variable,
                    [this.differential.eval(context)]
                ]
            ])
        }
    }
}