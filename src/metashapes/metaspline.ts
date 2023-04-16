import { BoundingBox, Mat4, Vec2, Vec3 } from "playcanvas-extended";
import { EncapsulatingDomainSamplingContext, EncapsulatingDomainSamplingContextParentContext, EncapsulatingDomainSamplingContextParentDomain, extraFields, ExtraFields, Field, FieldInterpolator, FieldsField, FieldsPointMapped, FieldsPointOptional, FieldsPoint_Omit_Leaf, InterpolationManager, Interpolator, makeInterpolator, SampleDomain, SampleDomainLocationField, SamplingContext, ScalarField, FieldsPoint } from "../fields/index.js";
import { Pi, PiOver2, TwoPi } from "../utils/pi.js";
import { TextureLocation, TextureSamplingContext } from "../textures/texture.js";
import { MultiObjectsVolume } from "../volumes/volumes/multi-objects.js";
import { TransformVolume } from "../volumes/volumes/transform.js";
import { MetaShape, MetaShapeLocation, MetaShapeLocationExtraFields, MetaShapeParametersIn, MetaShapeSample, MetaShapeSampleExtraFields, MetaShapeSamplingContext, MetaShapeSamplingContext_Texture, MetaShapeSamplingContext_Volume, MetaShapeTxLocation, MetaShapeTxSample, MetaShapeVolume, MetaShapeVolumeSamplingContext } from "./metashape.js";
import { VolumeSurfaceMeshingKey, VolumeSurfaceMeshingProcessingContext } from "../surfaces/processor.js";
import { defaultMeshingSettings } from "../meshing/meshing-algorithm.js";

export type MetaSplineSegmentFigureLocation<Location extends MetaShapeLocation = MetaShapeLocation> =
    MetaShapeLocationExtraFields<Location> & { theta: number, phi: number }

export type MetaSplineSegmentFigureSample<Sample extends MetaShapeSample = MetaShapeSample> =
    MetaShapeSampleExtraFields<Sample> & FieldsPointOptional<MetaShapeParametersIn>

export type MetaSplineSegmentFigure<
        Location extends MetaShapeLocation = MetaShapeLocation,
        Sample extends MetaShapeSample = MetaShapeSample
    > =
    SampleDomain<
        MetaSplineSegmentFigureLocation<Location>,
        MetaSplineSegmentFigureSample<Sample>
    >

export const MetaSplineSegmentSamplingContext_Figure = Symbol('metaspline-segment:radial-figure')
export interface MetaSplineSegmentSamplingContext<
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaShapeTxSample = MetaShapeTxSample,
        Location extends MetaShapeLocation = MetaShapeLocation,
        TextureContext extends
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext> =
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext>
    > extends
    MetaShapeSamplingContext<
        TxLocation,
        TxSample,
        Location,
        TextureContext,
        VolumeContext
    > {
    [MetaSplineSegmentSamplingContext_Figure]: SamplingContext<MetaSplineSegmentFigureLocation<Location>>
}

class MetaSpline<
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaShapeTxSample = MetaShapeTxSample,
        Location extends MetaShapeLocation = MetaShapeLocation,
        Sample extends MetaShapeSample = MetaShapeSample,
        TextureContext extends
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext> =
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext>
    > {
    private t: number[]
    private transform_interpolator: FieldInterpolator<number, Mat4>
    private figure_interpolator: Interpolator<number, MetaSplineSegmentFigure<Location, Sample>>

    constructor(public segments: MetaSplineSegment<TxLocation, TxSample, Location, Sample, TextureContext, VolumeContext>[]) {
        this.transform_interpolator = InterpolationManager[makeInterpolator](segments.map(segment => ({ location: segment.t, value: segment.transform_relative_root })))
        this.figure_interpolator = InterpolationManager[makeInterpolator](segments.map(segment => ({ location: segment.t, value: segment.figure })))
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

            while (iterations-- > 0) {
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
            }

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
        extraLocation: ExtraFields<Location, MetaShapeLocation>,
        context: MetaSplineSegmentSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext>[typeof MetaSplineSegmentSamplingContext_Figure]
    ) {
        return this.figure_interpolator(t).sample({ phi, theta, ...extraLocation }, context)
    }
}

