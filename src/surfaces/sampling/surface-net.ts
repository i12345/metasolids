import { IndicesTypedArray, allocNewFilledInvalid } from "../../utils/indices-array.js";
import { NumberArrayLike, TypedArray } from "../../utils/typed-array.js";
import { arrayCopy } from "../../paradigm/trees/index.js"
import { Axis, DiagonalDirection, Direction, OctTreeCell, OctTreeCellsMask, Quadrant, TriagonalDirection } from "../../paradigm/octtree/address.js";
import { DualKey, OctTreeWithDualGroups, OctTreeWithDualGroupsTemplate, OctTreeWithDualLayer, OctTreeWithDualLayersGrouped, OctTreeWithDualOctTreesGrouped, OctTreeWithDualValue, OctTreeWithDualValuesGrouped } from "../../paradigm/octtree/dual.js";
import { OctTreeCellsMaskOctTree } from "../../paradigm/octtree/mask.js";
import { SubdivisionKey } from "../../paradigm/octtree/processor.js";
import { OctTreeReferences, OctTreeReferencesOctTreeGroups, OctTreeReferencesOctTreeGroupsTemplate, OctTreeReferencesOctTreeLayer, OctTreeReferencesOctTreeLayersGrouped, OctTreeReferencesOctTreeValue, OctTreeReferencesOctTreeValuesGrouped, OctTreeReferencesOctTreesGrouped } from "../../paradigm/octtree/references.js";
import { TypedArrayOctTree } from "../../paradigm/octtree/typed-array.js";
import { ProcessorInitialization } from "../../paradigm/processing/processor.js";
import { EncapsulatingKey, WithEncapsulating } from "../../paradigm/trees/encapsulating.js";
import { MultiObjectsGroupsOrLeafMapped, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplateOrLeaf, MultiObjectsGroupsTemplate_Leaf, groupPaths, isGroupLeaf } from "../../paradigm/trees/multi-objects-groups.js";
import { VolumeProcessing } from "../../volumes/processor.js";
import { VolumeSamplingSubdivisionProcessor, VolumeSamplingSubdivisionProcessingWithDual, VolumeProcessingWithSampling, VolumeProcessingContextWithSampling, VolumeSamplingSubdivisionProcessingContextWithDual, VolumeSamplingSubdivisionProcessingContext, VolumeSamplingSubdivisionProcessing, SamplingKey, SpaceKey, VolumeSamplingSubdivisionSamplesOctTreesGrouped, SamplesKey } from "../../volumes/sampling/index.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/volume.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { VolumeProcessingContextWithMeshing } from "../meshing/processing.js";
import { VolumeSurfacesKey } from "../volume-surfaces.js";
import HashTable from "@ronomon/hash-table"

export const SurfaceNetKey = "surface"

export type SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups = {
    [SurfaceNetKey]: {
        primary_cells: {
            /**
             * whether or not it is above surface level
             */
            aboveSurfaceLevel: MultiObjectsGroupsTemplateLeaf
        }
        dual_cells: {
            surfacePoints: MultiObjectsGroupsTemplateLeaf

            /**
             * polygons_by_edge[dual_cell layer][(12 * dual_cell local index) + diagonal direction] = reference to polygon
             *
             * {@link DiagonalDirection} = (4 * plane) | quadrant
             */
            polygons_by_edge: OctTreeReferencesOctTreeGroups
        }
        polygons: {
            /**
             * references to primary vertices that make the edge that this polygon rotates around
             * packed two primary vertex references at a time
             * edge.{layers|localIndices}.layers[polygon layer][(2 * polygon local_index) + {0 = a, 1 = b}] =
             * reference to primary vertex making the edge this polygon rotates around
             * The first vertex (a) is at or above surface level; the second (b) is below
             */
            edges: OctTreeReferencesOctTreeGroups

            vertices: {
                /**
                 * offset in the dual_cells property for a given polygon
                 */
                offsets: MultiObjectsGroupsTemplateLeaf

                /**
                 * references to the dual cells that are the vertices for each polygon
                 */
                dual_cells: OctTreeReferencesOctTreeGroups
            }

            /**
             * offset in a polygon's vertices where triangulation should start
             *
             * A negative index means the zig zag starts from the triangulation_start vertex;
             * a positive (or zero) index means the vertices to the left and right of the
             * triangulation_start vertex form the first zig-zag segment.
             *
             * A negative index counts from the end; e.g., -1 means the last vertex, -2 is
             * second-to-last, etc.
             */
            triangulation_start: MultiObjectsGroupsTemplateLeaf
        }
    }
}

export const SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroupsTemplate: SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups = {
    [SurfaceNetKey]: {
        primary_cells: {
            /**
             * whether or not it is above surface level
             */
            aboveSurfaceLevel: MultiObjectsGroupsTemplate_Leaf,
        },
        dual_cells: {
            surfacePoints: MultiObjectsGroupsTemplate_Leaf,

            /**
             * polygons_by_edge[dual_cell layer][(12 * dual_cell local index) + diagonal direction] = reference to polygon
             *
             * {@link DiagonalDirection} = (4 * plane) | quadrant
             */
            polygons_by_edge: OctTreeReferencesOctTreeGroupsTemplate,
        },
        polygons: {
            /**
             * references to primary vertices that make the edge that this polygon rotates around
             * packed two primary vertex references at a time
             * edge.{layers|localIndices}.layers[polygon layer][(2 * polygon local_index) + {0 = a, 1 = b}] =
             * reference to primary vertex making the edge this polygon rotates around
             * The first vertex (a) is at or above surface level; the second (b) is below
             */
            edges: OctTreeReferencesOctTreeGroupsTemplate,

            vertices: {
                /**
                 * offset in the dual_cells property for a given polygon
                 */
                offsets: MultiObjectsGroupsTemplate_Leaf,

                /**
                 * references to the dual cells that are the vertices for each polygon
                 */
                dual_cells: OctTreeReferencesOctTreeGroupsTemplate,
            },

            /**
             * offset in a polygon's vertices where triangulation should start
             *
             * A negative index means the zig zag starts from the triangulation_start vertex;
             * a positive (or zero) index means the vertices to the left and right of the
             * triangulation_start vertex form the first zig-zag segment.
             *
             * A negative index counts from the end; e.g., -1 means the last vertex, -2 is
             * second-to-last, etc.
             */
            triangulation_start: MultiObjectsGroupsTemplate_Leaf,
        }
    }
}

export type SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValue = number | OctTreeReferencesOctTreeValue

export type SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped = {
    [SurfaceNetKey]: {
        primary_cells: {
            /**
             * whether or not it is above surface level (1 = true)
             */
            aboveSurfaceLevel: number
        }
        dual_cells: {
            surfacePoints: number

            /**
             * polygons_by_edge[dual_cell layer][(12 * dual_cell local index) + diagonal direction] = reference to polygon
             *
             * {@link DiagonalDirection} = (4 * plane) | quadrant
             */
            polygons_by_edge: OctTreeReferencesOctTreeValuesGrouped
        }
        polygons: {
            /**
             * references to primary vertices that make the edge that this polygon rotates around
             * packed two primary vertex references at a time
             * edge.{layers|localIndices}.layers[polygon layer][(2 * polygon local_index) + {0 = a, 1 = b}] =
             * reference to primary vertex making the edge this polygon rotates around
             * The first vertex (a) is at or above surface level; the second (b) is below
             */
            edges: OctTreeReferencesOctTreeValuesGrouped

            vertices: {
                /**
                 * offset in the dual_cells property for a given polygon
                 */
                offsets: number

                /**
                 * references to the dual cells that are the vertices for each polygon
                 */
                dual_cells: OctTreeReferencesOctTreeValuesGrouped
            }

            /**
             * offset in a polygon's vertices where triangulation should start
             *
             * A negative index means the zig zag starts from the triangulation_start vertex;
             * a positive (or zero) index means the vertices to the left and right of the
             * triangulation_start vertex form the first zig-zag segment.
             *
             * A negative index counts from the end; e.g., -1 means the last vertex, -2 is
             * second-to-last, etc.
             */
            triangulation_start: number
        }
    }
}

export type SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayer<IndicesT extends IndicesTypedArray = IndicesTypedArray> = Float64Array | Uint32Array | Int32Array | OctTreeReferencesOctTreeLayer<IndicesT>

export type SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped<IndicesT extends IndicesTypedArray = IndicesTypedArray> = {
    [SurfaceNetKey]: {
        primary_cells: {
            /**
             * whether or not it is above surface level
             */
            aboveSurfaceLevel: Uint8Array
        }
        dual_cells: {
            surfacePoints: Float64Array

            /**
             * polygons_by_edge[dual_cell layer][(12 * dual_cell local index) + diagonal direction] = reference to polygon
             *
             * {@link DiagonalDirection} = (4 * plane) | quadrant
             */
            polygons_by_edge: OctTreeReferencesOctTreeLayersGrouped<IndicesT>
        }
        polygons: {
            /**
             * references to primary vertices that make the edge that this polygon rotates around
             * packed two primary vertex references at a time
             * edge.{layers|localIndices}.layers[polygon layer][(2 * polygon local_index) + {0 = a, 1 = b}] =
             * reference to primary vertex making the edge this polygon rotates around
             * The first vertex (a) is at or above surface level; the second (b) is below
             */
            edges: OctTreeReferencesOctTreeLayersGrouped<IndicesT>

            vertices: {
                /**
                 * offset in the dual_cells property for a given polygon
                 */
                offsets: Uint32Array

                /**
                 * references to the dual cells that are the vertices for each polygon
                 */
                dual_cells: OctTreeReferencesOctTreeLayersGrouped<IndicesT>
            }

            /**
             * offset in a polygon's vertices where triangulation should start
             *
             * A negative index means the zig zag starts from the triangulation_start vertex;
             * a positive (or zero) index means the vertices to the left and right of the
             * triangulation_start vertex form the first zig-zag segment.
             *
             * A negative index counts from the end; e.g., -1 means the last vertex, -2 is
             * second-to-last, etc.
             */
            triangulation_start: Int32Array
        }
    }
}

