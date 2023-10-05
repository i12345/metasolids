import { Color, Vec2 } from "playcanvas-extended";
import { ColorField } from "../../fields/fields/color.js";
import { FieldPoint } from "../../fields/point.js";
import { Texture, TextureLocation, TextureSamplingContext } from "../texture.js";
import { FieldPointVectorContainerStatic } from "../../fields/vectorized/point.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { FieldPointTensor } from "../../fields/tensor/tensor.js";
import * as tf from "@tensorflow/tfjs"

export class UVColorTexture implements Texture<
        TextureLocation,
        TextureLocation,
        TextureLocation,
        FieldPointVectorContainerStatic<NumberTypedArray>,
        Color,
        Color,
        Color,
        FieldPointVectorContainerStatic<NumberTypedArray>
    > {
    readonly field = ColorField.instance

    init(context: TextureSamplingContext<TextureLocation>): void {
    }

    sample(location: TextureLocation, context: TextureSamplingContext<TextureLocation>): Color {
        return new Color(location.uv.x, location.uv.y, 0)
    }

    render(resolution: Vec2, context: TextureSamplingContext): FieldPointTensor<Color, tf.Rank.R2> {
        return {
            r: tf.broadcastTo(tf.range(0, resolution.x).div(resolution.x).expandDims(0), [resolution.y, resolution.x]),
            g: tf.broadcastTo(tf.range(0, resolution.y).div(resolution.y).expandDims(1), [resolution.y, resolution.x]),
            b: tf.fill([resolution.y, resolution.x], 0, "float32"),
            a: tf.fill([resolution.y, resolution.x], 1, "float32"),
        }
    }
}