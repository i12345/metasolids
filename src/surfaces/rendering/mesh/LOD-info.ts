import { Application, Vec2, Vec3 } from "playcanvas-extended"
import { FieldPointRange, FieldPointVectorized, RANGE_MAX, RANGE_MIN, field_point_mean, field_point_range_compute, groupKinds } from "../../../fields/index.js"
import { MeshDecimationIndividual } from "./decimation.js"
import { MeshRendererIndividual, MeshRendererShared } from "./renderer.js"
import { IndiciesArray, indicesArrayType } from "../../../utils/indices-array.js"
import { onlyOne } from "../../../utils/index.js"
import { SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceTextureLocationsGroupKindsTemplate } from "../../texturing/index.js"
import { TextureLocation } from "../../../textures/texture.js"

type LevelOfDetailInfo_Edge_Cached = {
    absolute: {
        /**
         * Range of world distance per edge
         */
        world: number

        /**
         * Range of UV distance per edge
         */
        uv: number
    }
    ratios: {
        /**
         * Range of (world distance \div UV distance) per edge
         */
        world_UV: number
    }
}

type LevelOfDetailInfo_Edge = LevelOfDetailInfo_Edge_Cached & {
    absolute: {
        /**
         * Range of screen distance per edge
         */
        screen: number
    }
    ratios: {
        /**
         * Range of (screen distance \div UV distance) per edge
         */
        screen_UV: number
    }
}

type LevelOfDetailInfo_Cached = {
    edge: {
        distances: FieldPointRange<LevelOfDetailInfo_Edge_Cached>
    }
}

export type LevelOfDetailInfo = {
    distance: number
    edge: {
        distances: FieldPointRange<LevelOfDetailInfo_Edge>
    }
}

export class LevelOfDetailInfoComputerShared {
    /** quality -> cache */
    private readonly cache = new Map<number, LevelOfDetailInfo_Cached>()

    constructor(public readonly renderer: MeshRendererShared) { }

    individualize(renderer: MeshRendererIndividual) {
        return new LevelOfDetailInfoComputerIndividual(this, renderer)
    }

    cached(quality: number) {
        const cached = this.cache.get(quality)
        if (cached)
            return cached
        else {
            const cached = this.computeCache(quality)
            this.cache.set(quality, cached)
            return cached
        }
    }

    private computeCache(quality: number): LevelOfDetailInfo_Cached {
        const isFirst = this.renderer.implementation_cache.size === 0
        const surface = this.renderer.renderer.surface
        const meshData = surface.mesh
        const UVunwrapping = this.renderer.UVUnwrapping

        /** decimated? UV-unwrapped-duplicated? vertex index -> original mesh data vertex index */
        const vertices_original = isFirst ?
            new Array(meshData.vertices.length + (UVunwrapping?.duplicatedVerts.length ?? 0)) :
            this.renderer.decimation.cached(quality).vertices_original

        /** decimated? UV-unwrapped? vertex index -> UV-unwrapped? vertex index */
        const vertices_unwrapped = isFirst ?
            new Array(meshData.vertices.length + (UVunwrapping?.duplicatedVerts.length ?? 0)) :
            this.renderer.decimation.cached(quality).vertices_final
        
        if (isFirst) {
            for (let i = 0; i < meshData.vertices.length; i++) {
                vertices_original[i] = i
                vertices_unwrapped[i] = i
            }

            if (UVunwrapping) {
                for (let i = 0; i < UVunwrapping.duplicatedVerts.length; i++) {
                    vertices_original[i + meshData.vertices.length] = UVunwrapping.duplicatedVerts[i]
                    vertices_unwrapped[i + meshData.vertices.length] = i + meshData.vertices.length
                }
            }
        }

        /** indices within decimated? UV-unwrapped-duplicated? vertices */
        const indices = isFirst ?
            (UVunwrapping?.finalIndices ?? meshData.triangles) :
            this.renderer.decimation.cached(quality).triangles
        
        const edges: LevelOfDetailInfo_Edge_Cached[] = []
        
        const EDGES_COUNT = 100
        for (let i = 0; i < EDGES_COUNT; i++) {
            const i0 = Math.min(indices.length - 1, Math.floor(indices.length * Math.random()))
            const i1 = (((i0 % 3) + 1) % 3) + (3 * Math.floor(i0 / 3))
            
            const v0_decimated = indices[i0]
            const v1_decimated = indices[i1]

            const v0_UVunwrapped = vertices_unwrapped[v0_decimated]
            const v1_UVunwrapped = vertices_unwrapped[v1_decimated]

            const v0_original = vertices_original[v0_decimated]
            const v1_original = vertices_original[v1_decimated]

            const world_0 = meshData.vertices[v0_original]
            const world_1 = meshData.vertices[v1_original]
            const world_dist = world_0.distance(world_1)

            const uv_dist = UVunwrapping ?
                UVunwrapping.UVs[v0_UVunwrapped].distance(UVunwrapping?.UVs[v1_UVunwrapped]) :
                NaN

            edges.push({
                absolute: {
                    world: world_dist,
                    uv: uv_dist
                },
                ratios: {
                    world_UV: world_dist / uv_dist
                }
            })
        }

        return {
            edge: {
                distances: field_point_range_compute(edges)
            }
        }
    }
}

export class LevelOfDetailInfoComputerIndividual {
    private readonly edge_distance_world_mean!: number
    private _info!: LevelOfDetailInfo

    get info(): LevelOfDetailInfo {
        return this._info
    }

    constructor(
        public readonly shared: LevelOfDetailInfoComputerShared,
        public readonly renderer: MeshRendererIndividual
    ) {
        this.update()
    }

    update() {
        const camera = Application.getApplication()!.systems.camera!.cameras[0]
        const distance = this.renderer.renderer.entity.getPosition().distance(camera.entity.getPosition())

        const edge_distance_calc_world_0 = camera.entity.forward.clone().mulScalar(distance).add(camera.entity.getPosition())
        const edge_distance_calc_world_1 = camera.entity.right.clone().mulScalar(this.edge_distance_world_mean).add(edge_distance_calc_world_0)
        const edge_distance_calc_screen_0 = camera.worldToScreen(edge_distance_calc_world_0)
        const edge_distance_calc_screen_1 = camera.worldToScreen(edge_distance_calc_world_1)
        const edge_distance_calc_screen_0_v2 = new Vec2(edge_distance_calc_screen_0.x, edge_distance_calc_screen_0.y)
        const edge_distance_calc_screen_1_v2 = new Vec2(edge_distance_calc_screen_1.x, edge_distance_calc_screen_1.y)
        const edge_distance_screen_mean = edge_distance_calc_screen_0_v2.distance(edge_distance_calc_screen_1_v2)

        const ratio_screen_per_world = edge_distance_screen_mean / this.edge_distance_world_mean

        const cache = this.shared.cached(this.renderer.decimation.quality)

        this._info = {
            distance,
            edge: {
                distances: {
                    absolute: {
                        world: cache.edge.distances.absolute.world,
                        uv: cache.edge.distances.absolute.uv,
                        screen: [
                            ratio_screen_per_world * cache.edge.distances.absolute.world[RANGE_MIN],
                            ratio_screen_per_world * cache.edge.distances.absolute.world[RANGE_MAX]
                        ]
                    },
                    ratios: {
                        world_UV: cache.edge.distances.ratios.world_UV,
                        screen_UV: [
                            ratio_screen_per_world * cache.edge.distances.ratios.world_UV[RANGE_MIN],
                            ratio_screen_per_world * cache.edge.distances.ratios.world_UV[RANGE_MAX]
                        ]
                    }
                }
            }
        }
    }
}