export type SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped<IndicesT extends IndicesTypedArray = IndicesTypedArray> = {
    [SurfaceNetKey]: {
        primary_cells: {
            aboveSurfaceLevel: TypedArrayOctTree<number, Uint8Array>
        }
        dual_cells: {
            surfacePoints: TypedArrayOctTree<number, Float64Array>

            /**
             * polygons_by_edge[dual_cell layer][(12 * dual_cell local index) + diagonal direction] = reference to polygon
             *
             * {@link DiagonalDirection} = (4 * plane) | quadrant
             */
            polygons_by_edge: OctTreeReferences<IndicesT>
        }
        polygons: {
            /**
             * references to primary vertices that make the edge that this polygon rotates around
             * packed two primary vertex references at a time
             * edge.{layers|localIndices}.layers[polygon layer][(2 * polygon local_index) + {0 = a, 1 = b}] =
             * reference to primary vertex making the edge this polygon rotates around
             * The first vertex (a) is at or above surface level; the second (b) is below
             */
            edges: OctTreeReferences<IndicesT>

            vertices: {
                /**
                 * offset in the dual_cells property for a given polygon
                 */
                offsets: TypedArrayOctTree<number, Uint32Array>

                /**
                 * references to the dual cells that are the vertices for each polygon
                 */
                dual_cells: OctTreeReferences<IndicesT>
            }

            /**
             * offset in a polygon's vertices where triangulation should start
             *
             * A negative index means the zig zag starts from the triangulation_start vertex;
             * a positive (or zero) index means the vertices to the left and right of the
             * triangulation_start vertex form the first zig-zag segment.
             *
             * A negative index counts from the end; e.g., -1 means the last vertex, -2 is
             * second-to-last, etc.
             */
            triangulation_start: TypedArrayOctTree<number, Int32Array>
        }
    }
}


// if the state of a dual cell is represented with 8 bits, one per vertex,
// each meaning whether the vertex is at or above surface level(1) or below it(0)
// then 256 cases can be precalculated to know if there are multiple interior islands -
// if there are at least two vertices at or above surface level that don't touch each other
const dual_cell_state_hasMultipleInteriorIslands = new Uint8Array(256)

const corner_adjacency = new Uint8Array([
    0b00010110,
    0b00101001,
    0b01001001,
    0b10000110,
    0b01100001,
    0b10010010,
    0b10010100,
    0b01101000
])

function precalculate_dual_cell_state_hasMultipleInteriorIslands() {
    const islands = new Uint8Array(8)

    for (let state = 0; state < 256; state++) {
        for (let vertex = 0; vertex < 8; vertex++)
            islands[vertex] = state & (1 << vertex)

        for (let power = 0; power < 4; power++) {
            for (let vertex = 0; vertex < 8; vertex++) {
                if ((state & (1 << vertex)) !== 0) {
                    const vertex_adjacency = corner_adjacency[vertex]

                    for (let other_vertex = 0; other_vertex < 8; other_vertex++) {
                        if (other_vertex === vertex) continue

                        const other_vertex_mask = 1 << other_vertex

                        if ((state & other_vertex_mask) !== 0 &&
                            ((vertex_adjacency & other_vertex_mask) !== 0)) {
                            islands[other_vertex] = islands[vertex] = islands[vertex] | islands[other_vertex]
                        }
                    }
                }
            }
        }

        let multipleIslands = false
        for (let vertex = 0; vertex < 8; vertex++) {
            if ((state & (1 << vertex)) !== 0) {
                if (islands[vertex] !== state) {
                    multipleIslands = true
                    break
                }
            }
        }

        dual_cell_state_hasMultipleInteriorIslands[state] = multipleIslands ? 1 : 0
    }
}

precalculate_dual_cell_state_hasMultipleInteriorIslands()

export type SurfaceNetVolumeSamplingSubdivisionProcessing<
            IndicesT extends IndicesTypedArray = IndicesTypedArray,
            VolumeLocationT extends VolumeLocation = VolumeLocation,
            VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
            VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
            VolumeSampleT extends VolumeSample = VolumeSample,
            VolumeSampleElementType extends VolumeSample = VolumeSampleT,
            VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
            VolumeSampleProcessingContextT = any,
            VolumeSamplingContextT extends
                VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
                VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
            VolumeT extends
                VolumeWithBoundingBox<
                        VolumeLocationT,
                        VolumeLocationElementType,
                        VolumeLocationFuseMode,
                        VolumeSampleT,
                        VolumeSampleElementType,
                        VolumeSampleFuseMode,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT
                    > =
                VolumeWithBoundingBox<
                        VolumeLocationT,
                        VolumeLocationElementType,
                        VolumeLocationFuseMode,
                        VolumeSampleT,
                        VolumeSampleElementType,
                        VolumeSampleFuseMode,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT
                    >,
            VolumeProcessingT extends
                // VolumeWithSamplingProcessing<
                //         IndicesT,
                //         OctTreeGroups,
                //         OctTreeT,
                //         OctTreeTGrouped,
                //         OctTreeLayer,
                //         OctTreeLayersGrouped,
                //         OctTreesGrouped,
                //         VolumeLocationT,
                //         VolumeSampleT,
                //         VolumeSamplingContextT,
                //         VolumeT
                //     > =
                // VolumeWithSamplingProcessing<
                //         IndicesT,
                //         OctTreeGroups,
                //         OctTreeT,
                //         OctTreeTGrouped,
                //         OctTreeLayer,
                //         OctTreeLayersGrouped,
                //         OctTreesGrouped,
                //         VolumeLocationT,
                //         VolumeSampleT,
                //         VolumeSamplingContextT,
                //         VolumeT
                //     >
                VolumeProcessing<
                        VolumeLocationT,
                        VolumeLocationElementType,
                        VolumeLocationFuseMode,
                        VolumeSampleT,
                        VolumeSampleElementType,
                        VolumeSampleFuseMode,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeT
                    > =
                VolumeProcessing<
                        VolumeLocationT,
                        VolumeLocationElementType,
                        VolumeLocationFuseMode,
                        VolumeSampleT,
                        VolumeSampleElementType,
                        VolumeSampleFuseMode,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeT
                    >
    > =
    VolumeSamplingSubdivisionProcessingWithDual<
        IndicesT,
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        VolumeProcessingT
    > &
    VolumeSamplingSubdivisionProcessing<
        IndicesT,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped, // <IndicesT>,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped, // <IndicesT>,
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        VolumeProcessingT
    >

export type SurfaceNetVolumeSamplingSubdivisionProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeProcessingContextT extends
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped, // <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > &
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped, // <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > &
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >
    > =
    VolumeSamplingSubdivisionProcessingContextWithDual<
        IndicesT,
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeProcessingContextT
    > &
    VolumeSamplingSubdivisionProcessingContext<
        IndicesT,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped, // <IndicesT>,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped, // <IndicesT>,
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeProcessingContextT
    >

/**
 * This processor forms a surface net over the dual cells
 */
