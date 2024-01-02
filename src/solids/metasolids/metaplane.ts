import { BoundingBox, Vec2, Vec3 } from "playcanvas-physics-advanced";
import { Field, FieldsPointMapped, FieldsPointOptional, MultiObjectsInfluencesGroupsDefault, field_point_new } from "../../fields/index.js";
import { VolumeSurfacesKey, meshing } from "../../surfaces/index.js";
import { TextureLocation, TextureSamplingContext } from "../../textures/texture.js";
import { Sign } from "../../utils/sign.js";
import { MetaSolidShape, MetaSolidLocation, MetaSolidParametersIn, MetaSolidSample, MetaSolidShapeSamplingContext, MetaSolidSamplingContext_Texture, MetaSolidSamplingContext_Volume, MetaSolidTxLocation, MetaSolidTxSample, MetaSolidVolume, MetaSolidVolumeSamplingContext } from "./metasolid.js";
import { FieldsField } from "../../fields/fields/fields.js";
import { SignField } from "../../fields/fields/sign.js";
import { VolumeSolidsKey } from "../volume-solids.js";
import { MultiObjectsGroupsTemplate } from "../../paradigm/trees/index.js";
import { Cloneable, clone, makeClone } from "../../utils/cloneable.js";
import { FieldPointVector, FieldPointVectorContainerStatic, field_point_vector_fill, field_point_vectorized_new } from "../../fields/vectorized/index.js";
import { vectorized } from "vectorized-functions";

export type MetaPlaneSample = MetaSolidSample & {
    side: Sign
}

export class MetaPlane<
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        Location extends MetaSolidLocation = MetaSolidLocation,
        Sample extends MetaPlaneSample = MetaPlaneSample,
        OuterSampleProcessingContextT = any,
        TextureContext extends
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext> =
            MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext>,
        Context extends
            MetaSolidShapeSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext> =
            MetaSolidShapeSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext>,
    > implements
    MetaSolidShape<
        InfluenceGroup,
        TxLocation,
        TxSample,
        Location,
        Sample,
        OuterSampleProcessingContextT,
        TextureContext,
        VolumeContext,
        Context
    >,
    Cloneable<MetaPlane<
        InfluenceGroup,
        TxLocation,
        TxSample,
        Location,
        Sample,
        OuterSampleProcessingContextT,
        TextureContext,
        VolumeContext
    >> {
    readonly boundingBox = new BoundingBox()
    readonly field = FieldsField.merge<Sample>(
        MetaSolidVolume.defaultFields.sample as FieldsField<Sample>,
        new FieldsField({
            side: SignField.instance,
        } as FieldsPointMapped<Sample, Field>)
    )

    constructor(
        public area: {
                offset: Vec2,
                size: Vec2
            } = {
                offset: new Vec2(-1, -1),
                size: new Vec2(2, 2)
            }
        ) { }

    [clone]() {
        return new MetaPlane<
                InfluenceGroup,
                TxLocation,
                TxSample,
                Location,
                Sample,
                OuterSampleProcessingContextT,
                TextureContext,
                VolumeContext
            >(
                makeClone(this.area),
            )
    }

    init(context: Context): void {
        const texture = context[MetaSolidSamplingContext_Texture]?.item

        const xy_offset = this.area.offset
        const xy_size = this.area.size

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
            this.boundingBox.compute(hints_surface, hints_surface_offset / 3)

            const hints_surface_array = new Float32Array(hints_surface_offset)
            hints_surface_array.set(hints_surface.subarray(0, hints_surface_offset))
            context[VolumeSurfacesKey].hints.push(hints_surface)

            const hints_solid_array = new Float32Array(hints_solid_offset)
            hints_solid_array.set(hints_solid.subarray(0, hints_solid_offset))
            context[VolumeSolidsKey].hints.push(hints_solid)
        }
    }

    @vectorized(MetaPlane.sample_vectorized)
    sample(location: Location, context: Context): Sample {
        const side = Math.sign(location.p.z) as Sign
        const gradient = new Vec3(0, 0, side)
        const distance = Math.abs(location.p.z)

        const uv = new Vec2(
            (location.p.x - this.area.offset.x) / this.area.size.x,
            (location.p.y - this.area.offset.y) / this.area.size.y
        )

        return {
            ...MetaSolidVolume.defaultParameters,
            distance,
            gradient,
            side,
            uv
        } as unknown as Sample
    }

    private static sample_vectorized<
            InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
            TxLocation extends TextureLocation = TextureLocation,
            TxSample extends MetaSolidTxSample = MetaSolidTxSample,
            Location extends MetaSolidLocation = MetaSolidLocation,
            Sample extends MetaPlaneSample = MetaPlaneSample,
            OuterSampleProcessingContextT = any,
            TextureContext extends
                TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
                TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>,
            VolumeContext extends
                MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext> =
                MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext>,
            Context extends
                MetaSolidShapeSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext> =
                MetaSolidShapeSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext>,
        >(
            this: MetaPlane<
                    InfluenceGroup,
                    TxLocation,
                    TxSample,
                    Location,
                    Sample,
                    OuterSampleProcessingContextT,
                    TextureContext,
                    VolumeContext,
                    Context
                >,
            locations: FieldPointVector<Location, FieldPointVectorContainerStatic>,
            context: Context
        ): FieldPointVector<Sample, FieldPointVectorContainerStatic> {
        const location_p = locations.p
        let location_p_i = 0,
            location_p_x: number,
            location_p_y: number,
            location_p_z: number
        
        const area_offset_x = this.area.offset.x
        const area_offset_y = this.area.offset.y
        const area_size_x = this.area.size.x
        const area_size_y = this.area.size.y
        
        const length = location_p.length / 3
        
        const results = field_point_vectorized_new<Sample, FieldPointVectorContainerStatic>(
            this.field.elementType,
            length,
            false
        )

        const results_side = results.side
        const results_gradient = results.gradient
        const results_distance = results.distance
        const results_uv = results.uv

        field_point_vector_fill(
            this.field.elementType,
            MetaSolidVolume.defaultFields.parametersIn.elementType,
            results,
            MetaSolidVolume.defaultParameters
        )

        let results_uv_i = 0
        
        for (let i = 0; i < length; i++) {
            location_p_x = location_p[location_p_i++]
            location_p_y = location_p[location_p_i++]
            location_p_z = location_p[location_p_i]
            
            results_gradient[location_p_i] = results_side[i] = Math.sign(location_p_z)
            location_p_i++

            results_distance[i] = Math.abs(location_p_z)

            results_uv[results_uv_i++] = (location_p_x - area_offset_x) / area_size_x
            results_uv[results_uv_i++] = (location_p_y - area_offset_y) / area_size_y
        }
        
        return results
    }
}