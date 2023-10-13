import { vectorized } from "vectorized-functions";
import { VectorSamplingContext } from "../../fields/domains/vector.js";
import { Field } from "../../fields/field.js";
import { FieldPoint } from "../../fields/point.js";
import { FieldPointNumbers, field_point_numbers_decode } from "../../fields/numbers.js";
import { FieldPointVector, FieldPointVectorContainerStatic, IsDynamicVector, field_point_vectorized_new } from "../../fields/vectorized/point.js";
import { MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray, typedArrayClone } from "../../utils/typed-array.js";
import { FieldPointTensor, FieldPointTensor2D, field_point_tensor_decode, field_point_tensor_map } from "../../fields/tensor/tensor.js";
import { FieldPointTensorVariableInstance } from "../../fields/tensor/variable.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";
import * as tf from "@tensorflow/tfjs"
import { Vec2 } from "playcanvas-extended";
import { FieldPointType, tensor } from "../../fields/index.js";
import { vectorIterator } from "../../fields/vectorized/iterators/factory.js";
import { TensorShape } from "../../utils/tf-rank.js";
import { defaultField } from "../../fields/fields/default.js";

export enum TensorTextureResizeMode {
    bilinear = "bilinear",
    nearestNeighbor = "nearestNeighbor",
}

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
    readonly field: Field<Sample> = defaultField(this.type)
    
    constructor(
        public readonly tensor: FieldPointTensor<Sample, tf.Rank.R0 | tf.Rank.R2>,
        public readonly type: FieldPointType<Sample>,
        public readonly shape: TensorShape<tf.Rank.R0 | tf.Rank.R2>,
        public readonly resizeMode: TensorTextureResizeMode = TensorTextureResizeMode.bilinear
    ) {}

    init(context: Context): void {
    }

    @vectorized(TensorTexture.sample_vectorized)
    sample(location: Location, context: Context): Sample {
        if (this.shape.length === 0) {
            const numbers = <FieldPointNumbers<Sample>><unknown>field_point_tensor_map(
                this.type,
                this.tensor,
                raw => raw.dataSync()[0]
            )
            
            return field_point_numbers_decode(this.type, numbers)
        }
        else {
            const [height, width] = <[number, number]>this.shape
            const i = [[
                Math.floor(height * location.uv.y),
                Math.floor(width * location.uv.x)
            ]]

            const numbers = <FieldPointNumbers<Sample>><unknown>field_point_tensor_map(
                this.type,
                this.tensor,
                raw => raw.gather(i).dataSync()[0]
            )

            return field_point_numbers_decode(this.type, numbers)
        }
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
        const uvs = locations.uv
        const n = uvs.length / 2

        if (this.shape.length === 0) {
            const { vector } = field_point_tensor_decode(
                this.type,
                this.tensor
            )

            const item = vectorIterator(
                this.type,
                false,
                undefined,
                vector
            ).get_returnValue(vector, vector, 0)

            return <SampleVector>field_point_vectorized_new(
                this.type,
                n,
                <IsDynamicVector<Sample, SampleContainer>>false,
                undefined,
                item
            )
        }

        const [height, width] = this.shape

        const uvs_float32 = uvs instanceof Float32Array ? uvs : typedArrayClone<number, typeof uvs, Float32Array>(uvs, Float32Array)
        const indices_tf_unstacked = tf.tensor2d(uvs_float32, [n, 2], 'float32').unstack(1)
        const indices_tf_restacked = tf.stack([indices_tf_unstacked[1], indices_tf_unstacked[0]], 1) // [[y1,x1],
        const tf_indices = indices_tf_restacked.mul(tf.tensor2d([[height!, width!]], [1, 2], 'int32')).floor().cast('int32')

        const extracted = field_point_tensor_map(
            this.type,
            this.tensor,
            raw => raw.gather(tf_indices)
        )

        return <SampleVector>field_point_tensor_decode(
            this.type,
            extracted
        ).vector
    }

    render(resolution: Vec2, context: Context): tensor.FieldPointTensor2D<Sample> {
        if (this.shape.length === 0) {
            return field_point_tensor_map(
                this.type,
                this.tensor,
                raw => raw.broadcastTo([resolution.y, resolution.x])
            )
        }
        else {
            const tensor_real = (this.shape[0] === resolution.y && this.shape[1] === resolution.x) ?
                this.tensor :
                field_point_tensor_map(
                    this.type,
                    this.tensor,
                    raw => (this.resizeMode === "bilinear" ? tf.image.resizeBilinear : tf.image.resizeNearestNeighbor)(<tf.Tensor3D>raw.expandDims(0).expandDims(3), <TensorShape<tf.Rank.R2>>this.shape).squeeze([0, 3])
                )
        
            return <tensor.FieldPointTensor2D<Sample>>tensor_real
        }
    }
}