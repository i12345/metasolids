import { Texture, TextureLocation, TextureSample } from "../../../textures/texture.js";
import { StageAndTexture, VertexInterpolatingTexture, opaqueStagedTexture } from "../../../textures/index.js";
import { GeneratorType, Reflect_entries, mergeObjects, onlyOne } from "../../../utils/index.js";
import { MaterialSemanticImplementation, RenderedBufferForSemanticWithImplementation } from "./implementation.js";
import { VolumeLocation } from "../../../volumes/index.js";
import { MultiObjectsGroupsMapped, groupKinds, groups, MultiObjectsGroupsTemplate, MultiObjectsIDs, extract } from "../../../paradigm/trees/index.js";
import { field_point_equal, field_point_add_inplace, field_point_divide, field_point_add, FieldPoint, field_point_identity, Triangles2DMeshInterpolator, field_point_new, field_point_map, FieldPointType, SampleDomainLocationFieldKey } from "../../../fields/index.js";
import { MultiObjectsSampleDomain, ConstantSampleDomain } from "../../../fields/domains/index.js"
import { MaterialSemanticImplementation_Constant, MaterialSemanticImplementation_Immediate, MaterialSemanticImplementation_Multi, MaterialSemanticImplementation_None, MaterialSemanticImplementation_Setting, MaterialSemanticImplementation_Texture, MaterialSemanticImplementation_Texture_SideEffect, MaterialSemanticImplementation_VertexColors } from "./semantic-implementations/index.js";
import { Material_Groups } from "./groups.js";
import { BasicMaterial, Color, DETAILMODE_ADD, DETAILMODE_MUL, StandardMaterial, Vec2 } from "playcanvas-extended";
import { FormatChannelQuality } from "./texture-formats.js";
import { SurfaceUVUnwrapping } from "../../uv-unwrapping/index.js";
import { SurfaceTextureLocationsGroupKindsTemplate } from "../../texturing/index.js";
import { MaterialSemanticImplementationStorageClassInstanceIndividual_VertexColors, MaterialSemanticImplementationStorageClass_Constant, MaterialSemanticImplementationStorageClass_Texture } from "./storage-classes/index.js";
import { Material_Groups_TextureContexts, Material_Texture_Context, Material_Texture_Location } from "./material-texture.js";
import { SurfaceProcessingContextWithRendering, SurfaceWithRendering } from "../surface.js";
import { Material_Groups_Textures } from "./material-texture.js";
import { MeshData } from "../../../surfaces/mesh-data.js";
import { vectorIterator } from "../../../fields/vectorized/iterators/factory.js";
import { FieldPointVectorContainer, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic, IsDynamicVector, field_point_vectorized_multi_objects_new, isDynamicVector } from "../../../fields/vectorized/point.js";
import { fusePoints } from "../../../fields/vectorized/fusing.js";
import { ArithmeticPrimitiveFuseMode, ArithmeticPrimitiveFuseModeOp } from "../../../fields/vectorized/fuse-modes/arithmetic.js";
import { field_point_vector_stdDev, field_point_vector_stdDev_aggregate } from "../../../fields/vectorized/index.js";

const MaterialGroup_ImplementationType_NotSupported = Symbol("not supported")

interface Material_Group_Implementations {
    name: keyof StandardMaterial | string
    channels: 1 | 3 | 4
    mixing?: {
        /**
         * If this is set then the texture can be decomposed into a primary
         * texture map and secondary `*DetailMap` texture map.
         */
        detailMap?: {
            /**
             * Whether the detail map can be an addition composition.
             *
             * @default false
             */
            add?: boolean

            /**
             * Whether the detail map can be a multiplication composition.
             *
             * If this is not set, the material semantic will probably still
             * multiply except the `*DetailMode` field won't be set.
             *
             * @default true
             */
            multiply?: boolean
        }

        products?: {
            /**
             * Whether this material group can be implemented using a texture
             * multiplied by vertex colors.
             */
            texture_and_vertexColors?: boolean

            /**
             * Whether this material group can be implemented using a constant
             * coefficient multiplied by (either a texture or vertex colors but
             * not both).
             */
            constant_and_texture_or_vertexColors?: boolean

            /**
             * Whether this material group can be implemented using a constant
             * coefficient multiplied by (a texture, vertex colors, or the
             * product of texture and vertex colors).
             */
            constant_and_texture_and_or_vertexColors?: boolean

            /**
             * Whether this material group requires a constant.
             *
             * A unity constant will be used (`1` or `Color.WHITE`).
             */
            constant_required?: boolean

            /**
             * Whether this material group must enable the `*Tint` flag for
             * a constant to multiply by texture and/or vertex colors.
             *
             * @default false
             */
            tint_flag?: boolean
        }
    }

    /**
     * The other properties on the material to change if this property is set
     *
     * Side effects of type {@link MaterialSemanticImplementation_Texture_SideEffect}
     * only run if the texture implementation was run.
     */
    sideEffects?: (
        [keyof StandardMaterial, boolean] |
        MaterialSemanticImplementation_Texture_SideEffect
    )[]

    /**
     * The priority for this material group to be rendered (lower values =
     * higher priority).
     *
     * @default 0
     */
    priority?: number,

    /**
     * Minimum quality channel format to encode texture
     *
     * @default {@link FormatChannelQuality.uint8}
     */
    texture_formatChannelQuality?: FormatChannelQuality

    /**
     * ??
     *
     * @default EFFECTIVE_TEXEL_DIFF_DEFAULT = 0.05
     */
    effectiveTexelDiff?: number

