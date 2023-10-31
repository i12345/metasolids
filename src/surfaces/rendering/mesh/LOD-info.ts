import { Application, Vec2, Vec3 } from "playcanvas-extended"
import { FieldPointRange, RANGE_MAX, RANGE_MIN, field_point_range_compute } from "../../../fields/index.js"
import { MeshRendererIndividual, MeshRendererShared } from "./renderer.js"
import { VolumeLocation } from "../../../volumes/index.js"
import { IndicesTypedArray, indicesArrayType } from "../../../paradigm/arrays/indices-array.js"
import { MultiObjectsTemplate } from "../../../paradigm/trees/index.js"

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

export class LevelOfDetailInfoComputerShared<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    /** quality -> cache */
    private readonly cache = new Map<number, LevelOfDetailInfo_Cached>()

    constructor(public readonly renderer: MeshRendererShared<Objects, ObjIDsT, VolumeLocationT>) { }

    individualize(renderer: MeshRendererIndividual<Objects, ObjIDsT, VolumeLocationT>) {
        return new LevelOfDetailInfoComputerIndividual<Objects, ObjIDsT, VolumeLocationT>(this, renderer)
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
        const meshData = this.renderer.renderer.meshData
        const UVunwrapping = this.renderer.renderer.surfaceUVUnwrapping
        const n_original_vertices = meshData.vertices.length / 3

        /** decimated? UV-unwrapped-duplicated? vertex index -> original mesh data vertex index */
        const vertices_original = isFirst ?
            new (indicesArrayType(n_original_vertices))(n_original_vertices + (UVunwrapping?.duplicatedVerts.length ?? 0)) :
            this.renderer.decimation.cached(quality).vertices_original

        /** decimated? UV-unwrapped? vertex index -> UV-unwrapped? vertex index */
        const vertices_unwrapped = isFirst ?
            new (indicesArrayType(n_original_vertices + (UVunwrapping?.duplicatedVerts.length ?? 0)))(n_original_vertices + (UVunwrapping?.duplicatedVerts.length ?? 0)) :
            this.renderer.decimation.cached(quality).vertices_final

        if (isFirst) {
            for (let i = 0; i < n_original_vertices; i++) {
                vertices_original[i] = i
                vertices_unwrapped[i] = i
            }

            if (UVunwrapping) {
                for (let i = 0; i < UVunwrapping.duplicatedVerts.length; i++) {
                    vertices_original[i + n_original_vertices] = UVunwrapping.duplicatedVerts[i]
                    vertices_unwrapped[i + n_original_vertices] = i + n_original_vertices
                }
            }
        }

        /** indices within decimated? UV-unwrapped-duplicated? vertices */
        const indices = isFirst ?
            (UVunwrapping?.finalIndices ?? meshData.triangles) :
            this.renderer.decimation.cached(quality).triangles

        const edges: LevelOfDetailInfo_Edge_Cached[] = []

        const EDGES_COUNT = Math.min(100, indices.length / 3)

        const world_0 = new Vec3(), world_1 = new Vec3()
        const uv_0 = new Vec2(), uv_1 = new Vec2()

        for (let i = 0; i < EDGES_COUNT; i++) {
            const i0 = Math.min(indices.length - 1, Math.floor(indices.length * Math.random()))
            const i1 = (((i0 % 3) + 1) % 3) + (3 * Math.floor(i0 / 3))

            const v0_decimated = indices[i0]
            const v1_decimated = indices[i1]

            const v0_UVunwrapped = vertices_unwrapped[v0_decimated]
            const v1_UVunwrapped = vertices_unwrapped[v1_decimated]

            const v0_original = vertices_original[v0_decimated]
            const v1_original = vertices_original[v1_decimated]

            world_0.set(
                meshData.vertices[(3 * v0_original) + 0],
                meshData.vertices[(3 * v0_original) + 1],
                meshData.vertices[(3 * v0_original) + 2]
            )

            world_1.set(
                meshData.vertices[(3 * v1_original) + 0],
                meshData.vertices[(3 * v1_original) + 1],
                meshData.vertices[(3 * v1_original) + 2]
            )

            const world_dist = world_0.distance(world_1)

            const uv_dist = UVunwrapping ?
                uv_0.set(
                        UVunwrapping.UVs[(2 * v0_UVunwrapped) + 0],
                        UVunwrapping.UVs[(2 * v0_UVunwrapped) + 1]
                    )
                    .distance(
                            uv_1.set(
                                    UVunwrapping.UVs[(2 * v1_UVunwrapped) + 0],
                                    UVunwrapping.UVs[(2 * v1_UVunwrapped) + 1]
                                )
                        ) :
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

export class LevelOfDetailInfoComputerIndividual<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    private _info!: LevelOfDetailInfo

    get info(): LevelOfDetailInfo {
        return this._info
    }

    constructor(
        public readonly shared: LevelOfDetailInfoComputerShared<Objects, ObjIDsT, VolumeLocationT>,
        public readonly renderer: MeshRendererIndividual<Objects, ObjIDsT, VolumeLocationT>
    ) {
        this.update()
    }

    update() {
        const app = Application.getApplication()!
        const camera = app.systems.camera!.cameras[0]
        if (camera === undefined) {
            this._info = {
                distance: 0,
                edge: {
                    distances: {
                        absolute: {
                            world: [NaN, NaN],
                            screen: [NaN, NaN],
                            uv: [NaN, NaN],
                        },
                        ratios: {
                            screen_UV: [NaN, NaN],
                            world_UV: [NaN, NaN],
                        }
                    }
                }
            }
        }
        else {
            const distance = this.renderer.renderer.entity.getPosition().distance(camera.entity.getPosition())

            const cache = this.shared.cached(this.renderer.decimation.quality)
            const edge_distance_world = cache.edge.distances.absolute.world
            const edge_distance_world_mean = (edge_distance_world[RANGE_MIN] + edge_distance_world[RANGE_MAX]) / 2

            const edge_distance_calc_world_0 = camera.entity.forward.clone().mulScalar(distance).add(camera.entity.getPosition())
            const edge_distance_calc_world_1 = camera.entity.right.clone().mulScalar(edge_distance_world_mean).add(edge_distance_calc_world_0)
            const edge_distance_calc_screen_0 = camera.worldToScreen(edge_distance_calc_world_0)
            const edge_distance_calc_screen_1 = camera.worldToScreen(edge_distance_calc_world_1)
            const edge_distance_calc_screen_0_v2 = new Vec2(edge_distance_calc_screen_0.x, edge_distance_calc_screen_0.y)
            const edge_distance_calc_screen_1_v2 = new Vec2(edge_distance_calc_screen_1.x, edge_distance_calc_screen_1.y)
            const edge_distance_screen_mean = edge_distance_calc_screen_0_v2.distance(edge_distance_calc_screen_1_v2)

            const ratio_screen_per_world = edge_distance_screen_mean / edge_distance_world_mean

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
}