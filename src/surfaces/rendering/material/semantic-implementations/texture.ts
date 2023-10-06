import { Vec2, StandardMaterial, BasicMaterial } from "playcanvas-extended"
import { MultiObjectsIDsKey, MultiObjectsTemplate, groups } from "../../../../paradigm/trees/index.js"
import { RANGE_MAX, RANGE_MIN } from "../../../../fields/range.js"
import { textures } from "../../../../index.js"
import { TextureLocation, TextureSample } from "../../../../textures/texture.js"
import { GeneratorType } from "../../../../utils/generator-type.js"
import { VolumeLocation } from "../../../../volumes/volume.js"
import { Cost_Space_Texture, RenderedBufferForSemanticWithImplementation } from "../implementation.js"
import { MaterialSemanticImplementationStorageClass_Texture } from "../storage-classes/texture.js"
import { SurfaceRendererIndividual } from "../../renderer.js"
import { Material_Texture_Context, Material_Texture_Location } from "../material-texture.js"
import { LevelOfDetailInfo } from "../../mesh/LOD-info.js"
import { MaterialSemanticImplementation_Immediate } from "./immediate.js"
import { FieldPointVector, FieldPointVectorContainerStatic } from "../../../../fields/vectorized/point.js"
import { IndicesTypedArray } from "../../../../utils/indices-array.js"
import { VectorSamplingContext, makeVectorSamplingContext } from "../../../../fields/domains/vector.js"
import { NumberTypedArray, typedArrayClone } from "../../../../utils/typed-array.js"
import * as tf from "@tensorflow/tfjs"

export type MaterialSemanticImplementation_Texture_SideEffect<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > = (
        rendered: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>,
        renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>
    ) => RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[]

export class MaterialSemanticImplementation_Texture<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        TexelTypeT extends TextureSample = TextureSample
    > implements
    MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT> {
    readonly cost: {
        time: number
        space: Cost_Space_Texture
    }

    get source_group() {
        return this.surface_textureGroup.path
    }

    constructor(
        public readonly semantic: keyof StandardMaterial | keyof BasicMaterial,
        public readonly texture: textures.Texture<
                Material_Texture_Location<VolumeLocationT>,
                Material_Texture_Location<VolumeLocationT>,
                Material_Texture_Location<VolumeLocationT>,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                TexelTypeT,
                TexelTypeT,
                TexelTypeT,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                Material_Texture_Context<Objects, ObjIDsT, VolumeLocationT>,
                Objects,
                ObjIDsT
            >,
        public readonly stage: number,
        public readonly surface_textureGroup: GeneratorType<ReturnType<typeof groups>>,
        /**
         * All the sampled textures are squares
         */
        public readonly resolution: number,
        public readonly channels: number,
        public readonly effectiveTexelSizeUV: number,
        public readonly hdr = false,
        public readonly sideEffects: MaterialSemanticImplementation_Texture_SideEffect<Objects, ObjIDsT, VolumeLocationT>[] = []
    ) {
        const texels = resolution ** 2

        this.cost = {
            time: texels,
            space: {
                elements: texels * channels
            }
        }
    }

    quality(info: LevelOfDetailInfo) {
        // texture pixels per screen pixel
        const information_per_pixel_min = Math.max(2, this.resolution / info.edge.distances.ratios.screen_UV[RANGE_MAX])
        const information_per_pixel_max = Math.max(2, this.resolution / info.edge.distances.ratios.screen_UV[RANGE_MIN])
        const information_per_pixel_mean = Math.min(1, (information_per_pixel_min + information_per_pixel_max) / 2)

        // 1 = this resolution effectively samples the underlying texture
        // 0 = there's infinite more detail that this sampling misses
        const effectiveQuality = Math.max(1, this.resolution * this.effectiveTexelSizeUV)

        return Math.max(information_per_pixel_mean, effectiveQuality) ** 2
    }

    equals(that: MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT>): boolean {
        return that instanceof MaterialSemanticImplementation_Texture &&
            ///@ts-ignore
            this.texture === that.texture &&
            this.channels === that.channels &&
            this.stage === that.stage &&
            this.semantic === that.semantic &&
            this.source_group === that.source_group &&
            this.resolution === that.resolution
    }

    implement(renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>): RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[] {
        type TextureVectorSamplingContext = VectorSamplingContext<
            TextureLocation,
            TextureLocation,
            TextureLocation,
            FieldPointVectorContainerStatic,
            TexelTypeT,
            TexelTypeT,
            TexelTypeT,
            FieldPointVectorContainerStatic,
            Objects,
            ObjIDsT,
            FieldPointVectorContainerStatic<ObjIDsT>,
            Material_Texture_Context<Objects, ObjIDsT, VolumeLocationT, TexelTypeT, TexelTypeT, TexelTypeT>
        >
        
        const texture_context = <TextureVectorSamplingContext>this.surface_textureGroup.get<Material_Texture_Context<Objects, ObjIDsT, VolumeLocationT>>(renderer.shared.textureContexts)
        
        const multiObjectsIDs = texture_context[MultiObjectsIDsKey]
        
        const resolution = new Vec2(this.resolution, this.resolution)
        
        this.texture.init(texture_context)

        // renderTexture("output-textures/uv.png", texture_location_interpolator, texture_context, ['uv'])
        // renderTexture("output-textures/composing.png", texture_composing, texture_context)

        makeVectorSamplingContext<
                TextureLocation,
                TextureLocation,
                TextureLocation,
                FieldPointVectorContainerStatic,
                TexelTypeT,
                TexelTypeT,
                TexelTypeT,
                FieldPointVectorContainerStatic,
                Objects,
                ObjIDsT,
                FieldPointVectorContainerStatic<ObjIDsT>,
                Material_Texture_Context<Objects, ObjIDsT, VolumeLocationT, TexelTypeT, TexelTypeT, TexelTypeT>,
                FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>,
                FieldPointVector<TexelTypeT, FieldPointVectorContainerStatic>,
                TextureVectorSamplingContext
            >(this.texture.field, texture_context, multiObjectsIDs)
        
        const samples = this.texture.render(resolution, <any>texture_context)
        const samples_container = (<tf.Tensor>samples).as1D()
        
        const buffer = (this.hdr === true && samples_container.dtype === 'float32') ?
            <Float32Array>samples_container.dataSync() :
            this.hdr ?
                <Float32Array>samples_container.cast('float32').dataSync() :
                typedArrayClone<number, tf.TypedArray, Uint8Array>(
                    (samples_container.dtype === 'bool' ?
                        samples_container.mul(tf.scalar(0xFF, 'int32')) :
                        samples_container
                    ).dataSync(),
                    Uint8Array
                )

        //TODO: optimizations for translating, rotating, scaling, and tiling textures

        const rendered: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT> = {
            storageClass: MaterialSemanticImplementationStorageClass_Texture.$class,
            implementation: this,
            semantic: this.semantic,
            buffer,
            channels: this.channels
        }

        const sideEffects_results = this.sideEffects.flatMap(sideEffect => sideEffect(rendered, renderer))

        return [rendered, ...sideEffects_results]
    }
}