    /**
     * These will be filled out by default using the {@link name} field.
     */
    semantics?: {
        constant?: keyof StandardMaterial | keyof BasicMaterial | typeof MaterialGroup_ImplementationType_NotSupported
        texture?: keyof StandardMaterial | keyof BasicMaterial| typeof MaterialGroup_ImplementationType_NotSupported
        vertexColors?: keyof StandardMaterial | keyof BasicMaterial | typeof MaterialGroup_ImplementationType_NotSupported
    }
}

export const EFFECTIVE_TEXEL_DIFF_DEFAULT = 0.05

const Material_Groups_Implementations: MultiObjectsGroupsMapped<Material_Groups, Material_Group_Implementations> = {
    color: {
        name: "color",
        channels: 4,
        texture_formatChannelQuality: FormatChannelQuality.float16,
        semantics: {
            constant: "color",
            texture: "colorMap",
            vertexColors: "vertexColors"
        }
    },

    diffuse: {
        name: "diffuse",
        channels: 3,
        texture_formatChannelQuality: FormatChannelQuality.float16,
        mixing: {
            detailMap: {
                add: true,
                multiply: true
            },
            products: {
                texture_and_vertexColors: true,
                constant_and_texture_and_or_vertexColors: true,
                tint_flag: true
            },
        },
    },

    glossiness: {
        name: "gloss",
        channels: 1,
        mixing: {
            products: {
                texture_and_vertexColors: true,
            },
        }
    },

    metalness: {
        name: "metalness",
        channels: 1,
        mixing: {
            products: {
                texture_and_vertexColors: true,
            },
        },
        sideEffects: [
            ['useMetalness', true],
            // ['useMetalnessSpecularColor', true] //? is this needed here?
        ]
    },

    emissive: {
        name: "emissive",
        channels: 3,
        mixing: {
            products: {
                texture_and_vertexColors: true,
                constant_and_texture_and_or_vertexColors: true,
                tint_flag: true
            },
        },
    },

    /**
     * To dynamically control height more efficiently, the height map can be
     * set to a static value, so a static normal map will be computed also,
     * while {@link StandardMaterial.heightMapFactor} and
     * {@link StandardMaterial.bumpiness} can be modified dynamically.
     */
    height: {
        name: "height",
        channels: 1,
        semantics: {
            constant: MaterialGroup_ImplementationType_NotSupported,
            vertexColors: MaterialGroup_ImplementationType_NotSupported,
        },
        sideEffects: [
            ({ buffer, implementation }, surface) => {
                let normalMap: RenderedBufferForSemanticWithImplementation["buffer"]

                throw new Error('not implemented')

                //TODO: compute normal map

                // if (buffer instanceof Float32Array) {
                //     normalMap = new Float32Array(buffer.length)
                //     const size = Math.sqrt(buffer.length)
                //     for (let x = 0; x < size; x++)
                //     for (let y = 0; y < size; y++)
                //         normalMap[(y * size)+ x] =
                // } else {
                //
                // }

                return [{
                    buffer: normalMap,
                    channels: 3,
                    semantic: 'normalMap',
                    storageClass: MaterialSemanticImplementationStorageClass_Texture.$class,
                    implementation
                }]
            }
        ]
    },

    iridescence: {
        indexOfRefraction: {
            name: "refractionIndex",
            channels: 1,
            semantics: {
                texture: MaterialGroup_ImplementationType_NotSupported,
                vertexColors: MaterialGroup_ImplementationType_NotSupported,
            },
            sideEffects: [
                ['useIridescence', true]
            ]
        },

        intensity: {
            name: "iridescence",
            channels: 1,
            semantics: {
                constant: MaterialGroup_ImplementationType_NotSupported,
                vertexColors: MaterialGroup_ImplementationType_NotSupported,
            },
            sideEffects: [
                ['useIridescence', true]
            ]
        },

        thickness: {
            name: "iridescenceThickness",
            channels: 1,
            semantics: {
                constant: "iridescenceThicknessMax",
                vertexColors: MaterialGroup_ImplementationType_NotSupported,
            },
            sideEffects: [
                ['useIridescence', true],

                ({ implementation }) => [
                    {
                        storageClass: MaterialSemanticImplementationStorageClass_Constant.$class,
                        buffer: new Float32Array([0]),
                        channels: 1,
                        semantic: 'iridescenceThicknessMin',
                        implementation
                    },

                    {
                        storageClass: MaterialSemanticImplementationStorageClass_Constant.$class,
                        buffer: new Float32Array([1000]),
                        channels: 1,
                        semantic: 'iridescenceThicknessMax',
                        implementation
                    }
                ]
            ]
        }
    },

    opacity: {
        name: "opacity",
        channels: 1,
        mixing: {
            products: {
                texture_and_vertexColors: true
            }
        },
        sideEffects: [
            ['opacityFadesSpecular', false]
        ]
    },

    refraction: {
        indexOfRefraction: {
            name: "refractionIndex",
            channels: 1,
            semantics: {
                texture: MaterialGroup_ImplementationType_NotSupported,
                vertexColors: MaterialGroup_ImplementationType_NotSupported
            }
        },

        visibility: {
            name: "refraction",
            channels: 1,
            mixing: {
                products: {
                    texture_and_vertexColors: true
                }
            }
        },

        attenuation: {
            color: {
                name: "attenuation",
                channels: 3,
                semantics: {
                    texture: MaterialGroup_ImplementationType_NotSupported,
                    vertexColors: MaterialGroup_ImplementationType_NotSupported,
                },
                sideEffects: [
                    ['useDynamicRefraction', true],
                ]
            },

            distance: {
                name: "attenuationDistance",
                channels: 1,
                semantics: {
                    texture: MaterialGroup_ImplementationType_NotSupported,
                    vertexColors: MaterialGroup_ImplementationType_NotSupported,
                },
                sideEffects: [
                    ['useDynamicRefraction', true],
                ]
            }
        }
    },

    clearCoat: {
        glossiness: {
            name: "clearCoatGloss",
            channels: 1,
            mixing: {
                products: {
                    constant_and_texture_or_vertexColors: true,
                    constant_required: true,
                }
            }
        },

        height: {
            name: "height",
            channels: 1,
            sideEffects: [
                //TODO: compute clear coat normal map
            ],
            semantics: {
                constant: MaterialGroup_ImplementationType_NotSupported,
                texture: "clearCoatHeightMap" as unknown as keyof StandardMaterial,
                vertexColors: MaterialGroup_ImplementationType_NotSupported,
            }
        },

        intensity: {
            name: "clearCoat",
            channels: 1,
            mixing: {
                products: {
                    constant_required: true,
                    constant_and_texture_and_or_vertexColors: true,
                }
            }
        }
    },

    sheen: {
        color: {
            name: 'sheen',
            channels: 3,
            mixing: {
                products: {
                    texture_and_vertexColors: true,
                    constant_and_texture_and_or_vertexColors: true,
                    tint_flag: true
                }
            }
        },

        glossiness: {
            name: 'sheenGloss',
            channels: 1,
            mixing: {
                products: {
                    texture_and_vertexColors: true,
                    constant_and_texture_and_or_vertexColors: true,
                    tint_flag: true
                }
            }
        }
    },

    specular: {
        name: 'specular',
        channels: 3,
        mixing: {
            products: {
                texture_and_vertexColors: true,
                constant_and_texture_and_or_vertexColors: true,
                tint_flag: true
            }
        }
    }
}

