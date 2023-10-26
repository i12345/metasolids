import { Color, Vec2 } from "playcanvas-extended";
import { ColorField } from "../../fields/fields/color.js";
import { FieldPoint } from "../../fields/point.js";
import { Texture, TextureLocation, TextureRenderContext, TextureSamplingContext } from "../texture.js";
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

    render(resolution: Vec2, context: TextureRenderContext<
            TextureLocation,
            TextureLocation,
            TextureLocation,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            Color,
            Color,
            Color,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            TextureSamplingContext<TextureLocation>
        >): FieldPointTensor<Color, tf.Rank.R2> {
        const [
            m11, m12, m13,
            m21, m22, m23,
            m31, m32, m33
        ] = context.transform.data
        
        const location_x = <tf.Tensor2D>tf.range(0, resolution.x).div(resolution.x).expandDims(0)
        const location_y = <tf.Tensor2D>tf.range(0, resolution.y).div(resolution.y).expandDims(1)

        const uv_x = <tf.Tensor2D>tf.addN([
            location_x.mul(m11),
            location_y.mul(m21),
            m31
        ])

        const uv_y = <tf.Tensor2D>tf.addN([
            location_x.mul(m12),
            location_y.mul(m22),
            m32
        ])
        
        return {
            r: uv_x,
            g: uv_y,
            b: tf.fill([resolution.y, resolution.x], 0, "float32"),
            a: tf.fill([resolution.y, resolution.x], 1, "float32"),
        }
    }
}