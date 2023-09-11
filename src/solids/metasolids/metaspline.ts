import { BoundingBox, Mat4, Vec2, Vec3 } from "playcanvas-extended";
import { MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsTemplate, extract, hasPath, intract } from "../../paradigm/trees/index.js";
import { extraFields, ExtraFields, Field, FieldInterpolator, FieldsPointMapped, FieldsPointOptional, FieldsPoint_Omit_Leaf, InterpolationManager, Interpolator, makeInterpolator, SampleDomain, SampleDomainLocationFieldKey, SamplingContext, FieldsPoint, MultiObjectsInfluencesGroupsDefault, field_point_new, VectorInterpolator, field_point_map, FieldPointPrimitive, field_point_identity, field_point_add_inplace_weighted } from "../../fields/index.js";
import { EncapsulatingDomainSamplingContext, EncapsulatingDomainSamplingContextParentContext, EncapsulatingDomainSamplingContextParentDomain, VectorSampleFunction, VectorSamplingContext, makeVectorSamplingContext } from '../../fields/domains/index.js'
import { FieldsField } from '../../fields/fields/fields.js'
import { Pi, PiOver2, TwoPi } from "../../utils/pi.js";
import { TextureLocation, TextureSamplingContext } from "../../textures/texture.js";
import { MultiObjectsVolume } from "../../volumes/volumes/multi-objects.js";
import { TransformVolume } from "../../volumes/volumes/transform.js";
import { MetaSolidShape, MetaSolidLocation, MetaSolidLocationExtraFields, MetaSolidParametersIn, MetaSolidSample, MetaSolidSampleExtraFields, MetaSolidShapeSamplingContext, MetaSolidSamplingContext_Texture, MetaSolidSamplingContext_Volume, MetaSolidTxLocation, MetaSolidTxSample, MetaSolidVolume, MetaSolidVolumeSamplingContext } from "./metasolid.js";
import { VolumeSurfacesKey, meshing } from "../../surfaces/index.js";
import { VolumeSolidsKey } from "../volume-solids.js";
import { ScalarField } from "../../fields/fields/scalar.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorStatic, FuseMode, IsDynamicVector, field_point_vector_fill, field_point_vector_mat4_transformPoint, field_point_vector_mat4_transformPoint_single_multiple, field_point_vector_vec3_normalize, field_point_vectorized_new, fuseModes, fuseVectors } from "../../fields/vectorized/index.js";
import { vectorized } from "vectorized-functions";
import { Cloneable, clone, makeClone } from "../../utils/cloneable.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";

export type MetaSplineSegmentFigureLocation<Location extends MetaSolidLocation = MetaSolidLocation> =
    { theta: number, phi: number } //& MetaSolidLocationExtraFields<Location>

export type MetaSplineSegmentFigureSample<Sample extends MetaSolidSample = MetaSolidSample> =
    MetaSolidSampleExtraFields<Sample> & FieldsPointOptional<MetaSolidParametersIn>

export type MetaSplineSegmentFigure<
        Location extends MetaSolidLocation = MetaSolidLocation,
        Sample extends MetaSolidSample = MetaSolidSample
    > =
    SampleDomain<
        MetaSplineSegmentFigureLocation<Location>,
        MetaSplineSegmentFigureSample<Sample>
    >

export const MetaSplineSegmentSamplingContext_Figure = Symbol('metaspline.segment:radial-figure')
export interface MetaSplineSegmentSamplingContext<
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        Location extends MetaSolidLocation = MetaSolidLocation,
        VolumeSampleProcessingContextT = any,
        TextureContext extends
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, VolumeSampleProcessingContextT, TextureContext> =
            MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, VolumeSampleProcessingContextT, TextureContext>
    > extends
    MetaSolidShapeSamplingContext<
        InfluenceGroup,
        TxLocation,
        TxSample,
        Location,
        VolumeSampleProcessingContextT,
        TextureContext,
        VolumeContext
    > {
    [MetaSplineSegmentSamplingContext_Figure]: SamplingContext<MetaSplineSegmentFigureLocation<Location>>
}

export type MetaSplineSegmentMultiObjectsInternalPreservedGroups = {
    [MetaSplineSegmentSamplingContext_Figure]: MultiObjectsGroupsTemplateLeaf
}

export const MetaSplineSegmentMultiObjectsInternalPreservedGroupsTemplate: MetaSplineSegmentMultiObjectsInternalPreservedGroups = {
    [MetaSplineSegmentSamplingContext_Figure]: MultiObjectsGroupsTemplate_Leaf
}

type MetaSplineIntersectingPlane = {
    t: number
    v: Vec3
    r: number
    phi: number
    theta: number
}

