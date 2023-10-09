import { vectorized } from "vectorized-functions";
import { VectorSamplingContext } from "../../fields/domains/vector.js";
import { Field } from "../../fields/field.js";
import { FieldPoint, FieldPointMapped, FieldPointNumbers, FieldPointPrimitive, field_point_map } from "../../fields/point.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../../fields/vectorized/point.js";
import { MultiObjectsTemplate, extract } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray, typedArrayClone } from "../../utils/typed-array.js";
import { field_point_tensor_decode, field_point_tensor_map } from "../../fields/tensor/tensor.js";
import { FieldPointTensorVariable } from "../../fields/tensor/variable.js";
import { FieldPointTensorSystemRunner } from "../../fields/tensor/system.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";
import * as tf from "@tensorflow/tfjs"
import { FieldPointType } from "../../fields/type.js";
import { Color, Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from "playcanvas-extended";
import { tensor } from "../../fields/index.js";

export class TensorTexture<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = FieldPoint,
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
            FieldPointVector<Sample, SampleContainer> =
            FieldPointVector<Sample, SampleContainer>,
        VectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    Sample,
                    Sample,
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
                    Sample,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                >
    > implements
    Texture<
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        Sample,
        Sample,
        SampleContainer,
        Context,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    field!: Field<Sample>
    
    constructor(
        public readonly runner: FieldPointTensorSystemRunner,
        public readonly variable: FieldPointTensorVariable<Sample, tf.Rank.R0 | tf.Rank.R2>,
        public readonly resizeMode: "bilinear" | "nearestNeighbor" = "bilinear"
    ) { }

    init(context: Context): void {
    }

    @vectorized(TensorTexture.sample_vectorized)
    sample(location: Location, context: Context): Sample {
        const variable_tensor = this.runner.context.variables.get(this.variable)!

        const numbers = field_point_tensor_map(
            this.variable.type,
            variable_tensor,
            raw => {
                const [height, width] = <[number, number]>raw.shape
                const i = [
                    Math.floor(height * location.uv.y),
                    Math.floor(width * location.uv.x)
                ]

                return <number>raw.gather(i).dataSync()[0]
            }
        )

        return <Sample><unknown>field_point_map<Sample, FieldPointType<FieldPointPrimitive>, FieldPointPrimitive>(
            <FieldPointMapped<Sample, FieldPointType<FieldPointPrimitive>>>this.variable.type,
            value => value instanceof Function,
            (primitive_type, path) => {
                const primitive_value = extract<FieldPointNumbers<FieldPointPrimitive>>(numbers, path)

                switch (primitive_type) {
                    case Number:
                        return <number>primitive_value
                        case Vec2:
                            return new Vec2(
                                (<Vec2>primitive_value).x,
                                (<Vec2>primitive_value).y,
                            )
                        case Vec3:
                            return new Vec3(
                                (<Vec3>primitive_value).x,
                                (<Vec3>primitive_value).y,
                                (<Vec3>primitive_value).z,
                            )
                        case Vec4:
                            return new Vec4(
                                (<Vec4>primitive_value).x,
                                (<Vec4>primitive_value).y,
                                (<Vec4>primitive_value).z,
                                (<Vec4>primitive_value).w,
                            )
                        case Quat:
                            return new Quat(
                                (<Quat>primitive_value).x,
                                (<Quat>primitive_value).y,
                                (<Quat>primitive_value).z,
                                (<Quat>primitive_value).w,
                            )
                        case Color:
                            return new Color(
                                (<Color>primitive_value).r,
                                (<Color>primitive_value).g,
                                (<Color>primitive_value).b,
                                (<Color>primitive_value).a,
                            )
                    case Mat3: {
                        const { r, s } = <FieldPointNumbers<Mat3>>primitive_value
                        return new Mat3().setFromMat4(
                            new Mat4().setTRS(
                                Vec3.ZERO,
                                new Quat(r.x, r.y, r.z, r.w),
                                new Vec3(s.x, s.y, s.z)
                            )
                        )
                    }
                    case Mat4: {
                        const { t, r, s } = <FieldPointNumbers<Mat4>>primitive_value
                        return new Mat4().setTRS(
                            new Vec3(t.x, t.y, t.z),
                            new Quat(r.x, r.y, r.z, r.w),
                            new Vec3(s.x, s.y, s.z)
                        )
                    }
                    default:
                        throw new Error()
                }
            }
        )
    }

    private static sample_vectorized<
            Location extends TextureLocation = TextureLocation,
            LocationElementType extends TextureLocation = Location,
            LocationFuseMode extends TextureLocation = Location,
            LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
            Sample extends TextureSample = FieldPoint,
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
                FieldPointVector<Sample, SampleContainer> =
                FieldPointVector<Sample, SampleContainer>,
            VectorContext extends
                VectorSamplingContext<
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        Sample,
                        Sample,
                        Sample,
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
                        Sample,
                        Sample,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        Context,
                        LocationVector,
                        SampleVector
                    >
        >(
            this: TensorTexture<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
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
            context: VectorSamplingContext
        ): SampleVector {
        const tensor = this.runner.context.variables.get(this.variable)!
        
        const [height, width] = this.variable.realShape(this.runner.parameters)
        
        const uvs = locations.uv
        const n = uvs.length / 2

        const uvs_float32 = uvs instanceof Float32Array ? uvs : typedArrayClone<number, typeof uvs, Float32Array>(uvs, Float32Array)
        const indices_tf_unstacked = tf.tensor2d(uvs_float32, [n, 2], 'float32').unstack(1)
        const indices_tf_restacked = tf.stack([indices_tf_unstacked[1], indices_tf_unstacked[0]], 1) // [[y1,x1],
        const tf_indices = indices_tf_restacked.mul(tf.tensor2d([[height!, width!]], [1, 2], 'int32')).floor().cast('int32')

        const extracted = field_point_tensor_map(
            this.field.elementType,
            tensor,
            raw => raw.gather(tf_indices)
        )

        return <SampleVector>field_point_tensor_decode(
            this.field.elementType,
            extracted
        ).vector
    }

    render(resolution: Vec2, context: Context): tensor.FieldPointTensor2D<Sample> {
        const tensor = this.runner.context.variables.get(this.variable)!
        const tensor_shape = this.variable.realShape(this.runner.parameters)

        if (tensor_shape.length === 0) {
            return field_point_tensor_map(
                this.field.elementType,
                tensor,
                raw => raw.broadcastTo([resolution.y, resolution.x])
            )
        }

        const tensor_real = (tensor_shape[0] === resolution.y && tensor_shape[1] === resolution.x) ?
            tensor :
            field_point_tensor_map(
                this.field.elementType,
                tensor,
                raw => (this.resizeMode === "bilinear" ? tf.image.resizeBilinear : tf.image.resizeNearestNeighbor)(<tf.Tensor3D>raw.expandDims(0), tensor_shape)
            )
        
        return <tensor.FieldPointTensor2D<Sample>>tensor_real
    }
}