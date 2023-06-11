import { calculateNormals, Vec3 } from "playcanvas-extended"
import { VolumeProcessor, VolumeSamplingKey } from "../../volumes/processor.js"
import { VolumeSample, VolumeLocation } from "../../volumes/volume.js"
import { SurfaceProcessingContext } from "../surface-samples.js"
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeSurfacesKey } from "../volume-surfaces.js"
import { MeshDataWithNormals } from "../surface.js"
import { MeshingAlgorithm, MeshingSettings } from "./meshing-algorithm.js"
import { indicesArrayType, IndiciesArray } from "../../utils/indices-array.js"
import { PROPERTYKEY_ALL } from "../../paradigm/property-path.js"

export const VolumeSurfaceMeshingKey = Symbol("volume.surface-meshing")

export interface VolumeSurfaceMeshingProcessing<
        Sample extends VolumeSample = VolumeSample
    > extends VolumeProcessingWithSurfaces<Sample> {
}

export interface VolumeSurfaceMeshingProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
    > extends
    VolumeProcessingWithSurfacesContext<
        Location,
        Sample,
        SampleProcessingContextT,
        SurfaceProcessingContextT
    > {
    [VolumeSurfaceMeshingKey]: {
        algorithm: MeshingAlgorithm,
        settings: MeshingSettings
    }
}

export class VolumeSurfaceMeshingProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
    > implements
    VolumeProcessor<
        Location,
        Sample,
        SampleProcessingContextT,
        VolumeSurfaceMeshingProcessing<Sample>,
        VolumeSurfaceMeshingProcessingContext<Location, Sample, SampleProcessingContextT>
    > {
    init() {
        const connections = {
            inputs: [
                [VolumeSamplingKey]
            ],
            outputs: [
                [VolumeSurfacesKey, PROPERTYKEY_ALL, "mesh"]
            ]
        }

        return { connections }
    }

    process(
            volume: VolumeSurfaceMeshingProcessing<Sample>,
            context: VolumeSurfaceMeshingProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT
            >
        ): void {
        const sampling = volume[VolumeSamplingKey]
        const algorithm = context[VolumeSurfaceMeshingKey].algorithm
        const mesh = algorithm.mesh(
            sampling,
            context[VolumeSurfaceMeshingKey].settings
        )

        // use a tree where each vertex points to its parent;
        // then it just needs to keep track of island (tree) roots

        /**
         * vertices_parent[vertex_index] = index of parent vertex for this vertex_index
         * Eventuallt points to the root vertex in the vertex island
         * -1 = unset
         */
        const vertices_parent = new Int32Array(mesh.vertices.length).fill(-1)

        /**
         * Finds the island root vertex for a given vertex; also finds the
         * depth to the root vertex.
         * 
         * For all island root vertices,
         * vertices_parent[island_root_vertex] = -1
         * 
         * @param vertex_index the vertex to find island root for
         * @returns the vertex index of the island root vertex and depth to it
         */
        function vertex_root(vertex_index: number) {
            let parent_index = vertex_index
            let depth = -1

            do {
                vertex_index = parent_index
                parent_index = vertices_parent[vertex_index]
                depth++
            } while (parent_index !== -1)
            
            return {
                root: vertex_index,
                depth
            }
        }

        for (let i = 0; i < mesh.triangles.length; i += 3) {
            const vertex_index_0 = mesh.triangles[i + 0]
            const vertex_index_1 = mesh.triangles[i + 1]
            const vertex_index_2 = mesh.triangles[i + 2]

            let { root: root_0, depth: depth_0 } = vertex_root(vertex_index_0)
            let { root: root_1, depth: depth_1 } = vertex_root(vertex_index_1)
            let { root: root_2, depth: depth_2 } = vertex_root(vertex_index_2)

            if (root_0 !== root_1) {
                if (depth_0 < depth_1) {
                    vertices_parent[root_0] = root_1
                    root_0 = root_1
                    depth_0++
                }
                else {
                    vertices_parent[root_1] = root_0
                    root_1 = root_0
                    depth_1++
                }
            }

            if (root_2 !== root_0) {
                if (depth_2 > depth_0 && depth_2 > depth_1) {
                    vertices_parent[root_0] = root_2
                    vertices_parent[root_1] = root_2
                    // root_0 = root_2
                    // root_1 = root_2
                    // depth_0++
                    // depth_1++
                }
                else {
                    vertices_parent[root_2] = root_0
                    // depth_2++
                }
            }
        }

        const islands = new Map<number, {
            /** same as key */
            root: number

            vertices_count: number
            triangles_count: number

            /** island vertex index -> original vertex index */
            indices?: IndiciesArray
        }>()

        for (let i = 0; i < vertices_parent.length; i++) {
            const { root } = vertex_root(i)

            const island = islands.get(root)
            if (island)
                island.vertices_count++
            else {
                islands.set(root, {
                    root,
                    triangles_count: 0,
                    vertices_count: 1
                })
            }
        }

        for (const island of islands.values()) {
            for (let i = 0; i < mesh.triangles.length; i += 3)
                if (vertex_root(mesh.triangles[i]).root === island.root)
                    island.triangles_count++

            island.indices = new (indicesArrayType(mesh.vertices.length))(island.vertices_count)
            
            let island_vertex_index_next = 0
            for (let i = 0; i < mesh.vertices.length; i++)
                if (vertex_root(i).root === island.root)
                    island.indices![island_vertex_index_next++] = i
            console.assert(island_vertex_index_next === island.vertices_count)
        }

        for (const island of islands.values()) {
            const triangles = new (indicesArrayType(island.vertices_count))(3 * island.triangles_count)
            const vertices = new Array<Vec3>(island.vertices_count)

            /** island vertex index -> original vertex index */
            const island_vertices = island.indices!

            /** original vertex index -> island vertex index */
            const island_vertices_inverse = new (indicesArrayType(island.vertices_count))(mesh.vertices.length)

            for (let i = 0; i < island_vertices.length; i++) {
                const vertex_index_original = island_vertices[i]
                island_vertices_inverse[vertex_index_original] = i
                vertices[i] = mesh.vertices[vertex_index_original]
            }

            let triangles_next_i = 0
            for (let i = 0; i < mesh.triangles.length; i += 3) {
                if (vertex_root(mesh.triangles[i]).root !== island.root)
                    continue
                
                triangles[triangles_next_i++] = island_vertices_inverse[mesh.triangles[i + 0]]
                triangles[triangles_next_i++] = island_vertices_inverse[mesh.triangles[i + 1]]
                triangles[triangles_next_i++] = island_vertices_inverse[mesh.triangles[i + 2]]
            }

            console.assert(triangles_next_i === triangles.length)

            const vertices_buffer = new Float32Array(3 * vertices.length)
            for (let i = 0; i < vertices.length; i++) {
                vertices_buffer[(3 * i) + 0] = vertices[i].x
                vertices_buffer[(3 * i) + 1] = vertices[i].y
                vertices_buffer[(3 * i) + 2] = vertices[i].z
            }

            const normals = new Float32Array(calculateNormals(
                vertices_buffer as ArrayLike<number> as number[],
                triangles as ArrayLike<number> as number[]
            ))

            const mesh_surface: MeshDataWithNormals = {
                vertices,
                triangles,
                normals
            }

            const box_min = sampling.boundingBox.getMin()
            const box_size = sampling.boundingBox.halfExtents.clone().mulScalar(2)
            const voxels = sampling.voxels
            const voxels_size = sampling.size

            function interpolateSample(p: Vec3) {
                const voxel_p = p.clone().sub(box_min).mul(voxels_size).div(box_size)
                const voxel_000 = voxel_p.clone().floor()
                // if (((voxel_p.x - voxel_000.x) +
                //     (voxel_p.x - voxel_000.x) +
                //     (voxel_p.x - voxel_000.x)) < 0.01)

                //TODO: implement interpolation

                return voxels[voxel_000.x][voxel_000.y][voxel_000.z]
            }

            const samples = mesh.vertices.map(v => interpolateSample(v))
            volume[VolumeSurfacesKey].push({
                mesh: mesh_surface,
                samples
            })
        }
    }

    private constructor() { }

    static readonly instance = new this()
}