import { Application, Vec2, Vec3 } from "playcanvas-extended"
import { FieldPointRange, FieldPointVectorized, RANGE_MAX, RANGE_MIN, field_point_mean, field_point_range_compute, groupKinds } from "../../../../fields/index.js"
import { MeshDecimationIndividual } from "./decimation.js"
import { MeshRendererIndividual, MeshRendererShared } from "./renderer.js"
import { IndiciesArray, indicesArrayType } from "../../../../utils/indices-array.js"
import { onlyOne } from "../../../../utils/index.js"
import { SurfaceTextureLocationsGroupKindsTemplate } from "../../texturing/index.js"
import { TextureLocation } from "../../../../textures/texture.js"

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
        if (this.cache.has(quality))
            return this.cache.get(quality)
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
        const render2samples = !isFirst ? this.renderer.decimation.cached(quality).render2samples : undefined

        const sample_textureLocationGroup =
            onlyOne(groupKinds(this.renderer.renderer.context.sample, SurfaceTextureLocationsGroupKindsTemplate)).group

        const positions = isFirst ?
            meshData.vertices :
            new Array<Vec3>(render2samples.length)
        const indices = isFirst ?
            meshData.triangles :
            this.renderer.decimation.cached(quality).triangles
        
        if (!isFirst)
            for (let i = 0; i < positions.length; i++)
                positions[i] = meshData.vertices[render2samples[i]]
        
        const edges: LevelOfDetailInfo_Edge_Cached[] = []
        
        const EDGES_COUNT = 100
        for (let i = 0; i < EDGES_COUNT; i++) {
            const i0 = Math.min(indices.length - 1, Math.floor(indices.length * Math.random()))
            const i1 = (((i0 % 3) + 1) % 3) + (3 * Math.floor(i0 / 3))
            
            const v0 = indices[i0]
            const v1 = indices[i1]

            const world_0 = isFirst ? meshData.vertices[v0] : meshData.vertices[render2samples[v0]]
            const world_1 = isFirst ? meshData.vertices[v1] : meshData.vertices[render2samples[v1]]
            const world_dist = world_0.distance(world_1)

            const uv_0 = sample_textureLocationGroup.get<TextureLocation>(surface.samples[isFirst ? v0 : render2samples[v0]]).uv
            const uv_1 = sample_textureLocationGroup.get<TextureLocation>(surface.samples[isFirst ? v1 : render2samples[v1]]).uv
            const uv_dist = uv_0.distance(uv_1)

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
    private readonly edge_distance_world_mean: number
    private _info: LevelOfDetailInfo

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
        const camera = Application.getApplication().systems.camera.cameras[0]
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