export class MetaSplineSegment<
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaShapeTxSample = MetaShapeTxSample,
        Location extends MetaShapeLocation = MetaShapeLocation,
        Sample extends MetaShapeSample = MetaShapeSample,
        TextureContext extends
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext> =
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext>
    > implements
    MetaShape<
        TxLocation,
        TxSample,
        Location,
        Sample,
        TextureContext,
        VolumeContext,
        MetaSplineSegmentSamplingContext<
            TxLocation,
            TxSample,
            Location,
            TextureContext,
            VolumeContext
        >
    > {
    field: Field<Sample>
    
    //TODO: let there be multiple figures with different times for a single SplineSegment
    constructor(
        public figure: MetaSplineSegmentFigure<Location, Sample>,
        public t_offset: number = 1
    ) {
    }
    
    private spline_potential: MetaSpline<TxLocation, TxSample, Location, Sample, TextureContext, VolumeContext>[]
    private spline: MetaSpline<TxLocation, TxSample, Location, Sample, TextureContext, VolumeContext>
    private spline_segment_index: number

    transform_relative_root: Mat4
    transform_relative_root_inv: Mat4

    t: number = 0
    t_iterations: number

    boundingBox: BoundingBox

    init(context: MetaSplineSegmentSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext>): void {
        this.init_figure(context)
        
        // find parent to connect with
        const parent = this.init_spline_find_parent_segment(context[MetaShapeSamplingContext_Volume] as any) 
        if (!parent) {
            this.spline_segment_index = 0
            this.spline = undefined
            this.t = 0
            this.t_iterations = NaN
            this.transform_relative_root = new Mat4().setIdentity()
        }
        else {
            this.spline_segment_index = (parent.segment.spline?.segments.length ?? 0) + 1
            this.init_spline_potential(new MetaSpline([...(parent.segment.spline?.segments ?? []), this]), context)
            this.t = this.t_offset + parent.segment.t
            this.t_iterations = Math.log2(this.t_offset) + 15
            this.transform_relative_root = new Mat4().mul2(parent.segment.transform_relative_root, parent.transform_to_parent)
        }

        this.transform_relative_root_inv = this.transform_relative_root.clone().invert()
        
        this.field = FieldsField.merge<Sample>(
            (this.figure.field as FieldsField<MetaSplineSegmentFigureSample<Sample>>) as FieldsField<Sample>,
            MetaShapeVolume.defaultFields.sample as FieldsField<Sample>
        )
    }

    private init_figure(context: MetaSplineSegmentSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext>): void {
        context[MetaSplineSegmentSamplingContext_Figure] = {
            [SampleDomainLocationField]: FieldsField.merge<MetaSplineSegmentFigureLocation<Location>>(
                (context[SampleDomainLocationField] as FieldsField<Location>).omit({
                    p: FieldsPoint_Omit_Leaf
                } as FieldsPointMapped<Location, typeof FieldsPoint_Omit_Leaf>) as any as FieldsField<MetaSplineSegmentFigureLocation<Location>>,
                new FieldsField<MetaSplineSegmentFigureLocation<Location>>({
                    phi: new ScalarField([-PiOver2, PiOver2]),
                    theta: new ScalarField([-Pi, Pi]),
                } as FieldsPointMapped<MetaSplineSegmentFigureLocation<Location>, Field>)
            )
        }

        this.figure.init(context[MetaSplineSegmentSamplingContext_Figure])
    }

    private init_spline_find_parent_segment(
            context: EncapsulatingDomainSamplingContext<Location, Sample>,
            searching_for_parent: boolean = false,
            transform_to_parent: Mat4 = new Mat4().setIdentity()
        ): {
            segment: MetaSplineSegment<TxLocation, TxSample, Location, Sample, TextureContext, VolumeContext>,
            transform_to_parent: Mat4
        } {
        if (!context[EncapsulatingDomainSamplingContextParentDomain])
            return undefined
        
        if (context[EncapsulatingDomainSamplingContextParentDomain] instanceof MultiObjectsVolume) {
            const parent = context[EncapsulatingDomainSamplingContextParentDomain] as any as MultiObjectsVolume
            if (!searching_for_parent) {
                return this.init_spline_find_parent_segment(
                    context[EncapsulatingDomainSamplingContextParentContext] as any,
                    true,
                    transform_to_parent
                )
            }
            else {
                const metashape_spline_segment_volume = Reflect.ownKeys(parent.children)
                    .map(key => parent.children[key] as any)
                    .find(child => child instanceof MetaShapeVolume && child.inner instanceof MetaSplineSegment)
                
                if (metashape_spline_segment_volume) {
                    const segment = (metashape_spline_segment_volume as any as MetaShapeVolume).inner as MetaSplineSegment<TxLocation, TxSample, Location, Sample, TextureContext, VolumeContext>

                    return {
                        segment,
                        transform_to_parent
                    }
                }
                else {
                    return this.init_spline_find_parent_segment(
                        context[EncapsulatingDomainSamplingContextParentContext] as any,
                        true,
                        transform_to_parent
                    )
                }
            }
        }
        else if (context[EncapsulatingDomainSamplingContextParentDomain] instanceof TransformVolume) {
            const volume = context[EncapsulatingDomainSamplingContextParentDomain] as any as TransformVolume

            return this.init_spline_find_parent_segment(
                context[EncapsulatingDomainSamplingContextParentContext] as any,
                searching_for_parent,
                new Mat4().mul2(volume.transform, transform_to_parent)
            )
        }
        
        return this.init_spline_find_parent_segment(
            context[EncapsulatingDomainSamplingContextParentContext] as any,
            searching_for_parent,
            transform_to_parent
        )
    }

    private init_spline_potential(
        spline: MetaSpline<TxLocation, TxSample, Location, Sample, TextureContext, VolumeContext>,
        context: MetaSplineSegmentSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext>
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

    private init_bounding_box(context: MetaSplineSegmentSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext>) {
        if (this.spline_segment_index === 0) {
            this.boundingBox = new BoundingBox()
            return
        }

        const segment_first = this.spline_segment_index === 1
        const segment_last = this.spline_segment_index === this.spline.segments.length - 1

        const texture = context[MetaShapeSamplingContext_Texture].item

        const meshingSettings = (context[MetaShapeSamplingContext_Volume] as unknown as VolumeSurfaceMeshingProcessingContext)[VolumeSurfaceMeshingKey].settings ?? defaultMeshingSettings

        const t0 = this.spline.segments[this.spline_segment_index - 1].t

        const resolution = {
            t: 32,
            theta: 8,
            phi: 4
        }

        const boundingBox = {
            max: new Vec3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
            min: new Vec3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY),
        }

        const sample_theta = (t: number, m: Mat4, phi = 0) => {
            const m_offset = m.getTranslation()
            const z_offset = phi === 0 ? Vec3.ZERO : m.getZ().mulScalar(Math.sin(phi))
            const cos_phi = Math.cos(phi)

            for (let theta_i = 0; theta_i < resolution.theta; theta_i++) {
                const theta = theta_i * TwoPi / resolution.theta
                const uv = this.uv(t, theta, phi)

                const v = new Vec3().add2(
                    m.getX().mulScalar(cos_phi * Math.cos(theta)),
                    m.getY().mulScalar(cos_phi * Math.sin(theta))
                ).add(z_offset)

                const texture_location = { uv, gradient: v } as MetaShapeTxLocation<Location, TxLocation> & Sample
                const texture_sample = texture?.sample(texture_location, context[MetaShapeSamplingContext_Texture].context)

                const figure_sample = this.spline.figureSample(t, theta, 0, {} as any, context[MetaSplineSegmentSamplingContext_Figure])
                
                const parameters = MetaShapeVolume.combineParameters(
                    (texture_sample ?? MetaShapeVolume.defaultParameters) as FieldsPointOptional<MetaShapeParametersIn>,
                    (figure_sample ?? MetaShapeVolume.defaultParameters) as FieldsPointOptional<MetaShapeParametersIn>
                )
                const parameters_valid = MetaShapeVolume.parametersValid(parameters)

                if (parameters_valid) {
                    const radius = MetaShapeVolume.boundingLength(parameters, meshingSettings)
                    v.mulScalar(radius)
                    v.add(m_offset)

                    boundingBox.max.max(v)
                    boundingBox.min.min(v)
                }
            }
        }

        for (let t_i = 0; t_i <= this.t_offset * resolution.t; t_i++) {
            const t = t0 + (t_i / resolution.t)
            const m = this.spline.planeAt(t)

            sample_theta(t, m)
        }

        if (segment_first) {
            const t = t0
            const m = this.spline.planeAt(t)
            
            for (let phi_i = 1; phi_i <= resolution.phi; phi_i++)
                sample_theta(t, m, phi_i * -PiOver2 / resolution.phi)
        }

        if (segment_last) {
            const t = this.t
            const m = this.spline.planeAt(t)
            
            for (let phi_i = 1; phi_i <= resolution.phi; phi_i++)
                sample_theta(t, m, phi_i * PiOver2 / resolution.phi)
        }

        this.boundingBox = new BoundingBox(
            new Vec3().add2(boundingBox.max, boundingBox.min).divScalar(2),
            new Vec3().sub2(boundingBox.max, boundingBox.min).divScalar(2)
        )
    }

    sample(
            location: Location,
            context: MetaSplineSegmentSamplingContext<
                    TxLocation,
                    TxSample,
                    Location,
                    TextureContext,
                    VolumeContext
                >
        ): Sample {
        if (this.spline_segment_index === 0)
            return undefined
        
        const location_extra = extraFields<MetaShapeLocation, Location>(location, { p: true })

        const plane_sample = this.spline.intersectingPlane(location.p, this.spline_segment_index)
        if (!plane_sample) return undefined
        
        const { t, r, theta, phi, v } = plane_sample
        const figure_sample = this.spline.figureSample(t, theta, phi, location_extra, context[MetaSplineSegmentSamplingContext_Figure])
        const uv = this.uv(t, theta, phi)
        
        const shape_sample = {
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
}