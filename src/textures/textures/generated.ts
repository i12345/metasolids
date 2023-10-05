import { vectorized } from "vectorized-functions";
import { VectorSamplingContext } from "../../fields/domains/vector.js";
import { Field } from "../../fields/field.js";
import { defaultField } from "../../fields/fields/default.js";
import { FieldPoint, FieldPointMapped, FieldPointMappedObjectsGroupedRemoved, FieldPointNumbers, FieldPointPrimitive, field_point_map } from "../../fields/point.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, IsDynamicVector, field_point_vectorized_new } from "../../fields/vectorized/point.js";
import { MultiObjectsTemplate, extract } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { RankAtOrBelow } from "../../utils/tf-rank.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { field_point_tensor_decode, field_point_tensor_encode, field_point_tensor_map } from "../../fields/tensor/tensor.js";
import { FieldPointTensorVariable } from "../../fields/tensor/variable.js";
import { FieldPointTensorSystemRunner } from "../../fields/tensor/system.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";
import * as tf from "@tensorflow/tfjs"
import { FieldPointType } from "../../fields/type.js";
import { Color, Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from "playcanvas-extended";
import { vectorIterator } from "../../fields/vectorized/iterators/factory.js";
import { tensor } from "../../fields/index.js";

export class GeneratedTexture<
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

    @vectorized(GeneratedTexture.sample_vectorized)
    sample(location: Location, context: Context): Sample {
        const variable_tensor = this.runner.context.variables.get(this.variable)!

        const numbers = field_point_tensor_map(
            this.variable.type,
            variable_tensor,
            raw => {
                const [width, height] = <[number, number]>raw.shape
                const i = (
                    Math.floor(width * location.uv.x) +
                    (width * Math.floor(height * location.uv.y))
                )

                return <number>raw.dataSync()[i]
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
            this: GeneratedTexture<
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
        
        const [width, height] = this.variable.realShape(this.runner.parameters)
        
        const uvs = locations.uv
        const n = uvs.length / 2

        const indices = new Int32Array(n)

        for (let i = 0, i_uv = 0; i < n; i++) {
            indices[i] = (
                Math.floor(width! * uvs[i_uv++]) +
                width! * Math.floor(height! * uvs[i_uv++])
            )
        }

        const tf_indices = tf.tensor1d(indices, 'int32')

        const extracted = field_point_tensor_map(
            this.field.elementType,
            tensor,
            raw => raw.flatten().gather(tf_indices)
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