import * as tf from "@tensorflow/tfjs"
import { FieldPointTensorStatement, FieldPointTensorStatementContext, FieldPointTensorStatementResult } from "../statement.js"
import { FieldPointTensorVariable } from "../variable.js"
import { Per2PRank, RankAtOrBelow, RankNext, RankPrev, ScalarN } from "../../../utils/tf-rank.js"
import { FieldPointTensor } from "../tensor.js"
import { FieldPointTensorExpression } from "../expression.js"
import { FieldPointTensorSystemRunnerContext } from "../system.js"
import { renderTensor } from "../../../utils/tf-img.js"

export class FieldPointTensorStatementDiffusion<
        T extends number = number,
        R extends tf.Rank.R2 = tf.Rank.R2
    > implements FieldPointTensorStatement {
    private spaceStretch_reciprocal!: Per2PRank<tf.Tensor<R>, R>
    private dimensions!: Per2PRank<Per2PRank<number, RankAtOrBelow<R>>, R>

    constructor(
        public readonly variable: FieldPointTensorVariable<T, R>,
        //this will be changed to topology field
        public readonly spaceStretch: FieldPointTensorVariable<ScalarN<R>, R>,
        public readonly rate: FieldPointTensorExpression<boolean, R>,
    ) { }

    init(context: FieldPointTensorStatementContext): void {
        const spaceStretch = <FieldPointTensor<ScalarN<R>, R>>context.variables.get(this.spaceStretch)!
        const valid = (<FieldPointTensorSystemRunnerContext>context).topologies.get(this.variable.space)!.projector?.mask
        
        const rank = this.spaceStretch.space.shape.length

        this.spaceStretch_reciprocal = <Per2PRank<tf.Tensor<R>, R>>new Array(1 << rank)
        this.dimensions = <Per2PRank<Per2PRank<number, RankAtOrBelow<R>>, R>>new Array(1 << rank)

        for (let var_bits = 1; var_bits < (1 << rank); var_bits++) {
            this.spaceStretch_reciprocal[var_bits] = tf.tidy(() => {
                const lengths: tf.Tensor<R>[] = []
                const dimensions: number[] = []
                for (let var_i = 0; var_i < rank; var_i++) {
                    if ((var_bits & (1 << var_i)) !== 0) {
                        lengths.push((<Record<number, tf.Tensor<R>>>spaceStretch)[var_i])
                        dimensions.push(var_i)
                    }
                }
                const spaceStretch_reciprocal = tf.addN(lengths.map(length => length.square())).sqrt().reciprocal()
                this.dimensions[var_bits] = <Per2PRank<number, RankAtOrBelow<R>>>dimensions

                if (valid)
                    return spaceStretch_reciprocal.where(valid, 0)
                return spaceStretch_reciprocal
            })
        }
    }

    dispose(): void {
        tf.dispose(this.spaceStretch_reciprocal)
    }

    update(context: FieldPointTensorStatementContext): FieldPointTensorStatementResult {
        const x = context.variables.get(this.variable)!

        const valid = (<FieldPointTensorSystemRunnerContext>context).topologies.get(this.variable.space)!.projector?.mask

        const rank = this.spaceStretch.space.shape.length

        const y: tf.Tensor<R>[] = []

        for (let var_bits = 1; var_bits < (1 << rank); var_bits++) {
            const spaceStretch_reciprocal = this.spaceStretch_reciprocal[var_bits]
            const dimensions = this.dimensions[var_bits]

            for (let fwd_mask = 0; fwd_mask < (1 << dimensions.length); fwd_mask++) {
                y.push(tf.tidy(() => {
                    const slice_start = new Array<number>(rank).fill(0)
                    const slice_size = [...x.shape]
                    const paddings = <[number, number][]>x.shape.map(() => [0, 0])

                    for (let i_axis = 0; i_axis < dimensions.length; i_axis++) {
                        const isForward = (fwd_mask & (1 << i_axis)) === 0
                        slice_start[dimensions[i_axis]] = isForward ? 0 : 1
                        slice_size[dimensions[i_axis]] -= 1
                        paddings[dimensions[i_axis]] = isForward ? [1, 0] : [0, 1]
                    }

                    const x_offset = x.slice(slice_start, slice_size).pad(paddings)
                    const valid_offset = valid.slice(slice_start, slice_size).pad(paddings)
                    const spaceStretch_reciprocal_offset = spaceStretch_reciprocal.slice(slice_start, slice_size).pad(paddings)
                    
                    const x_delta_in = tf.sub(x_offset, x)
                    const spaceStretch_reciprocal_in = tf.add(spaceStretch_reciprocal, spaceStretch_reciprocal_offset).div(2)
                    // const spaceStretch_reciprocal_in = spaceStretch_reciprocal
                    const diffuse_in = x_delta_in.mul(spaceStretch_reciprocal_in).where(valid_offset, 0)
                    // return <tf.Tensor<R>>diffuse_in
                    for (let i_axis = 0; i_axis < dimensions.length; i_axis++) {
                        const isForward = (fwd_mask & (1 << i_axis)) !== 0
                        slice_start[dimensions[i_axis]] = isForward ? 0 : 1
                        paddings[dimensions[i_axis]] = isForward ? [1, 0] : [0, 1]
                    }
                    
                    const diffuse_out = diffuse_in.slice(slice_start, slice_size).pad(paddings)

                    // // renderTensor(<tf.Tensor2D>diffuse_out, tf.max(diffuse_out).dataSync()[0])

                    // return <tf.Tensor<R>>diffuse_out
                    return tf.sub(diffuse_in, diffuse_out)
                }))
            }
        }

        // renderTensor(<tf.Tensor2D>x, 1) // tf.max(sum).dataSync()[0])
        // renderTensor(<tf.Tensor2D>y[0], 1.5, "y_0_") // tf.max(sum).dataSync()[0])
        // renderTensor(<tf.Tensor2D>y[1], 1.5, "y_1_") // tf.max(sum).dataSync()[0])
        // renderTensor(<tf.Tensor2D>y[2], 1.5, "y_2_") // tf.max(sum).dataSync()[0])
        // renderTensor(<tf.Tensor2D>y[3], 1.5, "y_3_") // tf.max(sum).dataSync()[0])
        // renderTensor(<tf.Tensor2D>y[4], 1.5, "y_4_") // tf.max(sum).dataSync()[0])

        const sum = tf.addN(y)
        tf.dispose(y)

        // renderTensor(<tf.Tensor2D>this.spaceStretch_reciprocal[1], 10)
        // renderTensor(<tf.Tensor2D>this.spaceStretch_reciprocal[2], 10)
        // renderTensor(<tf.Tensor2D>this.spaceStretch_reciprocal[3], 10)
        // renderTensor(<tf.Tensor2D>x, 1, "x") // tf.max(sum).dataSync()[0])
        // renderTensor(<tf.Tensor2D>sum, 5, "sum") // tf.max(sum).dataSync()[0])

        return {
            differentials: new Map([
                [<FieldPointTensorVariable>this.variable, [sum]]
            ])
        }
    }
}