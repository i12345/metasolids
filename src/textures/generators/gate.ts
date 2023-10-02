import { FieldPoint, field_point_map } from "../../fields/point.js";
import { extract, intract } from "../../paradigm/trees/index.js";
import { GeneratorValue, Generator, GeneratorContext, GeneratorResult, field_point_vector_tensor_map, FieldPointVectorTensor } from "../generator.js";
import * as tf from "@tensorflow/tfjs"

export class GateGenerator implements Generator {
    constructor(
        public readonly condition: GeneratorValue<number>,
        public readonly child: Generator,
    ) { }

    init(context: GeneratorContext): void {
        this.condition.init(context)
        this.child.init(context)
    }

    update(context: GeneratorContext): GeneratorResult {
        //TODO: short-circuit when condition is completely zero
        const result = this.child.update(context)
        const condition_value = this.condition.eval(context)

        if (result.differentials) {
            for (const differential of result.differentials) {
                result.differentials.set(
                    differential[0],
                    differential[1].length === 0 ?
                        [] :
                        [<FieldPointVectorTensor>field_point_vector_tensor_map(
                            differential[0].type,
                            differential[1].length === 1 ?
                                differential[1][0] :
                                <FieldPointVectorTensor>field_point_vector_tensor_map(
                                    differential[0].type,
                                    differential[1][0],
                                    (_, path) => <any>tf.addN(differential[1].map(t => extract<tf.Tensor>(t, path)))
                                ),
                            raw => <any>condition_value.mul(raw)
                        )]
                )
            }
        }

        if (result.values) {
            const condition_inverse = tf.sub(1, condition_value)

            for (const value of result.values) {
                const currentValue = context.buffers.get(value[0])!

                result.values.set(
                    value[0],
                    <FieldPointVectorTensor>field_point_vector_tensor_map(
                        value[0].type,
                        value[1],
                        (newValue, path) => <any>tf.add(
                            condition_value.mul(newValue),
                            condition_inverse.mul(extract<tf.Tensor>(currentValue, path))
                        )
                    )
                )
            }
        }

        return result
    }
}