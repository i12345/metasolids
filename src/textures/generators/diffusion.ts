import { FieldPoint } from "../../fields/point.js";
import * as tf from "@tensorflow/tfjs"
import { Generator, GeneratorBuffer, GeneratorContext, GeneratorResult } from "../generator.js";
import { Vec2 } from "playcanvas-extended";
import { RankNext, ScalarN } from "../../utils/tf-rank.js";

export class DiffusionGenerator<
        T extends number = number,
        R extends tf.Rank.R2 = tf.Rank.R2
    > implements Generator {
    private spaceStretch_x_reciprocal!: tf.Tensor<R>
    private spaceStretch_y_reciprocal!: tf.Tensor<R>
    private spaceStretch_xy_reciprocal!: tf.Tensor<R>
    
    constructor(
        public readonly variable: GeneratorBuffer<T, R>,
        public readonly spaceStretch: GeneratorBuffer<ScalarN<R>, R>
    ) { }

    init(context: GeneratorContext): void {
        const spaceStretch = context.buffers.get(this.spaceStretch)!
        this.spaceStretch_x_reciprocal = spaceStretch.x.reciprocal()
        this.spaceStretch_y_reciprocal = spaceStretch.y.reciprocal()
        this.spaceStretch_xy_reciprocal = <tf.Tensor<R>>tf.add(spaceStretch.x.square(), spaceStretch.y.square()).sqrt().reciprocal()
    }

    update(context: GeneratorContext): GeneratorResult {
        const x = context.buffers.get(this.variable)!

        // this funciton makes element diffuse left to right
        function diffuse(axis: [[number, number], [number, number]], inverse_distance: tf.Tensor<R>) {
            const axis_forward = axis
            const axis_backward: typeof axis = [[axis[0][1] - axis[0][0], axis[0][0] - axis[0][1]], [axis[1][1] - axis[1][0], axis[1][0] - axis[1][1]]]

            const crop_forward = tf.layers.cropping2D({
                cropping: axis_backward
            })
            const pad_forward = tf.layers.zeroPadding2d({
                padding: axis_forward
            })

            const crop_backward = tf.layers.cropping2D({
                cropping: axis_forward
            })
            const pad_backward = tf.layers.zeroPadding2d({
                padding: axis_backward
            })

            // Rank = R2 // ExpandedRank = R4
            type ExpandedRank = RankNext<RankNext<R>>

            const x_expanded = <tf.Tensor<ExpandedRank>>x.expandDims(0).expandDims(3)
            const spaceStretch_expanded = <tf.Tensor<ExpandedRank>>inverse_distance.expandDims(0).expandDims(3)

            const x_backward = <tf.Tensor<ExpandedRank>>crop_backward.call(pad_backward.call(x_expanded, {}), {})

            const spaceStretch_forward = <tf.Tensor<ExpandedRank>>crop_forward.call(pad_forward.call(spaceStretch_expanded, {}), {})
            const spaceStretch_backward = <tf.Tensor<ExpandedRank>>crop_backward.call(pad_backward.call(spaceStretch_expanded, {}), {})
        
            // const spaceStretch_diffuse = spaceStretch_0.add(spaceStretch_1).div(2)

            const diff_backward = <tf.Tensor<ExpandedRank>>x_backward.sub(x_expanded)
            const diff_forward = <tf.Tensor<ExpandedRank>>crop_forward.call(pad_forward.call(diff_backward, {}), {})

            // diff_1[location] = variable[location + direction] - variable[location]

            const diff = tf.add(
                diff_forward.mul(spaceStretch_forward),
                diff_backward.mul(spaceStretch_backward),
            )

            return diff.squeeze([0, 3])
        }

        const sum = <tf.Tensor<R>>tf.addN([
            diffuse([[0, 0], [0, 1]], this.spaceStretch_x_reciprocal),
            diffuse([[0, 1], [0, 0]], this.spaceStretch_y_reciprocal),
            diffuse([[0, 1], [0, 1]], this.spaceStretch_xy_reciprocal),
            diffuse([[1, 0], [0, 1]], this.spaceStretch_xy_reciprocal),
        ])

        return {
            differentials: new Map([
                [<GeneratorBuffer>this.variable, [sum]]
            ])
        }
    }
}