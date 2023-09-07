import { BoundingBox, Vec2, Vec3 } from "playcanvas-extended";
import { change, ExtraFields, Field, FieldPoint, FieldsPoint, FieldsPointMapped, FieldsPointOptional, FieldsPoint_Omit_Leaf, fields_point_map, makeInterpolator, field_point_invalid, MultiObjectsInfluencesGroupsDefault, WithInfluence, WithInfluenceProcessingContext, MultiObjectsInfluencesGroupKindsTemplate } from "../../fields/index.js";
import { SampleDomain, SampleDomainLocationFieldKey } from "../../fields/domain.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../../textures/texture.js";
import { extract, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsTemplate, MultiObjectsGroupsMapped, WithMultiObjectsIDs, MultiObjectsIDsKey, MultiObjectsGroupsTemplate, groupKinds } from "../../paradigm/trees/index.js";
import { VolumeLocation, VolumeSample, defaultVolumeSampleField } from "../../volumes/index.js";
import { VolumeSurfacesKey, texturing } from "../../surfaces/index.js";
import { FusedVectorSamplingContext, TransformingSampleDomain, VectorSampleFunction, VectorSamplingContext, makeVectorSamplingContext } from "../../fields/domains/index.js";
import { ScalarField, Vec2Field, Vec3Field, FieldsField  } from "../../fields/fields/index.js";
import { VolumeSamplingContextWithSolidHints } from "../sampling/hints.js";
import { VolumeSamplingContextWithSurfaceHints } from "../../surfaces/sampling/hints.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { ArithmeticPrimitiveFuseMode } from "../../fields/vectorized/fuse-modes/arithmetic.js";
import { FuseMode } from "../../fields/vectorized/fusing.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorStatic, FieldPointVectorWithMultiObjects, IsDynamicVector } from "../../fields/vectorized/point.js";
import { vectorized } from "vectorized-functions";
import { vectorIterator } from "../../fields/vectorized/iterators/factory.js";
import { NumberTypedArray, typedArrayClone } from "../../utils/typed-array.js";
import { onlyOne } from "../../utils/only-one.js";

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