class MetaSpline<
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        Location extends MetaSolidLocation = MetaSolidLocation,
        Sample extends MetaSolidSample = MetaSolidSample,
        VolumeSampleProcessingContextT = any,
        TextureContext extends
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, VolumeSampleProcessingContextT, TextureContext> =
            MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, VolumeSampleProcessingContextT, TextureContext>
    > {
    // private t: number[]
    private transform_interpolator: FieldInterpolator<number, Mat4>
    private transform_interpolator_vectorized: VectorInterpolator<number, number, number, Float64Array, Mat4, Mat4, Mat4, Float64Array>
    
    constructor(public segments: MetaSplineSegment<InfluenceGroup, TxLocation, TxSample, Location, Sample, VolumeSampleProcessingContextT, TextureContext, VolumeContext>[]) {
        const transform_keypoints = segments.map(segment => ({ location: segment.t, value: segment.transform_relative_root }))
        this.transform_interpolator = InterpolationManager[makeInterpolator](transform_keypoints, MetaSplineSegment.defaultFields.t)
        this.transform_interpolator_vectorized = InterpolationManager.makeInterpolatorVectorized(transform_keypoints, MetaSplineSegment.defaultFields.t, Mat4, false, false)
    }

    planeAt(t: number): Mat4 {
        return this.transform_interpolator(t)
    }

    @vectorized(MetaSpline.prototype.intersectingPlane_vectorized)
    intersectingPlane(
            p: Vec3,
            index: number
        ): MetaSplineIntersectingPlane | undefined {
        if (index === 0)
            return undefined

        const segment = this.segments[index]
        const canResultOutOfBounds = true // index === 1 || index === this.segments.length - 1
        p = segment.transform_relative_root.transformPoint(p)

        // This function will binary search to minimize
        // dot( (p(t) - v), n(t) ) to find the closest t

        const t0 = this.segments[index - 1].t
        const t_m = segment.t_offset

        const transform_interpolate = (t: number) => {
            const m = this.planeAt(t)

            const p0 = m.getTranslation()
            const n = m.getZ()

            // Partly from
            // https://gdbooks.gitbooks.io/3dcollisions/content/Chapter1/closest_point_on_plane.html
            const distance = new Vec3().sub2(p0, p).dot(n)

            return {
                m,
                distance
            }
        }

        // adapted from https://github.com/darkskyapp/binary-search/blob/master/index.js
        function search(iterations: number = 10) {
            let mid: number
            let cmp: ReturnType<typeof transform_interpolate>
            let low = t0, high = t0 + t_m

            do {
                mid = (low + high) / 2
                cmp = transform_interpolate(mid);

                // Too low.
                if (cmp.distance < 0.0)
                    low = mid;

                // Too high.
                else if (cmp.distance > 0.0)
                    high = mid;

                // Key found.
                else
                    return { ...cmp, t: mid, outOfBounds: false }
            } while (--iterations >= 0)

            if (low === 0) {
                return {
                    ...transform_interpolate(0),
                    t: 0,
                    outOfBounds: true
                }
            } else if (high === 1) {
                return {
                    ...transform_interpolate(1),
                    t: 1,
                    outOfBounds: true
                }
            }
            else {
                // Returns closest search results
                return { ...cmp, t: mid, outOfBounds: false }
            }
        }

        const closest = search(segment.t_iterations)

        if (closest.outOfBounds && !canResultOutOfBounds)
            return undefined

        const t = closest.t
        const v = segment.transform_relative_root_inv.transformVector(new Vec3().sub2(p, closest.m.getTranslation()))
        const v_plane = closest.m.invert().transformPoint(p)
        const r = v_plane.length() // = v.length()
        const phi = canResultOutOfBounds ? 0 : Math.atan2(v_plane.z, new Vec2(v_plane.x, v_plane.y).length())
        const theta = Math.atan2(v_plane.y, v_plane.x)

        return {
            t,
            v,
            r,
            phi,
            theta,
        }
    }

    // private static intersectingPlane_vectorized<
    //         InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
    //         TxLocation extends TextureLocation = TextureLocation,
    //         TxSample extends MetaSolidTxSample = MetaSolidTxSample,
    //         Location extends MetaSolidLocation = MetaSolidLocation,
    //         Sample extends MetaSolidSample = MetaSolidSample,
    //         VolumeSampleProcessingContextT = any,
    //         TextureContext extends
    //             TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
    //             TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>,
    //         VolumeContext extends
    //             MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, VolumeSampleProcessingContextT, TextureContext> =
    //             MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, VolumeSampleProcessingContextT, TextureContext>
    //     >(
    //         this: MetaSpline<
    //                 InfluenceGroup,
    //                 TxLocation,
    //                 TxSample,
    //                 Location,
    //                 Sample,
    //                 VolumeSampleProcessingContextT,
    //                 TextureContext,
    //                 VolumeContext
    //             >,
    //         p: FieldPointVectorStatic<Vec3>,
    //         index: number
    //     ): FieldPointVectorStatic<MetaSplineIntersectingPlane> {
    intersectingPlane_vectorized(
            p: FieldPointVectorStatic<Vec3>,
            index: number
        ): FieldPointVectorStatic<MetaSplineIntersectingPlane> {
        const length = p.length / 3
        
        if (index === 0) {
            return {
                t: new Float64Array(length).fill(NaN),
                v: new Float64Array(3 * length).fill(NaN),
                r: new Float64Array(length).fill(NaN),
                phi: new Float64Array(length).fill(NaN),
                theta: new Float64Array(length).fill(NaN),
            }
        }

        const segment = this.segments[index]
        const canResultOutOfBounds = true // index === 1 || index === this.segments.length - 1

        p = field_point_vector_mat4_transformPoint_single_multiple(segment.transform_relative_root, p, new Float64Array(3 * length))

        // This function will binary search to minimize
        // dot( (p(t) - v), n(t) ) to find the closest t

        const t0 = this.segments[index - 1].t
        const t_m = segment.t_offset

        /**
         * intersecting plane status
         * 0 = normal
         * 1 = exactly on-plane
         * 2 = out of bounds
         */
        const status = new Uint8Array(length).fill(0)
        const mid = new Float64Array(length)
        const low = new Float64Array(length).fill(t0)
        const high = new Float64Array(length).fill(t0 + t_m)

        const m = new Float64Array(16 * length)
        const distance = new Float64Array(length)

        // adapted from https://github.com/darkskyapp/binary-search/blob/master/index.js

        for (let iteration = 0; iteration < segment.t_iterations; iteration++) {
            for (let i = 0; i < length; i++)
                mid[i] = (low[i] + high[i]) / 2
            this.transform_interpolator_vectorized(mid, m)
            
            for (let i = 0, p_offset = 0, m_offset = 0;
                i < length;
                i++, p_offset += 3, m_offset += 16) {
                if(status[i] !== 0) continue
                // p0 = m[i].getTranslation() = m[3,0:2]
                // n = m[i].getZ() = m[2,0:2]
                // distance = (p0 - p) dot n
                distance[i] = (
                    ((m[m_offset + 12] - p[p_offset + 0]) * m[m_offset + 8]) +
                    ((m[m_offset + 13] - p[p_offset + 1]) * m[m_offset + 9]) +
                    ((m[m_offset + 14] - p[p_offset + 2]) * m[m_offset + 10])
                )
            }

            let distance_i: number
            for (let i = 0; i < length; i++) {
                if(status[i] !== 0) continue
                distance_i = distance[i]
                if (distance_i < 0.0)
                    low[i] = mid[i]
                else if (distance_i > 0.0)
                    high[i] = mid[i]
                else status[i] = 1
            }
        }

        const m_0 = this.transform_interpolator(0).data
        const m_1 = this.transform_interpolator(1).data

        if (canResultOutOfBounds) {
            for (let i = 0, p_offset = 0, m_offset = 0;
                i < length;
                i++, p_offset += 3, m_offset += 16) {
                if (low[i] === 0) {
                    mid[i] = 0
                    status[i] = 2

                    m[m_offset + 0] = m_0[0]
                    m[m_offset + 1] = m_0[1]
                    m[m_offset + 2] = m_0[2]
                    m[m_offset + 3] = m_0[3]
                    m[m_offset + 4] = m_0[4]
                    m[m_offset + 5] = m_0[5]
                    m[m_offset + 6] = m_0[6]
                    m[m_offset + 7] = m_0[7]
                    m[m_offset + 8] = m_0[8]
                    m[m_offset + 9] = m_0[9]
                    m[m_offset + 10] = m_0[10]
                    m[m_offset + 11] = m_0[11]
                    m[m_offset + 12] = m_0[12]
                    m[m_offset + 13] = m_0[13]
                    m[m_offset + 14] = m_0[14]
                    m[m_offset + 15] = m_0[15]

                    // p0 = m[i].getTranslation() = m[3,0:2]
                    // n = m[i].getZ() = m[2,0:2]
                    // distance = (p0 - p) dot n
                    distance[i] = (
                        ((m[m_offset + 12] - p[p_offset + 0]) * m[m_offset + 8]) +
                        ((m[m_offset + 13] - p[p_offset + 1]) * m[m_offset + 9]) +
                        ((m[m_offset + 14] - p[p_offset + 2]) * m[m_offset + 10])
                    )
                }
                else if (high[i] === 1) {
                    mid[i] = 1
                    status[i] = 2

                    m[m_offset + 0] = m_1[0]
                    m[m_offset + 1] = m_1[1]
                    m[m_offset + 2] = m_1[2]
                    m[m_offset + 3] = m_1[3]
                    m[m_offset + 4] = m_1[4]
                    m[m_offset + 5] = m_1[5]
                    m[m_offset + 6] = m_1[6]
                    m[m_offset + 7] = m_1[7]
                    m[m_offset + 8] = m_1[8]
                    m[m_offset + 9] = m_1[9]
                    m[m_offset + 10] = m_1[10]
                    m[m_offset + 11] = m_1[11]
                    m[m_offset + 12] = m_1[12]
                    m[m_offset + 13] = m_1[13]
                    m[m_offset + 14] = m_1[14]
                    m[m_offset + 15] = m_1[15]

                    // p0 = m[i].getTranslation() = m[3,0:2]
                    // n = m[i].getZ() = m[2,0:2]
                    // distance = (p0 - p) dot n
                    distance[i] = (
                        ((m[m_offset + 12] - p[p_offset + 0]) * m[m_offset + 8]) +
                        ((m[m_offset + 13] - p[p_offset + 1]) * m[m_offset + 9]) +
                        ((m[m_offset + 14] - p[p_offset + 2]) * m[m_offset + 10])
                    )
                }
            }
        }
        else {
            for (let i = 0, p_offset = 0, m_offset = 0;
                i < length;
                i++, p_offset += 3, m_offset += 16) {
                if (low[i] === 0) {
                    mid[i] = NaN
                    status[i] = 2
                }
                else if (high[i] === 1) {
                    mid[i] = NaN
                    status[i] = 2
                }
            }
        }

        const t = mid
        const v = new Float64Array(3 * length)
        const r = new Float64Array(length)
        const phi = new Float64Array(length)
        const theta = new Float64Array(length)

        const m_i = new Mat4()
        const m_i_data = m_i.data

        const transform_relative_root_inv = segment.transform_relative_root_inv.data

        let p_i_x: number
        let p_i_y: number
        let p_i_z: number

        let p_local_x: number
        let p_local_y: number
        let p_local_z: number

        if (!canResultOutOfBounds) {
            for (let i = 0; i < length; i++) {
                if (status[i] === 2) {
                    t[i] = NaN
                    v[(3 * i) + 0] = v[(3 * i) + 1] = v[(3 * i) + 2] = NaN
                    r[i] = NaN
                    phi[i] = NaN
                    theta[i] = NaN
                }
            }
        }

        for (let i = 0, p_offset = 0, m_offset = 0;
            i < length;
            i++, p_offset += 3, m_offset += 16) {
            if (status[i] === 2) continue
            
            m_i_data[0] = m[m_offset + 0]
            m_i_data[1] = m[m_offset + 1]
            m_i_data[2] = m[m_offset + 2]
            m_i_data[3] = m[m_offset + 3]
            m_i_data[4] = m[m_offset + 4]
            m_i_data[5] = m[m_offset + 5]
            m_i_data[6] = m[m_offset + 6]
            m_i_data[7] = m[m_offset + 7]
            m_i_data[8] = m[m_offset + 8]
            m_i_data[9] = m[m_offset + 9]
            m_i_data[10] = m[m_offset + 10]
            m_i_data[11] = m[m_offset + 11]
            m_i_data[12] = m[m_offset + 12]
            m_i_data[13] = m[m_offset + 13]
            m_i_data[14] = m[m_offset + 14]
            m_i_data[15] = m[m_offset + 15]

            p_i_x = p[p_offset + 0]
            p_i_y = p[p_offset + 1]
            p_i_z = p[p_offset + 2]

            // p_local = p[i] - m[i].getTranslation()
            p_local_x = p_i_x - m[m_offset + 12]
            p_local_y = p_i_y - m[m_offset + 13]
            p_local_z = p_i_z - m[m_offset + 14]

            v[p_offset + 0] = (
                (p_local_x * transform_relative_root_inv[0]) +
                (p_local_y * transform_relative_root_inv[4]) +
                (p_local_z * transform_relative_root_inv[8])
            )
            v[p_offset + 1] = (
                (p_local_x * transform_relative_root_inv[1]) +
                (p_local_y * transform_relative_root_inv[5]) +
                (p_local_z * transform_relative_root_inv[9])
            )
            v[p_offset + 2] = (
                (p_local_x * transform_relative_root_inv[2]) +
                (p_local_y * transform_relative_root_inv[6]) +
                (p_local_z * transform_relative_root_inv[10])
            )

            m_i.invert()

            // p_local = m[i].clone().invert().transformPoint(p[i])
            p_local_x = (
                (p_i_x * m_i_data[0]) +
                (p_i_y * m_i_data[4]) +
                (p_i_z * m_i_data[8]) +
                m_i_data[12]
            )
            p_local_y = (
                (p_i_x * m_i_data[1]) +
                (p_i_y * m_i_data[5]) +
                (p_i_z * m_i_data[9]) +
                m_i_data[13]
            )
            p_local_z = (
                (p_i_x * m_i_data[2]) +
                (p_i_y * m_i_data[6]) +
                (p_i_z * m_i_data[10]) +
                m_i_data[14]
            )

            r[i] = Math.sqrt(
                (p_local_x * p_local_x) +
                (p_local_y * p_local_y) +
                (p_local_z * p_local_z)
            )

            phi[i] = Math.atan2(
                p_local_z,
                Math.sqrt(
                    (p_local_x * p_local_x) +
                    (p_local_y * p_local_y)
                )
            )

            theta[i] = Math.atan2(p_local_y, p_local_x)

            // const v = segment.transform_relative_root_inv.transformVector(new Vec3().sub2(p, closest.m.getTranslation()))
            // const v_plane = closest.m.invert().transformPoint(p)
            // const r = v_plane.length() // = v.length()
            // const phi = canResultOutOfBounds ? 0 : Math.atan2(v_plane.z, new Vec2(v_plane.x, v_plane.y).length())
            // const theta = Math.atan2(v_plane.y, v_plane.x)
        }

        return {
            t,
            v,
            r,
            phi,
            theta,
        }
    }

    figureSample(
        index: number,
        t: number,
        theta: number,
        phi: number,
        extraLocation: ExtraFields<Location, MetaSolidLocation>,
        context: MetaSplineSegmentSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, VolumeSampleProcessingContextT, TextureContext, VolumeContext>[typeof MetaSplineSegmentSamplingContext_Figure]
    ) {
        if (index === 0)
            throw new Error()

        const figure_location: MetaSplineSegmentFigureLocation<Location> = { phi, theta, ...extraLocation }
        
        const figure_sample_0 = this.segments[index - 1].figure.sample(figure_location, context)
        const figure_sample_1 = this.segments[index - 0].figure.sample(figure_location, context)

        let figure_sample = field_point_identity(figure_sample_0)
        figure_sample = field_point_add_inplace_weighted(figure_sample, figure_sample_0, t)
        figure_sample = field_point_add_inplace_weighted(figure_sample, figure_sample_1, 1 - t)
        return figure_sample
    }

    figureSample_vectorized(
            index: number,
            t: FieldPointVector<number, FieldPointVectorContainerStatic<NumberTypedArray>>,
            theta: FieldPointVector<number, FieldPointVectorContainerStatic<NumberTypedArray>>,
            phi: FieldPointVector<number, FieldPointVectorContainerStatic<NumberTypedArray>>,
            extraLocation: FieldPointVector<FieldsPoint & ExtraFields<Location, MetaSolidLocation>, FieldPointVectorContainerStatic<NumberTypedArray>>,
            context: MetaSplineSegmentSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, VolumeSampleProcessingContextT, TextureContext, VolumeContext>[typeof MetaSplineSegmentSamplingContext_Figure]
        ): FieldPointVector<MetaSplineSegmentFigureSample<Sample>, FieldPointVectorContainerStatic<NumberTypedArray>> {
        if (index === 0)
            throw new Error()

        const figure_location: FieldPointVector<MetaSplineSegmentFigureLocation<Location>, FieldPointVectorContainerStatic<NumberTypedArray>> = { phi, theta, ...extraLocation }
        const figure0 = this.segments[index - 1].figure
        const figure1 = this.segments[index - 0].figure

        type VectorContextT = VectorSamplingContext<
            MetaSplineSegmentFigureLocation<Location>,
            MetaSplineSegmentFigureLocation<Location>,
            MetaSplineSegmentFigureLocation<Location>,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            MetaSplineSegmentFigureSample<Sample>,
            MetaSplineSegmentFigureSample<Sample>,
            MetaSplineSegmentFigureSample<Sample>,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            MultiObjectsTemplate,
            IndicesTypedArray,
            FieldPointVectorContainerStatic<IndicesTypedArray>,
            typeof context
        >
        
        const vectorContext = <VectorContextT>context
        makeVectorSamplingContext<
                MetaSplineSegmentFigureLocation<Location>,
                MetaSplineSegmentFigureLocation<Location>,
                MetaSplineSegmentFigureLocation<Location>,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                MetaSplineSegmentFigureSample<Sample>,
                MetaSplineSegmentFigureSample<Sample>,
                MetaSplineSegmentFigureSample<Sample>,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                MultiObjectsTemplate,
                IndicesTypedArray,
                FieldPointVectorContainerStatic<IndicesTypedArray>,
                typeof context
            >(figure0.field, vectorContext)

        const figure_sample_0 = vectorContext[VectorSampleFunction](figure0, figure_location, vectorContext)
        const figure_sample_1 = vectorContext[VectorSampleFunction](figure1, figure_location, vectorContext)

        //TODO: add weighted sum to arithmetic fusing mode and use here

        return figure_sample_0
    }
}

