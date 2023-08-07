import { Color, Vec3, Vec2, Vec4, StandardMaterial, BasicMaterial } from "playcanvas-extended"
import { groups, MultiObjectsGroupsTemplate } from "../../../../paradigm/trees/index.js";
import { RANGE_MIN, RANGE_MAX } from "../../../../fields/index.js"
import { Texture, TextureSample } from "../../../../textures/texture.js"
import { GeneratorType } from "../../../../utils/generator-type.js"
import { VolumeLocation } from "../../../../volumes/volume.js"
import { Cost_Space_VertexColors, RenderedBufferForSemanticWithImplementation } from "../implementation.js"
import { MaterialSemanticImplementationStorageClass_VertexColors } from "../storage-classes/vertex-colors.js"
import { SurfaceRendererIndividual } from "../../renderer.js"
import { Material_Texture_Context, Material_Texture_Location } from "../material-texture.js"
import { LevelOfDetailInfo } from "../../mesh/LOD-info.js"
import { MaterialSemanticImplementation_Immediate } from "./immediate.js"

export class MaterialSemanticImplementation_VertexColors<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        TexelTypeT extends TextureSample = TextureSample
    >
    implements MaterialSemanticImplementation_Immediate<VolumeLocationT> {
    readonly cost: {
        time: number
        space: Cost_Space_VertexColors
    }

    get source_group() {
        return this.surface_textureGroup.path
    }

    constructor(
        public readonly semantic: keyof StandardMaterial | keyof BasicMaterial,
        public readonly texture: Texture<
                Material_Texture_Location<VolumeLocationT>,
                TexelTypeT,
                Material_Texture_Context<VolumeLocationT>
            >,
        public readonly stage: number,
        public readonly surface_textureGroup: GeneratorType<ReturnType<typeof groups>>,
        public readonly channels: number,
        public readonly vertices: number,
        public readonly triangleMonotonicity: number
    ) {
        this.cost = {
            time: vertices * 0.1,
            space: {
                vertexColorChannels: channels,
                elements: vertices * channels
            }
        }
    }

    quality(info: LevelOfDetailInfo) {
        const information_per_pixel_min = 1 / Math.max(0.2, info.edge.distances.absolute.screen[RANGE_MAX])
        const information_per_pixel_max = 1 / Math.max(0.2, info.edge.distances.absolute.screen[RANGE_MIN])
        const information_per_pixel_mean = (information_per_pixel_min + information_per_pixel_max) / 2

        const interpolating_fit_definite = Math.max(1, information_per_pixel_mean)

        return interpolating_fit_definite + ((1 - interpolating_fit_definite) * this.triangleMonotonicity)
    }
    
    equals(that: MaterialSemanticImplementation_Immediate<VolumeLocationT>): boolean {
        return that instanceof MaterialSemanticImplementation_VertexColors &&
            ///@ts-ignore    
            this.texture === that.texture &&
            this.channels === that.channels &&
            this.stage === that.stage &&
            this.semantic === that.semantic &&
            this.source_group === that.source_group &&
            this.vertices === that.vertices
    }

    implement(renderer: SurfaceRendererIndividual<VolumeLocationT>): RenderedBufferForSemanticWithImplementation<VolumeLocationT>[] {
        const buffer = new Float32Array(this.channels * renderer.shared.meshData.vertices.length)
        
        const textureContext = this.surface_textureGroup.get<Material_Texture_Context<VolumeLocationT>>(renderer.shared.textureContexts)
        
        const UVs = renderer.shared.surfaceUVUnwrapping.UVs
        const n_vertices = renderer.shared.meshData.vertices.length / 3

        //TODO: vectorized sampling will let the vertex color buffer be easily automatically filled
        /** original vertices */
        const sample_texture_values = new Array<TexelTypeT>(n_vertices)
        for (let i = 0; i < n_vertices; i++) {
            sample_texture_values[i] =
                this.texture.sample(
                    //TODO: integrate other location fields
                    { uv: new Vec2(UVs[(2 * i) + 0], UVs[(2 * i) + 1]) } as Material_Texture_Location<VolumeLocationT>,
                    textureContext
                )
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

        return [{
            storageClass: MaterialSemanticImplementationStorageClass_VertexColors.$class,
            implementation: this,
            buffer: buffer,
            channels: this.channels,
            semantic: this.semantic
        }]
    }
}