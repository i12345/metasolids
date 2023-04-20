import { BoundingBox, Vec2, Vec3 } from "playcanvas-extended";
import { change, ExtraFields, Field, FieldPoint, FieldsField, FieldsPoint, FieldsPointMapped, FieldsPointOptional, FieldsPoint_Omit_Leaf, fields_point_map, field_point_clone, makeInterpolator, ScalarField, TransformingSampleDomain, Vec2Field, Vec3Field } from "../fields/index.js";
import { SampleDomain, SampleDomainLocationField, SamplingContext } from "../fields/domain.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../textures/texture.js";
import { extract } from "../utils/tree.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from "../volumes/volume.js";
import { MeshingSettings } from "../meshing/meshing-algorithm.js";

export interface MetaShapeLocation extends VolumeLocation {
}

export type MetaShapeLocationExtraFields<Location extends MetaShapeLocation = MetaShapeLocation> =
    ExtraFields<Location, VolumeLocation>

export type MetaShapeParametersIn = {
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
         * @default 1
         */
        rate: number

        /**
         * The logarithmic offset for falloff
         * 
         * @default 0
         */
        bias: number
    }
}

export type MetaShapeSample = FieldsPointOptional<MetaShapeParametersIn> & {
    /**
     * The closest distance to the shape in normalized distance units
     * (they might not be uniform through the local vector space)
     * 
     * This measures distance to the virtual defining geometry of the shape.
     * Combined with {@link unit.height}, it gives distance to calculate
     * presence.
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

export type MetaShapeTxLocation<
        Location extends VolumeLocation = VolumeLocation,
        TxLocation extends TextureLocation = TextureLocation
    > =
    MetaShapeTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>>

//TODO: refactor commonly recurring FieldsPoint & Omit<TxLocation, keyof TextureLocation>
// what is the meaning of TxLocation?

export type MetaShapeTxSample = FieldsPoint & FieldsPointOptional<MetaShapeParametersIn>

export type MetaShapeVolumeSample<
        TxSample extends MetaShapeTxSample = MetaShapeTxSample,
        InnerSample extends MetaShapeSample = MetaShapeSample
    > =
    VolumeSample & TxSample & InnerSample

export type MetaShapeSampleExtraFields<Sample extends MetaShapeSample = MetaShapeSample> =
    Omit<Sample, keyof MetaShapeSample>

export type MetaShapeTextureLocation<
        Location extends MetaShapeLocation = MetaShapeLocation,
        ParametersIn extends FieldsPoint = FieldsPoint
    > =
    MetaShapeLocationExtraFields<Location> & ParametersIn & TextureLocation

export type MetaShapeTextureSample<
        Sample extends MetaShapeSample = MetaShapeSample,
        ParametersOut extends FieldsPoint = FieldsPoint
    > =
    MetaShapeSampleExtraFields<Sample> & ParametersOut & TextureSample

export type MetaShapeTexture<
        Location extends MetaShapeLocation = MetaShapeLocation,
        Sample extends MetaShapeSample = MetaShapeSample,
        ParametersIn extends FieldsPoint = FieldsPoint,
        ParametersOut extends FieldsPoint = FieldsPoint,
        TextureContext extends
            TextureSamplingContext<MetaShapeTextureLocation<Location, ParametersIn>> =
            TextureSamplingContext<MetaShapeTextureLocation<Location, ParametersIn>>
    > =
    Texture<
        MetaShapeTextureLocation<Location, ParametersIn>,
        MetaShapeTextureSample<Sample, ParametersOut>,
        TextureContext
    >

export const MetaShapeSamplingContext_Volume = Symbol('metashape:volume')
export const MetaShapeSamplingContext_Texture = Symbol('metashape:texture')

export interface MetaShapeVolumeSamplingContext<
        TxLocation extends TextureLocation = TextureLocation,
        Location extends MetaShapeLocation = MetaShapeLocation,
        TextureContext extends
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>>
    > extends
    VolumeSamplingContext<Location> {
    [MetaShapeSamplingContext_Texture]: TextureContext
}

export interface MetaShapeSamplingContext<
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
    SamplingContext<Location> {
    [MetaShapeSamplingContext_Volume]: VolumeContext
    [MetaShapeSamplingContext_Texture]: {
        item: Texture<MetaShapeTxLocation<Location, TxLocation>, TxSample, TextureContext>
        context: TextureContext
    }
}

export interface MetaShape<
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
    >
    extends SampleDomain<Location, Sample, Context> {
    boundingBox: BoundingBox
}

export class MetaShapeVolume<
        Location extends MetaShapeLocation = MetaShapeLocation,
        TxLocation extends TextureLocation = TextureLocation,
        TxSample extends MetaShapeTxSample = MetaShapeTxSample,
        InnerSample extends
            Omit<TxLocation, keyof TextureLocation> & MetaShapeSample =
            Omit<TxLocation, keyof TextureLocation> & MetaShapeSample,
        TextureContext extends
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>> =
            TextureSamplingContext<MetaShapeTxLocation<Location, TxLocation>>,
        VolumeContext extends
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext> =
            MetaShapeVolumeSamplingContext<TxLocation, Location, TextureContext>,
        Context extends
            MetaShapeSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext> =
            MetaShapeSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext>,
    > extends
    TransformingSampleDomain<
        Location,
        MetaShapeVolumeSample<TxSample, InnerSample>,
        VolumeContext,
        Location,
        InnerSample,
        Context
    > implements
    Volume<
        Location,
        MetaShapeVolumeSample<TxSample, InnerSample>,
        VolumeContext
    > {
    get boundingBox(): BoundingBox {
        return this.shape?.boundingBox
    }

    get shape() {
        return this.inner as MetaShape<
            TxLocation,
            TxSample,
            Location,
            InnerSample,
            TextureContext,
            VolumeContext,
            Context
        >
    }

    set shape(shape) {
        this.inner = shape
    }

    constructor(
            shape: MetaShape<
                    TxLocation,
                    TxSample,
                    Location,
                    InnerSample,
                    TextureContext,
                    VolumeContext,
                    Context
                >,
            public texture?: Texture<
                    MetaShapeTxLocation<Location>,
                    TxSample,
                    TextureContext
                >
        ) {
        super(shape)
    }

    override init(context: VolumeContext): void {
        context[MetaShapeSamplingContext_Texture] = {
            [SampleDomainLocationField]: FieldsField.merge<MetaShapeTxLocation<Location, TxLocation>>(
                (context[SampleDomainLocationField] as FieldsField<Location>).omit({
                    p: FieldsPoint_Omit_Leaf
                } as FieldsPointMapped<Location, typeof FieldsPoint_Omit_Leaf>) as any as FieldsField<MetaShapeTxLocation<Location, TxLocation>>,
                new FieldsField<MetaShapeTxLocation<Location, TxLocation>>({
                    uv: new Vec2Field(),
                } as FieldsPointMapped<MetaShapeTxLocation<Location, TxLocation>, Field>)
            )
        } as any as TextureContext
        this.texture?.init(context[MetaShapeSamplingContext_Texture])

        super.init(context)

        context[MetaShapeSamplingContext_Texture] = {
            [SampleDomainLocationField]: FieldsField.merge(
                (context[MetaShapeSamplingContext_Texture][SampleDomainLocationField] as FieldsField<MetaShapeTxLocation<Location, TxLocation>>),
                this.inner.field as any as FieldsField<MetaShapeTxLocation<Location, TxLocation>>
            )
        } as any as TextureContext
        this.texture?.init(context[MetaShapeSamplingContext_Texture])
    }

    protected override init_transfer_context(innerContext: Context, outerContext: VolumeContext): void {
        super.init_transfer_context(innerContext, outerContext)
        
        outerContext[MetaShapeSamplingContext_Texture] = innerContext[MetaShapeSamplingContext_Texture].context
    }

    protected override init_make_field(innerField: Field<InnerSample>): Field<MetaShapeVolumeSample<TxSample, InnerSample>> {
        const presenceField = new FieldsField<{ presence: number }>({
            presence: new ScalarField()
        })

        return FieldsField.merge<MetaShapeVolumeSample<TxSample, InnerSample>>(
            presenceField as FieldsField<MetaShapeVolumeSample<TxSample, InnerSample>>,
            ((innerField as FieldsField<InnerSample>).omit({
                falloff: FieldsPoint_Omit_Leaf,
                unit: FieldsPoint_Omit_Leaf,
            } as FieldsPointMapped<InnerSample, typeof FieldsPoint_Omit_Leaf>)) as FieldsField<MetaShapeVolumeSample<TxSample, InnerSample>>,
            ((this.texture?.field as FieldsField<TxSample>)?.omit({
                falloff: FieldsPoint_Omit_Leaf,
                unit: FieldsPoint_Omit_Leaf,
            } as FieldsPointMapped<InnerSample, typeof FieldsPoint_Omit_Leaf>)) as FieldsField<MetaShapeVolumeSample<TxSample, InnerSample>>
        )
    }

    protected override transformContext(context: VolumeContext): Context {
        const inner: MetaShapeSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext> = {
            ...context,
            [MetaShapeSamplingContext_Volume]: context,
            [MetaShapeSamplingContext_Texture]: {
                context: context[MetaShapeSamplingContext_Texture],
                item: this.texture
            }
        }

        return inner as Context
    }

    protected override transformSample(
            sample: InnerSample,
            location: { outer: Location },
            context: { outer: VolumeContext, inner: Context }
        ): MetaShapeVolumeSample<TxSample, InnerSample> {
        const texture_location_field =
            this.texture ?
                (context.inner[MetaShapeSamplingContext_Texture].context[SampleDomainLocationField] as FieldsField<MetaShapeTxLocation<Location, TxLocation>>) :
                undefined
        const texture_location =
            this.texture ?
                fields_point_map<MetaShapeTxLocation<Location, TxLocation>, Field, FieldPoint>(
                    texture_location_field.fields,
                    leaf =>
                        leaf.interpolationType !== undefined &&
                        leaf.interpolationType[makeInterpolator] !== undefined,
                    (_, path) => extract(location, path) ?? extract(sample, path)
                ) as any as MetaShapeTextureLocation<Location, FieldsPoint & Omit<TxLocation, keyof TextureLocation>> :
                undefined
        const texture_sample = this.texture?.sample(texture_location, context.outer[MetaShapeSamplingContext_Texture])

        const parameters = MetaShapeVolume.combineParameters(sample, texture_sample)
        const is_valid = MetaShapeVolume.parametersValid(parameters) && sample !== undefined
        
        const surface_distance = !is_valid ? NaN : (sample.distance - parameters.unit.height) / parameters.unit.length
        const presence = !is_valid ? 0 : Math.min(1, Math.exp((surface_distance + parameters.falloff.bias) * -parameters.falloff.rate))

        return change<MetaShapeVolumeSample<TxSample, InnerSample>, InnerSample & TxSample, MetaShapeParametersIn>({
            ...texture_sample,
            ...(sample ?? {
                distance: 0,
                uv: Vec2.ZERO,
                gradient: Vec3.ZERO,
                ...MetaShapeVolume.defaultParameters
            } as typeof sample),
            presence,
        }, ['falloff', 'unit'], {})
    }

    static readonly defaultParameters: MetaShapeParametersIn = {
        unit: {
            height: 1,
            length: 1
        },
        falloff: {
            rate: 1,
            bias: 0
        }
    }

    private static defaultFields_parametersIn = new FieldsField({
        falloff: {
            bias: new ScalarField(),
            rate: new ScalarField(),
        },
        unit: {
            height: new ScalarField([0, Infinity]),
            length: new ScalarField([0, Infinity]),
        }
    } as any as FieldsPointMapped<MetaShapeParametersIn, Field>)

    static readonly defaultFields = {
        parametersIn: this.defaultFields_parametersIn,

        sample: new FieldsField({
            falloff: this.defaultFields_parametersIn.fields.falloff,
            unit: this.defaultFields_parametersIn.fields.unit,
            
            distance: new ScalarField([0, Infinity]),
            gradient: new Vec3Field(),
            uv: new Vec2Field(),
        } as any as FieldsPointMapped<MetaShapeSample, Field>),
    }

    static combineParameters(a?: FieldsPointOptional<MetaShapeParametersIn>, b?: FieldsPointOptional<MetaShapeParametersIn>): MetaShapeParametersIn {
        const parameters: MetaShapeParametersIn = {
            unit: {
                height: 0,
                length: 1
            },
            falloff: {
                bias: 0,
                rate: 1
            }
        }

        parameters.unit.height += a?.unit?.height ?? 0
        parameters.unit.length *= a?.unit?.length ?? 1
        parameters.falloff.bias += a?.falloff?.bias ?? 0
        parameters.falloff.rate *= a?.falloff?.rate ?? 1

        parameters.unit.height += b?.unit?.height ?? 0
        parameters.unit.length *= b?.unit?.length ?? 1
        parameters.falloff.bias += b?.falloff?.bias ?? 0
        parameters.falloff.rate *= b?.falloff?.rate ?? 1

        return parameters
    }

    static parametersValid(parameters: MetaShapeParametersIn) {
        return !(
            isNaN(parameters.unit.height) ||
            isNaN(parameters.unit.length) ||
            isNaN(parameters.falloff.bias) ||
            isNaN(parameters.falloff.rate))
    }

    static boundingLength(
            parameters: MetaShapeParametersIn,
            meshingSettings: MeshingSettings
        ): number {
        if (!MetaShapeVolume.parametersValid(parameters))
            return 0
        
        /**
         * Solving for distance given the other known values
         * 
         * exp((surface_distance + parameters.falloff.bias) * -parameters.falloff.rate) = surfaceLevel
         * (surface_distance + parameters.falloff.bias) * -parameters.falloff.rate = ln(surfaceLevel)
         * surface_distance + parameters.falloff.bias = ln(surfaceLevel) / -parameters.falloff.rate
         * surface_distance = (ln(surfaceLevel) / -parameters.falloff.rate) - parameters.falloff.bias
         * 
         * surface_distance = (distance - parameters.unit.height) / parameters.unit.length
         * surface_distance * parameters.unit.length = distance - parameters.unit.height
         * (surface_distance * parameters.unit.length) + parameters.unit.height = distance
         * 
         * distance = (((ln(surfaceLevel) / -parameters.falloff.rate) - parameters.falloff.bias) * parameters.unit.length) + parameters.unit.height
         */

        return (((Math.log(meshingSettings.surfaceLevel) / -parameters.falloff.rate) - parameters.falloff.bias) * parameters.unit.length) + parameters.unit.height
    }

    static idealSurfaceLevel(parameters: MetaShapeParametersIn): number {
        /**
         * What value of surfaceLevel is needed so that distance = unit.length + unit.height
         * using the equation from the previous method?
         * 
         * distance = (((ln(surfaceLevel) / -falloff.rate) - falloff.bias) * unit.length) + unit.height
         * unit.length + unit.height = (((ln(surfaceLevel) / -falloff.rate) - falloff.bias) * unit.length) + unit.height
         * unit.length = ((ln(surfaceLevel) / -falloff.rate) - falloff.bias) * unit.length
         * 1 = (ln(surfaceLevel) / -falloff.rate) - falloff.bias
         * 1 + falloff.bias = ln(surfaceLevel) / -falloff.rate
         * (-falloff.rate)(1 + falloff.bias) = ln(surfaceLevel)
         * surfaceLevel = exp((-falloff.rate)(1 + falloff.bias))
         */

        return Math.exp((-parameters.falloff.rate) * (1 + parameters.falloff.bias))
    }
}
