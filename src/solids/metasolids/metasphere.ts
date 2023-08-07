import { BoundingBox, Vec2, Vec3 } from "playcanvas-extended";
import { FieldsField } from "../../fields/fields/fields.js";
import { Pi, TwoPi } from "../../utils/pi.js";
import { TextureLocation, TextureSamplingContext } from "../../textures/texture.js";
import { MetaSolidShape, MetaSolidLocation, MetaSolidParametersIn, MetaSolidSample, MetaSolidShapeSamplingContext, MetaSolidSamplingContext_Texture, MetaSolidSamplingContext_Volume, MetaSolidTextureLocation, MetaSolidTxLocation, MetaSolidTxSample, MetaSolidVolume, MetaSolidVolumeSamplingContext } from "./metasolid.js";
import { VolumeSurfacesKey, meshing } from "../../surfaces/index.js";
import { FieldsPoint, FieldsPointOptional } from "../../fields/point.js";
import { VolumeSolidsKey } from "../volume-solids.js";

export class MetaSphere<
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        Location extends MetaSolidLocation = MetaSolidLocation,
        Sample extends MetaSolidSample = MetaSolidSample,
        OuterSampleProcessingContextT = any,    
        TextureContext extends
            TextureSamplingContext<MetaSolidTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>>> =
            TextureSamplingContext<MetaSolidTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>>>,
        VolumeContext extends
            MetaSolidVolumeSamplingContext<TxLocation, Location, OuterSampleProcessingContextT, TextureContext> =
            MetaSolidVolumeSamplingContext<TxLocation, Location, OuterSampleProcessingContextT, TextureContext>,
        Context extends
            MetaSolidShapeSamplingContext<TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext> =
            MetaSolidShapeSamplingContext<TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext>,
    > implements
    MetaSolidShape<
        TxLocation,
        TxSample,
        Location,
        Sample,
        OuterSampleProcessingContextT,
        TextureContext,
        VolumeContext,
        Context
    > {
    readonly boundingBox = new BoundingBox()
    readonly field = MetaSolidVolume.defaultFields.sample as FieldsField<Sample>
    
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
        const texture = context[MetaSolidSamplingContext_Texture]?.item

        const resolution = 32
        
        const hints_surface = new Float32Array(3 * (2 * resolution) * resolution)
        let hints_surface_offset = 0

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

                const texture_location = { uv, gradient: point } as MetaSolidTxLocation<Location, TxLocation> & Sample
                const texture_sample = texture?.sample(texture_location, context[MetaSolidSamplingContext_Texture].context)
                
                const parameters = MetaSolidVolume.combineParameters((texture_sample ?? MetaSolidVolume.defaultParameters) as FieldsPointOptional<MetaSolidParametersIn>)
                const parameters_valid = MetaSolidVolume.parametersValid(parameters)

                if (parameters_valid) {
                    const radius = MetaSolidVolume.surfaceDistance(parameters, context)
                    point.mulScalar(radius)

                    hints_surface[hints_surface_offset++] = point.x
                    hints_surface[hints_surface_offset++] = point.y
                    hints_surface[hints_surface_offset++] = point.z
                }
            }
        }

        if (hints_surface_offset > 0) {
            this.boundingBox.compute(hints_surface, hints_surface_offset)

            const hints_surface_array = new Float32Array(hints_surface_offset)
            hints_surface_array.set(hints_surface.subarray(0, hints_surface_offset))
            context[VolumeSurfacesKey].hints.push(hints_surface)

            //TODO: use sub-surface as well as center points
            context[VolumeSolidsKey].hints.push(new Float32Array([0, 0, 0]))
        }
    }
}