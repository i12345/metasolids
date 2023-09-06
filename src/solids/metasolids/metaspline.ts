import { BoundingBox, Mat4, Vec2, Vec3 } from "playcanvas-extended";
import { MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/index.js";
import { extraFields, ExtraFields, Field, FieldInterpolator, FieldsPointMapped, FieldsPointOptional, FieldsPoint_Omit_Leaf, InterpolationManager, Interpolator, makeInterpolator, SampleDomain, SampleDomainLocationFieldKey, SamplingContext, FieldsPoint, MultiObjectsInfluencesGroupsDefault } from "../../fields/index.js";
import { EncapsulatingDomainSamplingContext, EncapsulatingDomainSamplingContextParentContext, EncapsulatingDomainSamplingContextParentDomain } from '../../fields/domains/index.js'
import { FieldsField } from '../../fields/fields/fields.js'
import { Pi, PiOver2, TwoPi } from "../../utils/pi.js";
import { TextureLocation, TextureSamplingContext } from "../../textures/texture.js";
import { MultiObjectsVolume } from "../../volumes/volumes/multi-objects.js";
import { TransformVolume } from "../../volumes/volumes/transform.js";
import { MetaSolidShape, MetaSolidLocation, MetaSolidLocationExtraFields, MetaSolidParametersIn, MetaSolidSample, MetaSolidSampleExtraFields, MetaSolidShapeSamplingContext, MetaSolidSamplingContext_Texture, MetaSolidSamplingContext_Volume, MetaSolidTxLocation, MetaSolidTxSample, MetaSolidVolume, MetaSolidVolumeSamplingContext } from "./metasolid.js";
import { VolumeSurfacesKey, meshing } from "../../surfaces/index.js";
import { VolumeSolidsKey } from "../volume-solids.js";
import { ScalarField } from "../../fields/fields/scalar.js";
import { FuseMode, fuseModes } from "../../fields/vectorized/index.js";

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
    private figure_interpolator: Interpolator<number, MetaSplineSegmentFigure<Location, Sample>>

    constructor(public segments: MetaSplineSegment<InfluenceGroup, TxLocation, TxSample, Location, Sample, VolumeSampleProcessingContextT, TextureContext, VolumeContext>[]) {
        this.transform_interpolator = InterpolationManager[makeInterpolator](segments.map(segment => ({ location: segment.t, value: segment.transform_relative_root })), MetaSplineSegment.defaultFields.t)
        this.figure_interpolator = InterpolationManager[makeInterpolator](segments.map(segment => ({ location: segment.t, value: segment.figure })), MetaSplineSegment.defaultFields.t)
    }

    planeAt(t: number): Mat4 {
        return this.transform_interpolator(t)
    }

    intersectingPlane(
            p: Vec3,
            index: number
        ) {
        if (index === 0)
            return undefined

        const segment = this.segments[index]
        const canResultOutOfBounds = index === 1 || index === this.segments.length - 1
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
            } while (--iterations > 0)

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

    figureSample(
        t: number,
        theta: number,
        phi: number,
        extraLocation: ExtraFields<Location, MetaSolidLocation>,
        context: MetaSplineSegmentSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, VolumeSampleProcessingContextT, TextureContext, VolumeContext>[typeof MetaSplineSegmentSamplingContext_Figure]
    ) {
        return this.figure_interpolator(t).sample({ phi, theta, ...extraLocation }, context)
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
    > {
    field!: Field<Sample>

    //TODO: let there be multiple figures with different times for a single SplineSegment
    constructor(
        public figure: MetaSplineSegmentFigure<Location, Sample>,
        public t_offset: number = 1
    ) {
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

                const figure_sample = this.spline!.figureSample(t, theta, 0, {} as any, context[MetaSplineSegmentSamplingContext_Figure])

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
            this.boundingBox.compute(hints_surface, hints_surface_offset)

            const hints_surface_array = new Float32Array(hints_surface_offset)
            hints_surface_array.set(hints_surface.subarray(0, hints_surface_offset))
            context[VolumeSurfacesKey].hints.push(hints_surface)

            const hints_solid_array = new Float32Array(hints_solid_offset)
            hints_solid_array.set(hints_solid.subarray(0, hints_solid_offset))
            context[VolumeSolidsKey].hints.push(hints_solid)
        }
    }

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
            return undefined!

        const location_extra = extraFields<MetaSolidLocation, Location>(location, { p: true })

        const plane_sample = this.spline!.intersectingPlane(location.p, this.spline_segment_index)
        if (!plane_sample) return undefined!

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
    }

    private uv(t: number, theta: number, phi: number): Vec2 {
        return new Vec2(t + (phi / PiOver2), (theta / TwoPi) + 0.5)
    }

    static defaultFields = {
        t: new ScalarField(),
        figureLocation: new FieldsField<MetaSplineSegmentFigureLocation>({
            phi: new ScalarField(<FuseMode<number>>fuseModes.ArithmeticPrimitiveFuseMode.add, [-PiOver2, PiOver2]),
            theta: new ScalarField(<FuseMode<number>>fuseModes.ArithmeticPrimitiveFuseMode.add, [-Pi, Pi]),
        } as FieldsPointMapped<MetaSplineSegmentFigureLocation, Field>)
    }
}