export type MetaSolidSample = MetaSolidParametersIn & {
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
        InnerSample extends MetaSolidSample = MetaSolidSample,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault
    > =
    VolumeSample &
    WithInfluence<InfluenceGroup> &
    Omit<TxSample, keyof MetaSolidParametersIn> &
    MetaSolidSampleExtraFields<InnerSample> &
    MultiObjectsGroupsMapped<texturing.SurfaceObjectsTextureLocationsGroupsDefault, TextureLocation>

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
        MetaSolidTextureLocation<Location, ParametersIn>,
        MetaSolidTextureLocation<Location, ParametersIn>,
        MetaSolidTextureSample<Sample, ParametersOut>,
        MetaSolidTextureSample<Sample, ParametersOut>,
        TextureContext
    >

export const MetaSolidSamplingContext_Volume = Symbol('metasolid:volume')
export const MetaSolidSamplingContext_Texture = Symbol('metasolid:texture')

export interface MetaSolidVolumeSamplingContext<
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
        TxLocation extends TextureLocation = TextureLocation,
        Location extends MetaSolidLocation = MetaSolidLocation,
        OuterSampleProcessingContextT = any,
        TextureContext extends
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>
    > extends
    WithInfluenceProcessingContext<InfluenceGroup>,
    VolumeSamplingContextWithSurfaceHints<Location, Location, Location, OuterSampleProcessingContextT>,
    VolumeSamplingContextWithSolidHints<Location, Location, Location, OuterSampleProcessingContextT> {
    [MetaSolidSamplingContext_Texture]: TextureContext
}

export type MetaSolidVolumeMultiObjectsInternalPreservedGroups = {
    [MetaSolidSamplingContext_Texture]: MultiObjectsGroupsTemplateLeaf
}

export const MetaSolidVolumeMultiObjectsInternalPreservedGroupsTemplate: MetaSolidVolumeMultiObjectsInternalPreservedGroups = {
    [MetaSolidSamplingContext_Texture]: MultiObjectsGroupsTemplate_Leaf
}

export interface MetaSolidShapeSamplingContext<
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        Location extends MetaSolidLocation = MetaSolidLocation,
        VolumeSampleProcessingContextT = any,
        TextureContext extends
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaSolidVolumeSamplingContext<
                    InfluenceGroup,
                    TxLocation,
                    Location,
                    VolumeSampleProcessingContextT,
                    TextureContext
                > =
            MetaSolidVolumeSamplingContext<
                    InfluenceGroup,
                    TxLocation,
                    Location,
                    VolumeSampleProcessingContextT,
                    TextureContext
                >
    > extends
    VolumeSamplingContextWithSurfaceHints<Location, Location, Location, VolumeSampleProcessingContextT>,
    VolumeSamplingContextWithSolidHints<Location, Location, Location, VolumeSampleProcessingContextT> {
    [MetaSolidSamplingContext_Volume]: VolumeContext
    [MetaSolidSamplingContext_Texture]: {
        item: Texture<
            MetaSolidTxLocation<Location, TxLocation>, TxSample,
            MetaSolidTxLocation<Location, TxLocation>,
            MetaSolidTxLocation<Location, TxLocation>,
            TxSample,
            TxSample,
            TextureContext
        >
        context: TextureContext
    }
}

export interface MetaSolidShape<
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
            MetaSolidVolumeSamplingContext<
                    InfluenceGroup,
                    TxLocation,
                    Location,
                    VolumeSampleProcessingContextT,
                    TextureContext
                > =
            MetaSolidVolumeSamplingContext<
                    InfluenceGroup,
                    TxLocation,
                    Location,
                    VolumeSampleProcessingContextT,
                    TextureContext
                >,
        Context extends
            MetaSolidShapeSamplingContext<
                    InfluenceGroup,
                    TxLocation,
                    TxSample,
                    Location,
                    VolumeSampleProcessingContextT,
                    TextureContext,
                    VolumeContext
                > =
            MetaSolidShapeSamplingContext<
                    InfluenceGroup,
                    TxLocation,
                    TxSample,
                    Location,
                    VolumeSampleProcessingContextT,
                    TextureContext,
                    VolumeContext
                >,
    >
    extends SampleDomain<
        Location, Sample,
        Location,
        Location,
        Sample,
        Sample,
        Context
    > {
    boundingBox: BoundingBox
}

export class MetaSolidVolume<
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
        Location extends MetaSolidLocation = MetaSolidLocation,        
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaSolidTxSample = MetaSolidTxSample,
        InnerSample extends
            Omit<TxLocation, keyof TextureLocation> & MetaSolidSample =
            Omit<TxLocation, keyof TextureLocation> & MetaSolidSample,
        VolumeSampleProcessingContextT = any,
        TextureContext extends
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaSolidTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaSolidVolumeSamplingContext<
                    InfluenceGroup,
                    TxLocation,
                    Location,
                    VolumeSampleProcessingContextT,
                    TextureContext
                > =
            MetaSolidVolumeSamplingContext<
                    InfluenceGroup,
                    TxLocation,
                    Location,
                    VolumeSampleProcessingContextT,
                    TextureContext
                >,
        Context extends
            MetaSolidShapeSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, VolumeSampleProcessingContextT, TextureContext, VolumeContext> =
            MetaSolidShapeSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, VolumeSampleProcessingContextT, TextureContext, VolumeContext>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
    > extends
    TransformingSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        Location,
        Location,
        Location,
        LocationContainer,
        MetaSolidVolumeSample<TxSample, InnerSample>,
        MetaSolidVolumeSample<TxSample, InnerSample>,
        MetaSolidVolumeSample<TxSample, InnerSample>,
        SampleContainer,
        VolumeContext,
        FieldPointVector<Location, LocationContainer>,
        FieldPointVectorWithMultiObjects<
                MetaSolidVolumeSample<TxSample, InnerSample>,
                SampleContainer,
                ObjIDsT,
                ObjIDsContainer
            >,
        FusedVectorSamplingContext<
                Location,
                Location,
                Location,
                LocationContainer,
                MetaSolidVolumeSample<TxSample, InnerSample>,
                MetaSolidVolumeSample<TxSample, InnerSample>,
                MetaSolidVolumeSample<TxSample, InnerSample>,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                VolumeContext,
                FieldPointVector<Location, LocationContainer>,
                FieldPointVectorWithMultiObjects<
                        MetaSolidVolumeSample<TxSample, InnerSample>,
                        SampleContainer,
                        ObjIDsT,
                        ObjIDsContainer
                    >
            >,
        Location,
        Location,
        Location,
        LocationContainer,
        InnerSample,
        InnerSample,
        InnerSample,
        SampleContainer,
        Context
    > implements
    VolumeWithBoundingBox<
        Location,
        Location,
        Location,
        MetaSolidVolumeSample<TxSample, InnerSample>,
        MetaSolidVolumeSample<TxSample, InnerSample>,
        MetaSolidVolumeSample<TxSample, InnerSample>,
        VolumeSampleProcessingContextT,
        VolumeContext
    > {
    protected readonly transformsLocation = false
    protected readonly transformsSample = true
    
    private influenceGroup_set!: (o: object, influence: any) => void

    get boundingBox(): BoundingBox {
        return this.shape?.boundingBox
    }

    get shape() {
        return this.inner as MetaSolidShape<
            InfluenceGroup,
            TxLocation,
            TxSample,
            Location,
            InnerSample,
            VolumeSampleProcessingContextT,
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
                    InfluenceGroup,
                    TxLocation,
                    TxSample,
                    Location,
                    InnerSample,
                    VolumeSampleProcessingContextT,
                    TextureContext,
                    VolumeContext,
                    Context
                >,
            public texture?: Texture<
                    MetaSolidTxLocation<Location>,
                    TxSample,
                    MetaSolidTxLocation<Location>,
                    MetaSolidTxLocation<Location>,
                    TxSample,
                    TxSample,
                    TextureContext
                >,
            public influenceGroup?: InfluenceGroup
        ) {
        super(shape)
    }

    override init(context: VolumeContext): void {
        this.influenceGroup_set = onlyOne(groupKinds(context, MultiObjectsInfluencesGroupKindsTemplate, this.influenceGroup)).group.set

        context[MetaSolidSamplingContext_Texture] = {
            [SampleDomainLocationFieldKey]: FieldsField.merge<MetaSolidTxLocation<Location, TxLocation>>(
                (context[SampleDomainLocationFieldKey] as FieldsField<Location>).omit({
                    p: FieldsPoint_Omit_Leaf
                } as FieldsPointMapped<Location, typeof FieldsPoint_Omit_Leaf>) as any as FieldsField<MetaSolidTxLocation<Location, TxLocation>>,
                new FieldsField<MetaSolidTxLocation<Location, TxLocation>>({
                    uv: Vec2Field.instance,
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
        
        const multiObjectIDs = (<WithMultiObjectsIDs<Objects, ObjIDsT>><unknown>context)[MultiObjectsIDsKey]
        if (this.texture && multiObjectIDs) {
            type TextureVectorContext = VectorSamplingContext<
                    MetaSolidTxLocation<Location, TxLocation>,
                    MetaSolidTxLocation<Location, TxLocation>,
                    MetaSolidTxLocation<Location, TxLocation>,
                    FieldPointVectorContainerStatic,
                    TxSample,
                    TxSample,
                    TxSample,
                    FieldPointVectorContainerStatic,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    TextureContext,
                    FieldPointVectorStatic<MetaSolidTxLocation<Location, TxLocation>, FieldPointVectorContainerStatic>,
                    FieldPointVectorStatic<TxSample, FieldPointVectorContainerStatic>
                >

            makeVectorSamplingContext(this.texture.field, <TextureVectorContext>context[MetaSolidSamplingContext_Texture], multiObjectIDs)
        }
    }

    protected override init_transfer_context(innerContext: Context, outerContext: VolumeContext): void {
        super.init_transfer_context(innerContext, outerContext)
        
        outerContext[MetaSolidSamplingContext_Texture] = innerContext[MetaSolidSamplingContext_Texture].context
    }

    protected override init_make_field(innerField: Field<InnerSample>, context: { inner: Context }): Field<MetaSolidVolumeSample<TxSample, InnerSample>> {
        const textureLocationField = new FieldsField({
            [texturing.SurfaceObjectsTextureLocationsGroupsDefaultKey]: context.inner[MetaSolidSamplingContext_Texture].context[SampleDomainLocationFieldKey]
        })

        const influenceGroup_fields = {} as FieldsPointMapped<MetaSolidVolumeSample<TxSample, InnerSample>, Field>
        this.influenceGroup_set(influenceGroup_fields, ScalarField.instance)

        return FieldsField.merge<MetaSolidVolumeSample<TxSample, InnerSample>>(
            defaultVolumeSampleField as FieldsField<MetaSolidVolumeSample<TxSample, InnerSample>>,
            textureLocationField as FieldsField<MetaSolidVolumeSample<TxSample, InnerSample>>,
            new FieldsField(influenceGroup_fields),
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
            InfluenceGroup,
            TxLocation,
            TxSample,
            Location,
            VolumeSampleProcessingContextT,
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

    @vectorized(MetaSolidVolume.transformSample_vectorized)
    protected override transformSample(
            sample: InnerSample,
            innerLocation: Location,
            outerLocation: Location,
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

        const result = change<
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
        
        this.influenceGroup_set(result, alpha)

        return result
    }

    private static transformSample_vectorized<
            InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsInfluencesGroupsDefault,
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
                MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext> =
                MetaSolidVolumeSamplingContext<InfluenceGroup, TxLocation, Location, OuterSampleProcessingContextT, TextureContext>,
            Context extends
                MetaSolidShapeSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext> =
                MetaSolidShapeSamplingContext<InfluenceGroup, TxLocation, TxSample, Location, OuterSampleProcessingContextT, TextureContext, VolumeContext>,
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
            LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        >(
            this: MetaSolidVolume<
                    InfluenceGroup,
                    Location,
                    TxLocation,
                    TxSample,
                    InnerSample,
                    OuterSampleProcessingContextT,
                    TextureContext,
                    VolumeContext,
                    Context,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    LocationContainer,
                    SampleContainer
                >,
            samples: FieldPointVector<InnerSample, SampleContainer>,
            innerLocations: FieldPointVector<Location, LocationContainer>,
            outerLocations: FieldPointVector<Location, LocationContainer>,
            context: {
                outer: FusedVectorSamplingContext<
                        Location,
                        Location,
                        Location,
                        LocationContainer,
                        MetaSolidVolumeSample<TxSample, InnerSample>,
                        MetaSolidVolumeSample<TxSample, InnerSample>,
                        MetaSolidVolumeSample<TxSample, InnerSample>,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        VolumeContext,
                        FieldPointVector<Location, LocationContainer>,
                        FieldPointVectorWithMultiObjects<
                                MetaSolidVolumeSample<TxSample, InnerSample>,
                                SampleContainer,
                                ObjIDsT,
                                ObjIDsContainer
                            >
                    >
                inner: Context
            }
        ): FieldPointVectorWithMultiObjects<
                MetaSolidVolumeSample<TxSample, InnerSample>,
                SampleContainer,
                ObjIDsT,
                ObjIDsContainer
            > {
        const texture_context = <TextureVectorContext>context.inner[MetaSolidSamplingContext_Texture].context
        const texture_location_field = texture_context[SampleDomainLocationFieldKey] as FieldsField<MetaSolidTxLocation<Location, TxLocation>>
        
        const multiObjectsIDs = context.outer[MultiObjectsIDsKey]
        const locations = innerLocations
        
        const texture_location =
            texture_location_field ?
            <FieldPointVector<MetaSolidTxLocation<Location, TxLocation>, FieldPointVectorContainerStatic>>
            fields_point_map<MetaSolidTxLocation<Location, TxLocation>, Field, FieldPointVectorContainerStatic>(
                texture_location_field.fields,
                leaf =>
                    leaf.interpolationType !== undefined &&
                    leaf.interpolationType[makeInterpolator] !== undefined,
                (_, path) => extract(locations, path) ?? extract(samples, path)
            ) :
            undefined
        
        type TextureVectorContext = VectorSamplingContext<
                MetaSolidTxLocation<Location, TxLocation>,
                MetaSolidTxLocation<Location, TxLocation>,
                MetaSolidTxLocation<Location, TxLocation>,
                FieldPointVectorContainerStatic,
                TxSample,
                TxSample,
                TxSample,
                FieldPointVectorContainerStatic,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                TextureContext,
                FieldPointVector<MetaSolidTxLocation<Location, TxLocation>, FieldPointVectorContainerStatic>,
                FieldPointVector<TxSample, FieldPointVectorContainerStatic>
            >

        const texture_samples = this.texture ? texture_context[VectorSampleFunction](this.texture, texture_location!, texture_context) : undefined

        const parameters = MetaSolidVolume.combineParameters_vectorized(<FieldPointVector<MetaSolidParametersIn>>samples, <FieldPointVector<MetaSolidParametersIn>>texture_samples)
        
        const samples_iterator = vectorIterator(this.inner.field.elementType, <IsDynamicVector<InnerSample, SampleContainer>>false, multiObjectsIDs)
        const length = samples_iterator.length(samples, samples)

        if (MultiObjectsIDsKey in samples)
            throw new Error("cannot handle metasolids with multiobjects samples")

        type ResultSamplesVector = FieldPointVectorWithMultiObjects<
                MetaSolidVolumeSample<TxSample, InnerSample>,
                SampleContainer,
                ObjIDsT,
                ObjIDsContainer
            >
        
        const result_samples = <ResultSamplesVector><unknown>samples

        const samples_distance = (<FieldPointVector<MetaSolidSample, SampleContainer>>samples).distance
        const parameters_unit_height = <NumberTypedArray>parameters.unit!.height
        const parameters_unit_length = <NumberTypedArray>parameters.unit!.length
        const parameters_falloff_rate = <NumberTypedArray>parameters.falloff!.rate
        const result_alpha = (<FieldPointVector<MetaSolidVolumeSample, SampleContainer>><unknown>result_samples).alpha = <SampleContainer><unknown>(new Float64Array(length))

        let surface_distance: number
        let isValid: boolean
        let parameter_unit_height: number,
            parameter_unit_length: number,
            parameter_falloff_rate: number
        for (let i = 0; i < length; i++) {
            parameter_unit_height = parameters_unit_height[i]
            parameter_unit_length = parameters_unit_length[i]
            parameter_falloff_rate = parameters_falloff_rate[i]
            isValid = (
                !Number.isNaN(parameter_unit_height) &&
                !Number.isNaN(parameter_unit_length) &&
                !Number.isNaN(parameter_falloff_rate)
            )

            if (isValid) {
                surface_distance = (samples_distance[i] - parameter_unit_height) / parameter_unit_length
                result_alpha[i] = ((1 - Math.min(1, Math.max(0, surface_distance))) ** parameter_falloff_rate)
            }
            else result_alpha[i] = 0
        }

        this.influenceGroup_set(result_samples, typedArrayClone(result_alpha));

        (<FieldPointVector<MetaSolidVolumeSample, SampleContainer>><unknown>result_samples)[texturing.SurfaceObjectsTextureLocationsGroupsDefaultKey] = <any><FieldPointVector<MetaSolidTextureLocation<Location>>>texture_location

        delete (<Partial<FieldPointVector<MetaSolidSample, SampleContainer>>>result_samples).falloff
        delete (<Partial<FieldPointVector<MetaSolidSample, SampleContainer>>>result_samples).unit
        delete (<Partial<FieldPointVector<MetaSolidSample, SampleContainer>>>result_samples).uv
        delete (<Partial<FieldPointVector<MetaSolidSample, SampleContainer>>>result_samples).distance

        return result_samples
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
            rate: ScalarField.instance,
        },
        unit: {
            height: new ScalarField(<FuseMode<number>>ArithmeticPrimitiveFuseMode.add, [0, Infinity]),
            length: new ScalarField(<FuseMode<number>>ArithmeticPrimitiveFuseMode.add, [0, Infinity]),
        }
    } as FieldsPointMapped<MetaSolidParametersIn, Field>)

    static readonly defaultFields = {
        parametersIn: this.defaultFields_parametersIn,

        sample: new FieldsField({
            falloff: this.defaultFields_parametersIn.fields.falloff,
            unit: this.defaultFields_parametersIn.fields.unit,
            
            distance: new ScalarField(<FuseMode<number>>ArithmeticPrimitiveFuseMode.add, [0, Infinity]),
            gradient: Vec3Field.instance,
            uv: Vec2Field.instance,
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

    static combineParameters_vectorized(
            accumulator: FieldPointVector<MetaSolidParametersIn>,
            multiplier?: FieldPointVector<Partial<MetaSolidParametersIn>>
        ): FieldPointVector<Partial<MetaSolidParametersIn>> {
        const accumulator_unit_height = accumulator?.unit?.height
        const accumulator_unit_length = accumulator?.unit?.length
        const accumulator_falloff_rate = accumulator?.falloff?.rate

        const multiplier_unit_height = multiplier?.unit?.height
        const multiplier_unit_length = multiplier?.unit?.length
        const multiplier_falloff_rate = multiplier?.falloff?.rate
        
        if (!accumulator_unit_height ||
            !accumulator_unit_length ||
            !accumulator_falloff_rate) 
            return <FieldPointVector<Partial<MetaSolidParametersIn>>>accumulator

        if (!multiplier_unit_height ||
            !multiplier_unit_length ||
            !multiplier_falloff_rate)
            return accumulator

        for (let i = 0; i < length; i++) {
            accumulator_unit_height[i] *= multiplier_unit_height[i]
            accumulator_unit_length[i] *= multiplier_unit_length[i]
            accumulator_falloff_rate[i] *= multiplier_falloff_rate[i]
        }

        return accumulator
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
