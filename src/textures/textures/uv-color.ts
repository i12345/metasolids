import { Color } from "playcanvas-extended";
import { ColorField } from "../../fields/index.js";
import { FieldPoint } from "../../fields/point.js";
import { Texture, TextureLocation, TextureSamplingContext } from "../texture.js";

export class UVColorTexture implements Texture {
    readonly field = ColorField.instance

    init(context: TextureSamplingContext<TextureLocation>): void {
    }

    sample(location: TextureLocation, context: TextureSamplingContext<TextureLocation>): FieldPoint {
        return new Color(location.uv.x, location.uv.y, 0)
    }
}