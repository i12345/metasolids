import { calculateNormals } from "playcanvas-extended";
import { DualKey } from "../../paradigm/octtree/dual.js";
import { TypedArrayOctTree } from "../../paradigm/octtree/typed-array.js";
import { ProcessorInitialization } from "../../paradigm/processing/processor.js";
import { IndicesTypedArray, indicesArrayType } from "../../utils/indices-array.js";
import { VolumeKey, VolumeProcessor } from "../../volumes/processor.js";
import { SamplingKey, VolumeSamplingContextKey } from "../../volumes/sampling/types.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/volume.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { SurfaceProcessingContext } from "../processing.js";
import { SurfaceNetKey } from "../sampling/surface-net.js";
import { Surface } from "../surface.js";
import { VolumeSurfacesKey } from "../volume-surfaces.js";
import { OctTreeReferencesOctTreeLayersGrouped } from "../../paradigm/octtree/references.js";
import { SubdivisionKey } from "../../paradigm/octtree/processor.js";
import { VolumeProcessingContextWithMeshing, VolumeProcessingWithMeshing } from "./processing.js";
import { VectorSampleFunction, VectorSamplingContext, makeVectorSamplingContext } from "../../fields/domains/vector.js";
import { FieldPointVectorContainerStatic, IsDynamicVector, field_point_vectorized_multi_objects_new } from "../../fields/vectorized/point.js";
import { MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs } from "../../paradigm/trees/multi-objects.js";
import { SampleDomainLocationFieldKey } from "../../fields/domain.js";

