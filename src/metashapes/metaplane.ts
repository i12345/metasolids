import { BoundingBox, Vec2, Vec3 } from "playcanvas-extended";
import { change, extraFields, Field, FieldsField, FieldsPoint, FieldsPointMapped, FieldsPointOptional, FieldsPoint_Omit_Leaf, SampleDomainLocationField, SamplingContext, SignField, Vec2Field } from "../fields/index.js";
import { FigureSample } from "../figures/figure.js";
import { TextureLocation, TextureSamplingContext } from "../textures/texture.js";
import { Sign } from "../utils/sign.js";
import { MetaShape, MetaShapeFigure, MetaShapeFigureLocation, MetaShapeFigureSample, MetaShapeLocation, MetaShapeParametersIn, MetaShapeSample, MetaShapeSamplingContext, MetaShapeSamplingContext_Texture, MetaShapeTxLocation, MetaShapeTxSample, MetaShapeVolume, MetaShapeVolumeSamplingContext } from "./metashape.js";

export interface MetaPlaneFigureParametersIn extends FieldsPoint {
    /**
     * The sign of the local z coordinate
     */
    side: Sign
}

export interface MetaPlaneFigureParametersOut extends MetaShapeParametersIn {
    /**
     * The thickness of the metaplane (additional unit scale in Z direction).
     * 
     * @default 1
     */
    thickness: number

    /**
     * The radius of the metaplane (additional unit scale in XY plane).
     * 
     * @default 1
     */
    radius: number
}

export type MetaPlaneFigureLocation<
    Location extends MetaShapeLocation = MetaShapeLocation
> = MetaShapeFigureLocation<Location, MetaPlaneFigureParametersIn>

export type MetaPlaneFigureSample<
    Sample extends MetaShapeSample = MetaShapeSample
> = MetaShapeFigureSample<Sample, MetaPlaneFigureParametersOut>

export const MetaPlaneSamplingContext_Figure = Symbol('metaplane:figure')
export interface MetaPlaneSamplingContext<
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
    [MetaPlaneSamplingContext_Figure]: SamplingContext<MetaPlaneFigureLocation<Location>>
}

