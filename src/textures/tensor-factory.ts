import { FieldPoint } from "../fields/point.js";
import { FieldPointTensorEncoding, FieldPointTensorFactory } from "../fields/tensor/tensor-factory.js";
import * as tf from "@tensorflow/tfjs"
import { FieldPointType, field_point_type_contains } from "../fields/type.js";
import { FieldPointTensor2D } from "../fields/tensor/tensor.js";
import { Texture, TextureLocation, TextureRenderContext, TextureSamplingContext, defaultTextureLocationField } from "./texture.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../fields/vectorized/point.js";
import { NumberTypedArray } from "../utils/typed-array.js";
import { SampleDomainLocationFieldKey } from "../fields/domain.js";
import { Mat3, Vec2 } from "playcanvas-extended";
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

        this.texture.init(texture_context)

        if (!field_point_type_contains(this.texture.field.elementType, type))
            throw new Error()

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
        
        type TextureRenderContextT = TextureRenderContext<
            TextureLocation,
            TextureLocation,
            TextureLocation,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            T,
            T,
            T,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            TextureSamplingContextT,
            MultiObjectsTemplate,
            IndicesTypedArray,
            FieldPointVectorContainerStatic<IndicesTypedArray>,
            FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>,
            FieldPointVector<T, FieldPointVectorContainerStatic>,
            TextureSamplingContextT
        >
        
        const texture_render_context = <TextureRenderContextT>{
            ...texture_context,
            transform: new Mat3().setIdentity()
        }
        
        return this.texture.render(new Vec2(shape[1], shape[0]), texture_render_context)
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
        
        if (item.init === undefined || item.sample === undefined || item.render === undefined)
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