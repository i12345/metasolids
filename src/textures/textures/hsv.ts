import { Color, Vec2 } from "playcanvas-extended";
import { VectorSamplingContext, makeVectorSamplingContext } from "../../fields/domains/vector.js";
import { FieldPointVectorContainerStatic, FieldPointVector } from "../../fields/vectorized/point.js";
import { MultiObjectsIDsKey, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureRenderContext, TextureSamplingContext } from "../texture.js";
import { Tensor, Rank } from "@tensorflow/tfjs";
import { FieldsPointMapped } from "../../fields/point.js";
import { ColorField } from "../../fields/fields/color.js";
import { convertHsvToRgb } from "culori"
import { ScalarField } from "../../fields/fields/scalar.js";
import * as tf from "@tensorflow/tfjs"
import { FieldPointTensor2D } from "../../fields/tensor/tensor.js";

export class HSVTexture<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Context extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVector<Color, SampleContainer> =
            FieldPointVector<Color, SampleContainer>,
        VectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Color,
                    Color,
                    Color,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Color,
                    Color,
                    Color,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                >
    >
    implements Texture<
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Color,
        Color,
        Color,
        SampleContainer,
        Context,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    readonly field = ColorField.instance

    constructor(
        /** Hue [0-360) */
        public readonly h: Texture<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                number,
                number,
                number,
                SampleContainer,
                Context,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LocationVector,
                FieldPointVector<number, SampleContainer>
            >,
        /** Saturation [0-1] */
        public readonly s: Texture<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                number,
                number,
                number,
                SampleContainer,
                Context,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LocationVector,
                FieldPointVector<number, SampleContainer>
            >,
        /** Value [0, 1] */
        public readonly v: Texture<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                number,
                number,
                number,
                SampleContainer,
                Context,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LocationVector,
                FieldPointVector<number, SampleContainer>
            >,
        ) { }
    
    init(context: Context): void {
        this.h.init(context)
        this.s.init(context)
        this.v.init(context)
    }

    sample(location: Location, context: Context): Color {
        const h = this.h.sample(location, context)
        const s = this.s.sample(location, context)
        const v = this.v.sample(location, context)
        const rgb = convertHsvToRgb({ h, s, v })
        return new Color(rgb.r, rgb.g, rgb.b)
    }

    render(resolution: Vec2, context: TextureRenderContext<Location, LocationElementType, LocationFuseMode, LocationContainer, Color, Color, Color, SampleContainer, Context, Objects, ObjIDsT, ObjIDsContainer, LocationVector, SampleVector, VectorContext>): FieldsPointMapped<{ r: number; g: number; b: number; a: number; }, Tensor<Rank.R2>> {
        const context_numbers = <TextureRenderContext<Location, LocationElementType, LocationFuseMode, LocationContainer, number, number, number, SampleContainer, Context, Objects, ObjIDsT, ObjIDsContainer, LocationVector, FieldPointVector<number, SampleContainer>>><unknown>{ ...context }
        makeVectorSamplingContext<Location, LocationElementType, LocationFuseMode, LocationContainer, number, number, number, SampleContainer, Objects, ObjIDsT, ObjIDsContainer, Context, LocationVector, FieldPointVector<number, SampleContainer>>(ScalarField.instance, context_numbers, context[MultiObjectsIDsKey])
        const h = this.h.render(resolution, context_numbers)
        const s = this.h.render(resolution, context_numbers)
        const v = this.h.render(resolution, context_numbers)
        
        // based on https://github.com/Evercoder/culori/blob/main/src/hsv/convertHsvToRgb.js
        const h_normalized = h.add(360).mod(360)
        const h_div_60 = h.div(60)
        const f = h_div_60.mod(2).sub(1).abs()
        const h_class = h.div(60).floor()
        
        const one_minus_s_mul_f = tf.sub(1, s.mul(f))
        const one_minus_s = tf.sub(1, s)

        const h_0_r = v
        const h_0_g = v.mul(one_minus_s_mul_f)
        const h_0_b = v.mul(one_minus_s)

        const h_1_r = v.mul(one_minus_s_mul_f)
        const h_1_g = v
        const h_1_b = v.mul(one_minus_s)

        const h_2_r = v.mul(one_minus_s)
        const h_2_g = v
        const h_2_b = v.mul(one_minus_s_mul_f)

        const h_3_r = v.mul(one_minus_s)
        const h_3_g = v.mul(one_minus_s_mul_f)
        const h_3_b = v

        const h_4_r = v.mul(one_minus_s_mul_f)
        const h_4_g = v.mul(one_minus_s)
        const h_4_b = v

        const h_5_r = v
        const h_5_g = v.mul(one_minus_s)
        const h_5_b = v.mul(one_minus_s_mul_f)

        const r = h_0_r.where(h_class.equal(0),
            h_1_r.where(h_class.equal(1),
                h_2_r.where(h_class.equal(2),
                    h_3_r.where(h_class.equal(3),
                        h_4_r.where(h_class.equal(4),
                            h_5_r)))))

        const g = h_0_g.where(h_class.equal(0),
            h_1_g.where(h_class.equal(1),
                h_2_g.where(h_class.equal(2),
                    h_3_g.where(h_class.equal(3),
                        h_4_g.where(h_class.equal(4),
                            h_5_g)))))

        const b = h_0_b.where(h_class.equal(0),
            h_1_b.where(h_class.equal(1),
                h_2_b.where(h_class.equal(2),
                    h_3_b.where(h_class.equal(3),
                        h_4_b.where(h_class.equal(4),
                            h_5_b)))))
        
        return <FieldPointTensor2D<Color>>{ r, g, b }
    }
}