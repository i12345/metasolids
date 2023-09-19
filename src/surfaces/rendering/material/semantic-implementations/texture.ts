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
import { VertexInterpolatingTexture, renderTexture } from "../../../../textures/index.js"
import { FieldPointVector, FieldPointVectorContainerStatic, IsDynamicVector, field_point_vectorized_multi_objects_new, field_point_vectorized_new } from "../../../../fields/vectorized/point.js"
import { SampleDomainLocationFieldKey } from "../../../../fields/domain.js"
import { IndicesTypedArray } from "../../../../utils/indices-array.js"
import { VectorSampleFunction, VectorSamplingContext, makeVectorSamplingContext } from "../../../../fields/domains/vector.js"
import { ComposingSampleDomain } from "../../../../fields/domains/composing.js"

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
                TexelTypeT,
                Material_Texture_Location<VolumeLocationT>,
                Material_Texture_Location<VolumeLocationT>,
                TexelTypeT,
                TexelTypeT,
                Material_Texture_Context<Objects, ObjIDsT, VolumeLocationT>
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
        const texture_location_field = texture_context[SampleDomainLocationFieldKey]

        const { UVs, finalIndices } = renderer.shared.surfaceUVUnwrapping

        // const UVs_tmp = new Array<Vec2>(UVs.length / 2)
        // for (let i = 0; i < UVs_tmp.length; i++)
        //     UVs_tmp[i] = new Vec2(UVs[(2 * i) + 0], UVs[(2 * i) + 1])

        const locations = field_point_vectorized_multi_objects_new<Material_Texture_Location<VolumeLocationT>, FieldPointVectorContainerStatic, ObjIDsT>(
            texture_location_field.elementType,
            finalIndices.length / 3,
            <IsDynamicVector<Material_Texture_Location<VolumeLocationT>, FieldPointVectorContainerStatic>>false,
            multiObjectsIDs?.IDsType,
            undefined //TODO
        );

        (<FieldPointVector<TextureLocation, FieldPointVectorContainerStatic>>locations).uv = <Float64Array><unknown>UVs

        const texture_location_interpolator = new VertexInterpolatingTexture<
                Objects,
                ObjIDsT,
                TextureLocation,
                TextureLocation,
                TextureLocation,
                Material_Texture_Location<VolumeLocationT>,
                Material_Texture_Location<VolumeLocationT>,
                Material_Texture_Location<VolumeLocationT>
            >(
            //TODO: integrate other location fields
            // UVs_tmp.map(uv => ({ uv }) as Material_Texture_Location<VolumeLocationT>),
            // UVs_tmp,
            locations,
            <Float64Array><unknown>UVs,
            finalIndices,
            texture_location_field
        )

        const texture_composing = new ComposingSampleDomain<
                Objects,
                ObjIDsT,
                FieldPointVectorContainerStatic<ObjIDsT>,
                TextureLocation,
                TextureLocation,
                TextureLocation,
                FieldPointVectorContainerStatic,
                Material_Texture_Location<VolumeLocationT>,
                Material_Texture_Location<VolumeLocationT>,
                Material_Texture_Location<VolumeLocationT>,
                FieldPointVectorContainerStatic,
                TexelTypeT,
                TexelTypeT,
                TexelTypeT,
                FieldPointVectorContainerStatic,
                typeof texture_context
            >(
                texture_location_interpolator,
                this.texture
            )
        
        const resolution = this.resolution
        const texels = resolution ** 2
        const sampleLocations = field_point_vectorized_new<TextureLocation, FieldPointVectorContainerStatic, Objects, ObjIDsT, FieldPointVectorContainerStatic<ObjIDsT>>({ uv: Vec2 }, texels, false)
        const sampleLocations_uv = sampleLocations.uv
        
        let sampleLocations_uv_i = 0
        for (let y = 0; y < resolution; y++) {
            for (let x = 0; x < resolution; x++) {
                sampleLocations_uv[sampleLocations_uv_i++] = x / resolution
                sampleLocations_uv[sampleLocations_uv_i++] = y / resolution
            }
        }
        
        texture_composing.init(texture_context)

        // renderTexture("textures/uv.png", texture_location_interpolator, texture_context, ['uv'])
        // renderTexture("textures/composing.png", texture_composing, texture_context)

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
            >(texture_composing.field, texture_context, multiObjectsIDs)
        
        const samples = texture_context[VectorSampleFunction](texture_composing, sampleLocations, texture_context)
        const samples_container = <FieldPointVectorContainerStatic>samples
        const samples_channels = samples_container.length / texels
        
        const buffer_channels = this.channels
        const buffer = new (this.hdr ? Float32Array : Uint8Array)(buffer_channels * texels)

        const min_channels = Math.min(samples_channels, buffer_channels)

        let samples_i: number
        let buffer_i: number
        if (buffer instanceof Uint8Array) {
            let sample: number
            for (let i = 0; i < texels; i++) {
                for (let j = 0; j < min_channels; j++) {
                    samples_i = (i * samples_channels) + j
                    buffer_i = (i * buffer_channels) + j

                    sample = Math.floor(256 * samples_container[samples_i])
                    if (sample < 0)
                        buffer[buffer_i] = 0
                    else if (sample > 255)
                        buffer[buffer_i] = 255
                    else
                        buffer[buffer_i] = sample
                }
            }
        }
        else {
            let sample: number
            for (let i = 0; i < texels; i++) {
                for (let j = 0; j < min_channels; j++) {
                    samples_i = (i * samples_channels) + j
                    buffer_i = (i * buffer_channels) + j

                    sample = samples_container[samples_i]
                    if (sample < 0)
                        buffer[buffer_i] = 0
                    else if (sample > 1)
                        buffer[buffer_i] = 1
                    else
                        buffer[buffer_i] = sample
                }
            }
        }

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