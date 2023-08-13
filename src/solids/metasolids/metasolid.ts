import { BoundingBox, Vec2, Vec3 } from "playcanvas-extended";
import { change, ExtraFields, Field, FieldPoint, FieldsPoint, FieldsPointMapped, FieldsPointOptional, FieldsPoint_Omit_Leaf, fields_point_map, makeInterpolator, field_point_invalid } from "../../fields/index.js";
import { SampleDomain, SampleDomainLocationFieldKey } from "../../fields/domain.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../../textures/texture.js";
import { extract, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/index.js";
import { VolumeLocation, VolumeSample, VolumeSampleKey } from "../../volumes/index.js";
import { VolumeSurfacesKey, texturing } from "../../surfaces/index.js";
import { TransformingSampleDomain } from "../../fields/domains/index.js";
import { ScalarField, Vec2Field, Vec3Field, FieldsField  } from "../../fields/fields/index.js";
import { VolumeSamplingContextWithSolidHints } from "../sampling/hints.js";
import { VolumeSamplingContextWithSurfaceHints } from "../../surfaces/sampling/hints.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";

export type MetaSolidLocation = VolumeLocation

export type MetaSolidLocationExtraFields<Location extends MetaSolidLocation = MetaSolidLocation> =
    ExtraFields<Location, MetaSolidLocation>

export type MetaSolidParametersIn = {
    /**
     * Volume sample alpha falls off from 1 when distance = unit.height
     * to 0 when distance = unit.height + unit.length. Between then it is
     * modulated by {@link falloff.rate}.
     */
    unit: {
        /**
         * The unit length for distance in local space. This may vary at different
         * locations.
         * 
         * @default 1
         */
        length: number

        /**
         * The ground-level unit height for calculating distance for presence.
         * 
         * @default 1
         */
        height: number
    }

    falloff: {
        /**
         * The multiplier for exponential falloff
         * 
         * presence = (1 - min(0, max(1, (distance - unit.height) / unit.length))) ^ falloff.rate
         * 
         * @default 1
         */
        rate: number
    }
}

export type MetaSolidSample = FieldsPointOptional<MetaSolidParametersIn> & {
    /**
     * The closest distance to the shape in normalized distance units
     * (they might not be uniform through the local vector space)
     * 
     * This measures distance to the virtual defining geometry of the shape.
     * Combined with {@link MetaSolidParametersIn}, it gives value for alpha.
     */
    distance: number

    /**
     * The direction going away from the shape.
     *
     * This should be a unit-length vector.
     */
    gradient: Vec3

    /**
     * The texture coordinates on the surface of the shape
     */
    uv: Vec2
}

export type MetaSolidTxLocation<
        Location extends VolumeLocation = VolumeLocation,
        TxLocation extends TextureLocation = TextureLocation
    > =
    MetaSolidTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>>

//TODO: refactor commonly recurring FieldsPoint & Omit<TxLocation, keyof TextureLocation>
// what is the meaning of TxLocation?

export type MetaSolidTxSample = FieldsPoint & FieldsPointOptional<MetaSolidParametersIn>

export type MetaSolidSampleExtraFields<Sample extends MetaSolidSample = MetaSolidSample> =
    Omit<Sample, keyof MetaSolidSample>

// let extraFields1: MetaSolidSampleExtraFields<MetaSolidSample> = {}

export type MetaSolidVolumeSample<
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        InnerSample extends MetaSolidSample = MetaSolidSample
    > =
    VolumeSample &
    Omit<TxSample, keyof MetaSolidParametersIn> &
    MetaSolidSampleExtraFields<InnerSample> & {
        [texturing.SurfaceObjectsTextureLocationsGroupsDefaultKey]: TextureLocation
    }

export type MetaSolidTextureLocation<
        Location extends MetaSolidLocation = MetaSolidLocation,
        ParametersIn extends FieldsPoint = FieldsPoint
    > =
    MetaSolidLocationExtraFields<Location> & ParametersIn & TextureLocation

export type MetaSolidTextureSample<
        Sample extends MetaSolidSample = MetaSolidSample,
        ParametersOut extends FieldsPoint = FieldsPoint
    > =
    MetaSolidSampleExtraFields<Sample> & ParametersOut & TextureSample

export type MetaSolidTexture<
        Location extends MetaSolidLocation = MetaSolidLocation,
        Sample extends MetaSolidSample = MetaSolidSample,
        ParametersIn extends FieldsPoint = FieldsPoint,
        ParametersOut extends FieldsPoint = FieldsPoint,
        TextureContext extends
            TextureSamplingContext<MetaSolidTextureLocation<Location, ParametersIn>> =
            TextureSamplingContext<MetaSolidTextureLocation<Location, ParametersIn>>
    > =
    Texture<
        MetaSolidTextureLocation<Location, ParametersIn>,
        MetaSolidTextureSample<Sample, ParametersOut>,
        TextureContext
    >

export const MetaSolidSamplingContext_Volume = Symbol('metasolid:volume')
export const MetaSolidSamplingContext_Texture = Symbol('metasolid:texture')

export interface MetaSolidVolumeSamplingContext<
        TxLocation extends TextureLocation = TextureLocation,
        Location extends MetaSolidLocation = MetaSolidLocation,
        OuterSampleProcessingContextT = any,
        TextureContext extends
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>
    > extends
    VolumeSamplingContextWithSurfaceHints<Location, OuterSampleProcessingContextT>,
    VolumeSamplingContextWithSolidHints<Location, OuterSampleProcessingContextT> {
    [MetaSolidSamplingContext_Texture]: TextureContext
}

export type MetaSolidVolumeMultiObjectsInternalPreservedGroups = {
    [MetaSolidSamplingContext_Texture]: MultiObjectsGroupsTemplateLeaf
}

export const MetaSolidVolumeMultiObjectsInternalPreservedGroupsTemplate: MetaSolidVolumeMultiObjectsInternalPreservedGroups = {
    [MetaSolidSamplingContext_Texture]: MultiObjectsGroupsTemplate_Leaf
}

export interface MetaSolidShapeSamplingContext<
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        Location extends MetaSolidLocation = MetaSolidLocation,
        OuterSampleProcessingContextT = any,
        TextureContext extends
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaSolidVolumeSamplingContext<TxLocation, Location, OuterSampleProcessingContextT, TextureContext> =
            MetaSolidVolumeSamplingContext<TxLocation, Location, OuterSampleProcessingContextT, TextureContext>
    > extends
    VolumeSamplingContextWithSurfaceHints<Location, OuterSampleProcessingContextT>,
    VolumeSamplingContextWithSolidHints<Location, OuterSampleProcessingContextT> {
    [MetaSolidSamplingContext_Volume]: VolumeContext
    [MetaSolidSamplingContext_Texture]: {
        item: Texture<MetaSolidTxLocation<Location, TxLocation>, TxSample, TextureContext>
        context: TextureContext
    }
}

export interface MetaSolidShape<
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        Location extends MetaSolidLocation = MetaSolidLocation,
        Sample extends MetaSolidSample = MetaSolidSample,
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
    >
    extends SampleDomain<Location, Sample, Context> {
    boundingBox: BoundingBox
}

export class MetaSolidVolume<
        Location extends MetaSolidLocation = MetaSolidLocation,
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        InnerSample extends
            Omit<TxLocation, keyof TextureLocation> & MetaSolidSample =
            Omit<TxLocation, keyof TextureLocation> & MetaSolidSample,
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
    > extends
    TransformingSampleDomain<
        Location,
        MetaSolidVolumeSample<TxSample, InnerSample>,
        VolumeContext,
        Location,
        InnerSample,
        Context
    > implements
    VolumeWithBoundingBox<
        Location,
        MetaSolidVolumeSample<TxSample, InnerSample>,
        OuterSampleProcessingContextT,
        VolumeContext
    > {
    get boundingBox(): BoundingBox {
        return this.shape?.boundingBox
    }

    get shape() {
        return this.inner as MetaSolidShape<
            TxLocation,
            TxSample,
            Location,
            InnerSample,
            OuterSampleProcessingContextT,
            TextureContext,
            VolumeContext,
            Context
        >
    }

    set shape(shape) {
        this.inner = shape
    }

    constructor(
            shape: MetaSolidShape<
                    TxLocation,
                    TxSample,
                    Location,
                    InnerSample,
                    OuterSampleProcessingContextT,
                    TextureContext,
                    VolumeContext,
                    Context
                >,
            public texture?: Texture<
                    MetaSolidTxLocation<Location>,
                    TxSample,
                    TextureContext
                >
        ) {
        super(shape)
    }

    override init(context: VolumeContext): void {
        context[MetaSolidSamplingContext_Texture] = {
            [SampleDomainLocationFieldKey]: FieldsField.merge<MetaSolidTxLocation<Location, TxLocation>>(
                (context[SampleDomainLocationFieldKey] as FieldsField<Location>).omit({
                    p: FieldsPoint_Omit_Leaf
                } as FieldsPointMapped<Location, typeof FieldsPoint_Omit_Leaf>) as any as FieldsField<MetaSolidTxLocation<Location, TxLocation>>,
                new FieldsField<MetaSolidTxLocation<Location, TxLocation>>({
                    uv: new Vec2Field(),
                } as FieldsPointMapped<MetaSolidTxLocation<Location, TxLocation>, Field>)
            )
        } as any as TextureContext
        this.texture?.init(context[MetaSolidSamplingContext_Texture])

        super.init(context)

        context[MetaSolidSamplingContext_Texture] = {
            [SampleDomainLocationFieldKey]: FieldsField.merge(
                (context[MetaSolidSamplingContext_Texture][SampleDomainLocationFieldKey] as FieldsField<MetaSolidTxLocation<Location, TxLocation>>),
                (this.inner.field as any as FieldsField<MetaSolidSample>).omit({
                    distance: FieldsPoint_Omit_Leaf,
                    gradient: FieldsPoint_Omit_Leaf,
                    falloff: FieldsPoint_Omit_Leaf,
                    unit: FieldsPoint_Omit_Leaf,
                    uv: FieldsPoint_Omit_Leaf,
                } as any as FieldsPointMapped<MetaSolidSample, typeof FieldsPoint_Omit_Leaf>) as any as FieldsField<MetaSolidTxLocation<Location, TxLocation>>
            )
        } as any as TextureContext
        this.texture?.init(context[MetaSolidSamplingContext_Texture])
    }

    protected override init_transfer_context(innerContext: Context, outerContext: VolumeContext): void {
        super.init_transfer_context(innerContext, outerContext)
        
        outerContext[MetaSolidSamplingContext_Texture] = innerContext[MetaSolidSamplingContext_Texture].context
    }

    protected override init_make_field(innerField: Field<InnerSample>, context: { inner: Context }): Field<MetaSolidVolumeSample<TxSample, InnerSample>> {
        const presenceField = new FieldsField({
            presence: new ScalarField()
        })

        const textureLocationField = new FieldsField({
            [texturing.SurfaceObjectsTextureLocationsGroupsDefaultKey]: context.inner[MetaSolidSamplingContext_Texture].context[SampleDomainLocationFieldKey]
        })

        return FieldsField.merge<MetaSolidVolumeSample<TxSample, InnerSample>>(
            presenceField as FieldsField<MetaSolidVolumeSample<TxSample, InnerSample>>,
            textureLocationField as FieldsField<MetaSolidVolumeSample<TxSample, InnerSample>>,
            ((innerField as FieldsField<InnerSample>).omit({
                distance: FieldsPoint_Omit_Leaf,
                uv: FieldsPoint_Omit_Leaf,
                falloff: FieldsPoint_Omit_Leaf,
                unit: FieldsPoint_Omit_Leaf,
            } as FieldsPointMapped<InnerSample, typeof FieldsPoint_Omit_Leaf>)) as FieldsField<MetaSolidVolumeSample<TxSample, InnerSample>>,
            ((this.texture?.field as FieldsField<TxSample>)?.omit({
                falloff: FieldsPoint_Omit_Leaf,
                unit: FieldsPoint_Omit_Leaf,
            } as FieldsPointMapped<TxSample, typeof FieldsPoint_Omit_Leaf>)) as FieldsField<MetaSolidVolumeSample<TxSample, InnerSample>>,
        )
    }

    protected override transformContext(context: VolumeContext): Context {
        type InnerContextT = MetaSolidShapeSamplingContext<
            TxLocation,
            TxSample,
            Location,
            OuterSampleProcessingContextT,
            TextureContext,
            VolumeContext
        >

        const inner: InnerContextT = {
            ...context,
            [MetaSolidSamplingContext_Volume]: context,
            [MetaSolidSamplingContext_Texture]: {
                context: context[MetaSolidSamplingContext_Texture],
                item: this.texture!
            }
        }

        return inner as Context
    }

    protected override transformSample(
            sample: InnerSample,
            location: { outer: Location },
            context: { outer: VolumeContext, inner: Context }
        ): MetaSolidVolumeSample<TxSample, InnerSample> {
        const texture_location_field =
            context.inner[MetaSolidSamplingContext_Texture]
                .context[SampleDomainLocationFieldKey] as FieldsField<MetaSolidTxLocation<Location, TxLocation>>
        
        if (sample === undefined) {
            return {
                alpha: 0,
                gradient: Vec3.ZERO,
                [texturing.SurfaceObjectsTextureLocationsGroupsDefaultKey]: {
                    uv: field_point_invalid(Vec2.ZERO)
                },
            } as MetaSolidVolumeSample<TxSample, InnerSample>
        }

        const texture_location =
            fields_point_map<MetaSolidTxLocation<Location, TxLocation>, Field, FieldPoint>(
                texture_location_field.fields,
                leaf =>
                    leaf.interpolationType !== undefined &&
                    leaf.interpolationType[makeInterpolator] !== undefined,
                (_, path) => extract(location, path) ?? extract(sample, path)
            ) as any as MetaSolidTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>>
        const texture_sample = this.texture?.sample(texture_location, context.outer[MetaSolidSamplingContext_Texture])

        const parameters = MetaSolidVolume.combineParameters(sample, texture_sample)
        const is_valid = MetaSolidVolume.parametersValid(parameters)
        
        const surface_distance = !is_valid ? NaN : (sample.distance - parameters.unit.height) / parameters.unit.length
        const alpha = !is_valid ? 0 : ((1 - Math.min(1, Math.max(0, surface_distance))) ** parameters.falloff.rate)

        return change<
                MetaSolidVolumeSample<TxSample, InnerSample>,
                InnerSample & TxSample & { alpha: number },
                Omit<MetaSolidSample, keyof { gradient: Vec3 }>
            >({
            ...(texture_sample ?? {} as TxSample),
            ...(sample ?? {
                distance: 0,
                uv: Vec2.ZERO,
                gradient: Vec3.ZERO,
                ...MetaSolidVolume.defaultParameters
            } as InnerSample),
            alpha,
            [texturing.SurfaceObjectsTextureLocationsGroupsDefaultKey]: texture_location
        }, ['falloff', 'unit', 'uv', 'distance'], {})
    }

    static readonly defaultParameters: MetaSolidParametersIn = {
        unit: {
            height: 1,
            length: 1
        },
        falloff: {
            rate: 1,
        }
    }

    private static defaultFields_parametersIn = new FieldsField({
        falloff: {
            bias: new ScalarField(),
        },
        unit: {
            height: new ScalarField([0, Infinity]),
            length: new ScalarField([0, Infinity]),
        }
    } as any as FieldsPointMapped<MetaSolidParametersIn, Field>)

    static readonly defaultFields = {
        parametersIn: this.defaultFields_parametersIn,

        sample: new FieldsField({
            falloff: this.defaultFields_parametersIn.fields.falloff,
            unit: this.defaultFields_parametersIn.fields.unit,
            
            distance: new ScalarField([0, Infinity]),
            gradient: new Vec3Field(),
            uv: new Vec2Field(),
        } as any as FieldsPointMapped<MetaSolidSample, Field>),
    }

    static combineParameters(a?: FieldsPointOptional<MetaSolidParametersIn>, b?: FieldsPointOptional<MetaSolidParametersIn>): MetaSolidParametersIn {
        const parameters: MetaSolidParametersIn = {
            unit: { ...this.defaultParameters.unit },
            falloff: { ...this.defaultParameters.falloff },
        }

        parameters.unit.height += a?.unit?.height ?? 0
        parameters.unit.length *= a?.unit?.length ?? 1
        parameters.falloff.rate *= a?.falloff?.rate ?? 1

        parameters.unit.height += b?.unit?.height ?? 0
        parameters.unit.length *= b?.unit?.length ?? 1
        parameters.falloff.rate *= b?.falloff?.rate ?? 1

        return parameters
    }

    static parametersValid(parameters: MetaSolidParametersIn) {
        return !(
            isNaN(parameters.unit.height) ||
            isNaN(parameters.unit.length) ||
            isNaN(parameters.falloff.rate)
        )
    }

    /**
     * 
     * @param parameters MetaSolidParametersIn at this point
     * @returns distance to construct a bounding box (unit.height + unit.length)
     */
    static boundingLength(parameters: MetaSolidParametersIn): number {
        return parameters.unit.height + parameters.unit.length
    }

    static surfaceDistance(
            parameters: MetaSolidParametersIn,
            samplingContext: VolumeSamplingContextWithSurfaceHints
        ): number {
        if (!MetaSolidVolume.parametersValid(parameters))
            return 0
        
        /**
         * alpha = (1 - ((distance - unit.height) / unit.length)) ^ falloff.rate
         * = e^[ln(1 - ((distance - unit.height) / unit.length)) * falloff.rate]
         * ln(alpha) = ln(1 - ((distance - unit.height) / unit.length)) * falloff.rate
         * ln(alpha) / falloff.rate = ln(1 - ((distance - unit.height) / unit.length))
         * e^[ln(alpha) / falloff.rate] = 1 - ((distance - unit.height) / unit.length)
         * ((distance - unit.height) / unit.length) = 1 - e^[ln(alpha) / falloff.rate]
         * distance - unit.height = (1 - e^[ln(alpha) / falloff.rate]) * unit.length
         * distance = ((1 - e^[ln(alpha) / falloff.rate]) * unit.length) + unit.height
         * alpha = surface level alpha
         */
        
        return ((1 - Math.exp(Math.log(samplingContext[VolumeSurfacesKey].surfaceLevel) / parameters.falloff.rate)) * parameters.unit.length) + parameters.unit.height
    }
}
