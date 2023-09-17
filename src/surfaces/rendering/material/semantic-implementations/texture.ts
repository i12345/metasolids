import { Color, Vec3, Vec2, Vec4, StandardMaterial, BasicMaterial } from "playcanvas-extended"
import { MultiObjectsGroupsTemplate, MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs, groups } from "../../../../paradigm/trees/index.js"
import { RANGE_MAX, RANGE_MIN } from "../../../../fields/range.js"
import { textures } from "../../../../index.js"
import { TextureLocation, TextureSample } from "../../../../textures/texture.js"
import { GeneratorType } from "../../../../utils/generator-type.js"
import { VolumeLocation } from "../../../../volumes/volume.js"
import { Cost_Space_Texture, RenderedBufferForSemanticWithImplementation } from "../implementation.js"
import { MaterialSemanticImplementationStorageClass_Texture } from "../storage-classes/texture.js"
import { SurfaceRendererIndividual } from "../../renderer.js"
import { FieldPoint } from "../../../../fields/point.js"
import { Material_Texture_Context, Material_Texture_Location } from "../material-texture.js"
import { LevelOfDetailInfo } from "../../mesh/LOD-info.js"
import { MaterialSemanticImplementation_Immediate } from "./immediate.js"
import { VertexInterpolatingTexture } from "../../../../textures/index.js"
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorStatic, IsDynamicVector, field_point_vectorized_multi_objects_new } from "../../../../fields/vectorized/point.js"
import { SampleDomainLocationFieldKey } from "../../../../fields/domain.js"
import { IndicesTypedArray } from "../../../../utils/indices-array.js"

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
        const effectiveFit = Math.min(1, this.resolution * this.effectiveTexelSizeUV)

        return Math.max(information_per_pixel_mean, effectiveFit) ** 2
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
        const buffer = new (this.hdr ? Float32Array : Uint8Array)(this.channels * (this.resolution ** 2))

        const texture_context = this.surface_textureGroup.get<Material_Texture_Context<Objects, ObjIDsT, VolumeLocationT>>(renderer.shared.textureContexts)
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

        texture_location_interpolator.init(texture_context)

        const sample_texture_values = new Array<FieldPoint>(this.resolution ** 2)

        //TODO: use vector function
        for (let y = this.resolution - 1; y >= 0; y--) {
            for (let x = this.resolution - 1; x >= 0; x--) {
                const uv = new Vec2(x, y).divScalar(this.resolution)
                const texture_location = texture_location_interpolator.sample({ uv })
                sample_texture_values[(y * this.resolution) + x] = this.texture.sample(texture_location, texture_context)
            }
        }

        if (typeof sample_texture_values[0] === 'number') {
            for (let i = 0; i < sample_texture_values.length; i++) {
                const sample_texture_value = sample_texture_values[i] as number
                buffer[i * this.channels] = sample_texture_value
            }
        }
        else if (sample_texture_values[0] instanceof Color) {
            switch (this.channels) {
                case 1:
                    for (let i = 0; i < sample_texture_values.length; i++) {
                        const sample_texture_value = sample_texture_values[i] as Color
                        buffer[i] = sample_texture_value.r
                    }
                    break
                case 3:
                    for (let i = 0; i < sample_texture_values.length; i++) {
                        const sample_texture_value = sample_texture_values[i] as Color
                        buffer[(i * 3) + 0] = sample_texture_value.r
                        buffer[(i * 3) + 1] = sample_texture_value.g
                        buffer[(i * 3) + 2] = sample_texture_value.b
                    }
                    break
                case 4:
                    for (let i = 0; i < sample_texture_values.length; i++) {
                        const sample_texture_value = sample_texture_values[i] as Color
                        buffer[(i * 4) + 0] = sample_texture_value.r
                        buffer[(i * 4) + 1] = sample_texture_value.g
                        buffer[(i * 4) + 2] = sample_texture_value.b
                        buffer[(i * 4) + 3] = sample_texture_value.a
                    }
                    break
            }
        }
        else if (sample_texture_values[0] instanceof Vec3) {
            for (let i = 0; i < sample_texture_values.length; i++) {
                const sample_texture_value = sample_texture_values[i] as Vec3
                buffer[(i * this.channels) + 0] = sample_texture_value.x
                buffer[(i * this.channels) + 1] = sample_texture_value.y
                buffer[(i * this.channels) + 2] = sample_texture_value.z
            }
        }
        else if (sample_texture_values[0] instanceof Vec2) {
            for (let i = 0; i < sample_texture_values.length; i++) {
                const sample_texture_value = sample_texture_values[i] as Vec2
                buffer[(i * this.channels) + 0] = sample_texture_value.x
                buffer[(i * this.channels) + 1] = sample_texture_value.y
            }
        }
        else if (sample_texture_values[0] instanceof Vec4) {
            for (let i = 0; i < sample_texture_values.length; i++) {
                const sample_texture_value = sample_texture_values[i] as Vec4
                buffer[(i * this.channels) + 0] = sample_texture_value.x
                buffer[(i * this.channels) + 1] = sample_texture_value.y
                buffer[(i * this.channels) + 2] = sample_texture_value.z
                buffer[(i * this.channels) + 3] = sample_texture_value.w
            }
        }
        else throw new Error("unsupported type")

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