export class MetaPlane<
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
        MetaPlaneSamplingContext<
            TxLocation,
            TxSample,
            Location,
            TextureContext,
            VolumeContext
        >
    > {
    boundingBox: BoundingBox
    field: Field<Sample>

    constructor(
        public figure: MetaShapeFigure<Location, Sample, MetaPlaneFigureParametersIn, MetaPlaneFigureParametersOut>
    ) { }
    
    init(context: MetaPlaneSamplingContext<
            TxLocation,
            TxSample,
            Location,
            TextureContext,
            VolumeContext
        >): void {
        context[MetaPlaneSamplingContext_Figure] = {
            [SampleDomainLocationField]: FieldsField.merge<MetaPlaneFigureLocation<Location>>(
                (context[SampleDomainLocationField] as FieldsField<Location>).omit({
                    p: FieldsPoint_Omit_Leaf
                } as FieldsPointMapped<Location, typeof FieldsPoint_Omit_Leaf>) as any as FieldsField<MetaPlaneFigureLocation<Location>>,
                new FieldsField<MetaPlaneFigureLocation<Location>>({
                    p: new Vec2Field(),
                    side: new SignField()
                } as FieldsPointMapped<MetaPlaneFigureLocation<Location>, Field>)
            )
        } as typeof context[typeof MetaPlaneSamplingContext_Figure]

        this.figure.init(context[MetaPlaneSamplingContext_Figure])

        const texture = context[MetaShapeSamplingContext_Texture].item

        const xy_box = this.figure.boundingBox
        const xy_min = new Vec2(xy_box.getMin().x, xy_box.getMin().y)
        const xy_size = new Vec2(xy_box.halfExtents.x, xy_box.halfExtents.y).mulScalar(2)
        
        let max_z = { [+1]: Number.NEGATIVE_INFINITY, [-1]: Number.NEGATIVE_INFINITY }
        let max_margin = 0

        const resolution = 32
        for (let x = 0; x < resolution; x++) {
            for (let y = 0; y < resolution; y++) {
                const uv = new Vec2(x, y).divScalar(resolution)
                const p = uv.mul(xy_size).add(xy_min)
                
                const texture_sample = texture?.sample({ uv } as MetaShapeTxLocation<Location, TxLocation>, context[MetaShapeSamplingContext_Texture].context)

                const figure_samples = Object.fromEntries([-1, 0, 1].map(side => [side,
                    this.figure.sample({ p, side } as MetaPlaneFigureLocation<Location>, context[MetaPlaneSamplingContext_Figure])]))
                
                max_z[+1] = Math.max(
                    max_z[+1],
                    MetaShapeVolume.boundingLength(
                        MetaShapeVolume.combineParameters(
                            MetaShapeVolume.combineParameters(
                                figure_samples[+1] as unknown as FieldsPointOptional<MetaShapeParametersIn>,
                                {
                                    unit: {
                                        length: figure_samples[+1].thickness
                                    }
                                } as unknown as FieldsPointOptional<MetaShapeParametersIn>
                            ) as unknown as FieldsPointOptional<MetaShapeParametersIn>,
                            texture_sample
                        )
                    )
                )
                
                max_z[-1] = Math.max(
                    max_z[-1],
                    MetaShapeVolume.boundingLength(
                        MetaShapeVolume.combineParameters(
                            MetaShapeVolume.combineParameters(
                                figure_samples[-1] as unknown as FieldsPointOptional<MetaShapeParametersIn>,
                                {
                                    unit: {
                                        length: figure_samples[-1].thickness
                                    }
                                } as unknown as FieldsPointOptional<MetaShapeParametersIn>
                            ) as unknown as FieldsPointOptional<MetaShapeParametersIn>,
                            texture_sample
                        )
                    )
                )

                max_margin = Math.max(
                    max_margin,
                    MetaShapeVolume.boundingLength(
                        MetaShapeVolume.combineParameters(
                            MetaShapeVolume.combineParameters(
                                figure_samples[0] as unknown as FieldsPointOptional<MetaShapeParametersIn>,
                                {
                                    unit: {
                                        length: figure_samples[0].thickness
                                    }
                                } as unknown as FieldsPointOptional<MetaShapeParametersIn>
                            ) as unknown as FieldsPointOptional<MetaShapeParametersIn>,
                            texture_sample
                        )
                    )
                )
            }
        }
        
        this.boundingBox = new BoundingBox(
            new Vec3(xy_box.center.x, xy_box.center.y, (max_z[+1] + max_z[-1]) / 2),
            new Vec3(max_margin, max_margin, (max_z[+1] - max_z[-1]) / 2).add(xy_box.halfExtents)
        )

        this.field = FieldsField.merge<Sample>(
            (this.figure.field as FieldsField<MetaPlaneFigureSample<Sample>>).omit<FigureSample>({
                distance: FieldsPoint_Omit_Leaf,
                pointOnFigure: FieldsPoint_Omit_Leaf
            } as FieldsPointMapped<MetaPlaneFigureSample<Sample>, typeof FieldsPoint_Omit_Leaf>) as any as FieldsField<Sample>,
            MetaShapeVolume.defaultFields.sample as FieldsField<Sample>
        )
    }

    sample(location: Location, context: MetaPlaneSamplingContext<TxLocation, TxSample, Location, TextureContext, VolumeContext>): Sample {
        //TODO: add spherical binary search for local minimium
        const figure_p = new Vec2(location.p.x, location.p.y)
        const side = Math.sign(location.p.z) as MetaPlaneFigureParametersIn["side"]
        const figure_location = change<MetaPlaneFigureLocation<Location>, Location, MetaShapeLocation>(location, ['p'], { p: figure_p, side })
        const figure_sample = this.figure.sample(figure_location, context[MetaPlaneSamplingContext_Figure])
        const { pointOnFigure, thickness, radius } = figure_sample
        const diff = new Vec3().sub2(location.p, new Vec3(pointOnFigure.x, pointOnFigure.y, 0))
        const gradient = diff.clone().normalize()

        const scale = new Vec3(
            thickness ?? 1,
            thickness ?? 1,
            radius ?? 1
        )

        diff.div(scale)
        gradient.div(scale)

        const distance = diff.length()
        const uv = new Vec2(
            ((location.p.x - this.boundingBox.center.x) / this.boundingBox.halfExtents.x) + 0.5,
            ((location.p.y - this.boundingBox.center.y) / this.boundingBox.halfExtents.y) + 0.5
        )

        return {
            ...extraFields<FigureSample, MetaPlaneFigureSample<Sample>>(
                figure_sample,
                {
                    distance: true,
                    pointOnFigure: true
                }
            ),
            distance,
            gradient,
            uv
        } as unknown as Sample
    }
}