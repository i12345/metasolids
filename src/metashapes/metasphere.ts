import { BoundingBox, Vec2, Vec3 } from "playcanvas-extended";
import { FieldsField } from "../fields/fields/fields.js";
import { Pi, TwoPi } from "../utils/pi.js";
import { TextureLocation, TextureSamplingContext } from "../textures/texture.js";
import { MetaShape, MetaShapeLocation, MetaShapeParametersIn, MetaShapeSample, MetaShapeSamplingContext, MetaShapeSamplingContext_Texture, MetaShapeSamplingContext_Volume, MetaShapeTextureLocation, MetaShapeTxLocation, MetaShapeTxSample, MetaShapeVolume, MetaShapeVolumeSamplingContext } from "./metashape.js";
import { defaultMeshingSettings } from "../meshing/meshing-algorithm.js";
import { VolumeSurfaceMeshingKey, VolumeSurfaceMeshingProcessingContext } from "../surfaces/processor.js";
import { FieldsPoint, FieldsPointOptional } from "../fields/point.js";

export class MetaSphere<
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaShapeTxSample = MetaShapeTxSample,
        Location extends MetaShapeLocation = MetaShapeLocation,
        Sample extends MetaShapeSample = MetaShapeSample,
        TextureContext extends
            TextureSamplingContext<MetaShapeTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>>> =
            TextureSamplingContext<MetaShapeTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>>>,
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
        const phi = Math.atan2(new Vec2(location.p.x, location.p.y).length(), location.p.z)
        const uv = new Vec2(((theta / TwoPi) + 1) % 1, (phi / Pi))

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
        const meshingSettings = (context[MetaShapeSamplingContext_Volume] as unknown as VolumeSurfaceMeshingProcessingContext)[VolumeSurfaceMeshingKey].settings ?? defaultMeshingSettings

        const resolution = 32
        
        const boundingBox = {
            max: new Vec3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
            min: new Vec3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
        }

        for (let u = 0; u < 2 * resolution; u++) {
            const theta = TwoPi * (u / (2 * resolution))
            const cos_theta = Math.cos(theta)
            const sin_theta = Math.sin(theta)

            for (let v = 0; v < resolution; v++) {
                const uv = new Vec2(u / 2, v).divScalar(resolution)
                const phi = Pi * uv.y

                const point = new Vec3(cos_theta, sin_theta)
                point.mulScalar(Math.sin(phi))
                point.z = Math.cos(phi)

                const texture_location = { uv, gradient: point } as MetaShapeTxLocation<Location, TxLocation> & Sample
                const texture_sample = texture?.sample(texture_location, context[MetaShapeSamplingContext_Texture].context)
                
                const parameters = MetaShapeVolume.combineParameters((texture_sample ?? MetaShapeVolume.defaultParameters) as FieldsPointOptional<MetaShapeParametersIn>)
                const parameters_valid = MetaShapeVolume.parametersValid(parameters)

                if (parameters_valid) {
                    const radius = MetaShapeVolume.boundingLength(parameters, meshingSettings)
                    point.mulScalar(radius)
                    
                    boundingBox.max.max(point)
                    boundingBox.min.min(point)
                }
            }
        }

        this.boundingBox = new BoundingBox(
            new Vec3().add2(boundingBox.max, boundingBox.min).divScalar(2),
            new Vec3().sub2(boundingBox.max, boundingBox.min).divScalar(2)
        )
    }
}