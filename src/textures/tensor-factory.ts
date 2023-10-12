import { FieldPoint, FieldPointMapped, FieldsPoint, FieldsPointMapped } from "../fields/point.js";
import { FieldPointTensorEncoding, FieldPointTensorFactory } from "../fields/tensor/tensor-factory.js";
import * as tf from "@tensorflow/tfjs"
import { PropertyPath } from "../paradigm/trees/path.js";
import { FieldPointType, field_point_type_contains } from "../fields/type.js";
import { FieldPointTensor2D } from "../fields/tensor/tensor.js";
import { extract } from "../paradigm/trees/tree.js";
import { Texture, TextureLocation, TextureSamplingContext, defaultTextureLocationField } from "./texture.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../fields/vectorized/point.js";
import { NumberTypedArray } from "../utils/typed-array.js";
import { SampleDomainLocationFieldKey } from "../fields/domain.js";
import { Vec2 } from "playcanvas-extended";
import { VectorSampleFunction, VectorSamplingContext, makeVectorSamplingContext } from "../fields/domains/vector.js";
import { MultiObjectsIDsKey, MultiObjectsTemplate } from "../paradigm/trees/multi-objects.js";
import { IndicesTypedArray } from "../utils/indices-array.js";
import { TensorTexture, TensorTextureResizeMode } from "./index.js";

export class TextureTensorFactory<
        T extends FieldPoint = FieldPoint,
    >
    implements FieldPointTensorFactory<
        T,
        tf.Rank.R2
    > {
    constructor(
        public readonly texture: Texture<
            TextureLocation,
            TextureLocation,
            TextureLocation,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            T,
            T,
            T,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            TextureSamplingContext,
            MultiObjectsTemplate,
            IndicesTypedArray,
            FieldPointVectorContainerStatic<IndicesTypedArray>,
            FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>,
            FieldPointVector<T, FieldPointVectorContainerStatic>,
            VectorSamplingContext<
                TextureLocation,
                TextureLocation,
                TextureLocation,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                T,
                T,
                T,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                MultiObjectsTemplate,
                IndicesTypedArray,
                FieldPointVectorContainerStatic<IndicesTypedArray>,
                TextureSamplingContext,
                FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>,
                FieldPointVector<T, FieldPointVectorContainerStatic>
            >
        >
    ) { }

    init(type: FieldPointType<T>, shape: [h: number, w: number]): FieldPointTensor2D<T> {
        if (!field_point_type_contains(this.texture.field.elementType, type))
            throw new Error()
        
        type TextureSamplingContextT = VectorSamplingContext<
            TextureLocation,
            TextureLocation,
            TextureLocation,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            T,
            T,
            T,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            MultiObjectsTemplate,
            IndicesTypedArray,
            FieldPointVectorContainerStatic<IndicesTypedArray>,
            TextureSamplingContext,
            FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>,
            FieldPointVector<T, FieldPointVectorContainerStatic>
        >
        
        const texture_context: TextureSamplingContextT = {
            [VectorSampleFunction]: undefined!,
            [MultiObjectsIDsKey]: undefined!,
            [SampleDomainLocationFieldKey]: defaultTextureLocationField
        }

        makeVectorSamplingContext<
                TextureLocation,
                TextureLocation,
                TextureLocation,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                T,
                T,
                T,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                MultiObjectsTemplate,
                IndicesTypedArray,
                FieldPointVectorContainerStatic<IndicesTypedArray>,
                TextureSamplingContextT
            >(
                this.texture.field,
                texture_context
            )

        this.texture.init(texture_context)
        return this.texture.render(new Vec2(shape[1], shape[0]), texture_context)
    }
}

export class TextureTensorEncoding<T extends FieldPoint = FieldPoint>
    implements FieldPointTensorEncoding<
        T,
        tf.Rank.R2,
        tf.Tensor2D,
        FieldPointTensor2D<T>,
        Texture<
            TextureLocation,
            TextureLocation,
            TextureLocation,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            T,
            T,
            T,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            TextureSamplingContext,
            MultiObjectsTemplate,
            IndicesTypedArray,
            FieldPointVectorContainerStatic<IndicesTypedArray>,
            FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>,
            FieldPointVector<T, FieldPointVectorContainerStatic>,
            VectorSamplingContext<
                TextureLocation,
                TextureLocation,
                TextureLocation,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                T,
                T,
                T,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                MultiObjectsTemplate,
                IndicesTypedArray,
                FieldPointVectorContainerStatic<IndicesTypedArray>,
                TextureSamplingContext,
                FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>,
                FieldPointVector<T, FieldPointVectorContainerStatic>
            >
        >
    > {
    constructor(
        public resizeMode?: TensorTextureResizeMode
    ) { }
    
    decode(
            type: FieldPointType<T>,
            rank: tf.Rank.R2,
            item: Texture<
                TextureLocation,
                TextureLocation,
                TextureLocation,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                T,
                T,
                T,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                TextureSamplingContext,
                MultiObjectsTemplate,
                IndicesTypedArray,
                FieldPointVectorContainerStatic<IndicesTypedArray>,
                FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>,
                FieldPointVector<T, FieldPointVectorContainerStatic>,
                VectorSamplingContext<
                    TextureLocation,
                    TextureLocation,
                    TextureLocation,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    T,
                    T,
                    T,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    MultiObjectsTemplate,
                    IndicesTypedArray,
                    FieldPointVectorContainerStatic<IndicesTypedArray>,
                    TextureSamplingContext,
                    FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>,
                    FieldPointVector<T, FieldPointVectorContainerStatic>
                >
            >,
            context: any
        ): FieldPointTensorFactory<T, tf.Rank.R2> | undefined {
        if (rank !== tf.Rank.R2)
            return undefined

        if (!field_point_type_contains(item.field.elementType, type))
            return undefined
        
        return new TextureTensorFactory(item)
    }

    encode(
            type: FieldPointType<T>,
            shape: [h: number, w: number],
            tensor: FieldPointTensor2D<T>
        ): undefined | Texture<
            TextureLocation,
            TextureLocation,
            TextureLocation,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            T,
            T,
            T,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            TextureSamplingContext,
            MultiObjectsTemplate,
            IndicesTypedArray,
            FieldPointVectorContainerStatic<IndicesTypedArray>,
            FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>,
            FieldPointVector<T, FieldPointVectorContainerStatic>,
            VectorSamplingContext<
                TextureLocation,
                TextureLocation,
                TextureLocation,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                T,
                T,
                T,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                MultiObjectsTemplate,
                IndicesTypedArray,
                FieldPointVectorContainerStatic<IndicesTypedArray>,
                TextureSamplingContext,
                FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>,
                FieldPointVector<T, FieldPointVectorContainerStatic>
            >
        > {
        return new TensorTexture(
            tensor,
            type,
            shape,
            this.resizeMode
        )
    }
}