import { BoundingBox, Vec2, Vec3 } from "playcanvas-extended";
import { FieldsField } from "../fields";
import { Pi, TwoPi } from "../utils";
import { TextureLocation, TextureSamplingContext } from "../textures";
import { MetaShape, MetaShapeLocation, MetaShapeSample, MetaShapeSamplingContext, MetaShapeSamplingContext_Texture, MetaShapeTextureLocation, MetaShapeTxLocation, MetaShapeTxSample, MetaShapeVolume, MetaShapeVolumeSamplingContext } from "./metashape";

export class MetaSphere<
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaShapeTxSample = MetaShapeTxSample,
        Location extends MetaShapeLocation = MetaShapeLocation,
        Sample extends MetaShapeSample = MetaShapeSample,
        TextureContext extends
            TextureSamplingContext<MetaShapeTextureLocation<Location, Omit<TxLocation, keyof TextureLocation>>> =
            TextureSamplingContext<MetaShapeTextureLocation<Location, Omit<TxLocation, keyof TextureLocation>>>,
        VolumeContext extends
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext> =
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext>,
        Context extends
            MetaShapeSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext> =
            MetaShapeSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext>,
    > implements
    MetaShape<
        TxLocation,
        TxSample,
        Location,
        Sample,
        TextureContext,
        VolumeContext,
        Context
    > {
    boundingBox: BoundingBox
    field = MetaShapeVolume.defaultFields.sample as FieldsField<Sample>
    
    sample(location: Location, context: Context): Sample {
        const theta = Math.atan2(location.p.y, location.p.x)
        const phi = Math.atan2(location.p.z, new Vec2(location.p.x, location.p.y).length())
        const uv = new Vec2((theta / TwoPi) + 0.5, (phi / Pi) + 0.5)

        const distance = location.p.length()
        const gradient = location.p.clone().divScalar(distance)

        return {
            distance,
            gradient,
            uv,
        } as Sample
    }

    init(context: Context): void {
        const texture = context[MetaShapeSamplingContext_Texture].item

        const resolution = 32
        const verts = new Float32Array(2 * resolution * resolution * 3)
        for (let u = 0; u < 2 * resolution; u++) {
            const theta = TwoPi * ((u / 2) - 0.5)
            const cos_theta = Math.cos(theta)
            const sin_theta = Math.sin(theta)

            for (let v = 0; v < resolution; v++) {
                const uv = new Vec2(u / 2, v).divScalar(resolution)
                const phi = Pi * (uv.y - 0.5)

                const point = new Vec3(cos_theta, sin_theta)
                point.mulScalar(Math.cos(phi))
                point.z = Math.sin(phi)

                const texture_location = { uv, gradient: point } as MetaShapeTxLocation<Location, TxLocation> & Sample
                const texture_sample = texture.sample(texture_location, context[MetaShapeSamplingContext_Texture].context)
                const radius = MetaShapeVolume.boundingLength(MetaShapeVolume.combineParameters(texture_sample))
                point.mulScalar(radius)
                
                verts[(((u * resolution) + v) * 3) + 0] = point.x
                verts[(((u * resolution) + v) * 3) + 1] = point.y
                verts[(((u * resolution) + v) * 3) + 2] = point.z
            }
        }

        this.boundingBox = new BoundingBox()
        this.boundingBox.compute(verts)
    }
}