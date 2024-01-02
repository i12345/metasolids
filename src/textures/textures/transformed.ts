import { Mat3, Mat4, Quat, Vec2, Vec3 } from "playcanvas-physics-advanced";
import { TransformingSampleDomain } from "../../fields/domains/transforming.js";
import { VectorSamplingContext } from "../../fields/domains/vector.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../../fields/vectorized/index.js";
import { MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray, typedArrayConstructor } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureRenderContext, TextureSample, TextureSamplingContext } from "../texture.js";
import { FieldPointTensor2D, field_point_tensor_map } from "../../fields/tensor/tensor.js";
import * as tf from "@tensorflow/tfjs"
import { mat4_from_mat3 } from "../../utils/matrix.js";

export class TransformedTexture<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
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
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        VectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
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
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                >
    >
    extends TransformingSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,

        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Context,
        LocationVector,
        SampleVector,
        VectorContext,

        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Context,
        LocationVector,
        SampleVector,
        VectorContext
    >
    implements Texture<
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Context,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    protected readonly transformsLocation = true
    protected readonly transformsSample = false
    
    private _transform!: Mat4

    constructor(
        inner: Texture<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                Sample,
                SampleElementType,
                SampleFuseMode,
                SampleContainer,
                Context,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LocationVector,
                SampleVector,
                VectorContext
            >,
            public translation: Vec2 = new Vec2(0, 0),
            public rotation: number = 0,
            public scale: Vec2 = new Vec2(1, 1),
        ) {
        super(inner)
    }

    init(context: Context): void {
        this._transform = new Mat4().mul2(
            new Mat4().mul2(
                new Mat4().setTranslate(this.translation.x, this.translation.y, 0),
                new Mat4().setFromEulerAngles(0, 0, this.rotation)
            ),
            new Mat4().setScale(this.scale.x, this.scale.y, 1)
        )

        super.init(context)
    }

    protected transformLocation(location: Location, context: { outer: Context; inner: Context; }): Location {
        const [
            m11, m12, m13, m14,
            m21, m22, m23, m24,
            m31, m32, m33, m34,
            m41, m42, m43, m44
        ] = this._transform.data

        return {
            ...location,
            uv: new Vec2(
                (m11 * location.uv.x) +
                (m21 * location.uv.y) +
                m31,
                (m12 * location.uv.x) +
                (m22 * location.uv.y) +
                m32
            )
        }
    }

    private static transformLocation_vectorized<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
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
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        VectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
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
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                >
        >(
            this: TransformedTexture<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Context,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    LocationVector,
                    SampleVector,
                    VectorContext
                >,
            locations: LocationVector,
            context: { outer: Context; inner: Context }
        ): LocationVector {
        const uv_outside = locations.uv
        const uv_inside = new (typedArrayConstructor(locations.uv))(locations.uv.length)

        const [
            m11, m12, m13, m14,
            m21, m22, m23, m24,
            m31, m32, m33, m34,
            m41, m42, m43, m44
        ] = this._transform.data

        for (let offset = 0; offset < locations.uv.length; offset += 2) {
            uv_inside[offset + 0] = (
                (m11 * uv_outside[offset + 0]) +
                (m21 * uv_outside[offset + 1]) +
                m31
            )

            uv_inside[offset + 1] = (
                (m12 * uv_outside[offset + 0]) +
                (m22 * uv_outside[offset + 1]) +
                m32
            )
        }
        
        return {
            ...locations,
            uv: uv_inside
        }
    }

    render(resolution: Vec2, context: TextureRenderContext<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Sample,
            SampleElementType,
            SampleFuseMode,
            SampleContainer,
            Context,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LocationVector,
            SampleVector,
            VectorContext
        >): FieldPointTensor2D<SampleElementType> {
        type TextureT = Texture<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Sample,
            SampleElementType,
            SampleFuseMode,
            SampleContainer,
            Context,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LocationVector,
            SampleVector,
            VectorContext
        >
        
        const inner_context = <typeof context>{
            ...context,
            transform: new Mat3().setFromMat4(new Mat4().mul2(
                this._transform,
                mat4_from_mat3(context.transform)
            ))
        }

        return (<TextureT>this.inner).render(resolution, inner_context)

        // const [
        //     m11, m12, m13, m14,
        //     m21, m22, m23, m24,
        //     m31, m32, m33, m34,
        //     m41, m42, m43, m44
        // ] = this._transform.data

        // const transform = tf.tensor2d([[
        //     m11, m21, m31,
        //     m12, m22, m32,
        //     0, 0
        // ]])

        // return field_point_tensor_map(
        //     this.field.elementType,
        //     (<TextureT>this.inner).render(resolution, context),
        //     raw => tf.image.transform(
        //         <tf.Tensor4D>raw.expandDims(0).expandDims(3),
        //         transform,
        //         "bilinear"
        //     ).squeeze([0, 3])
        // )
    }
}