export class SurfaceNetVolumeSamplingSubdivisionProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            VolumeWithBoundingBox<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped, /// <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped, /// <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped, // <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > &
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped, // <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > &
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
    > implements
    VolumeSamplingSubdivisionProcessor<
            IndicesT,
            OctTreeWithDualGroups,
            OctTreeWithDualValuesGrouped,
            OctTreeWithDualLayersGrouped, // <IndicesT>,
            OctTreeWithDualOctTreesGrouped, // <IndicesT>
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            VolumeProcessingT,
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped, // <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT//,
                    // VolumeProcessingContextT
                >  &
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
            WithEncapsulating<VolumeProcessingT> &
                SurfaceNetVolumeSamplingSubdivisionProcessing<
                        IndicesT,
                        VolumeLocationT,
                        VolumeLocationElementType,
                        VolumeLocationFuseMode,
                        VolumeSampleT,
                        VolumeSampleElementType,
                        VolumeSampleFuseMode,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeT,
                        VolumeProcessingT
                    >, //,
            WithEncapsulating<VolumeProcessingContextT> &
                SurfaceNetVolumeSamplingSubdivisionProcessingContext<
                        IndicesT,
                        VolumeLocationT,
                        VolumeLocationElementType,
                        VolumeLocationFuseMode,
                        VolumeSampleT,
                        VolumeSampleElementType,
                        VolumeSampleFuseMode,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeProcessingContextT
                    >
            // VolumeSamplingSubdivisionProcessingContextWithDual<
            //         IndicesT,
            //         VolumeLocationT,
            //         VolumeSampleT,
            //         VolumeSamplingContextT,
            //         VolumeSampleProcessingContextT,
            //         VolumeProcessingContextT
            //     >
        > {


    init(context: SurfaceNetVolumeSamplingSubdivisionProcessingContext<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeProcessingContextT
            >): ProcessorInitialization {
        return {
            connections: {
                inputs: [...groupPaths(OctTreeWithDualGroupsTemplate)],
                outputs: [[SurfaceNetKey]]
            }
        }
    }

    process(
        item: WithEncapsulating<VolumeProcessingT> &
            SurfaceNetVolumeSamplingSubdivisionProcessing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                >,
        context: SurfaceNetVolumeSamplingSubdivisionProcessingContext<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeProcessingContextT
            >): void {
        const subdivision = context[SubdivisionKey]
        const layer = subdivision.depth
        const parent_layer = layer - 1
        const primary_alpha = (<VolumeSamplingSubdivisionSamplesOctTreesGrouped>context)[SamplesKey].alpha.layers
        const surface_level = context[EncapsulatingKey][VolumeSurfacesKey].surfaceLevel

        if (parent_layer === -1) {
            context[SurfaceNetKey] = {
                primary_cells: {
                    aboveSurfaceLevel: new TypedArrayOctTree(Uint8Array, [new Uint8Array((primary_alpha[0][0] > surface_level) ? 1 : 0)]),
                },
                dual_cells: {
                    surfacePoints: new TypedArrayOctTree(Float64Array),
                    polygons_by_edge: new OctTreeReferences(subdivision.typedArray)
                },
                polygons: {
                    edges: new OctTreeReferences(subdivision.typedArray),
                    triangulation_start: new TypedArrayOctTree(Int32Array),
                    vertices: {
                        dual_cells: new OctTreeReferences(subdivision.typedArray),
                        offsets: new TypedArrayOctTree(Uint32Array)
                    }
                }
            }

            item[SurfaceNetKey] = {
                primary_cells: {
                    aboveSurfaceLevel: context[SurfaceNetKey].primary_cells.aboveSurfaceLevel.layers[0],
                },
                dual_cells: {
                    surfacePoints: context[SurfaceNetKey].dual_cells.surfacePoints.subdivide(0),
                    polygons_by_edge: context[SurfaceNetKey].dual_cells.polygons_by_edge.subdivide(0),
                },
                polygons: {
                    edges: context[SurfaceNetKey].polygons.edges.subdivide(0),
                    triangulation_start: context[SurfaceNetKey].polygons.triangulation_start.subdivide(0),
                    vertices: {
                        offsets: context[SurfaceNetKey].polygons.vertices.offsets.subdivide(0),
                        dual_cells: context[SurfaceNetKey].polygons.vertices.dual_cells.subdivide(0),
                    }
                }
            }

            item[SubdivisionKey].recommendation.layers[layer][0]++
        }
        else {
            const number_subdivided_primary_cells = subdivision.layer_sizes[layer] / 8
            const number_new_primary_cells = subdivision.layer_sizes[layer]
            const dual_cells = context[DualKey].cells
            const dual_cells_vertices_layers = dual_cells.vertices.layers.layers
            const dual_cells_vertices_localIndices = dual_cells.vertices.localIndices.layers
            const dual_cells_neighbors_layers = dual_cells.neighbors.layers.layers
            const dual_cells_neighbors_localIndices = dual_cells.neighbors.localIndices.layers
            const dual_cells_lookup_corners_layers = dual_cells.lookup.corners.layers.layers
            const dual_cells_lookup_corners_localIndices = dual_cells.lookup.corners.localIndices.layers

            const new_dual_cells = item[DualKey]
            const number_new_dual_cells = new_dual_cells.cells.vertices.layers.length / 8

            const invalid_layer = 255
            const invalid_localIndex = subdivision.invalid

            const space = context[SpaceKey]
            const space_positions = space.positions.layers

            const references_parents = subdivision.references.parents.layers[parent_layer]

            const new_polygons_by_edge = context[SurfaceNetKey].dual_cells.polygons_by_edge.subdivide(12 * number_new_dual_cells)

            const cells_polygons_by_edge_layers = context[SurfaceNetKey].dual_cells.polygons_by_edge.layers.layers
            const cells_polygons_by_edge_localIndices = context[SurfaceNetKey].dual_cells.polygons_by_edge.localIndices.layers

            context[SurfaceNetKey].dual_cells.surfacePoints.subdivide(3 * number_new_dual_cells).fill(NaN)
            const surfacePoints = context[SurfaceNetKey].dual_cells.surfacePoints.layers
            const polygons_vertices_offsets = context[SurfaceNetKey].polygons.vertices.offsets.layers
            const polygon_edges_layers = context[SurfaceNetKey].polygons.edges.layers.layers
            const polygon_edges_localIndices = context[SurfaceNetKey].polygons.edges.localIndices.layers
            const polygon_vertices_dual_cells_layers = context[SurfaceNetKey].polygons.vertices.dual_cells.layers.layers
            const polygon_vertices_dual_cells_localIndices = context[SurfaceNetKey].polygons.vertices.dual_cells.localIndices.layers
            const polygon_triangulation_start = context[SurfaceNetKey].polygons.triangulation_start.layers

            let new_polygon_localIndex = 0
            const max_number_new_polygons = (number_new_dual_cells * 12) + (9 * 8 * number_subdivided_primary_cells)

            const new_polygon_vertices_offsets = new Uint32Array(max_number_new_polygons)
            const new_polygon_vertices_dualCells_layers: NumberArrayLike = [] // new Uint8Array(max_number_new_polygons * max_number_vertices_per_polygon)
            const new_polygon_vertices_dualCells_localIndices: NumberArrayLike = [] // new subdivision.typedArray(max_number_new_polygons * max_number_vertices_per_polygon)
            const new_polygon_edges_layers = new Uint8Array(2 * max_number_new_polygons)
            const new_polygon_edges_localIndices = <IndicesT>new subdivision.typedArray(2 * max_number_new_polygons)

            const invalid_int32 = (2 << 31) - 1
            const new_polygon_triangulation_start = allocNewFilledInvalid(Int32Array, max_number_new_polygons)

            const primary_cell_aboveSurfaceLevel = context[SurfaceNetKey].primary_cells.aboveSurfaceLevel.layers

            const new_primary_alpha = primary_alpha[layer]
            const new_primary_aboveSurfaceLevel = context[SurfaceNetKey].primary_cells.aboveSurfaceLevel.subdivide(number_new_primary_cells)
            for (let primary_child_localIndex = 0; primary_child_localIndex < number_new_primary_cells; primary_child_localIndex++)
                if (new_primary_alpha[primary_child_localIndex] > surface_level)
                    new_primary_aboveSurfaceLevel[primary_child_localIndex] = 1

            /**
             * this is a bitmap for whether a dual cell is part of at least one polygon or not
             */
            const dual_cell_subdivide_recommendation_surfaceIntersects = new OctTreeCellsMaskOctTree()
            for (const layer_size of subdivision.layer_sizes)
                dual_cell_subdivide_recommendation_surfaceIntersects.subdivide(layer_size)

            //TODO: compute whether each dual cell used to be intersected
            // perhaps this isn't even desired if the it is desired that the surface have an even positioning of vertices

            // function validate_polygons(
            //     initial_dual_cell_layer: number,
            //     initial_dual_cell_localIndex: number,
            // ) {
            //     const isNewInitialDualCell = (initial_dual_cell_layer === layer)

            //     for (let edge = 0; edge < 12; edge++) {
            //         const polygon_layer = (isNewInitialDualCell ? new_polygon_by_edges_layers : cells_polygons_by_edge_layers[initial_dual_cell_layer])[(12 * initial_dual_cell_localIndex) + edge]
            //         if (polygon_layer !== invalid_layer) {
            //             const polygon_localIndex = (isNewInitialDualCell ? new_polygon_by_edges_localIndices : cells_polygons_by_edge_localIndices[initial_dual_cell_layer])[(12 * initial_dual_cell_localIndex) + edge]
            //             let initial_dual_cell_member: boolean | undefined = undefined

            //             const isNewPolygon = (polygon_layer === layer)

            //             const polygon_dual_cells_offset = (isNewPolygon ? new_polygon_vertices_offsets : polygons_vertices_offsets[polygon_layer])[polygon_localIndex]
            //             const polygon_dual_cells_offset_next = (isNewPolygon ? new_polygon_vertices_offsets : polygons_vertices_offsets[polygon_layer])[polygon_localIndex + 1]
            //             for (let dual_cell_i = polygon_dual_cells_offset; dual_cell_i < polygon_dual_cells_offset_next; dual_cell_i++) {
            //                 const dual_cell_layer = (isNewPolygon ? new_polygon_vertices_dualCells_layers : polygon_vertices_dual_cells_layers[polygon_layer])[dual_cell_i]
            //                 const dual_cell_localIndex = (isNewPolygon ? new_polygon_vertices_dualCells_localIndices : polygon_vertices_dual_cells_localIndices[polygon_layer])[dual_cell_i]

            //                 const isNewDualCell = (dual_cell_layer === layer)

            //                 let polygon_member = false

            //                 initial_dual_cell_member ??= false
            //                 if (dual_cell_layer === initial_dual_cell_layer &&
            //                     dual_cell_localIndex === initial_dual_cell_localIndex)
            //                     initial_dual_cell_member ||= true

            //                 for (let edge_1 = 0; edge_1 < 12; edge_1++) {
            //                     const referenced_polygon_layer = (isNewDualCell ? new_polygon_by_edges_layers : cells_polygons_by_edge_layers[dual_cell_layer])[(12 * dual_cell_localIndex) + edge_1]
            //                     const referenced_polygon_localIndex = (isNewDualCell ? new_polygon_by_edges_localIndices : cells_polygons_by_edge_localIndices[dual_cell_layer])[(12 * dual_cell_localIndex) + edge_1]
            //                     if (referenced_polygon_layer === polygon_layer && referenced_polygon_localIndex === polygon_localIndex)
            //                         polygon_member ||= true
            //                 }

            //                 if (polygon_member === false)
            //                     debugger
            //             }

            //             if (initial_dual_cell_member === false)
            //                 debugger
            //         }
            //     }
            // }

            function invalidate_polygons(
                dual_cell_layer: number,
                dual_cell_localIndex: number,
            ) {
                // invalidate any polygon made around an edge of this dual cell
                for (let edge = 0; edge < 12; edge++) {
                    const polygon_layer = cells_polygons_by_edge_layers[dual_cell_layer][(12 * dual_cell_localIndex) + edge]
                    if (polygon_layer !== invalid_layer) {
                        const polygon_localIndex = cells_polygons_by_edge_localIndices[dual_cell_layer][(12 * dual_cell_localIndex) + edge]

                        polygon_edges_layers[polygon_layer][(2 * polygon_localIndex) + 0] = invalid_layer
                        polygon_edges_layers[polygon_layer][(2 * polygon_localIndex) + 1] = invalid_layer
                        polygon_edges_localIndices[polygon_layer][(2 * polygon_localIndex) + 0] = invalid_localIndex
                        polygon_edges_localIndices[polygon_layer][(2 * polygon_localIndex) + 1] = invalid_localIndex
                        polygon_triangulation_start[polygon_layer][polygon_localIndex] = invalid_int32

                        const polygon_dual_cells_offset = polygons_vertices_offsets[polygon_layer][polygon_localIndex]
                        const polygon_dual_cells_offset_next = polygons_vertices_offsets[polygon_layer][polygon_localIndex + 1]
                        for (let dual_cell_i = polygon_dual_cells_offset; dual_cell_i < polygon_dual_cells_offset_next; dual_cell_i++) {
                            const dual_cell_layer = polygon_vertices_dual_cells_layers[polygon_layer][dual_cell_i]
                            const dual_cell_localIndex = polygon_vertices_dual_cells_localIndices[polygon_layer][dual_cell_i]

                            for (let edge_1 = 0; edge_1 < 12; edge_1++) {
                                const referenced_polygon_layer = cells_polygons_by_edge_layers[dual_cell_layer][(12 * dual_cell_localIndex) + edge_1]
                                const referenced_polygon_localIndex = cells_polygons_by_edge_localIndices[dual_cell_layer][(12 * dual_cell_localIndex) + edge_1]
                                if (referenced_polygon_layer === polygon_layer && referenced_polygon_localIndex === polygon_localIndex) {
                                    cells_polygons_by_edge_layers[dual_cell_layer][(12 * dual_cell_localIndex) + edge_1] = invalid_layer
                                    cells_polygons_by_edge_localIndices[dual_cell_layer][(12 * dual_cell_localIndex) + edge_1] = invalid_localIndex
                                }
                            }

                            polygon_vertices_dual_cells_layers[polygon_layer][dual_cell_i] = invalid_layer
                            polygon_vertices_dual_cells_localIndices[polygon_layer][dual_cell_i] = invalid_localIndex
                        }
                    }
                }
            }

            // invalidate all polygons formed around edges of any of the previous triagonal neighbor dual cells
            // = the dual cells that used to be cornered by the primary parent vertex
            for (let primary_localIndex_group = 0; primary_localIndex_group < number_subdivided_primary_cells; primary_localIndex_group++) {
                const primary_parent_localIndex = references_parents[primary_localIndex_group]

                for (let corner = 0; corner < 8; corner++) {
                    const dual_cell_layer = dual_cells_lookup_corners_layers[parent_layer][(8 * primary_parent_localIndex) | corner]
                    if (dual_cell_layer !== invalid_layer) {
                        const dual_cell_localIndex = dual_cells_lookup_corners_localIndices[parent_layer][(8 * primary_parent_localIndex) | corner]

                        invalidate_polygons(dual_cell_layer, dual_cell_localIndex)
                    }
                }
            }

            //TODO: pack subdivision recommendations into single array

            const subdivide_recommendation_isolateMultipleInteriorIslands = new Uint8Array(number_subdivided_primary_cells)

            const dual_cell_corners_aboveSurfaceLevel = new Uint8Array(8)
            const dual_cell_corners_alpha = new Float64Array(8)
            const dual_cell_corners_positions = new Float64Array(3 * 8)
            // update surface points for every dual cell related to each subdivided primary vertex
            // = every dual cell cornered by each child cell of every subdivided primary parent
            function update_surface_point(dual_cell_layer: number, dual_cell_localIndex: number) {
                if (dual_cell_layer === invalid_layer)
                    return

                if (!isNaN(surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 0]))
                    return

                const dual_cell_corners_offset = (8 * dual_cell_localIndex)

                let vertex_layer: number, vertex_localIndex: number
                for (let corner = 0; corner < 8; corner++) {
                    vertex_layer = dual_cells_vertices_layers[dual_cell_layer][dual_cell_corners_offset | corner]
                    vertex_localIndex = dual_cells_vertices_localIndices[dual_cell_layer][dual_cell_corners_offset | corner]
                    dual_cell_corners_alpha[corner] = primary_alpha[vertex_layer][vertex_localIndex]
                    dual_cell_corners_aboveSurfaceLevel[corner] = primary_cell_aboveSurfaceLevel[vertex_layer][vertex_localIndex]
                    //read vertex positions
                    dual_cell_corners_positions[(3 * corner) + 0] = space_positions[vertex_layer][(3 * vertex_localIndex) + 0]
                    dual_cell_corners_positions[(3 * corner) + 1] = space_positions[vertex_layer][(3 * vertex_localIndex) + 1]
                    dual_cell_corners_positions[(3 * corner) + 2] = space_positions[vertex_layer][(3 * vertex_localIndex) + 2]
                }

                let n_crossed_edges = 0
                let p_x = 0
                let p_y = 0
                let p_z = 0

                for (let vertex_corner_a = 0; vertex_corner_a < 8; vertex_corner_a++) {
                    const adjacency = corner_adjacency[vertex_corner_a]

                    const vertex_alpha_a = dual_cell_corners_alpha[vertex_corner_a]
                    const vertex_aboveSurface_a = dual_cell_corners_aboveSurfaceLevel[vertex_corner_a]
                    const p_x_a = dual_cell_corners_positions[(3 * vertex_corner_a) + 0]
                    const p_y_a = dual_cell_corners_positions[(3 * vertex_corner_a) + 1]
                    const p_z_a = dual_cell_corners_positions[(3 * vertex_corner_a) + 2]

                    for (let vertex_corner_b = vertex_corner_a + 1; vertex_corner_b < 8; vertex_corner_b++) {
                        if ((adjacency & (1 << vertex_corner_b)) !== 0) {
                            const vertex_aboveSurface_b = dual_cell_corners_aboveSurfaceLevel[vertex_corner_b]

                            if (vertex_aboveSurface_a !== vertex_aboveSurface_b) {
                                const vertex_alpha_b = dual_cell_corners_alpha[vertex_corner_b]
                                const p_x_b = dual_cell_corners_positions[(3 * vertex_corner_b) + 0]
                                const p_z_b = dual_cell_corners_positions[(3 * vertex_corner_b) + 2]
                                const p_y_b = dual_cell_corners_positions[(3 * vertex_corner_b) + 1]

                                const t = (surface_level - vertex_alpha_a) / (vertex_alpha_b - vertex_alpha_a)
                                const s = 1 - t

                                p_x += (s * p_x_a) + (t * p_x_b)
                                p_y += (s * p_y_a) + (t * p_y_b)
                                p_z += (s * p_z_a) + (t * p_z_b)

                                n_crossed_edges++
                            }
                        }
                    }
                }

                if (n_crossed_edges > 0) {
                    surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 0] = p_x / n_crossed_edges
                    surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 1] = p_y / n_crossed_edges
                    surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 2] = p_z / n_crossed_edges
                }
                else {
                    surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 0] = Infinity
                    // surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 1] = Infinity
                    // surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 2] = Infinity
                }

                // TODO: recommend subdividing if there are two vertices below surface level that are not connected
                let cubeState = 0
                for (let corner = 0; corner < 8; corner++)
                    if (dual_cell_corners_alpha[corner] >= surface_level)
                        cubeState |= (1 << corner)

                if (dual_cell_state_hasMultipleInteriorIslands[cubeState] !== 0) {
                    for (let corner = 0; corner < 8; corner++) {
                        const primary_vertex_layer = dual_cells_vertices_layers[dual_cell_layer][(8 * dual_cell_localIndex) | corner]
                        if (primary_vertex_layer === layer) {
                            const primary_vertex_localIndex = dual_cells_vertices_localIndices[dual_cell_layer][(8 * dual_cell_localIndex) | corner]
                            subdivide_recommendation_isolateMultipleInteriorIslands[primary_vertex_localIndex] |= 1
                        }
                    }
                }
            }

            function invalidate_surface_point(dual_cell_layer: number, dual_cell_localIndex: number) {
                if (dual_cell_layer === invalid_layer)
                    return

                if (isNaN(surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 0]))
                    return

                surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 0] = NaN
                surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 1] = NaN
                surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 2] = NaN
            }

            for (let primary_localIndex_group = 0; primary_localIndex_group < number_subdivided_primary_cells; primary_localIndex_group++) {
                const primary_children_localIndex_offset = 8 * primary_localIndex_group
                // const dual_cell_interior_layer = layer
                // const dual_cell_interior_localIndex = new_dual_cells.cells.lookup.corners.localIndices[(8 * primary_children_localIndex_offset) + 7]

                // update surface points for each dual cell cornered by each primary child
                for (let primary_child_subcell = 0; primary_child_subcell < 8; primary_child_subcell++) {
                    const vertex_layer = layer
                    const vertex_localIndex = primary_children_localIndex_offset | primary_child_subcell
                    const vertex_localIndex_times_8 = 8 * vertex_localIndex

                    for (let dual_cell_corner = 0; dual_cell_corner < 8; dual_cell_corner++) {
                        invalidate_surface_point(
                            dual_cells_lookup_corners_layers[vertex_layer][vertex_localIndex_times_8 | dual_cell_corner],
                            dual_cells_lookup_corners_localIndices[vertex_layer][vertex_localIndex_times_8 | dual_cell_corner]
                        )
                    }
                }
            }

            for (let primary_localIndex_group = 0; primary_localIndex_group < number_subdivided_primary_cells; primary_localIndex_group++) {
                const primary_children_localIndex_offset = 8 * primary_localIndex_group
                // const dual_cell_interior_layer = layer
                // const dual_cell_interior_localIndex = new_dual_cells.cells.lookup.corners.localIndices[(8 * primary_children_localIndex_offset) + 7]

                // update surface points for each dual cell cornered by each primary child
                for (let primary_child_subcell = 0; primary_child_subcell < 8; primary_child_subcell++) {
                    const vertex_layer = layer
                    const vertex_localIndex = primary_children_localIndex_offset | primary_child_subcell
                    const vertex_localIndex_times_8 = 8 * vertex_localIndex

                    for (let dual_cell_corner = 0; dual_cell_corner < 8; dual_cell_corner++) {
                        update_surface_point(
                            dual_cells_lookup_corners_layers[vertex_layer][vertex_localIndex_times_8 | dual_cell_corner],
                            dual_cells_lookup_corners_localIndices[vertex_layer][vertex_localIndex_times_8 | dual_cell_corner]
                        )
                    }
                }
            }

            const edge2circular_quadrant_mapping: { [edge_quadrant: number]: Quadrant } = [2, 3, 1, 0]
            const circular2edge_quadrant_mapping: { [circular_quadrant: number]: Quadrant } = [3, 2, 0, 1]

            /**
             * faces_next[(4 * plane) + circular quadrant] = face that would point to adjacent neighbor; next quadrant
             * = (2 * (circular_quadrant in {0, 2} ? axis_1 : axis_2)) | (circular_quadrant in {2, 3} ? 0 : 1)
             */
            const faces_next = new Uint8Array([
                // (2 * axis_1) | 0,
                // (2 * axis_2) | 0,
                // (2 * axis_1) | 1,
                // (2 * axis_2) | 1,

                // X plane
                (2 * 1) | 0,
                (2 * 2) | 0,
                (2 * 1) | 1,
                (2 * 2) | 1,

                // Y plane
                (2 * 2) | 0,
                (2 * 0) | 0,
                (2 * 2) | 1,
                (2 * 0) | 1,

                // Z plane
                (2 * 0) | 0,
                (2 * 1) | 0,
                (2 * 0) | 1,
                (2 * 1) | 1,
            ])

            const lookup_key_buffer_size_min = 2 * (subdivision.typedArray.BYTES_PER_ELEMENT + 1)
            const lookup_key_buffer = Buffer.alloc(4 * Math.ceil(lookup_key_buffer_size_min / 4))
            const lookup_key_localIndices = new subdivision.typedArray(lookup_key_buffer.buffer, lookup_key_buffer.byteOffset + 0, 2)
            const lookup_key_layers = new Uint8Array(lookup_key_buffer.buffer, lookup_key_buffer.byteOffset + lookup_key_localIndices.byteLength, 2)
            const lookup_value_buffer = Buffer.alloc(1)
            const considered_edges = new HashTable(lookup_key_buffer.byteLength, 1, 0, number_subdivided_primary_cells * 8 * 8 * 4)

            // // form polygons for every edge of every dual cell cornered by any primary child vertex
            // function form_polygon(
            //     dual_cell_layer_initial: number,
            //     dual_cell_localIndex_initial: number,
            //     edge_axis: Axis,
            //     edge_quadrant_initial: Quadrant,
            // ) {
            //     const four_times_edge_axis = 4 * edge_axis
            //     const edge_initial = four_times_edge_axis | edge_quadrant_initial

            //     if (cells_polygons_by_edge_layers[dual_cell_layer_initial][(12 * dual_cell_localIndex_initial) + edge_initial] !== invalid_layer)
            //         return false

            //     const axis_1 = (edge_axis + 1) % 3
            //     const axis_2 = (edge_axis + 2) % 3
            //     const cell_0 = 1 << edge_axis
            //     const cell_1 = 1 << axis_1
            //     const cell_2 = 1 << axis_2

            //     const edge_initial_direction_1 = <Direction>((edge_quadrant_initial >> 0) & 1)
            //     const edge_initial_direction_2 = <Direction>((edge_quadrant_initial >> 1) & 1)
            //     const vertex_initial_a = (edge_initial_direction_1 === 0 ? 0 : cell_1) | (edge_initial_direction_2 === 0 ? 0 : cell_2)
            //     const vertex_initial_b = vertex_initial_a | cell_0

            //     const edge_vertex_layer_a = dual_cells_vertices_layers[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_a]
            //     const edge_vertex_layer_b = dual_cells_vertices_layers[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_b]
            //     const edge_vertex_localIndex_a = dual_cells_vertices_localIndices[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_a]
            //     const edge_vertex_localIndex_b = dual_cells_vertices_localIndices[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_b]

            //     if (edge_vertex_layer_a === edge_vertex_layer_b &&
            //         edge_vertex_localIndex_a === edge_vertex_localIndex_b)
            //         return false

            //     const edge_vertex_value_a = primary_alpha[edge_vertex_layer_a][edge_vertex_localIndex_a]
            //     const edge_vertex_value_b = primary_alpha[edge_vertex_layer_b][edge_vertex_localIndex_b]
            //     const edge_vertex_above_a = edge_vertex_value_a > surface_level
            //     const edge_vertex_above_b = edge_vertex_value_b > surface_level

            //     if (edge_vertex_above_a === edge_vertex_above_b)
            //         return false

            //     if (edge_vertex_above_a) {
            //         lookup_key_layers[0] = edge_vertex_layer_a
            //         lookup_key_layers[1] = edge_vertex_layer_b
            //         lookup_key_localIndices[0] = edge_vertex_localIndex_a
            //         lookup_key_localIndices[1] = edge_vertex_localIndex_b
            //     }
            //     else {
            //         lookup_key_layers[0] = edge_vertex_layer_b
            //         lookup_key_layers[1] = edge_vertex_layer_a
            //         lookup_key_localIndices[0] = edge_vertex_localIndex_b
            //         lookup_key_localIndices[1] = edge_vertex_localIndex_a
            //     }

            //     if (considered_edges.exist(lookup_key_buffer, 0))
            //         return false

            //     considered_edges.set(lookup_key_buffer, 0, lookup_value_buffer, 0)

            //     const polygon_vertices_offset = new_polygon_vertices_offsets[new_polygon_localIndex]

            //     let polygon_points = 0
            //     let polygon_points_updated_partial = 0

            //     //TODO: optimize by copy-and-pasting separate version for vertex b above and below
            //     // const circular_quadrant_offset_direction = edge_vertex_above_b ? 2 : 0
            //     // const circular_quadrant_offset_direction_next = edge_vertex_above_b ? 3 : 1
            //     // const circular_quadrant_offset_direction_prev = edge_vertex_above_b ? 1 : 3
            //     // const circular_quadrant_offset_direction_prev_offset = edge_vertex_above_b ? 3 : 1

            //     // TODO: optimize with these variables instead of swapping items after
            //     const circular_quadrant_offset_direction = 0
            //     const circular_quadrant_offset_direction_next = 1
            //     const circular_quadrant_offset_direction_prev = 3
            //     const circular_quadrant_offset_direction_prev_offset = 1

            //     // const circular_quadrant_offset_direction = 2
            //     // const circular_quadrant_offset_direction_next = 3
            //     // const circular_quadrant_offset_direction_prev = 1
            //     // const circular_quadrant_offset_direction_prev_offset = 3

            //     /**
            //      * invalidates references for the half-formed polygon in context[SurfaceNetKey].cells.polygons_by_edge
            //      * modified copy-and-paste of the following code
            //      * @returns false for convenience
            //      */
            //     function invalidate() {
            //         // these faces are not ordered by edge_quadrant, but by a circular quadrant
            //         // this number wraps around by adjacent quadrants, like in algebra
            //         let circular_quadrant: Quadrant = (edge2circular_quadrant_mapping[edge_quadrant_initial] + 2) & 0b11

            //         let dual_cell_layer_current = dual_cell_layer_initial
            //         let dual_cell_localIndex_current = dual_cell_localIndex_initial

            //         for (let polygon_points = 0; polygon_points < polygon_points_updated_partial; polygon_points++) {
            //             const current_surfacePoint_x = surfacePoints[dual_cell_layer_current][(3 * dual_cell_localIndex_current) + 0]
            //             if (Number.isNaN(current_surfacePoint_x) || !Number.isFinite(current_surfacePoint_x))
            //                 break

            //             const edge_quadrant_current = circular2edge_quadrant_mapping[circular_quadrant]
            //             const edge_current = (four_times_edge_axis) | edge_quadrant_current

            //             cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = invalid_layer
            //             cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = invalid_localIndex

            //             new_polygon_vertices_dualCells_layers[polygon_vertices_offset + polygon_points] = invalid_layer
            //             new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + polygon_points] = invalid_localIndex

            //             const face_next = faces_next[four_times_edge_axis | ((circular_quadrant + circular_quadrant_offset_direction) & 0b11)]

            //             const dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
            //             if (dual_cell_layer_adjacent === invalid_layer) {
            //                 // if there is no face in this direction because the focus edge makes two edges in this dual cell, like a tent,
            //                 // then continue in the previous direction that would have been before this dual cell
            //                 // otherwise a polygon cannot be formed around this edge

            //                 const circular_quadrant_test = (circular_quadrant + circular_quadrant_offset_direction_prev_offset) & 0b11
            //                 const edge_quadrant_test = circular2edge_quadrant_mapping[circular_quadrant_test]
            //                 const edge_direction_1 = <Direction>((edge_quadrant_test >> 0) & 1)
            //                 const edge_direction_2 = <Direction>((edge_quadrant_test >> 1) & 1)
            //                 const vertex_test_a = (edge_direction_1 === 0 ? 0 : cell_1) | (edge_direction_2 === 0 ? 0 : cell_2)
            //                 const vertex_test_b = vertex_test_a | cell_0

            //                 const test_matches = (
            //                     (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_layer_a) &&
            //                     (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_layer_b) &&
            //                     (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_localIndex_a) &&
            //                     (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_localIndex_b)
            //                 )

            //                 if (!test_matches)
            //                     break

            //                 const edge_test = (four_times_edge_axis) | edge_quadrant_test
            //                 cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = invalid_layer
            //                 cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = invalid_localIndex

            //                 const circular_quadrant_prev = (circular_quadrant + circular_quadrant_offset_direction_prev) & 0b11
            //                 const face_next = faces_next[four_times_edge_axis | circular_quadrant_prev]

            //                 const dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
            //                 const dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]

            //                 if (dual_cell_layer_adjacent === invalid_layer)
            //                     break

            //                 // it should be valid because a "tent" can only be formed between two triagonal corners

            //                 dual_cell_layer_current = dual_cell_layer_adjacent
            //                 dual_cell_localIndex_current = dual_cell_localIndex_adjacent
            //             }
            //             else {
            //                 const dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]

            //                 dual_cell_layer_current = dual_cell_layer_adjacent
            //                 dual_cell_localIndex_current = dual_cell_localIndex_adjacent

            //                 if (triangulation_start_vertex === -1)
            //                     triangulation_start_vertex = polygon_points

            //                 circular_quadrant += circular_quadrant_offset_direction_next
            //                 circular_quadrant &= 0b11
            //             }
            //         }

            //         return false
            //     }

            //     // these faces are not ordered by edge_quadrant, but by a circular quadrant
            //     // this number wraps around by adjacent quadrants, like in algebra
            //     let circular_quadrant: Quadrant = (edge2circular_quadrant_mapping[edge_quadrant_initial] + 2) & 0b11

            //     let dual_cell_layer_current = dual_cell_layer_initial
            //     let dual_cell_localIndex_current = dual_cell_localIndex_initial

            //     let triangulation_start_vertex = -1

            //     function collectCells() {
            //         do {
            //             polygon_points_updated_partial++;

            //             const current_surfacePoint_x = surfacePoints[dual_cell_layer_current][(3 * dual_cell_localIndex_current) + 0]
            //             if (Number.isNaN(current_surfacePoint_x) || !Number.isFinite(current_surfacePoint_x))
            //                 return false

            //             const edge_quadrant_current = circular2edge_quadrant_mapping[circular_quadrant]
            //             const edge_current = (four_times_edge_axis) | edge_quadrant_current

            //             cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = layer // = new_polygon_layer
            //             cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = new_polygon_localIndex

            //             new_polygon_vertices_dualCells_layers[polygon_vertices_offset + polygon_points] = dual_cell_layer_current
            //             new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + polygon_points] = dual_cell_localIndex_current

            //             const face_next = faces_next[four_times_edge_axis | ((circular_quadrant + circular_quadrant_offset_direction) & 0b11)]

            //             const dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
            //             if (dual_cell_layer_adjacent === invalid_layer) {
            //                 // if there is no face in this direction because the focus edge makes two edges in this dual cell, like a tent,
            //                 // then continue in the previous direction that would have been before this dual cell
            //                 // otherwise a polygon cannot be formed around this edge

            //                 const circular_quadrant_test = (circular_quadrant + circular_quadrant_offset_direction_prev_offset) & 0b11
            //                 const edge_quadrant_test = circular2edge_quadrant_mapping[circular_quadrant_test]
            //                 const edge_direction_1 = <Direction>((edge_quadrant_test >> 0) & 1)
            //                 const edge_direction_2 = <Direction>((edge_quadrant_test >> 1) & 1)
            //                 const vertex_test_a = (edge_direction_1 === 0 ? 0 : cell_1) | (edge_direction_2 === 0 ? 0 : cell_2)
            //                 const vertex_test_b = vertex_test_a | cell_0

            //                 const test_matches = (
            //                     (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_layer_a) &&
            //                     (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_layer_b) &&
            //                     (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_localIndex_a) &&
            //                     (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_localIndex_b)
            //                 )

            //                 if (!test_matches)
            //                     return false

            //                 const edge_test = (four_times_edge_axis) | edge_quadrant_test
            //                 cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = layer // = new_polygon_layer
            //                 cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = new_polygon_localIndex

            //                 const circular_quadrant_prev = (circular_quadrant + circular_quadrant_offset_direction_prev) & 0b11
            //                 const face_next = faces_next[four_times_edge_axis | circular_quadrant_prev]

            //                 const dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
            //                 const dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]

            //                 if (dual_cell_layer_adjacent === invalid_layer)
            //                     return false

            //                 // it should be valid because a "tent" can only be formed between two triagonal corners

            //                 dual_cell_layer_current = dual_cell_layer_adjacent
            //                 dual_cell_localIndex_current = dual_cell_localIndex_adjacent
            //             }
            //             else {
            //                 const dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]

            //                 dual_cell_layer_current = dual_cell_layer_adjacent
            //                 dual_cell_localIndex_current = dual_cell_localIndex_adjacent

            //                 if (triangulation_start_vertex === -1)
            //                     triangulation_start_vertex = polygon_points

            //                 circular_quadrant += circular_quadrant_offset_direction_next
            //                 circular_quadrant &= 0b11
            //             }

            //             polygon_points++
            //         } while (!(
            //             (dual_cell_layer_current === dual_cell_layer_initial) &&
            //             (dual_cell_localIndex_current === dual_cell_localIndex_initial)
            //         ))

            //         if (dual_cell_layer_current === invalid_layer)
            //             return false

            //         return true
            //     }

            //     if (!collectCells())
            //         return invalidate()

            //     const polygon_index = new_polygon_localIndex++

            //     new_polygon_vertices_offsets[new_polygon_localIndex] = polygon_vertices_offset + polygon_points

            //     new_polygon_edges_layers[(2 * polygon_index) + 0] = edge_vertex_above_a ? edge_vertex_layer_a : edge_vertex_layer_b
            //     new_polygon_edges_layers[(2 * polygon_index) + 1] = edge_vertex_above_b ? edge_vertex_layer_a : edge_vertex_layer_b
            //     new_polygon_edges_localIndices[(2 * polygon_index) + 0] = edge_vertex_above_a ? edge_vertex_localIndex_a : edge_vertex_localIndex_b
            //     new_polygon_edges_localIndices[(2 * polygon_index) + 1] = edge_vertex_above_b ? edge_vertex_localIndex_a : edge_vertex_localIndex_b

            //     let x: number, y: number, z: number

            //     // at this point, triangulation_start_vertex is >= 0

            //     /**
            //      * this index is relative to {@link triangulation_start_vertex},
            //      * and negative values mirror so that -x = {@link polygon_points} - x
            //      * before adding the {@link triangulation_start_vertex}
            //      */
            //     function loadVertex(index: number) {
            //         if (index < 0)
            //             index += polygon_points
            //         index += triangulation_start_vertex
            //         index %= polygon_points

            //         const dual_cell_layer = new_polygon_vertices_dualCells_layers[polygon_vertices_offset + index]
            //         const dual_cell_localIndex = new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + index]
            //         const array = surfacePoints[dual_cell_layer]
            //         x = array[(3 * dual_cell_localIndex) + 0]
            //         y = array[(3 * dual_cell_localIndex) + 1]
            //         z = array[(3 * dual_cell_localIndex) + 2]
            //     }

            //     /**
            //      * Computes the zig-zag length to discern how triangulation should be done
            //      * @param direction 0 = positive or zero triangulation_start
            //      * (zig zag starts using vertices to left and right of triangulation_start);
            //      * 1 = negative triangulation_start (zig zag starts from triangulation_start)
            //      * @returns the length of the zig-zag lines
            //      */
            //     function zigZagLength(direction: Direction) {
            //         const zig_zag_lines = polygon_points - 3
            //         // only diagonal zig-zag lines will be counted though
            //         // both directions give the same number of straight-across lines

            //         let ax: number,
            //             ay: number,
            //             az: number

            //         let distance = 0

            //         switch (direction) {
            //             case 0:
            //                 for (let i = 0; i < zig_zag_lines; i += 2) {
            //                     const isInverse = (i & 1) === 1
            //                     const a = (i >> 1) + 1
            //                     const b = isInverse ? -(1 + a) : -a

            //                     loadVertex(a)
            //                     ax = x, ay = y, az = z

            //                     loadVertex(b)
            //                     distance += Math.sqrt(
            //                         ((x - ax) ** 2) +
            //                         ((y - ay) ** 2) +
            //                         ((z - az) ** 2)
            //                     )
            //                 }
            //                 break

            //             case 1:
            //                 for (let i = 0; i < zig_zag_lines; i += 2) {
            //                     const isInverse = (i & 1) === 1
            //                     const a = i >> 1
            //                     const b = isInverse ? (a + 1) : -(2 + a)

            //                     loadVertex(a)
            //                     ax = x, ay = y, az = z

            //                     loadVertex(b)
            //                     distance += Math.sqrt(
            //                         ((x - ax) ** 2) +
            //                         ((y - ay) ** 2) +
            //                         ((z - az) ** 2)
            //                     )
            //                 }
            //                 break
            //         }

            //         return distance
            //     }

            //     new_polygon_triangulation_start[polygon_index] = zigZagLength(0) > zigZagLength(1) ? triangulation_start_vertex : -(1 + triangulation_start_vertex)

            //     function reverseVertices() {
            //         // vertices will be swapped in place
            //         for (let i = Math.ceil(polygon_points / 2) - 1; i > 0; i--) {
            //             const vertex_index_H = polygon_vertices_offset + ((triangulation_start_vertex + i) % polygon_points)
            //             const vertex_index_T = polygon_vertices_offset + ((triangulation_start_vertex - i + polygon_points) % polygon_points)

            //             let vertex_layer_H = new_polygon_vertices_dualCells_layers[vertex_index_H]
            //             let vertex_layer_T = new_polygon_vertices_dualCells_layers[vertex_index_T]
            //             let vertex_localIndex_H = new_polygon_vertices_dualCells_localIndices[vertex_index_H]
            //             let vertex_localIndex_T = new_polygon_vertices_dualCells_localIndices[vertex_index_T]

            //             new_polygon_vertices_dualCells_layers[vertex_index_H] = vertex_layer_T
            //             new_polygon_vertices_dualCells_layers[vertex_index_T] = vertex_layer_H
            //             new_polygon_vertices_dualCells_localIndices[vertex_index_H] = vertex_localIndex_T
            //             new_polygon_vertices_dualCells_localIndices[vertex_index_T] = vertex_localIndex_H
            //         }
            //     }

            //     if (edge_vertex_above_a)
            //         reverseVertices()

            //     function fillRecommendArray() {
            //         for (let point = 0; point < polygon_points; point++) {
            //             const polygon_vertex_dual_cell_layer = new_polygon_vertices_dualCells_layers[polygon_vertices_offset + point]
            //             const polygon_vertex_dual_cell_localIndex = new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + point]

            //             dual_cell_subdivide_recommendation_surfaceIntersects.set(polygon_vertex_dual_cell_layer, polygon_vertex_dual_cell_localIndex, true)
            //         }
            //     }

            //     fillRecommendArray()

            //     return true
            // }

            // TODO: optimize with these variables instead of swapping items after
            const circular_quadrant_offset_direction = 0
            const circular_quadrant_offset_direction_next = 1
            const circular_quadrant_offset_direction_prev = 3
            const circular_quadrant_offset_direction_prev_offset = 1

            let circular_quadrant: Quadrant
            let dual_cell_layer_current: number
            let dual_cell_localIndex_current: number
            let triangulation_start_vertex: number
            let current_surfacePoint_x: number
            let edge_quadrant_current: number
            let edge_current: number
            let face_next: number
            let dual_cell_layer_adjacent: number
            let dual_cell_localIndex_adjacent: number
            let circular_quadrant_test: number
            let edge_quadrant_test: number
            let edge_direction_1: number
            let edge_direction_2: number
            let vertex_test_a: number
            let vertex_test_b: number
            let test_matches: boolean
            let edge_test: number
            let circular_quadrant_prev: number
            let polygon_index: number
            let x: number, y: number, z: number
            let polygon_points: number
            let polygon_points_updated_partial: number
            let four_times_edge_axis: number
            let edge_initial: DiagonalDirection
            let axis_1: Axis
            let axis_2: Axis
            let cell_0: OctTreeCell
            let cell_1: OctTreeCell
            let cell_2: OctTreeCell
            let edge_initial_direction_1: Direction
            let edge_initial_direction_2: Direction
            let vertex_initial_a: number
            let vertex_initial_b: number
            let edge_vertex_layer_a: number
            let edge_vertex_layer_b: number
            let edge_vertex_localIndex_a: number
            let edge_vertex_localIndex_b: number
            let edge_vertex_above_a: boolean
            let edge_vertex_above_b: boolean
            let primary_subcell: OctTreeCell
            let corner: TriagonalDirection
            let dual_cell_layer_initial: number
            let dual_cell_localIndex_initial: number
            let edge_axis: Axis
            let edge_quadrant: Quadrant
            let polygon_vertices_offset: number

            /**
             * invalidates references for the half-formed polygon in context[SurfaceNetKey].dual_cells.polygons_by_edge
             * modified copy-and-paste of the following code
             */
            function invalidate() {
                // these faces are not ordered by edge_quadrant, but by a circular quadrant
                // this number wraps around by adjacent quadrants, like in algebra
                let circular_quadrant: Quadrant = (edge2circular_quadrant_mapping[edge_quadrant] + 2) & 0b11

                dual_cell_layer_current = dual_cell_layer_initial
                dual_cell_localIndex_current = dual_cell_localIndex_initial

                for (polygon_points = 0; polygon_points < polygon_points_updated_partial; polygon_points++) {
                    const current_surfacePoint_x = surfacePoints[dual_cell_layer_current][(3 * dual_cell_localIndex_current) + 0]
                    if (Number.isNaN(current_surfacePoint_x) || !Number.isFinite(current_surfacePoint_x))
                        break

                    edge_quadrant_current = circular2edge_quadrant_mapping[circular_quadrant]
                    edge_current = (four_times_edge_axis) | edge_quadrant_current

                    cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = invalid_layer
                    cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = invalid_localIndex

                    new_polygon_vertices_dualCells_layers[polygon_vertices_offset + polygon_points] = invalid_layer
                    new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + polygon_points] = invalid_localIndex

                    face_next = faces_next[four_times_edge_axis | ((circular_quadrant + circular_quadrant_offset_direction) & 0b11)]

                    dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                    if (dual_cell_layer_adjacent === invalid_layer) {
                        // if there is no face in this direction because the focus edge makes two edges in this dual cell, like a tent,
                        // then continue in the previous direction that would have been before this dual cell
                        // otherwise a polygon cannot be formed around this edge

                        circular_quadrant_test = (circular_quadrant + circular_quadrant_offset_direction_prev_offset) & 0b11
                        edge_quadrant_test = circular2edge_quadrant_mapping[circular_quadrant_test]
                        edge_direction_1 = <Direction>((edge_quadrant_test >> 0) & 1)
                        edge_direction_2 = <Direction>((edge_quadrant_test >> 1) & 1)
                        vertex_test_a = (edge_direction_1 === 0 ? 0 : cell_1) | (edge_direction_2 === 0 ? 0 : cell_2)
                        vertex_test_b = vertex_test_a | cell_0

                        test_matches = (
                            (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_layer_a) &&
                            (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_layer_b) &&
                            (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_localIndex_a) &&
                            (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_localIndex_b)
                        )

                        if (!test_matches)
                            break

                        edge_test = (four_times_edge_axis) | edge_quadrant_test
                        cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = invalid_layer
                        cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = invalid_localIndex

                        circular_quadrant_prev = (circular_quadrant + circular_quadrant_offset_direction_prev) & 0b11
                        face_next = faces_next[four_times_edge_axis | circular_quadrant_prev]

                        dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                        dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]

                        if (dual_cell_layer_adjacent === invalid_layer)
                            break

                        // it should be valid because a "tent" can only be formed between two triagonal corners

                        dual_cell_layer_current = dual_cell_layer_adjacent
                        dual_cell_localIndex_current = dual_cell_localIndex_adjacent
                    }
                    else {
                        dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]

                        dual_cell_layer_current = dual_cell_layer_adjacent
                        dual_cell_localIndex_current = dual_cell_localIndex_adjacent

                        if (triangulation_start_vertex === -1)
                            triangulation_start_vertex = polygon_points

                        circular_quadrant += circular_quadrant_offset_direction_next
                        circular_quadrant &= 0b11
                    }
                }
            }

            /**
             * this index is relative to {@link triangulation_start_vertex},
             * and negative values mirror so that -x = {@link polygon_points} - x
             * before adding the {@link triangulation_start_vertex}
             */
            function loadVertex(index: number) {
                if (index < 0)
                    index += polygon_points
                index += triangulation_start_vertex
                index %= polygon_points

                const dual_cell_layer = new_polygon_vertices_dualCells_layers[polygon_vertices_offset + index]
                const dual_cell_localIndex = new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + index]
                const array = surfacePoints[dual_cell_layer]
                x = array[(3 * dual_cell_localIndex) + 0]
                y = array[(3 * dual_cell_localIndex) + 1]
                z = array[(3 * dual_cell_localIndex) + 2]
            }

            /**
             * Computes the zig-zag length to discern how triangulation should be done
             * @param direction 0 = positive or zero triangulation_start
             * (zig zag starts using vertices to left and right of triangulation_start);
             * 1 = negative triangulation_start (zig zag starts from triangulation_start)
             * @returns the length of the zig-zag lines
             */
            function zigZagLength(direction: Direction) {
                let zig_zag_lines = polygon_points - 3
                // only diagonal zig-zag lines will be counted though
                // both directions give the same number of straight-across lines

                let ax: number,
                    ay: number,
                    az: number

                let distance = 0

                switch (direction) {
                    case 0:
                        for (let i = 0; i < zig_zag_lines; i += 2) {
                            const isInverse = (i & 1) === 1
                            const a = (i >> 1) + 1
                            const b = isInverse ? -(1 + a) : -a

                            loadVertex(a)
                            ax = x, ay = y, az = z

                            loadVertex(b)
                            distance += Math.sqrt(
                                ((x - ax) ** 2) +
                                ((y - ay) ** 2) +
                                ((z - az) ** 2)
                            )
                        }
                        break

                    case 1:
                        for (let i = 0; i < zig_zag_lines; i += 2) {
                            const isInverse = (i & 1) === 1
                            const a = i >> 1
                            const b = isInverse ? (a + 1) : -(2 + a)

                            loadVertex(a)
                            ax = x, ay = y, az = z

                            loadVertex(b)
                            distance += Math.sqrt(
                                ((x - ax) ** 2) +
                                ((y - ay) ** 2) +
                                ((z - az) ** 2)
                            )
                        }
                        break
                }

                return distance
            }

            const dual_cells_formPolygon = new Array<Uint8Array>(dual_cells.vertices.layers.layers.length)
            for (let i = 0; i < dual_cells.vertices.layers.layers.length; i++)
                dual_cells_formPolygon[i] = new Uint8Array(dual_cells.vertices.layers.layers[i].length / 8)

            let dual_cell_vertex_i: number
            let dual_cells_vertices_offset: number
            let dual_cells_vertices_layers_1: Uint8Array
            let dual_cells_vertices_localIndices_1: IndicesT
            const dual_cell_vertices_layers = new Uint8Array(8)
            const dual_cell_vertices_localIndices = new subdivision.typedArray(8)

            for (let primary_localIndex_group = 0; primary_localIndex_group < number_subdivided_primary_cells; primary_localIndex_group++) {
                const primary_children_localIndex_offset = 8 * primary_localIndex_group
                for (primary_subcell = 0; primary_subcell < 8; primary_subcell++) {
                    const primary_child_layer = layer
                    const primary_child_localIndex = primary_children_localIndex_offset | primary_subcell
                    for (corner = 0; corner < 8; corner++) {
                        dual_cell_layer_initial = dual_cells_lookup_corners_layers[primary_child_layer][(8 * primary_child_localIndex) | corner]
                        if (dual_cell_layer_initial === invalid_layer) continue
                        dual_cell_localIndex_initial = dual_cells_lookup_corners_localIndices[primary_child_layer][(8 * primary_child_localIndex) | corner]
                        if (dual_cells_formPolygon[dual_cell_layer_initial][dual_cell_localIndex_initial] !== 0) continue
                        dual_cells_formPolygon[dual_cell_layer_initial][dual_cell_localIndex_initial] = 1

                        dual_cells_vertices_layers_1 = dual_cells_vertices_layers[dual_cell_layer_initial]
                        dual_cells_vertices_localIndices_1 = <IndicesT>dual_cells_vertices_localIndices[dual_cell_layer_initial]
                        for (dual_cell_vertex_i = 0, dual_cells_vertices_offset = 8 * dual_cell_localIndex_initial; dual_cell_vertex_i < 8; dual_cell_vertex_i++, dual_cells_vertices_offset++) {
                            dual_cell_vertices_layers[dual_cell_vertex_i] = dual_cells_vertices_layers_1[dual_cells_vertices_offset]
                            dual_cell_vertices_localIndices[dual_cell_vertex_i] = dual_cells_vertices_localIndices_1[dual_cells_vertices_offset]
                        }

                        for (edge_axis = 0; edge_axis < 3; edge_axis++) {
                            for (edge_quadrant = 0; edge_quadrant < 4; edge_quadrant++) {
                                four_times_edge_axis = 4 * edge_axis
                                edge_initial = four_times_edge_axis | edge_quadrant

                                if (cells_polygons_by_edge_layers[dual_cell_layer_initial][(12 * dual_cell_localIndex_initial) + edge_initial] !== invalid_layer)
                                    continue

                                axis_1 = (edge_axis + 1) % 3
                                axis_2 = (edge_axis + 2) % 3
                                cell_0 = <OctTreeCell>(1 << edge_axis)
                                cell_1 = <OctTreeCell>(1 << axis_1)
                                cell_2 = <OctTreeCell>(1 << axis_2)

                                edge_initial_direction_1 = <Direction>((edge_quadrant >> 0) & 1)
                                edge_initial_direction_2 = <Direction>((edge_quadrant >> 1) & 1)
                                vertex_initial_a = (edge_initial_direction_1 === 0 ? 0 : cell_1) | (edge_initial_direction_2 === 0 ? 0 : cell_2)
                                vertex_initial_b = vertex_initial_a | cell_0

                                edge_vertex_layer_a = dual_cell_vertices_layers[vertex_initial_a]
                                edge_vertex_layer_b = dual_cell_vertices_layers[vertex_initial_b]
                                edge_vertex_localIndex_a = dual_cell_vertices_localIndices[vertex_initial_a]
                                edge_vertex_localIndex_b = dual_cell_vertices_localIndices[vertex_initial_b]

                                if (edge_vertex_layer_a === edge_vertex_layer_b &&
                                    edge_vertex_localIndex_a === edge_vertex_localIndex_b)
                                    continue

                                edge_vertex_above_a = primary_cell_aboveSurfaceLevel[edge_vertex_layer_a][edge_vertex_localIndex_a] !== 0
                                edge_vertex_above_b = primary_cell_aboveSurfaceLevel[edge_vertex_layer_b][edge_vertex_localIndex_b] !== 0

                                if (edge_vertex_above_a === edge_vertex_above_b)
                                    continue

                                if (edge_vertex_above_a) {
                                    lookup_key_layers[0] = edge_vertex_layer_a
                                    lookup_key_layers[1] = edge_vertex_layer_b
                                    lookup_key_localIndices[0] = edge_vertex_localIndex_a
                                    lookup_key_localIndices[1] = edge_vertex_localIndex_b
                                }
                                else {
                                    lookup_key_layers[0] = edge_vertex_layer_b
                                    lookup_key_layers[1] = edge_vertex_layer_a
                                    lookup_key_localIndices[0] = edge_vertex_localIndex_b
                                    lookup_key_localIndices[1] = edge_vertex_localIndex_a
                                }

                                if (considered_edges.exist(lookup_key_buffer, 0))
                                    continue

                                considered_edges.set(lookup_key_buffer, 0, lookup_value_buffer, 0)

                                polygon_vertices_offset = new_polygon_vertices_offsets[new_polygon_localIndex]

                                polygon_points = 0
                                polygon_points_updated_partial = 0

                                // these faces are not ordered by edge_quadrant, but by a circular quadrant
                                // this number wraps around by adjacent quadrants, like in algebra
                                circular_quadrant = (edge2circular_quadrant_mapping[edge_quadrant] + 2) & 0b11

                                dual_cell_layer_current = dual_cell_layer_initial
                                dual_cell_localIndex_current = dual_cell_localIndex_initial

                                triangulation_start_vertex = -1

                                do {
                                    polygon_points_updated_partial++;

                                    current_surfacePoint_x = surfacePoints[dual_cell_layer_current][(3 * dual_cell_localIndex_current) + 0]
                                    if (Number.isNaN(current_surfacePoint_x) || !Number.isFinite(current_surfacePoint_x)) {
                                        invalidate()
                                        continue
                                    }

                                    edge_quadrant_current = circular2edge_quadrant_mapping[circular_quadrant]
                                    edge_current = (four_times_edge_axis) | edge_quadrant_current

                                    cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = layer // = new_polygon_layer
                                    cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = new_polygon_localIndex

                                    new_polygon_vertices_dualCells_layers[polygon_vertices_offset + polygon_points] = dual_cell_layer_current
                                    new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + polygon_points] = dual_cell_localIndex_current

                                    face_next = faces_next[four_times_edge_axis | ((circular_quadrant + circular_quadrant_offset_direction) & 0b11)]

                                    dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                                    if (dual_cell_layer_adjacent === invalid_layer) {
                                        // if there is no face in this direction because the focus edge makes two edges in this dual cell, like a tent,
                                        // then continue in the previous direction that would have been before this dual cell
                                        // otherwise a polygon cannot be formed around this edge

                                        circular_quadrant_test = (circular_quadrant + circular_quadrant_offset_direction_prev_offset) & 0b11
                                        edge_quadrant_test = circular2edge_quadrant_mapping[circular_quadrant_test]
                                        edge_direction_1 = <Direction>((edge_quadrant_test >> 0) & 1)
                                        edge_direction_2 = <Direction>((edge_quadrant_test >> 1) & 1)
                                        vertex_test_a = (edge_direction_1 === 0 ? 0 : cell_1) | (edge_direction_2 === 0 ? 0 : cell_2)
                                        vertex_test_b = vertex_test_a | cell_0

                                        test_matches = (
                                            (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_layer_a) &&
                                            (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_layer_b) &&
                                            (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_localIndex_a) &&
                                            (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_localIndex_b)
                                        )

                                        if (!test_matches) {
                                            invalidate()
                                            continue
                                        }

                                        edge_test = (four_times_edge_axis) | edge_quadrant_test
                                        cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = layer // = new_polygon_layer
                                        cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = new_polygon_localIndex

                                        circular_quadrant_prev = (circular_quadrant + circular_quadrant_offset_direction_prev) & 0b11
                                        face_next = faces_next[four_times_edge_axis | circular_quadrant_prev]

                                        dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                                        dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]

                                        if (dual_cell_layer_adjacent === invalid_layer) {
                                            invalidate()
                                            continue
                                        }

                                        // it should be valid because a "tent" can only be formed between two triagonal corners

                                        dual_cell_layer_current = dual_cell_layer_adjacent
                                        dual_cell_localIndex_current = dual_cell_localIndex_adjacent
                                    }
                                    else {
                                        dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]

                                        dual_cell_layer_current = dual_cell_layer_adjacent
                                        dual_cell_localIndex_current = dual_cell_localIndex_adjacent

                                        if (triangulation_start_vertex === -1)
                                            triangulation_start_vertex = polygon_points

                                        circular_quadrant += circular_quadrant_offset_direction_next
                                        circular_quadrant &= 0b11
                                    }

                                    polygon_points++
                                } while (!(
                                    (dual_cell_layer_current === dual_cell_layer_initial) &&
                                    (dual_cell_localIndex_current === dual_cell_localIndex_initial)
                                ))

                                if (dual_cell_layer_current === invalid_layer) {
                                    invalidate()
                                    continue
                                }

                                polygon_index = new_polygon_localIndex++

                                new_polygon_vertices_offsets[new_polygon_localIndex] = polygon_vertices_offset + polygon_points

                                new_polygon_edges_layers[(2 * polygon_index) + 0] = edge_vertex_above_a ? edge_vertex_layer_a : edge_vertex_layer_b
                                new_polygon_edges_layers[(2 * polygon_index) + 1] = edge_vertex_above_b ? edge_vertex_layer_a : edge_vertex_layer_b
                                new_polygon_edges_localIndices[(2 * polygon_index) + 0] = edge_vertex_above_a ? edge_vertex_localIndex_a : edge_vertex_localIndex_b
                                new_polygon_edges_localIndices[(2 * polygon_index) + 1] = edge_vertex_above_b ? edge_vertex_localIndex_a : edge_vertex_localIndex_b

                                // at this point, triangulation_start_vertex is >= 0

                                new_polygon_triangulation_start[polygon_index] = zigZagLength(0) > zigZagLength(1) ? triangulation_start_vertex : -(1 + triangulation_start_vertex)

                                if (edge_vertex_above_a) {
                                    // vertices will be swapped in place
                                    for (let i = Math.ceil(polygon_points / 2) - 1; i > 0; i--) {
                                        const vertex_index_H = polygon_vertices_offset + ((triangulation_start_vertex + i) % polygon_points)
                                        const vertex_index_T = polygon_vertices_offset + ((triangulation_start_vertex - i + polygon_points) % polygon_points)

                                        let vertex_layer_H = new_polygon_vertices_dualCells_layers[vertex_index_H]
                                        let vertex_layer_T = new_polygon_vertices_dualCells_layers[vertex_index_T]
                                        let vertex_localIndex_H = new_polygon_vertices_dualCells_localIndices[vertex_index_H]
                                        let vertex_localIndex_T = new_polygon_vertices_dualCells_localIndices[vertex_index_T]

                                        new_polygon_vertices_dualCells_layers[vertex_index_H] = vertex_layer_T
                                        new_polygon_vertices_dualCells_layers[vertex_index_T] = vertex_layer_H
                                        new_polygon_vertices_dualCells_localIndices[vertex_index_H] = vertex_localIndex_T
                                        new_polygon_vertices_dualCells_localIndices[vertex_index_T] = vertex_localIndex_H
                                    }
                                }

                                for (let point = 0; point < polygon_points; point++) {
                                    const polygon_vertex_dual_cell_layer = new_polygon_vertices_dualCells_layers[polygon_vertices_offset + point]
                                    const polygon_vertex_dual_cell_localIndex = new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + point]

                                    dual_cell_subdivide_recommendation_surfaceIntersects.set(polygon_vertex_dual_cell_layer, polygon_vertex_dual_cell_localIndex, true)
                                }
                            }
                        }
                    }
                }
            }

            // save results
            const number_polygons_added = new_polygon_localIndex

            item[SurfaceNetKey] = {
                primary_cells: {
                    aboveSurfaceLevel: primary_cell_aboveSurfaceLevel[layer]
                },
                dual_cells: {
                    surfacePoints: surfacePoints[layer],
                    polygons_by_edge: new_polygons_by_edge
                },
                polygons: {
                    edges: arrayCopy(
                        {
                            layers: new_polygon_edges_layers,
                            localIndices: new_polygon_edges_localIndices,
                        },
                        context[SurfaceNetKey].polygons.edges.subdivide(2 * number_polygons_added)
                    ),
                    vertices: {
                        offsets: arrayCopy(new_polygon_vertices_offsets, context[SurfaceNetKey].polygons.vertices.offsets.subdivide(number_polygons_added + 1)),
                        dual_cells: arrayCopy(
                            {
                                layers: new_polygon_vertices_dualCells_layers,
                                localIndices: new_polygon_vertices_dualCells_localIndices
                            },
                            context[SurfaceNetKey].polygons.vertices.dual_cells.subdivide(new_polygon_vertices_offsets[number_polygons_added])
                        ),
                    },
                    triangulation_start: arrayCopy(new_polygon_triangulation_start, context[SurfaceNetKey].polygons.triangulation_start.subdivide(number_polygons_added)),
                }
            }

            const subdivide_recommendation_surfaceIntersects_primary = new Uint8Array(number_new_primary_cells)
            const dual_cells_lookup_corners_layers_newLayer = dual_cells_lookup_corners_layers[layer]
            const dual_cells_lookup_corners_localIndices_newLayer = dual_cells_lookup_corners_localIndices[layer]

            for (let primary_localIndex_group = 0; primary_localIndex_group < number_subdivided_primary_cells; primary_localIndex_group++) {
                const primary_children_localIndex_offset = 8 * primary_localIndex_group
                for (let primary_child_subcell = 0; primary_child_subcell < 8; primary_child_subcell++) {
                    const primary_child_localIndex = primary_children_localIndex_offset | primary_child_subcell
                    for (let triagonal_corner = 0; triagonal_corner < 8; triagonal_corner++) {
                        const dual_cell_layer = dual_cells_lookup_corners_layers_newLayer[(8 * primary_child_localIndex) | triagonal_corner]
                        if (dual_cell_layer === invalid_layer) continue
                        const dual_cell_localIndex = dual_cells_lookup_corners_localIndices_newLayer[(8 * primary_child_localIndex) | triagonal_corner]
                        if (dual_cell_subdivide_recommendation_surfaceIntersects.get(dual_cell_layer, dual_cell_localIndex)) {
                            subdivide_recommendation_surfaceIntersects_primary[primary_child_localIndex] |= 1
                            break
                        }
                    }
                }
            }

            const subdivision_recommendation = item[SubdivisionKey].recommendation.layers[layer]
            for (let primary_child_localIndex_group = 0; primary_child_localIndex_group < number_subdivided_primary_cells; primary_child_localIndex_group++) {
                const primary_child_localIndex_offset = (8 * primary_child_localIndex_group)

                for (let primary_subcell = 0; primary_subcell < 8; primary_subcell++) {
                    const primary_child_localIndex = primary_child_localIndex_offset | primary_subcell

                    subdivision_recommendation[primary_child_localIndex] += (
                        subdivide_recommendation_isolateMultipleInteriorIslands[primary_child_localIndex_group] +
                        subdivide_recommendation_surfaceIntersects_primary[primary_child_localIndex]
                    )
                }
            }
        }
    }

    private constructor() { }
    public static readonly instance = new this()
}