export class SurfaceNetMeshingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleT> =
            Surface<IndicesT, VolumeSampleT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    SurfaceProcessingContextT
                > =
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    SurfaceProcessingContextT
                >
    >
    implements VolumeProcessor<
            VolumeLocationT,
            VolumeSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            VolumeProcessingT,
            VolumeProcessingContextT
        > {
    init(context: VolumeProcessingContextT): ProcessorInitialization {
        return {
            connections: {
                inputs: [[SamplingKey, SurfaceNetKey]],
                outputs: [[VolumeSurfacesKey]]
            }
        }
    }

    process(item: VolumeProcessingT, context: VolumeProcessingContextT): void {
        const sampling = item[SamplingKey]
        const dual_cells = sampling[DualKey].cells
        const surface_net = sampling[SurfaceNetKey]

        const invalid_layer = 0xFF
        const invalid_uint32 = new Uint32Array([-1])[0]

        // prepare vertex and index buffers

        let vertex_prelim_next = 0
        const dual_cells_per_layer = dual_cells.vertices.layers.layers.map(vertices_layer => vertices_layer.length / 8)
        const vertex_buffer_lookup = new TypedArrayOctTree<number, Uint32Array>(Uint32Array, dual_cells_per_layer.map(layer_size => new Uint32Array(layer_size).fill(invalid_uint32)))
        const surfacePoints = sampling[SurfaceNetKey].cells.surfacePoints.layers
        
        let max_number_vertices_prelim = 0
        for (let layer = 1; layer < dual_cells_per_layer.length; layer++) {
            const dual_cells_in_layer = dual_cells_per_layer[layer]
            const surfacePoints_layer = surfacePoints[layer]
            for (let localIndex = 0; localIndex < dual_cells_in_layer; localIndex++) {
                const surfacePoint_x = surfacePoints_layer[(3 * localIndex) + 0]
                if (!Number.isNaN(surfacePoint_x) && Number.isFinite(surfacePoint_x))
                    max_number_vertices_prelim++
            }
        }

        const vertex_buffer_prelim = new Float32Array(3 * max_number_vertices_prelim)

        const dualCellReferences_buffer_prelim: OctTreeReferencesOctTreeLayersGrouped<IndicesT> = {
            layers: new Uint8Array(max_number_vertices_prelim),
            localIndices: new sampling[SubdivisionKey].typedArray(max_number_vertices_prelim) as IndicesT
        }

        const number_triangles_prelim = surface_net.polygons.vertices.offsets.layers.map(offsets => {
            let number_triangles = 0
            let offset_prev = offsets[0]

            for (let i = 1; i < offsets.length; i++) {
                const offset = offsets[i]
                const vertices_count = offset - offset_prev
                number_triangles += (vertices_count - 2)
                offset_prev = offset
            }

            return number_triangles
        }).reduce((sum, number_triangles) => sum + number_triangles, 0)

        let index_buffer_prelim_index_next = 0
        const index_buffer_prelim = new (indicesArrayType(vertex_buffer_prelim.length))(3 * number_triangles_prelim)

        function vertex_prelim_index(
                dual_cell_layer: number,
                dual_cell_localIndex: number
            ): number {
            const existing = vertex_buffer_lookup.layers[dual_cell_layer][dual_cell_localIndex]
            if (existing !== invalid_uint32) return existing
            
            const vertex = vertex_prelim_next++
            vertex_buffer_lookup.layers[dual_cell_layer][dual_cell_localIndex] = vertex
            
            vertex_buffer_prelim[(3 * vertex) + 0] = surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 0]
            vertex_buffer_prelim[(3 * vertex) + 1] = surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 1]
            vertex_buffer_prelim[(3 * vertex) + 2] = surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 2]

            dualCellReferences_buffer_prelim.layers[vertex] = dual_cell_layer
            dualCellReferences_buffer_prelim.localIndices[vertex] = dual_cell_localIndex

            return vertex
        }

        let vertices_offset: number
        let vertices_count: number
        let triangulation_start_vertex: number

        let polygon_vertices_references_layers: typeof surface_net.polygons.vertices.dual_cells.layers.layers[number];
        let polygon_vertices_references_localIndices: typeof surface_net.polygons.vertices.dual_cells.localIndices.layers[number];

        /**
         * this index is relative to {@link triangulation_start_vertex},
         * and negative values mirror so that -x = {@link polygon_points} - x
         * before adding the {@link triangulation_start_vertex}
         * 
         * @returns vertex_prelim_index()
         */
        function vertexIndex(index: number) {
            if (index < 0)
                index += vertices_count
            index += triangulation_start_vertex
            index %= vertices_count
            
            const dual_cell_layer = polygon_vertices_references_layers[vertices_offset + index]
            const dual_cell_localIndex = polygon_vertices_references_localIndices[vertices_offset + index]
            
            return vertex_prelim_index(dual_cell_layer, dual_cell_localIndex)
        }
    
        for (let polygon_layer = 0; polygon_layer < surface_net.polygons.vertices.offsets.layers.length; polygon_layer++) {
            const polygon_triangulation_start = surface_net.polygons.triangulation_start.layers[polygon_layer]
            const polygon_vertices_offset = surface_net.polygons.vertices.offsets.layers[polygon_layer]
            polygon_vertices_references_layers = surface_net.polygons.vertices.dual_cells.layers.layers[polygon_layer]
            polygon_vertices_references_localIndices = surface_net.polygons.vertices.dual_cells.localIndices.layers[polygon_layer]

            const number_polygons = polygon_triangulation_start.length

            for (let polygon_localIndex = 0; polygon_localIndex < number_polygons; polygon_localIndex++) {
                vertices_offset = polygon_vertices_offset[polygon_localIndex]
                vertices_count = polygon_vertices_offset[polygon_localIndex + 1] - vertices_offset
                
                if (polygon_vertices_references_layers[vertices_offset] === invalid_layer)
                    continue

                triangulation_start_vertex = polygon_triangulation_start[polygon_localIndex]
                const triangles = vertices_count - 2

                if (triangulation_start_vertex >= 0) {
                    for (let i = 0; i < triangles; i++) {
                        const isInverse = (i & 1) === 1
                        const a = (i >> 1) + 1
                        const b = isInverse ? -(1 + a) : -a
                        const c = isInverse ? -a : (a - 1)
                        
                        index_buffer_prelim[index_buffer_prelim_index_next++] = vertexIndex(a)
                        index_buffer_prelim[index_buffer_prelim_index_next++] = vertexIndex(b)
                        index_buffer_prelim[index_buffer_prelim_index_next++] = vertexIndex(c)
                    }
                }
                else {
                    // reversing polygon_triangulation_start[polygon_localIndex] = -(1 + triangulation_start_vertex)
                    triangulation_start_vertex = -1 - triangulation_start_vertex

                    for (let i = 0; i < triangles; i++) {
                        const isInverse = (i & 1) === 1
                        const a = i >> 1
                        const b = isInverse ? (a + 1) : -(2 + a)
                        const c = isInverse ? -(2 + a) : (b + 1)
                        
                        index_buffer_prelim[index_buffer_prelim_index_next++] = vertexIndex(a)
                        index_buffer_prelim[index_buffer_prelim_index_next++] = vertexIndex(b)
                        index_buffer_prelim[index_buffer_prelim_index_next++] = vertexIndex(c)
                    }
                }
            }
        }

        // distinguish islands of faces

        const number_vertices_prelim = vertex_prelim_next
        console.assert(number_vertices_prelim <= max_number_vertices_prelim)

        /** a flattened tree; each node references its parent or -1 if it is a root node */
        const islands = new Uint32Array(number_vertices_prelim).fill(invalid_uint32)

        function root_island(x: number) {
            let x_prev: number
            let depth = 0

            do {
                x = islands[x_prev = x]
                depth++
            } while (x !== invalid_uint32)

            return {
                root: x_prev,
                depth
            }
        }

        function joinIslands(a: number, b: number) {
            const { root: root_a, depth: depth_a } = root_island(a)
            const { root: root_b, depth: depth_b } = root_island(b)

            if (root_a !== root_b) {
                if (depth_a > depth_b)
                    islands[root_b] = root_a
                else islands[root_a] = root_b
            }
        }

        let index_buffer_i = 0
        while (index_buffer_i < index_buffer_prelim_index_next) {
            const i0 = index_buffer_prelim[index_buffer_i++]
            const i1 = index_buffer_prelim[index_buffer_i++]
            const i2 = index_buffer_prelim[index_buffer_i++]

            joinIslands(i0, i1)
            joinIslands(i1, i2)
        }

        const island_IDs = new Set<number>()

        for (let vertex_i = 0; vertex_i < islands.length; vertex_i++) {
            let root: number
            let reference = vertex_i

            do reference = islands[root = reference]
            while (reference !== invalid_uint32 && reference !== root)

            islands[vertex_i] = root
            island_IDs.add(root)
        }

        for (const island_ID of island_IDs) {
            let number_vertices = 0
            
            const vertex_translation_toLocal = new Uint32Array(number_vertices_prelim).fill(invalid_uint32)

            for (let i_vertex = 0; i_vertex < number_vertices_prelim; i_vertex++) {
                if (islands[i_vertex] === island_ID) {
                    vertex_translation_toLocal[i_vertex] = number_vertices
                    number_vertices++
                }
            }
            
            const vertex_buffer = new Float32Array(3 * number_vertices)
            const dualCellReferences: OctTreeReferencesOctTreeLayersGrouped<IndicesT> = {
                layers: new Uint8Array(number_vertices),
                localIndices: new sampling[SubdivisionKey].typedArray(number_vertices) as IndicesT
            }

            let vertex_buffer_next = 0
            for (let i_vertex = 0; i_vertex < number_vertices_prelim; i_vertex++) {
                if (islands[i_vertex] === island_ID) {
                    dualCellReferences.layers[vertex_buffer_next / 3] = dualCellReferences_buffer_prelim.layers[i_vertex]
                    dualCellReferences.localIndices[vertex_buffer_next / 3] = dualCellReferences_buffer_prelim.localIndices[i_vertex]

                    vertex_buffer[vertex_buffer_next++] = vertex_buffer_prelim[(3 * i_vertex) + 0]
                    vertex_buffer[vertex_buffer_next++] = vertex_buffer_prelim[(3 * i_vertex) + 1]
                    vertex_buffer[vertex_buffer_next++] = vertex_buffer_prelim[(3 * i_vertex) + 2]
                }
            }

            const indices_arrayType = indicesArrayType(number_vertices)
            const index_buffer_to_be_cut = new indices_arrayType(3 * number_triangles_prelim)
            
            let index_buffer_to_be_cut_offset = 0
            for (let index_buffer_prelim_offset = 0; index_buffer_prelim_offset < index_buffer_to_be_cut.length;) {
                const a = index_buffer_prelim[index_buffer_prelim_offset++]
                if (islands[a] === island_ID) {
                    index_buffer_to_be_cut[index_buffer_to_be_cut_offset++] = vertex_translation_toLocal[a]
                    index_buffer_to_be_cut[index_buffer_to_be_cut_offset++] = vertex_translation_toLocal[index_buffer_prelim[index_buffer_prelim_offset++]]
                    index_buffer_to_be_cut[index_buffer_to_be_cut_offset++] = vertex_translation_toLocal[index_buffer_prelim[index_buffer_prelim_offset++]]
                }
                else index_buffer_prelim_offset += 2
            }
            
            const mesh_vertices = vertex_buffer
            const mesh_triangles = new indices_arrayType(index_buffer_to_be_cut_offset)
            mesh_triangles.set(index_buffer_to_be_cut.subarray(0, index_buffer_to_be_cut_offset))

            const mesh_normals = new Float32Array(calculateNormals(mesh_vertices as unknown as number[], mesh_triangles as unknown as number[]))

            const volumeSamplingContext = <VolumeSamplingContextT>context[SamplingKey][VolumeSamplingContextKey]

            const multiObjectsIDs = (<WithMultiObjectsIDs><unknown>volumeSamplingContext)[MultiObjectsIDsKey]

            type VolumeLocationContainerT = FieldPointVectorContainerStatic

            // samples can be calculated for the precise position of each vertex
            const locations = field_point_vectorized_multi_objects_new<VolumeLocationT, VolumeLocationContainerT>(
                volumeSamplingContext[SampleDomainLocationFieldKey].elementType,
                mesh_triangles.length / 3,
                <IsDynamicVector<VolumeLocationT, VolumeLocationContainerT>>false,
                multiObjectsIDs?.IDsType,
            )

            type VectorContextT = VectorSamplingContext<
                VolumeLocationT,
                FieldPointVectorContainerStatic,
                VolumeSampleT,
                FieldPointVectorContainerStatic,
                MultiObjectsTemplate,
                IndicesTypedArray,
                FieldPointVectorContainerStatic<IndicesTypedArray>,
                VolumeSamplingContextT
            >

            const vectorContext = <VectorContextT>volumeSamplingContext
            // makeVectorSamplingContext(item[VolumeKey], vectorContext)
            const samples = vectorContext[VectorSampleFunction](item[VolumeKey], locations, vectorContext)

            const surface: Surface<IndicesT, VolumeSampleT> = {
                mesh: {
                    vertices: mesh_vertices,
                    triangles: mesh_triangles,
                    normals: mesh_normals,
                    dualCellReferences
                },
                samples,
                isClosed: true
            }

            item[VolumeSurfacesKey].push(surface as SurfaceT)
        }
    }

    private constructor() { }
    public static readonly instance = new this()
}