interface QualityMetrics<
        TexelTypeT extends TextureSample = TextureSample
    > {
    readonly constancy: number
    readonly triangleMonotonicity: number
    readonly effectiveTexelSizeUV: number
    readonly meanValue: TexelTypeT
}

function qualityMetrics_compute<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TexelTypeT extends TextureSample = TextureSample
    >(
        mesh: MeshData,
        texture: Texture<
                Material_Texture_Location<VolumeLocationT>,
                TexelTypeT,
                Material_Texture_Location<VolumeLocationT>,
                Material_Texture_Location<VolumeLocationT>,
                TexelTypeT,
                TexelTypeT,
                Material_Texture_Context<VolumeLocationT>
            >,
        textureContext: Material_Texture_Context<VolumeLocationT>,
        UVunwrapping: SurfaceUVUnwrapping,
        implementation: Material_Group_Implementations,
        multiObjectsIDs?: MultiObjectsIDs
    ): QualityMetrics {
    const location_type = textureContext[SampleDomainLocationFieldKey].elementType
    const sample_type = texture.field.elementType

    function perfect_constancy(texture: Texture): FieldPoint | undefined {
        if (texture instanceof ConstantSampleDomain)
            return texture.value
        else if (texture instanceof VertexInterpolatingTexture) {
            const vertices = texture.vertices
            const vertexIterator = vectorIterator(sample_type, <any>isDynamicVector(sample_type, vertices), vertices)
            const length = vertexIterator.length(vertices, vertices)

            if (length === 0)
                return field_point_new(sample_type)
            else if (length === 1)
                return vertexIterator.get_returnValue(vertices, vertices, 0)
            else {
                const constant = vertexIterator.get_returnValue(vertices, vertices, 0)
                for (let i = 1; i < length; i++) {
                    const item = vertexIterator.get_returnValue(vertices, vertices, i)
                    if (!field_point_equal(constant, item))
                        return undefined
                }
                return constant
            }
        }
        else if (texture instanceof MultiObjectsSampleDomain) {
            const child_constants = Reflect_entries(texture.children).map(([, child]) => perfect_constancy(child))
            if (!child_constants.every(child_constant => child_constant !== undefined))
                return undefined

            return fusePoints(
                sample_type,
                texture.childField.elementType,
                texture.fuseMode ?? texture.field.fuseMode,
                child_constants.map(value => ({ value: value! })),
                multiObjectsIDs
            )
        }
        return undefined
    }

    function perfect_triangleMonotonicity(texture: Texture): boolean {
        if (texture instanceof VertexInterpolatingTexture ||
            texture instanceof ConstantSampleDomain)
            return true
        else if (texture instanceof MultiObjectsSampleDomain &&
            texture.isCompositeArithmetic(ArithmeticPrimitiveFuseModeOp.none, ArithmeticPrimitiveFuseModeOp.add, ArithmeticPrimitiveFuseModeOp.subtract))
            return texture.children.every(perfect_triangleMonotonicity)
        return false
    }

    const constantValue = perfect_constancy(texture)
    if (constantValue) {
        return {
            constancy: 1,
            triangleMonotonicity: 1,
            effectiveTexelSizeUV: 1,
            meanValue: constantValue
        }
    }

    /**
        Let ${\bf{\hat{t}}}(\vec{x})$ be the texture value at location $\vec{x}$
        and let ${\bf{t}}(\vec{x})$ be the vertex-interpolated value.
        Let $m=e^{-E[|{\bf{\hat{t}}}(\vec{x})-{\bf{t}}(\vec{x})|]}$
        be a metric of triangular monotonicity (1 = perfect fit).
    */

    function vertex_original(vertex: number) {
        return (vertex < mesh.vertices.length) ? vertex :
            UVunwrapping.duplicatedVerts[vertex - mesh.vertices.length]
    }

    /** indices in UV-unwrapped, not decimated vertices */
    const indices = UVunwrapping.finalIndices ?? mesh.triangles

    /** indices in UV-unwrapped, not decimated vertices, divided by 3 (indices in UV-unwrapped, not decimated, triangles) */
    const tri_n_max = UVunwrapping.finalIndices.length / 3
    const tri_n = Math.min(64, tri_n_max)
    const tri_i_s = new Uint32Array(tri_n).fill(-1)
    for (let i = 0; i < tri_n; i++) {
        let tri_i: number
        do tri_i = Math.min(tri_n - 1, Math.floor(tri_n * Math.random()))
        while (tri_i_s.includes(tri_i))
        tri_i_s[i] = tri_i
    }

    const samples = field_point_vectorized_multi_objects_new<TexelTypeT>(
        sample_type,
        0,
        <IsDynamicVector<TexelTypeT>>true,
        multiObjectsIDs?.IDsType,
        undefined
    )

    const samples_iterator = vectorIterator<TexelTypeT>(texture.field.elementType, <any>isDynamicVector(sample_type, samples), multiObjectsIDs)
    const samples_add = (sample: TexelTypeT) => samples_iterator.set(samples, samples, sample, samples_iterator.length(samples, samples))

    function calculate_constancy() {
        const sample_stdDev = field_point_vector_stdDev_aggregate(sample_type, samples, multiObjectsIDs)
        //TODO: experiment to find ideal factor
        return Math.exp(-5 * sample_stdDev)
    }

    /** indexed by UV-unwrapped (potentially duplicated) vertex index */
    const vertex_texture_locations = new Map<number, Material_Texture_Location<VolumeLocationT>>()

    /** indexed by original (not UV unwrapped) vertex index */
    const vertex_texture_samples = new Map<number, TexelTypeT>()

    //TODO: use vectorized functions

    function vertex_texture_info(vertex: number) {
        const vertex_original_ = vertex_original(vertex)

        if (!vertex_texture_locations.has(vertex)) {
            const uv = new Vec2(
                UVunwrapping.UVs[(2 * vertex) + 0],
                UVunwrapping.UVs[(2 * vertex) + 1]
            )
            //TODO: integrate extra fields for material texture location
            const texture_location = { uv } as Material_Texture_Location<VolumeLocationT>
            vertex_texture_locations.set(vertex, texture_location)
        }

        if (!vertex_texture_samples.has(vertex_original_)) {
            const texture_location = vertex_texture_locations.get(vertex)!
            const texture_sample = texture.sample(texture_location, textureContext)
            samples_add(texture_sample)
            vertex_texture_samples.set(vertex_original_, texture_sample)
        }

        return {
            sample: vertex_texture_samples.get(vertex_original_)!,
            location: vertex_texture_locations.get(vertex)!
        }
    }

    const interpolator_values_locations = field_point_vectorized_multi_objects_new<Material_Texture_Location<VolumeLocationT>, FieldPointVectorContainerStatic>(
        location_type,
        3 * tri_n,
        <IsDynamicVector<Material_Texture_Location<VolumeLocationT>, FieldPointVectorContainerStatic>>false,
        multiObjectsIDs?.IDsType,
        undefined
    )

    const interpolator_values_locations_iterator = vectorIterator/* <Material_Texture_Location<VolumeLocationT>> */(location_type, <any>isDynamicVector(location_type, interpolator_values_locations), multiObjectsIDs)

    const interpolator_values_samples = field_point_vectorized_multi_objects_new<TexelTypeT, FieldPointVectorContainerStatic>(
        sample_type,
        3 * tri_n,
        <IsDynamicVector<TexelTypeT>>false,
        multiObjectsIDs?.IDsType,
        undefined
    )

    const interpolator_values_samples_iterator = vectorIterator<TexelTypeT>(sample_type, <any>isDynamicVector(sample_type, interpolator_values_samples), multiObjectsIDs)

    const interpolator_triangles = []

    let meanValue: TexelTypeT | undefined = undefined

    //TODO: optimize with field_point_vector_gather() and _vector_add()
    for (const tri_i of tri_i_s) {
        for (let index_i = 0; index_i < 3; index_i++) {
            const offset = (tri_i * 3) + index_i
            const vertex_i = indices[offset]
            const { location, sample } = vertex_texture_info(vertex_i)
            interpolator_values_locations_iterator.set(interpolator_values_locations, interpolator_values_locations, location, offset)
            interpolator_values_samples_iterator.set(interpolator_values_samples, interpolator_values_samples, sample, offset)
            interpolator_triangles.push(interpolator_triangles.length)
            meanValue = meanValue === undefined ? sample : field_point_add_inplace(meanValue, sample)
        }
    }

    meanValue = field_point_divide(meanValue!, tri_n)

    if (perfect_triangleMonotonicity(texture)) {
        const effectiveTexelSizeUV_dist: number[] = []

        const UVs = UVunwrapping.UVs
        for (const tri_i of tri_i_s) {
            for (let i0 = 0; i0 < 3; i0++) {
                const i1 = (i0 + 1) % 3

                const v0 = indices[(tri_i * 3) + i0]
                const v1 = indices[(tri_i * 3) + i1]

                const uv0x = UVs[(2 * v0) + 0]
                const uv0y = UVs[(2 * v0) + 1]

                const uv1x = UVs[(2 * v1) + 0]
                const uv1y = UVs[(2 * v1) + 1]

                const dist_01 = Math.sqrt(((uv0x - uv1x) ** 2) + ((uv0y - uv1y) ** 2))

                const val0 = vertex_texture_info(v0).sample
                const val1 = vertex_texture_info(v1).sample

                effectiveTexelSizeUV_dist.push(texture.field.distance(val0, val1) / dist_01)
            }
        }

        const constancy = calculate_constancy()

        return {
            constancy,
            triangleMonotonicity: 1,
            effectiveTexelSizeUV: effectiveTexelSizeUV_dist.at(Math.floor(0.75 * effectiveTexelSizeUV_dist.length))!,
            meanValue
        }
    }

    const interpolator_texture_location = new Triangles2DMeshInterpolator(location_type, interpolator_values_locations, interpolator_triangles, multiObjectsIDs)
    const interpolator_texture_sample = new Triangles2DMeshInterpolator<TexelTypeT>(sample_type, interpolator_values_samples, interpolator_triangles, multiObjectsIDs)

    const textureValuePerUV_dist: number[] = []

    let triangleInterpolating_error_total = 0
    let triangleInterpolating_error_eval = 0

    for (let i_tri = 0; i_tri < tri_n; i_tri++) {
        let texture_location_prev: Material_Texture_Location<VolumeLocationT> | undefined = undefined
        let texture_sample_prev: TexelTypeT | undefined = undefined
        for (let w = 0; w < 0.5; w += 0.02) {
            const texture_location_interpolated = <Material_Texture_Location<VolumeLocationT>>interpolator_texture_location.interpolate(i_tri, w, w)
            const texture_sample_interpolated = interpolator_texture_sample.interpolate(i_tri, w, w)

            const texture_sample_real = texture.sample(texture_location_interpolated, textureContext)
            samples_add(texture_sample_real)

            if (texture_location_prev) {
                const textureValuePerUV =
                    texture.field.distance(texture_sample_prev!, texture_sample_real) /
                    texture_location_prev.uv.distance(texture_location_interpolated.uv)

                textureValuePerUV_dist.push(textureValuePerUV)
            }

            texture_location_prev = texture_location_interpolated
            texture_sample_prev = texture_sample_real

            triangleInterpolating_error_total += texture.field.distance(
                texture_sample_interpolated,
                texture_sample_real
            )
            triangleInterpolating_error_eval++
        }
    }

    const triangleMonotonicity = Math.exp(-(triangleInterpolating_error_total / triangleInterpolating_error_eval))
    const constancy = calculate_constancy()
    const textureValuePerUV_q3 = textureValuePerUV_dist.sort((a, b) => a - b).at(Math.floor(0.75 * textureValuePerUV_dist.length))!

    let effectiveTexelSizeUV = (implementation.effectiveTexelDiff ?? EFFECTIVE_TEXEL_DIFF_DEFAULT) / textureValuePerUV_q3
    if (isNaN(effectiveTexelSizeUV) ||
        effectiveTexelSizeUV > 1)
        effectiveTexelSizeUV = 1

    return {
        constancy,
        triangleMonotonicity,
        effectiveTexelSizeUV,
        meanValue
    }
}

