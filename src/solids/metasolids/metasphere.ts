import { BoundingBox, Vec2, Vec3 } from "playcanvas-physics-advanced";
import { FieldsField } from "../../fields/fields/fields.js";
import { Pi, TwoPi } from "../../utils/pi.js";
import { TextureLocation, TextureSamplingContext } from "../../textures/texture.js";
import { MetaSolidShape, MetaSolidLocation, MetaSolidParametersIn, MetaSolidSample, MetaSolidShapeSamplingContext, MetaSolidSamplingContext_Texture, MetaSolidSamplingContext_Volume, MetaSolidTextureLocation, MetaSolidTxLocation, MetaSolidTxSample, MetaSolidVolume, MetaSolidVolumeSamplingContext } from "./metasolid.js";
import { VolumeSurfacesKey, meshing } from "../../surfaces/index.js";
import { FieldsPoint, FieldsPointOptional } from "../../fields/point.js";
import { VolumeSolidsKey } from "../volume-solids.js";
import { MultiObjectsGroupsTemplate } from "../../paradigm/trees/multi-objects-groups.js";
import { MultiObjectsInfluencesGroupsDefault } from "../../fields/multi-objects.js";
import { FieldPointVector, FieldPointVectorContainerStatic, IsDynamicVector, field_point_vector_fill, field_point_vectorized_new } from "../../fields/vectorized/point.js";
import { Cloneable, clone } from "../../utils/cloneable.js";
import { vectorized } from "vectorized-functions";

export class MetaSphere<
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        Location extends MetaSolidLocation = MetaSolidLocation,
        Sample extends MetaSolidSample = MetaSolidSample,
        OuterSampleProcessingContextT = any,
        TextureContext extends
            TextureSamplingContext<MetaSolidTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>>> =
            TextureSamplingContext<MetaSolidTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>>>,
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
    Cloneable<MetaSphere<
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
    readonly field = MetaSolidVolume.defaultFields.sample as FieldsField<Sample>

    [clone]() {
        return new MetaSphere<
            InfluenceGroup,
            TxLocation,
            TxSample,
            Location,
            Sample,
            OuterSampleProcessingContextT,
            TextureContext,
            VolumeContext
        >()
    }

    @vectorized(MetaSphere.sample_vectorized)
    sample(location: Location, context: Context): Sample {
        const theta = Math.atan2(location.p.y, location.p.x)
        const phi = Math.atan2(new Vec2(location.p.x, location.p.y).length(), location.p.z)
        const uv = new Vec2(((theta / TwoPi) + 1) % 1, (phi / Pi))

        const distance = location.p.length()
        const gradient = location.p.clone().divScalar(distance)

        return {
            ...MetaSolidVolume.defaultParameters,
            distance,
            gradient,
            uv
        } as Sample
    }

    private static sample_vectorized<
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        Location extends MetaSolidLocation = MetaSolidLocation,
        Sample extends MetaSolidSample = MetaSolidSample,
        OuterSampleProcessingContextT = any,
        TextureContext extends
            TextureSamplingContext<MetaSolidTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>>> =
            TextureSamplingContext<MetaSolidTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>>>,
        VolumeContext extends
            MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext> =
            MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext>,
        Context extends
            MetaSolidShapeSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext> =
            MetaSolidShapeSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext>,
        >(
            this: MetaSphere<
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
        let theta: number,
            phi: number
        
        const location_p = locations.p
        let location_p_i = 0,
            location_p_x: number,
            location_p_y: number,
            location_p_z: number,
            location_p_sq_sum_xy: number,
            distance: number
        
        const length = location_p.length / 3

        const results = field_point_vectorized_new<Sample, FieldPointVectorContainerStatic>(
            this.field.elementType,
            length,
            <IsDynamicVector<Sample, FieldPointVectorContainerStatic>>false
        )
        
        const results_uv = results.uv
        const results_distance = results.distance
        const results_gradient = results.gradient
        
        field_point_vector_fill(
            MetaSolidVolume.defaultFields.parametersIn.elementType,
            MetaSolidVolume.defaultFields.parametersIn.elementType,
            results,
            MetaSolidVolume.defaultParameters
        )

        let results_uv_i = 0,
            results_distance_i = 0,
            results_gradient_i = 0

        for (let i = 0; i < length; i++) {
            location_p_x = location_p[location_p_i++]
            location_p_y = location_p[location_p_i++]
            location_p_z = location_p[location_p_i++]
            location_p_sq_sum_xy = (location_p_x * location_p_x) + (location_p_y * location_p_y)

            theta = Math.atan2(location_p_y, location_p_x)
            phi = Math.atan2(Math.sqrt(location_p_sq_sum_xy), location_p_z)

            results_uv[results_uv_i++] = ((theta / TwoPi) + 1) % 1
            results_uv[results_uv_i++] = phi / Pi

            results_distance[results_distance_i++] = distance = Math.sqrt(location_p_sq_sum_xy + (location_p_z * location_p_z))
            
            results_gradient[results_gradient_i++] = location_p_x / distance
            results_gradient[results_gradient_i++] = location_p_y / distance
            results_gradient[results_gradient_i++] = location_p_z / distance
        }

        return results
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
            this.boundingBox.compute(hints_surface, hints_surface_offset / 3)

            const hints_surface_array = new Float32Array(hints_surface_offset)
            hints_surface_array.set(hints_surface.subarray(0, hints_surface_offset))
            context[VolumeSurfacesKey].hints.push(hints_surface)

            //TODO: use sub-surface as well as center points
            context[VolumeSolidsKey].hints.push(new Float32Array([0, 0, 0]))
        }
    }
}