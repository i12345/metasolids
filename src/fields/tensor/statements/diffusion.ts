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
    /**
     * = reciprocal of length of (
     * instant rate of change in world space
     * given change in texture space
     * by amount of translation for this direction)
     * normalized w.r.t. sum of diffuse rates
     */
    private diffuseRates!: Per2PRank<tf.Tensor<R>, R>
    private dimensions!: Per2PRank<Per2PRank<number, RankAtOrBelow<R>>, R>

    constructor(
        public readonly variable: FieldPointTensorVariable<T, R>,
        //this will be changed to topology field
        public readonly spaceStretch: FieldPointTensorVariable<ScalarN<R>, R>,
        public readonly rate?: FieldPointTensorExpression<number, R | tf.Rank.R0>,
    ) { }

    init(context: FieldPointTensorStatementContext): void {
        const spaceStretch = <FieldPointTensor<ScalarN<R>, R>>context.variables.get(this.spaceStretch)!
        const valid = (<FieldPointTensorSystemRunnerContext>context).topologies.get(this.variable.space)!.projector?.mask
        
        this.rate?.init(context)

        if (this.spaceStretch.space !== this.variable.space)
            throw new Error()

        if (this.rate && this.rate.topology.space.shape.length > 0 && this.rate.topology.space !== this.variable.space)
            throw new Error()

        const rank = this.spaceStretch.space.shape.length

        this.diffuseRates = <Per2PRank<tf.Tensor<R>, R>>new Array(1 << rank)
        this.dimensions = <Per2PRank<Per2PRank<number, RankAtOrBelow<R>>, R>>new Array(1 << rank)

        /** distance moved in world space given single pixel in axis direction */
        const spaceStretch_pixels = new Array(rank).fill(0).map((_, i) => (<Record<number, tf.Tensor<R>>>spaceStretch)[i]).map((t, i) => t.div<tf.Tensor<R>>(t.shape[i]))

        for (let var_bits = 1; var_bits < (1 << rank); var_bits++) {
            this.diffuseRates[var_bits] = tf.tidy(() => {
                const lengths: tf.Tensor<R>[] = []
                const dimensions: number[] = []
                for (let var_i = 0; var_i < rank; var_i++) {
                    if ((var_bits & (1 << var_i)) !== 0) {
                        lengths.push(spaceStretch_pixels[var_i])
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

        tf.tidy(() => {
            const diffuseRates_toSum: tf.Tensor<R>[] = []
            for (let i = 1; i < (1 << rank); i++)
                diffuseRates_toSum.push(tf.mul(this.diffuseRates[i], 2 ** this.dimensions[i].length))
            const diffuseRates_sum = tf.addN(diffuseRates_toSum)
            for (let var_bits = 1; var_bits < (1 << rank); var_bits++) {
                const spaceStretch_pixel_reciprocal = this.diffuseRates[var_bits]
                const diffuseRate = <tf.Tensor<R>>spaceStretch_pixel_reciprocal.div(diffuseRates_sum)
                this.diffuseRates[var_bits] = diffuseRate
                tf.keep(diffuseRate)
                tf.dispose(spaceStretch_pixel_reciprocal)
            }
        })
    }

    dispose(): void {
        tf.dispose(this.diffuseRates)
    }

    update(context: FieldPointTensorStatementContext): FieldPointTensorStatementResult {
        const x = context.variables.get(this.variable)!
        const rate = this.rate?.eval(context) ?? 1
        const rate_over_2 = tf.div(rate, 2)

        const valid = (<FieldPointTensorSystemRunnerContext>context).topologies.get(this.variable.space)!.projector?.mask

        const rank = this.spaceStretch.space.shape.length

        const y: tf.Tensor<R>[] = []

        for (let var_bits = 1; var_bits < (1 << rank); var_bits++) {
            const diffuseRate = this.diffuseRates[var_bits]
            const dimensions = this.dimensions[var_bits]

            for (let fwd_mask = 0; fwd_mask < (1 << (dimensions.length - 1)); fwd_mask++) {
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
                    const diffuseRate_offset = diffuseRate.slice(slice_start, slice_size).pad(paddings)
                    
                    const x_delta_in = <tf.Tensor<R>>tf.sub(x_offset, x)
                    const diffuseRate_in = <tf.Tensor<R>>tf.add(diffuseRate, diffuseRate_offset).mul(rate_over_2)
                    
                    const diffuse_in = x_delta_in.mul(diffuseRate_in).where(valid_offset.logicalAnd(valid), 0)
                    
                    for (let i_axis = 0; i_axis < dimensions.length; i_axis++) {
                        const isForward = (fwd_mask & (1 << i_axis)) !== 0
                        slice_start[dimensions[i_axis]] = isForward ? 0 : 1
                        paddings[dimensions[i_axis]] = isForward ? [1, 0] : [0, 1]
                    }
                    
                    const diffuse_out = diffuse_in.slice(slice_start, slice_size).pad(paddings)

                    return tf.sub(diffuse_in, diffuse_out).where(valid, 0)
                }))
            }
        }

        renderTensor(<tf.Tensor2D>x, 1, "diffusion_") // tf.max(sum).dataSync()[0])
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
        // renderTensor(<tf.Tensor2D>sum, 5, "sum_") // tf.max(sum).dataSync()[0])
        // renderTensor(<tf.Tensor2D>sum.abs(), 5, "sum_abs_") // tf.max(sum).dataSync()[0])

        return {
            differentials: new Map([
                [<FieldPointTensorVariable>this.variable, [sum]]
            ])
        }
    }
}