import { BoundingBox, Vec2, Vec3 } from "playcanvas-extended";
import { change, ExtraFields, Field, FieldPoint, FieldsField, FieldsPoint, FieldsPointMapped, FieldsPointOptional, FieldsPoint_Omit_Leaf, fields_point_map, makeInterpolator, ScalarField, TransformingSampleDomain, Vec2Field, Vec3Field } from "../fields/index.js";
import { SampleDomain, SampleDomainLocationField, SamplingContext } from "../fields/domain.js";
import { Figure, FigureLocation, FigureSample } from "../figures/figure.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../textures/texture.js";
import { extract } from "../utils/tree.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from "../volumes/volume.js";

export interface MetaShapeLocation extends VolumeLocation {
}

export type MetaShapeLocationExtraFields<Location extends MetaShapeLocation = MetaShapeLocation> =
    ExtraFields<Location, VolumeLocation>

export interface MetaShapeParametersIn extends FieldsPoint {
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

export type MetaShapeSample = FieldsPoint & FieldsPointOptional<MetaShapeParametersIn> & {
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
    MetaShapeTextureLocation<Location, Omit<TxLocation, keyof TextureLocation>>

export type MetaShapeTxSample = FieldsPoint & FieldsPointOptional<MetaShapeParametersIn>

export type MetaShapeVolumeSample<
        TxSample extends MetaShapeTxSample = MetaShapeTxSample,
        InnerSample extends MetaShapeSample = MetaShapeSample
    > =
    VolumeSample & TxSample & InnerSample

export type MetaShapeSampleExtraFields<Sample extends MetaShapeSample = MetaShapeSample> =
    Omit<Sample, keyof MetaShapeSample>

export type MetaShapeFigureLocation<
        Location extends MetaShapeLocation = MetaShapeLocation,
        ParametersIn extends FieldsPoint = FieldsPoint
    > =
    MetaShapeLocationExtraFields<Location> & ParametersIn & FigureLocation

export type MetaShapeFigureSample<
        Sample extends MetaShapeSample = MetaShapeSample,
        ParametersOut extends FieldsPoint = FieldsPoint
    > =
    MetaShapeSampleExtraFields<Sample> & ParametersOut & FigureSample

export type MetaShapeFigure<
        Location extends MetaShapeLocation = MetaShapeLocation,
        Sample extends MetaShapeSample = MetaShapeSample,
        ParametersIn extends FieldsPoint = FieldsPoint,
        ParametersOut extends FieldsPoint = FieldsPoint
    > =
    Figure<
        MetaShapeFigureLocation<Location, ParametersIn>,
        MetaShapeFigureSample<Sample, ParametersOut>
    >

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
            TextureSamplingContext<MetaShapeTextureLocation<Location, Omit<TxLocation, keyof TextureLocation>>> =
            TextureSamplingContext<MetaShapeTextureLocation<Location, Omit<TxLocation, keyof TextureLocation>>>,
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
    texture: Texture<MetaShapeTxLocation<Location>, TxSample, TextureContext>

    get boundingBox(): BoundingBox {
        return this.shape.boundingBox
    }

    constructor(public shape: MetaShape<TxLocation, TxSample, Location, InnerSample, TextureContext, VolumeContext, Context>) {
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
        this.texture.init(context[MetaShapeSamplingContext_Texture])

        super.init(context)

        context[MetaShapeSamplingContext_Texture] = {
            [SampleDomainLocationField]: FieldsField.merge(
                (context[MetaShapeSamplingContext_Texture][SampleDomainLocationField] as FieldsField<MetaShapeTxLocation<Location, TxLocation>>),
                this.inner.field as any as FieldsField<MetaShapeTxLocation<Location, TxLocation>>
            )
        } as any as TextureContext
        this.texture.init(context[MetaShapeSamplingContext_Texture])
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
            ((this.texture.field as FieldsField<TxSample>).omit({
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
        const texture_location_field = (context.inner[MetaShapeSamplingContext_Texture][SampleDomainLocationField] as FieldsField<MetaShapeTxLocation<Location, TxLocation>>)
        const texture_location = fields_point_map<MetaShapeTxLocation<Location, TxLocation>, Field, FieldPoint>(
            texture_location_field.fields,
            leaf =>
                leaf.interpolationType !== undefined &&
                leaf.interpolationType[makeInterpolator] !== undefined,
            (_, path) => extract(location, path) ?? extract(sample, path)
        ) as any as MetaShapeTextureLocation<Location, Omit<TxLocation, keyof TextureLocation>>
        const texture_sample = this.texture?.sample(texture_location, context.outer[MetaShapeSamplingContext_Texture])
        
        const parameters = MetaShapeVolume.combineParameters(sample, texture_sample)
        
        const surface_distance = (sample.distance - parameters.unit.height) / parameters.unit.length
        const presence = Math.min(1, Math.exp((surface_distance + parameters.falloff.bias) * -parameters.falloff.rate))

        return change<MetaShapeVolumeSample<TxSample, InnerSample>, InnerSample & TxSample, MetaShapeParametersIn>({
            ...texture_sample,
            ...sample,
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

    static readonly defaultFields = {
        parametersIn: new FieldsField({
            falloff: {
                bias: new ScalarField(),
                rate: new ScalarField(),
            },
            unit: {
                height: new ScalarField(),
                length: new ScalarField(),
            }
        } as any as FieldsPointMapped<MetaShapeParametersIn, Field>),

        sample: new FieldsField({
            falloff: {
                bias: new ScalarField(),
                rate: new ScalarField(),
            },
            unit: {
                height: new ScalarField(),
                length: new ScalarField(),
            },
            
            distance: new ScalarField(),
            gradient: new Vec3Field(),
            uv: new Vec2Field(),
        } as any as FieldsPointMapped<MetaShapeSample, Field>),
    }

    static combineParameters(a?: FieldsPointOptional<MetaShapeParametersIn>, b?: FieldsPointOptional<MetaShapeParametersIn>): MetaShapeParametersIn {
        const parameters = MetaShapeVolume.defaultParameters

        parameters.unit.height += a?.unit?.height ?? 0
        parameters.unit.length *= a?.unit?.height ?? 1
        parameters.falloff.bias += a?.falloff?.bias ?? 0
        parameters.falloff.rate *= a?.falloff?.rate ?? 1

        parameters.unit.height += b?.unit?.height ?? 0
        parameters.unit.length *= b?.unit?.height ?? 1
        parameters.falloff.bias += b?.falloff?.bias ?? 0
        parameters.falloff.rate *= b?.falloff?.rate ?? 1

        return parameters
    }

    static boundingLength(parameters: MetaShapeParametersIn): number {
        const presence_threshhold = 0.1

        /**
         * w = (x - h) / l
         * y = e^((w + b) * r)
         * y = e^((((x - h) / l) + b) * r)
         * 
         * To solve for x given y,
         * 
         * ln(y) = (((x - h) / l) + b) * r
         * ln(y) / r = ((x - h) / l) + b
         * (ln(y) / r) - b = (x - h) / l
         * ((ln(y) / r) - b) * l = x - h
         * (((ln(y) / r) - b) * l) + h = x
         */

        return (((Math.log(presence_threshhold) / parameters.falloff.rate) - parameters.falloff.bias) * parameters.unit.length) + parameters.unit.height
    }
}
