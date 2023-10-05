import { extract } from "../../../paradigm/trees/index.js"
import { field_point_tensor_map, FieldPointTensor } from "../tensor.js"
import { FieldPointTensorStatement, FieldPointTensorStatementResult, FieldPointTensorStatementContext } from "../statement.js"
import { FieldPointTensorExpression } from "../expression.js"
import * as tf from "@tensorflow/tfjs"

export class FieldPointTensorStatementGate implements FieldPointTensorStatement {
    constructor(
        public readonly condition: FieldPointTensorExpression<number>,
        public readonly child: FieldPointTensorStatement,
    ) { }

    init(context: FieldPointTensorStatementContext): void {
        this.condition.init(context)
        this.child.init(context)
    }

    dispose(): void {
        this.condition.dispose()
        this.child.dispose()
    }

    update(context: FieldPointTensorStatementContext): FieldPointTensorStatementResult {
        //TODO: short-circuit when condition is completely zero or false
        const result = this.child.update(context)
        const condition_value = this.condition.eval(context)

        if (result.differentials) {
            for (const differential of result.differentials) {
                result.differentials.set(
                    differential[0],
                    differential[1].length === 0 ?
                        [] :
                        [<FieldPointTensor>field_point_tensor_map(
                            differential[0].type,
                            differential[1].length === 1 ?
                                differential[1][0] :
                                <FieldPointTensor>field_point_tensor_map(
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
                const currentValue = context.variables.get(value[0])!

                result.values.set(
                    value[0],
                    <FieldPointTensor>field_point_tensor_map(
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