function qualityMetrics_combine<
        TexelTypeT extends TextureSample = TextureSample
    >(
        a: QualityMetrics<TexelTypeT>,
        b: QualityMetrics<TexelTypeT>
    ): QualityMetrics<TexelTypeT> {
    return {
        constancy: Math.min(a.constancy, b.constancy),
        triangleMonotonicity: Math.min(a.triangleMonotonicity, b.triangleMonotonicity),
        effectiveTexelSizeUV: Math.min(a.effectiveTexelSizeUV, b.effectiveTexelSizeUV),
        meanValue: field_point_divide(field_point_add(a.meanValue, b.meanValue), 2)
    }
}

/**
 * Proposes implementations for a material group;
 * only one implementation will be applied.
 *
 * @param group the material group to propose implementations for
 * @param surface the surface to implement this material semantic for
 * @param context
 * @returns potential ways to implement this material semantic
 */
export function* material_group_implementations<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        TexelTypeT extends TextureSample = TextureSample
    >(
        group: GeneratorType<ReturnType<typeof groups>>,
        textures: Material_Groups_Textures<VolumeLocationT>,
        contexts: Material_Groups_TextureContexts<VolumeLocationT>,
        mesh: MeshData,
        UVunwrapping: SurfaceUVUnwrapping
    ): Generator<MaterialSemanticImplementation<VolumeLocationT>> {
    type TextureLocationT = Material_Texture_Location<VolumeLocationT>
    type TextureContextT = Material_Texture_Context<VolumeLocationT>
    type TextureT = Texture<TextureLocationT, TexelTypeT, TextureLocationT, TextureLocationT, TexelTypeT, TexelTypeT, TextureContextT>
    type StageAndTextureT = StageAndTexture<TextureLocationT, TexelTypeT, TextureLocationT, TextureLocationT, TexelTypeT, TexelTypeT, TextureContextT, TextureT>

    const texture = group.get<TextureT>(textures)
    const textureContext = group.get<TextureContextT>(contexts)
    const implementation = group.get<Material_Group_Implementations>(Material_Groups_Implementations)

    const texture_hdr = (implementation.effectiveTexelDiff ?? EFFECTIVE_TEXEL_DIFF_DEFAULT) < (1 / 256)

    ///@ts-ignore
    const sideEffects_texture = implementation.sideEffects?.filter(sideEffect => typeof sideEffect === 'function') as unknown as MaterialSemanticImplementation_Texture_SideEffect<VolumeLocationT>[]
    ///@ts-ignore
    const sideEffects_general = (implementation.sideEffects?.filter(sideEffect => typeof sideEffect !== 'function') as [keyof StandardMaterial, boolean][] ?? []).map(([key, value]) => new MaterialSemanticImplementation_Setting<VolumeLocationT>(key, value, 0))

    // const texture_resolutions = [64, 128, 256, 512, 1024, 2048]
    const texture_resolutions = [1024, 2048]

    type CompositeTextureT = Texture<TextureLocationT, TexelTypeT, TextureLocationT, TextureLocationT, TexelTypeT, TexelTypeT, TextureContextT> & MultiObjectsSampleDomain

    function* decomposeStagedComponents(
            texture: TextureT,
            isDecomposition: (composite: CompositeTextureT) => boolean,
        ): Generator<StageAndTextureT> {
        const parent = opaqueStagedTexture(texture)
        const [parentStage, parentTexture] = parent

        if (isNaN(parentStage) &&
            parentTexture instanceof MultiObjectsSampleDomain &&
            isDecomposition(<any>parentTexture)) {
            for (const [, child] of Reflect_entries(parentTexture.children))
                yield* decomposeStagedComponents(child, isDecomposition)
        }
        else yield parent
    }

    function bestDecomposition(
            texture: TextureT,
            components = 2,
            isDecomposition: (composite: CompositeTextureT) => boolean,
            composition: (components: TextureT[]) => CompositeTextureT
        ): StageAndTexture<TextureLocationT, TexelTypeT, TextureLocationT, TextureLocationT, TexelTypeT, TexelTypeT, TextureContextT>[] {
        const stages_components: { [stage: number]: StageAndTextureT[] } = {}

        for (const [stage, component] of decomposeStagedComponents(texture, isDecomposition)) {
            stages_components[stage] ??= []
            stages_components[stage].push([stage, component])
        }

        const sorted_stages_components = Reflect_entries(stages_components).sort((a, b) => +a[0] - +b[0]).map(([stage, stageAndTextures]) => stageAndTextures)

        function componentsIntoTexture(components: StageAndTextureT[]): StageAndTextureT {
            if (components.length === 1)
                return components[0]
            else return [
                Math.max(...components.map(([stage, _]) => stage)),
                composition(components.map(([_, texture]) => texture))
            ]
        }

        const retval: StageAndTexture<TextureLocationT, TexelTypeT, TextureLocationT, TextureLocationT, TexelTypeT, TexelTypeT, TextureContextT>[] = []
        if (sorted_stages_components.length >= components) {
            for (let i = 0; i < components - 1; i++)
                retval[i] = componentsIntoTexture(sorted_stages_components.shift()!)
            retval[components - 1] = componentsIntoTexture(sorted_stages_components.flatMap(textures => textures))
        }
        else retval.push(...sorted_stages_components.map(staged_texture => componentsIntoTexture(staged_texture)))

        return retval
    }

    /**
     * if mixing.product or mixing.detailMap:
     * decompostion into product of 3
     * yield all product implementations
     * yield detail map with multiplication
     *
     * if mixing.detailMap.add:
     * decompose into sum of 2
     * yield detail map with addition
     *
     * yield single implementations
     */

    const semantics = {
        constant: <keyof StandardMaterial | keyof BasicMaterial>((implementation.semantics?.constant === MaterialGroup_ImplementationType_NotSupported ? undefined : implementation.semantics?.constant) ?? implementation.name),
        texture: <keyof StandardMaterial | keyof BasicMaterial>((implementation.semantics?.texture === MaterialGroup_ImplementationType_NotSupported ? undefined : implementation.semantics?.texture) ?? `${implementation.name}Map`),
        vertexColors: <keyof StandardMaterial | keyof BasicMaterial>((implementation.semantics?.vertexColors === MaterialGroup_ImplementationType_NotSupported ? undefined : implementation.semantics?.vertexColors) ?? `${implementation.name}VertexColor`),
    }

    if (implementation.mixing?.products ||
        (implementation.mixing?.detailMap &&
            (implementation.mixing.detailMap.multiply !== false))) {
        const canUse3factors =
            semantics.constant &&
            semantics.texture &&
            semantics.vertexColors

        const factors = bestDecomposition(
            texture,
            canUse3factors ? 3 : 2,
            composite => composite.isCompositeArithmetic(ArithmeticPrimitiveFuseModeOp.multiply),
            components => <CompositeTextureT><unknown>MultiObjectsSampleDomain.compositeArithmetic(
                ArithmeticPrimitiveFuseModeOp.multiply,
                texture.field,
                ...(<any[]>components)
            )
        )

        if (factors.length >= 2) {
            const qualityMetrics = factors.map(([, texture]) =>
                qualityMetrics_compute<VolumeLocationT>(
                    mesh,
                    texture,
                    textureContext,
                    UVunwrapping,
                    implementation
                )
            )

            const implementation_tint: MaterialSemanticImplementation_Immediate<VolumeLocationT> = (
                implementation.mixing?.products?.tint_flag ?
                    new MaterialSemanticImplementation_Setting(
                        <keyof StandardMaterial>`${implementation.name}Tint`,
                        true,
                        Math.max(0, ...factors.map(([stage]) => stage))
                    ) :
                    MaterialSemanticImplementation_None.instance as unknown as MaterialSemanticImplementation_None<VolumeLocationT>
            )

            if (factors.length === 3) {
                for (const factor_index_constant of [1, 2, 3]) {
                    const implementation_constant = new MaterialSemanticImplementation_Constant<VolumeLocationT>(
                        semantics.constant,
                        qualityMetrics[factor_index_constant].meanValue,
                        implementation.channels,
                        factors[factor_index_constant][0],
                        qualityMetrics[factor_index_constant].constancy
                    )

                    const factor_indices_vertexColor = [1, 2, 3]
                    factor_indices_vertexColor.splice(factor_index_constant, 1)
                    for (const factor_index_vertexColors of factor_indices_vertexColor) {
                        const implementation_vertexColors = new MaterialSemanticImplementation_VertexColors<VolumeLocationT, TexelTypeT>(
                            semantics.vertexColors,
                            factors[factor_index_vertexColors][1],
                            factors[factor_index_vertexColors][0],
                            group,
                            implementation.channels,
                            mesh.vertices.length,
                            qualityMetrics[factor_index_vertexColors].triangleMonotonicity
                        )

                        const factor_index_texture = [1, 2, 3].find(x => !([factor_index_constant, factor_index_vertexColors].includes(x)))!
                        for (const texture_resolution of texture_resolutions) {
                            ///@ts-ignore
                            const implementation_texture = new MaterialSemanticImplementation_Texture<VolumeLocationT>(
                                semantics.texture,
                                factors[factor_index_texture][1],
                                factors[factor_index_texture][0],
                                group,
                                texture_resolution,
                                implementation.channels,
                                qualityMetrics[factor_index_texture].effectiveTexelSizeUV,
                                texture_hdr,
                                sideEffects_texture
                            )

                            ///@ts-ignore
                            yield new MaterialSemanticImplementation_Multi<VolumeLocationT>([
                                implementation_tint,
                                implementation_constant,
                                implementation_vertexColors,
                                implementation_texture,
                                ...sideEffects_general
                            ])
                        }
                    }
                }
            }

            if (implementation.mixing.products?.texture_and_vertexColors ||
                implementation.mixing.products?.constant_and_texture_or_vertexColors ||
                (implementation.mixing.detailMap &&
                    (implementation.mixing.detailMap.multiply !== false))) {

                const factor_0 = factors[0]
                const factor_1 = factors.length === 2 ?
                    factors[1] :
                    [
                        Math.max(factors[1][0], factors[2][0]),
                        <CompositeTextureT><unknown>MultiObjectsSampleDomain.compositeArithmetic(
                            ArithmeticPrimitiveFuseModeOp.multiply,
                            <any>factors[1][1],
                            <any>factors[2][1]
                        )
                    ] as StageAndTexture

                const qualityMetrics_0 = qualityMetrics[0]
                const qualityMetrics_1 = factors.length === 2 ?
                    qualityMetrics[1] : qualityMetrics_combine(qualityMetrics[1], qualityMetrics[2])

                if (implementation.mixing.products?.constant_and_texture_or_vertexColors ||
                    implementation.mixing.products?.texture_and_vertexColors) {

                    const factors = [factor_0, factor_1]
                    const qualityMetrics = [qualityMetrics_0, qualityMetrics_1]

                    if (implementation.mixing.products?.constant_and_texture_or_vertexColors) {
                        for (const factor_index_constant of [0, 1]) {
                            const factor_index_other = 1 - factor_index_constant

                            const implementation_constant = new MaterialSemanticImplementation_Constant<VolumeLocationT>(
                                semantics.constant,
                                qualityMetrics[factor_index_constant].meanValue,
                                implementation.channels,
                                factors[factor_index_constant][0],
                                qualityMetrics[factor_index_constant].constancy
                            )

                            const implementation_vertexColors = new MaterialSemanticImplementation_VertexColors<VolumeLocationT>(
                                semantics.vertexColors,
                                factors[factor_index_other][1],
                                factors[factor_index_other][0],
                                group,
                                implementation.channels,
                                mesh.vertices.length,
                                qualityMetrics[factor_index_other].triangleMonotonicity
                            )

                            yield new MaterialSemanticImplementation_Multi<VolumeLocationT>([
                                implementation_constant,
                                implementation_vertexColors,
                                implementation_tint,
                                ...sideEffects_general
                            ])

                            for (const resolution of texture_resolutions) {
                                const implementation_texture = new MaterialSemanticImplementation_Texture<VolumeLocationT>(
                                    semantics.texture,
                                    factors[factor_index_other][1],
                                    factors[factor_index_other][0],
                                    group,
                                    resolution,
                                    implementation.channels,
                                    qualityMetrics[factor_index_other].effectiveTexelSizeUV,
                                    texture_hdr,
                                    sideEffects_texture
                                )

                                yield new MaterialSemanticImplementation_Multi([
                                    implementation_constant,
                                    implementation_texture,
                                    implementation_tint,
                                    ...sideEffects_general
                                ])
                            }
                        }
                    }

                    if (implementation.mixing.products?.texture_and_vertexColors) {
                        const sideEffects_tint = implementation.mixing.products.constant_required ? [
                            new MaterialSemanticImplementation_Constant<VolumeLocationT>(
                                semantics.constant,
                                implementation.channels === 1 ? 1 : Color.WHITE,
                                implementation.channels,
                                Math.max(factor_0[0], factor_1[0]),
                                1
                            ),
                            implementation_tint
                        ] : []

                        for (const factor_index_texture of [0, 1]) {
                            const factor_index_vertexColors = 1 - factor_index_texture

                            const implementation_vertexColors = new MaterialSemanticImplementation_VertexColors<VolumeLocationT>(
                                semantics.vertexColors,
                                factors[factor_index_vertexColors][1],
                                factors[factor_index_vertexColors][0],
                                group,
                                implementation.channels,
                                mesh.vertices.length,
                                qualityMetrics[factor_index_vertexColors].triangleMonotonicity
                            )

                            for (const resolution of texture_resolutions) {
                                const implementation_texture = new MaterialSemanticImplementation_Texture<VolumeLocationT>(
                                    semantics.texture,
                                    factors[factor_index_texture][1],
                                    factors[factor_index_texture][0],
                                    group,
                                    resolution,
                                    implementation.channels,
                                    qualityMetrics[factor_index_texture].effectiveTexelSizeUV,
                                    texture_hdr,
                                    sideEffects_texture
                                )

                                yield new MaterialSemanticImplementation_Multi<VolumeLocationT>([
                                    implementation_texture,
                                    implementation_vertexColors,
                                    ...sideEffects_tint,
                                    ...sideEffects_general
                                ])
                            }
                        }
                    }
                }

                if (implementation.mixing.detailMap && (implementation.mixing.detailMap.multiply !== false)) {
                    const sideEffects_detailMode = (implementation.mixing.detailMap.multiply || implementation.mixing.detailMap.add) ?
                        [new MaterialSemanticImplementation_Setting<VolumeLocationT>(
                            `${implementation.name}DetailMode` as keyof StandardMaterial,
                            DETAILMODE_MUL,
                            0 //?
                        )] : []

                    // Although, with the normal map, it can be decomposed into
                    // the sum of two (scalar * texture) products, since the
                    // normal map is generated from the height map, the height
                    // map has no optimizations like this, and no other texture
                    // can be decomposed like this, this kind of decomposition
                    // won't be supported.

                    if (sideEffects_texture?.length > 0)
                        throw new Error()

                    for (const resolution_0 of texture_resolutions) {
                        const implementation_0 = new MaterialSemanticImplementation_Texture<VolumeLocationT>(
                            semantics.texture,
                            factor_0[1],
                            factor_0[0],
                            group,
                            resolution_0,
                            implementation.channels,
                            qualityMetrics_0.effectiveTexelSizeUV,
                            texture_hdr,
                            sideEffects_texture
                        )

                        for (const resolution_1 of texture_resolutions) {
                            const implementation_1 = new MaterialSemanticImplementation_Texture<VolumeLocationT>(
                                <keyof StandardMaterial>`${implementation.name}DetailMap`,
                                factor_1[1],
                                factor_1[0],
                                group,
                                resolution_1,
                                implementation.channels,
                                qualityMetrics_1.effectiveTexelSizeUV,
                                texture_hdr,
                                sideEffects_texture
                            )

                            yield new MaterialSemanticImplementation_Multi<VolumeLocationT>([
                                implementation_0,
                                implementation_1,
                                ...sideEffects_detailMode,
                                ...sideEffects_general
                            ])
                        }
                    }
                }
            }
        }
    }

    if (implementation.mixing?.detailMap?.add) {
        const terms = bestDecomposition(
            texture,
            2,
            composite => composite.isCompositeArithmetic(ArithmeticPrimitiveFuseModeOp.multiply),
            components => <CompositeTextureT><unknown>MultiObjectsSampleDomain.compositeArithmetic(
                ArithmeticPrimitiveFuseModeOp.multiply,
                texture.field,
                ...(<any[]>components)
            )
        )

        if (terms.length === 2) {
            const qualityMetrics = terms.map(([, texture]) => qualityMetrics_compute<VolumeLocationT>(
                mesh,
                texture,
                textureContext,
                UVunwrapping,
                implementation
            ))

            const sideEffect_detailMode =
                new MaterialSemanticImplementation_Setting<VolumeLocationT>(
                    `${implementation.name}DetailMode` as keyof StandardMaterial,
                    DETAILMODE_ADD,
                    0
                )

            if (sideEffects_texture?.length > 0)
                throw new Error()

            for (const resolution_0 of texture_resolutions) {
                const implementation_0 = new MaterialSemanticImplementation_Texture<VolumeLocationT>(
                    semantics.texture,
                    terms[0][1],
                    terms[0][0],
                    group,
                    resolution_0,
                    implementation.channels,
                    qualityMetrics[0].effectiveTexelSizeUV,
                    texture_hdr,
                    sideEffects_texture
                )

                for (const resolution_1 of texture_resolutions) {
                    const implementation_1 = new MaterialSemanticImplementation_Texture<VolumeLocationT>(
                        <keyof StandardMaterial>`${implementation.name}DetailMap`,
                        terms[1][1],
                        terms[1][0],
                        group,
                        resolution_1,
                        implementation.channels,
                        qualityMetrics[1].effectiveTexelSizeUV,
                        texture_hdr,
                        sideEffects_texture
                    )

                    yield new MaterialSemanticImplementation_Multi<VolumeLocationT>([
                        implementation_0,
                        implementation_1,
                        sideEffect_detailMode,
                        ...sideEffects_general
                    ])
                }
            }
        }
    }

    const [stage,] = opaqueStagedTexture(texture)

    const qualityMetrics = qualityMetrics_compute(
            mesh,
            texture,
            textureContext,
            UVunwrapping,
            implementation
        )

    yield new MaterialSemanticImplementation_Multi<VolumeLocationT>([
        new MaterialSemanticImplementation_Constant<VolumeLocationT>(
                semantics.constant,
                qualityMetrics.meanValue,
                implementation.channels,
                stage,
                qualityMetrics.constancy
            ),
        ...sideEffects_general
    ])

    yield new MaterialSemanticImplementation_Multi<VolumeLocationT>([
        new MaterialSemanticImplementation_VertexColors<VolumeLocationT>(
                semantics.vertexColors,
                texture,
                stage,
                group,
                implementation.channels,
                mesh.vertices.length,
                qualityMetrics.triangleMonotonicity,
            ),
        ...sideEffects_general
    ])

    for (const resolution of texture_resolutions) {
        yield new MaterialSemanticImplementation_Multi<VolumeLocationT>([
            new MaterialSemanticImplementation_Texture<VolumeLocationT>(
                    semantics.texture,
                    texture,
                    stage,
                    group,
                    resolution,
                    implementation.channels,
                    qualityMetrics.effectiveTexelSizeUV,
                    texture_hdr,
                    sideEffects_texture
                ),
            ...sideEffects_general
        ])
    }
}