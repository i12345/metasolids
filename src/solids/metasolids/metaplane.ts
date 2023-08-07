import { BoundingBox, Vec2, Vec3 } from "playcanvas-extended";
import { Field, FieldsPointMapped, FieldsPointOptional } from "../../fields/index.js";
import { VolumeSurfacesKey, meshing } from "../../surfaces/index.js";
import { TextureLocation, TextureSamplingContext } from "../../textures/texture.js";
import { Sign } from "../../utils/sign.js";
import { MetaSolidShape, MetaSolidLocation, MetaSolidParametersIn, MetaSolidSample, MetaSolidShapeSamplingContext, MetaSolidSamplingContext_Texture, MetaSolidSamplingContext_Volume, MetaSolidTxLocation, MetaSolidTxSample, MetaSolidVolume, MetaSolidVolumeSamplingContext } from "./metasolid.js";
import { FieldsField } from "../../fields/fields/fields.js";
import { SignField } from "../../fields/fields/sign.js";
import { VolumeSolidsKey } from "../volume-solids.js";

export type MetaPlaneSample = MetaSolidSample & {
    side: Sign
}

export class MetaPlane<
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        Location extends MetaSolidLocation = MetaSolidLocation,
        Sample extends MetaPlaneSample = MetaPlaneSample,
        OuterSampleProcessingContextT = any,    
        TextureContext extends
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>,
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
    readonly field = FieldsField.merge<Sample>(
        MetaSolidVolume.defaultFields.sample as FieldsField<Sample>,
        new FieldsField({
            side: new SignField(),
        } as FieldsPointMapped<Sample, Field>)
    )

    constructor(
        public maxDomain: {
                offset: Vec2,
                size: Vec2
            } = {
                offset: new Vec2(-1, -1),
                size: new Vec2(2, 2)
            }
        ) { }
    
    init(context: Context): void {
        const texture = context[MetaSolidSamplingContext_Texture]?.item

        const xy_offset = this.maxDomain.offset
        const xy_size = this.maxDomain.size
        
        const resolution = 32

        const hints_surface = new Float32Array(2 * 3 * (resolution ** 2))
        const hints_solid = new Float32Array(3 * (resolution ** 2))
        let hints_surface_offset = 0
        let hints_solid_offset = 0

        const uv = new Vec2()
        const p = new Vec2()

        for (let x = 0; x < resolution; x++) {
            for (let y = 0; y < resolution; y++) {
                uv.set(x, y).divScalar(resolution)
                p.copy(uv).mul(xy_size).add(xy_offset)
                
                const texture_sample = texture?.sample({ uv } as MetaSolidTxLocation<Location, TxLocation>, context[MetaSolidSamplingContext_Texture].context)
                const parameters = MetaSolidVolume.combineParameters((texture_sample ?? MetaSolidVolume.defaultParameters) as FieldsPointOptional<MetaSolidParametersIn>)
                const parameters_valid = MetaSolidVolume.parametersValid(parameters)

                if (parameters_valid) {
                    const distance = MetaSolidVolume.surfaceDistance(
                        parameters,
                        context
                    )

                    hints_surface[hints_surface_offset++] = p.x
                    hints_surface[hints_surface_offset++] = p.y
                    hints_surface[hints_surface_offset++] = +1 * distance

                    hints_surface[hints_surface_offset++] = p.x
                    hints_surface[hints_surface_offset++] = p.y
                    hints_surface[hints_surface_offset++] = -1 * distance
                    if (x > 0 && (x + 1) < resolution &&
                        y > 0 && (y + 1) < resolution) {
                        hints_solid[hints_solid_offset++] = p.x
                        hints_solid[hints_solid_offset++] = p.y
                        hints_solid[hints_solid_offset++] = 0
                    }
                }
            }
        }
        
        if (hints_surface_offset > 0) {
            this.boundingBox.compute(hints_surface, hints_surface_offset)

            const hints_surface_array = new Float32Array(hints_surface_offset)
            hints_surface_array.set(hints_surface.subarray(0, hints_surface_offset))
            context[VolumeSurfacesKey].hints.push(hints_surface)

            const hints_solid_array = new Float32Array(hints_solid_offset)
            hints_solid_array.set(hints_solid.subarray(0, hints_solid_offset))
            context[VolumeSolidsKey].hints.push(hints_solid)
        }
    }

    sample(location: Location, context: Context): Sample {
        const side = Math.sign(location.p.z) as Sign
        const gradient = new Vec3(0, 0, side)
        const distance = Math.abs(location.p.z)
        
        const uv = new Vec2(
            ((location.p.x - this.boundingBox.center.x) / this.boundingBox.halfExtents.x) + 0.5,
            ((location.p.y - this.boundingBox.center.y) / this.boundingBox.halfExtents.y) + 0.5
        )

        return {
            distance,
            gradient,
            uv
        } as unknown as Sample
    }
}