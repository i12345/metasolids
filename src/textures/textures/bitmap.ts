import { Vec2 } from "playcanvas-extended";
import { VectorSampleDomain, VectorSamplingContext } from "../../fields/domains/vector.js";
import { Field } from "../../fields/field.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorIterator, FieldPointVectorStatic, IsDynamicVector, field_point_vector_multiObjs_count, field_point_vectorized_multi_objects_new, isDynamicVector } from "../../fields/vectorized/index.js";
import { MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureRenderContext, TextureSample, TextureSamplingContext } from "../texture.js";
import { vectorIterator } from "../../fields/vectorized/iterators/factory.js";
import { field_point_type_is_multiObj } from "../../fields/type.js";
import { vectorized } from "vectorized-functions";
import * as tf from "@tensorflow/tfjs";
import { tensor } from "../../fields/index.js";
import { field_point_tensor_encode, field_point_tensor_map } from "../../fields/tensor/tensor.js";

export class BitmapTexture<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        SingularContext extends
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> & TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> & TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
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
                    SingularContext,
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
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
    >
    implements
    Texture<
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        SingularContext,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        LocationVector,
        SampleVector,
        VectorContext
    >,
    VectorSampleDomain<
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
        SingularContext,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    private iterator!: FieldPointVectorIterator<Sample, SampleContainer, SampleVector, SampleElementType>
    
    constructor(
        public readonly data: SampleVector,
        public readonly resolution: Vec2,
        public readonly field: Field<Sample, SampleElementType, SampleFuseMode>,
        public readonly dtype?: tf.NumericDataType
    ) { }
    
    init(context: SingularContext): void {
        this.iterator = vectorIterator(this.field.elementType, isDynamicVector(this.field.elementType, this.data), context[MultiObjectsIDsKey])
        
        if (!Number.isInteger(this.resolution.x) || !Number.isInteger(this.resolution.y))
            throw new Error("shape lengths must be integers")

        if (this.resolution.x * this.resolution.y !== this.iterator.length(this.data, this.data))
            throw new Error("shape does not match data resolution")
    }

    @vectorized(BitmapTexture.prototype.indexOf_vectorized)
    indexOf(uv: Vec2) {
        return Math.floor(uv.x * this.resolution.x) + (this.resolution.x * Math.floor(uv.y * this.resolution.y))
    }

    indexOf_vectorized(uvs: FieldPointVectorStatic<Vec2>): FieldPointVectorStatic<number, IndicesTypedArray> {
        const n = uvs.length / 2
        const indices = new Uint32Array(n)

        const w = this.resolution.x
        const h = this.resolution.y
        
        let i_uv = 0
        for (let i = 0; i < n; i++)
            indices[i] = Math.floor(uvs[i_uv++] * w) + (w * Math.floor(uvs[i_uv++] * h))

        return indices
    }

    @vectorized(BitmapTexture.sample_vectorized)
    sample(location: Location, context: SingularContext): Sample {
        return this.iterator.get_returnValue(this.data, this.data, this.indexOf(location.uv))
    }

    private static sample_vectorized<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        SingularContext extends
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> & TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> & TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
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
                    SingularContext,
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
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
        >(
            this: BitmapTexture<
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
                    LocationVector,
                    SampleVector,
                    SingularContext,
                    VectorContext
                >,
            locations: LocationVector,
            context: VectorContext
        ): SampleVector {
        const uvs = locations.uv
        const n = uvs.length / 2
        const indices = this.indexOf_vectorized(uvs)

        const multiObjs_count = field_point_type_is_multiObj(this.field.elementType) ? field_point_vector_multiObjs_count(<any>this.data, indices) : undefined
        const dst = <SampleVector><unknown>field_point_vectorized_multi_objects_new<SampleElementType, SampleContainer, ObjIDsT, ObjIDsContainer>(this.field.elementType, n, <IsDynamicVector<SampleElementType, SampleContainer>>false, context[MultiObjectsIDsKey].IDsType, <any>multiObjs_count)
        
        this.iterator.scatter(
            dst, dst,
            this.data, this.data,
            indices
        )

        return dst
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
            SingularContext,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LocationVector,
            SampleVector,
            VectorContext
        >): tensor.FieldPointTensor2D<SampleElementType> {
        const encoded = field_point_tensor_encode<SampleElementType, tf.Rank.R2>(this.field.elementType, [this.resolution.y, this.resolution.x], this.dtype, this.data)
        
        if (!context.transform.isIdentity())
            console.warn('rendering bitmap texture with non-identity transform')

        if (resolution.equals(this.resolution))
            return encoded
        else {
            return field_point_tensor_map<SampleElementType, tf.Rank.R2, tf.Tensor2D>(
                this.field.elementType,
                encoded,
                raw => tf.image.resizeBilinear(
                    <tf.Tensor3D>raw.expandDims(0).expandDims(3),
                    [resolution.y, resolution.x]
                ).squeeze([0, 3])
            )
        }
    }
}

export class IntegerCoordBitmapTexture<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        SingularContext extends
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> & TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> & TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
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
                    SingularContext,
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
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
    >
    extends BitmapTexture<
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
        LocationVector,
        SampleVector,
        SingularContext,
        VectorContext
    > {
    constructor(
            data: SampleVector,
            resolution: Vec2,
            field: Field<Sample, SampleElementType, SampleFuseMode>,
            dtype?: tf.NumericDataType
        ) {
        super(
            data,
            resolution,
            field,
            dtype
        )
    }
    
    indexOf(uv: Vec2): number {
        return uv.x + (this.resolution.x * uv.y)
    }

    indexOf_vectorized(uvs: FieldPointVectorStatic<Vec2>): FieldPointVectorStatic<number, IndicesTypedArray> {
        const n = uvs.length / 2
        const indices = new Uint32Array(n)

        const w = this.resolution.x
        
        let i_uv = 0
        for (let i = 0; i < n; i++)
            indices[i] = uvs[i_uv++] + (w * uvs[i_uv++])

        return indices
    }
}