export class MetaSplineSegment<
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        Location extends MetaSolidLocation = MetaSolidLocation,
        Sample extends MetaSolidSample = MetaSolidSample,
        OuterSampleProcessingContextT = any,
        TextureContext extends
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext> =
            MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext>
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
        MetaSplineSegmentSamplingContext<
            InfluenceGroup,
            TxLocation,
            TxSample,
            Location,
            OuterSampleProcessingContextT,
            TextureContext,
            VolumeContext
        >
    >,
    Cloneable<MetaSplineSegment<
        InfluenceGroup,
        TxLocation,
        TxSample,
        Location,
        Sample,
        OuterSampleProcessingContextT,
        TextureContext,
        VolumeContext
    >> {
    field!: Field<Sample>
    private emptySample!: Sample

    //TODO: let there be multiple figures with different times for a single SplineSegment
    constructor(
        public figure: MetaSplineSegmentFigure<Location, Sample>,
        public t_offset: number = 1
    ) {
    }

    [clone]() {
        return new MetaSplineSegment<
                InfluenceGroup,
                TxLocation,
                TxSample,
                Location,
                Sample,
                OuterSampleProcessingContextT,
                TextureContext,
                VolumeContext
            >(
                makeClone(this.figure),
                this.t_offset,
            )
    }

    private readonly spline_potential: MetaSpline<InfluenceGroup, TxLocation, TxSample, Location, Sample, OuterSampleProcessingContextT, TextureContext, VolumeContext>[] = []
    private spline?: MetaSpline<InfluenceGroup, TxLocation, TxSample, Location, Sample, OuterSampleProcessingContextT, TextureContext, VolumeContext>
    private spline_segment_index!: number

    readonly transform_relative_root = new Mat4()
    readonly transform_relative_root_inv = new Mat4()

    t: number = 0
    t_iterations!: number

    readonly boundingBox = new BoundingBox()

    init(context: MetaSplineSegmentSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext>): void {
        this.spline_potential.splice(0, this.spline_potential.length)
        this.init_figure(context)

        // find parent to connect with
        const parent = this.init_spline_find_parent_segment(context[MetaSolidSamplingContext_Volume] as any)
        if (!parent) {
            this.spline_segment_index = 0
            this.t = 0
            this.t_iterations = NaN
            this.transform_relative_root.setIdentity()
            this.transform_relative_root_inv.setIdentity()
            this.spline = undefined
        }
        else {
            this.spline_segment_index = parent.segment.spline?.segments.length ?? 1
            this.t = this.t_offset + parent.segment.t
            this.t_iterations = Math.log2(this.t_offset) + 15
            this.transform_relative_root.mul2(parent.segment.transform_relative_root, parent.transform_to_parent)
            this.transform_relative_root_inv.copy(this.transform_relative_root).invert()
            this.init_spline_potential(new MetaSpline([...(parent.segment.spline?.segments ?? [parent.segment]), this]), context)
        }

        this.field = FieldsField.merge<Sample>(
            (this.figure.field as FieldsField<MetaSplineSegmentFigureSample<Sample>>) as FieldsField<Sample>,
            MetaSolidVolume.defaultFields.sample as FieldsField<Sample>
        )

        this.emptySample = field_point_new(this.field.elementType)
        this.emptySample.distance = Infinity
        Object.assign(this.emptySample, MetaSolidVolume.defaultParameters)
    }

    private init_figure(context: MetaSplineSegmentSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext>): void {
        context[MetaSplineSegmentSamplingContext_Figure] = {
            [SampleDomainLocationFieldKey]: FieldsField.merge<MetaSplineSegmentFigureLocation<Location>>(
                (context[SampleDomainLocationFieldKey] as FieldsField<Location>).omit({
                    p: FieldsPoint_Omit_Leaf
                } as FieldsPointMapped<Location, typeof FieldsPoint_Omit_Leaf>) as any as FieldsField<MetaSplineSegmentFigureLocation<Location>>,
                MetaSplineSegment.defaultFields.figureLocation as FieldsField<MetaSplineSegmentFigureLocation<Location>>
            )
        }

        this.figure.init(context[MetaSplineSegmentSamplingContext_Figure])
    }

    private init_spline_find_parent_segment(
            context: EncapsulatingDomainSamplingContext<Location, Sample>,
            transform_to_parent: Mat4 = new Mat4().setIdentity()
        ): {
            segment: MetaSplineSegment<InfluenceGroup, TxLocation, TxSample, Location, Sample, OuterSampleProcessingContextT, TextureContext, VolumeContext>,
            transform_to_parent: Mat4
        } | undefined {
        //TODO: consider this method
        if (!context[EncapsulatingDomainSamplingContextParentDomain])
            return undefined

        if (context[EncapsulatingDomainSamplingContextParentDomain] instanceof MultiObjectsVolume) {
            const parent = context[EncapsulatingDomainSamplingContextParentDomain] as any as MultiObjectsVolume            
            const main_metasolid = (parent.children["$$main"] as any as MetaSolidVolume)?.shape

            if (main_metasolid && main_metasolid instanceof MetaSplineSegment && main_metasolid !== this) {
                const segment = main_metasolid as MetaSplineSegment<InfluenceGroup, TxLocation, TxSample, Location, Sample, OuterSampleProcessingContextT, TextureContext, VolumeContext>

                return {
                    segment,
                    transform_to_parent
                }
            }
            else {
                return this.init_spline_find_parent_segment(
                    context[EncapsulatingDomainSamplingContextParentContext] as any,
                    transform_to_parent
                )
            }
        }
        else if (context[EncapsulatingDomainSamplingContextParentDomain] instanceof TransformVolume) {
            const volume = context[EncapsulatingDomainSamplingContextParentDomain] as any as TransformVolume

            return this.init_spline_find_parent_segment(
                context[EncapsulatingDomainSamplingContextParentContext] as any,
                new Mat4().mul2(volume.transform, transform_to_parent)
            )
        }

        return this.init_spline_find_parent_segment(
            context[EncapsulatingDomainSamplingContextParentContext] as any,
            transform_to_parent
        )
    }

    private init_spline_potential(
        spline: MetaSpline<InfluenceGroup, TxLocation, TxSample, Location, Sample, OuterSampleProcessingContextT, TextureContext, VolumeContext>,
        context: MetaSplineSegmentSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext>
    ) {
        if (!this.spline_potential.includes(spline))
            this.spline_potential.push(spline)

        function longestUnsplitPath<T>(paths: T[][]): number {
            paths.sort((a, b) => a.length - b.length)
            let longest = paths[0]
            let longest_i = 0
            let prev_longest_i = -1

            for (let i = 1; i < paths.length; i++) {
                if (paths[i].length <= longest.length)
                    return prev_longest_i
                else {
                    longest = paths[i]
                    longest_i = i
                }
            }

            return longest_i
        }

        const longestUnsplitSpline = this.spline_potential[longestUnsplitPath(this.spline_potential.map(spline => spline.segments))]
        if (longestUnsplitSpline !== this.spline) {
            this.spline = longestUnsplitSpline

            if (this.spline_segment_index > 0)
                this.spline.segments[this.spline_segment_index - 1].init_spline_potential(this.spline, context)

            this.init_bounding_box(context)
        }
    }

    private init_bounding_box(context: MetaSplineSegmentSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext>) {
        if (this.spline_segment_index === 0) {
            this.boundingBox.setMinMax(Vec3.ZERO, Vec3.ZERO)
            return
        }

        const segment_first = this.spline_segment_index === 1
        const segment_last = this.spline_segment_index === this.spline!.segments.length - 1

        const texture = context[MetaSolidSamplingContext_Texture].item

        const t0 = this.spline!.segments[this.spline_segment_index - 1].t

        const resolution = {
            t: 32,
            theta: 32,
            phi: 16
        }

        const hints_surface = new Float32Array(3 * ((2 * resolution.phi) + (1 + Math.floor(this.t_offset * resolution.t))) * resolution.theta)
        let hints_surface_offset = 0

        const hints_solid = new Float32Array(3 * ((2 * resolution.phi) + (1 + Math.floor(this.t_offset * resolution.t))))
        let hints_solid_offset = 0

        const sample_theta = (t: number, m: Mat4, phi = 0, isFirstOrLast = false) => {
            const m_offset = m.getTranslation()
            const z_offset = phi === 0 ? Vec3.ZERO : m.getZ().mulScalar(Math.sin(phi))
            const cos_phi = Math.cos(phi)
            const v = new Vec3()

            let atLeastOneSurfacePointValid = false

            for (let theta_i = 0; theta_i < resolution.theta; theta_i++) {
                const theta = theta_i * TwoPi / resolution.theta
                const uv = this.uv(t, theta, phi)

                v.add2(
                    m.getX().mulScalar(cos_phi * Math.cos(theta)),
                    m.getY().mulScalar(cos_phi * Math.sin(theta))
                ).add(z_offset)

                const texture_location = { uv, gradient: v } as MetaSolidTxLocation<Location, TxLocation> & Sample
                const texture_sample = texture?.sample(texture_location, context[MetaSolidSamplingContext_Texture].context)

                const figure_sample = this.spline!.figureSample(this.spline_segment_index, t, theta, 0, {} as any, context[MetaSplineSegmentSamplingContext_Figure])

                const parameters = MetaSolidVolume.combineParameters(
                    (texture_sample ?? MetaSolidVolume.defaultParameters) as FieldsPointOptional<MetaSolidParametersIn>,
                    (figure_sample ?? MetaSolidVolume.defaultParameters) as FieldsPointOptional<MetaSolidParametersIn>
                )
                const parameters_valid = MetaSolidVolume.parametersValid(parameters)

                if (parameters_valid) {
                    atLeastOneSurfacePointValid = true

                    const radius = MetaSolidVolume.surfaceDistance(parameters, context)
                    v.mulScalar(radius)
                    v.add(m_offset)

                    hints_surface[hints_surface_offset++] = v.x
                    hints_surface[hints_surface_offset++] = v.y
                    hints_surface[hints_surface_offset++] = v.z
                }
            }

            if (atLeastOneSurfacePointValid && !isFirstOrLast) {
                hints_solid[hints_solid_offset++] = m_offset.x
                hints_solid[hints_solid_offset++] = m_offset.y
                hints_solid[hints_solid_offset++] = m_offset.z
            }
        }

        for (let t_i = 0; t_i <= this.t_offset * resolution.t; t_i++) {
            const t = t0 + (t_i / resolution.t)
            const m = new Mat4().mul2(this.transform_relative_root_inv, this.spline!.planeAt(t))

            sample_theta(t, m)
        }

        /* if (segment_first) */ {
            const t = t0
            const m = new Mat4().mul2(this.transform_relative_root_inv, this.spline!.planeAt(t))

            for (let phi_i = 1; phi_i <= resolution.phi; phi_i++)
                sample_theta(t, m, phi_i * -PiOver2 / resolution.phi, phi_i === resolution.phi)
        }

        /* if (segment_last) */ {
            const t = this.t
            const m = new Mat4().mul2(this.transform_relative_root_inv, this.spline!.planeAt(t))

            for (let phi_i = 1; phi_i <= resolution.phi; phi_i++)
                sample_theta(t, m, phi_i * PiOver2 / resolution.phi, phi_i === resolution.phi)
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

    @vectorized(MetaSplineSegment.sample_vectorized)
    sample(
            location: Location,
            context: MetaSplineSegmentSamplingContext<
                    InfluenceGroup,
                    TxLocation,
                    TxSample,
                    Location,
                    OuterSampleProcessingContextT,
                    TextureContext,
                    VolumeContext
                >
        ): Sample {
        //TODO: consider if this is what should be returned
        // For this and the next `return undefined!` statements,
        // is that how transparency should be processed?
        if (this.spline_segment_index === 0)
            return this.emptySample

        const location_extra = extraFields<MetaSolidLocation, Location>(location, { p: true })

        const plane_sample = this.spline!.intersectingPlane(location.p, this.spline_segment_index)
        if (!plane_sample) return this.emptySample

        const { t, r, theta, phi, v } = plane_sample
        const figure_sample = this.spline!.figureSample(this.spline_segment_index, t, theta, phi, location_extra, context[MetaSplineSegmentSamplingContext_Figure])
        const uv = this.uv(t, theta, phi)

        const shape_sample = {
            ...MetaSolidVolume.defaultParameters,
            ...figure_sample,
            distance: r,
            gradient: v.normalize(),
            uv,
        } as Sample

        return shape_sample
    }

    private static sample_vectorized<
            InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
            TxLocation extends TextureLocation = TextureLocation,
            TxSample extends MetaSolidTxSample = MetaSolidTxSample,
            Location extends MetaSolidLocation = MetaSolidLocation,
            Sample extends MetaSolidSample = MetaSolidSample,
            OuterSampleProcessingContextT = any,
            TextureContext extends
                TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
                TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>,
            VolumeContext extends
                MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext> =
                MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext>
        >(
            this: MetaSplineSegment<
                    InfluenceGroup,
                    TxLocation,
                    TxSample,
                    Location,
                    Sample,
                    OuterSampleProcessingContextT,
                    TextureContext,
                    VolumeContext
                >,
            locations: FieldPointVector<Location, FieldPointVectorContainerStatic>,
            context: MetaSplineSegmentSamplingContext<
                    InfluenceGroup,
                    TxLocation,
                    TxSample,
                    Location,
                    OuterSampleProcessingContextT,
                    TextureContext,
                    VolumeContext
                >
        ): FieldPointVector<Sample, FieldPointVectorContainerStatic> {
        /**
         *  singular implementation
            if (this.spline_segment_index === 0)
                return this.emptySample

            const location_extra = extraFields<MetaSolidLocation, Location>(location, { p: true })

            const plane_sample = this.spline!.intersectingPlane(location.p, this.spline_segment_index)
            if (!plane_sample) return this.emptySample

            const { t, r, theta, phi, v } = plane_sample
            const figure_sample = this.spline!.figureSample(t, theta, phi, location_extra, context[MetaSplineSegmentSamplingContext_Figure])
            const uv = this.uv(t, theta, phi)

            const shape_sample = {
                ...MetaSolidVolume.defaultParameters,
                ...figure_sample,
                distance: r,
                gradient: v.normalize(),
                uv,
            } as Sample

            return shape_sample
         */

        const sample_length = locations.p.length / 3
        
        if (this.spline_segment_index === 0) {
            return field_point_vectorized_new(
                this.field.elementType,
                sample_length,
                <IsDynamicVector<Sample, FieldPointVectorContainerStatic>>false
            )
        }
        
        const location_extra = extraFields<
            FieldPointVector<MetaSolidLocation, FieldPointVectorContainerStatic>,
            FieldPointVector<Location, FieldPointVectorContainerStatic>
        >(locations, { p: true })

        const { t, r, theta, phi, v } = this.spline!.intersectingPlane_vectorized(locations.p, this.spline_segment_index)
        const figure_sample = this.spline!.figureSample_vectorized(this.spline_segment_index, t, theta, phi, <any>location_extra, context[MetaSplineSegmentSamplingContext_Figure])
        const uv = this.uv_vectorized(t, theta, phi)

        const shape_sample = {
            // ...field_point_vectorized_new<MetaSolidParametersIn, FieldPointVectorContainerStatic>(
            //     MetaSolidVolume.defaultFields.parametersIn.elementType,
            //     sample_length,
            //     <IsDynamicVector<MetaSolidParametersIn, FieldPointVectorContainerStatic>>false,
            //     undefined,
            //     MetaSolidVolume.defaultParameters
            // ),
            ...figure_sample,
            distance: r,
            gradient: v,
            uv,
        }

        // shape_sample.v.normalize()
        field_point_vector_vec3_normalize(shape_sample.gradient)
        
        // shape_sample = {...MetaSolidVolume.defaultParameters, ...figure_sample}
        // field_point_vector_fill(
        //     this.field.elementType,
        //     MetaSolidVolume.defaultFields.parametersIn.elementType,
        //     shape_sample,
        //     MetaSolidVolume.defaultParameters
        // )
        field_point_map(
            MetaSolidVolume.defaultFields.parametersIn.elementType,
            leaf => leaf instanceof Function,
            (elementType, path) => {
                if (!hasPath(shape_sample, path)) {
                    const default_values = field_point_vectorized_new(
                        elementType,
                        sample_length,
                        <IsDynamicVector<FieldPointPrimitive, FieldPointVectorContainerStatic>>false,
                        undefined,
                        extract(MetaSolidVolume.defaultParameters, path)
                    )
                    intract(shape_sample, path, default_values)
                }
            }
        )

        return <FieldPointVector<Sample, FieldPointVectorContainerStatic>>shape_sample
    }

    private uv(t: number, theta: number, phi: number): Vec2 {
        return new Vec2(t + (phi / PiOver2), (theta / TwoPi) + 0.5)
    }

    private uv_vectorized(
            t: FieldPointVector<number, FieldPointVectorContainerStatic<NumberTypedArray>>,
            theta: FieldPointVector<number, FieldPointVectorContainerStatic<NumberTypedArray>>,
            phi: FieldPointVector<number, FieldPointVectorContainerStatic<NumberTypedArray>>
        ): FieldPointVector<Vec2, FieldPointVectorContainerStatic> {
        const length = t.length
        const uv = field_point_vectorized_new<Vec2, FieldPointVectorContainerStatic>(Vec2, length, false)
        
        const piOver2 = PiOver2
        const twoPi = TwoPi

        for (let i = 0, uv_offset = 0; i < length; i++) {
            uv[uv_offset++] = t[i] + (phi[i] / piOver2)
            uv[uv_offset++] = (theta[i] / twoPi) + 0.5
        }

        return uv
    }

    static defaultFields = {
        t: new ScalarField(),
        figureLocation: new FieldsField<MetaSplineSegmentFigureLocation>({
            phi: new ScalarField(<FuseMode<number>>fuseModes.ArithmeticPrimitiveFuseMode.add, [-PiOver2, PiOver2]),
            theta: new ScalarField(<FuseMode<number>>fuseModes.ArithmeticPrimitiveFuseMode.add, [-Pi, Pi]),
        } as FieldsPointMapped<MetaSplineSegmentFigureLocation, Field>)
    }
}