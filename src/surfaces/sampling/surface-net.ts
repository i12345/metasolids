import { Axis, Direction, OctTreeCell, Quadrant } from "../../paradigm/octtree/address.js";
import { DualKey, OctTreeWithDualGroups, OctTreeWithDualGroupsTemplate, OctTreeWithDualLayer, OctTreeWithDualLayersGrouped, OctTreeWithDualOctTreesGrouped, OctTreeWithDualValue, OctTreeWithDualValuesGrouped } from "../../paradigm/octtree/dual.js";
import { OctTreeCellsMaskOctTree } from "../../paradigm/octtree/mask.js";
import { SubdivisionKey } from "../../paradigm/octtree/processor.js";
import { OctTreeReferences, OctTreeReferencesOctTreeGroups, OctTreeReferencesOctTreeGroupsTemplate, OctTreeReferencesOctTreeLayer, OctTreeReferencesOctTreeLayersGrouped, OctTreeReferencesOctTreeValue, OctTreeReferencesOctTreeValuesGrouped, OctTreeReferencesOctTreesGrouped } from "../../paradigm/octtree/references.js";
import { TypedArrayOctTree } from "../../paradigm/octtree/typed-array.js";
import { ProcessorInitialization } from "../../paradigm/processing/processor.js";
import { EncapsulatingKey, WithEncapsulating } from "../../paradigm/trees/encapsulating.js";
import { MultiObjectsGroupsOrLeafMapped, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplateOrLeaf, MultiObjectsGroupsTemplate_Leaf, groupPaths, isGroupLeaf } from "../../paradigm/trees/multi-objects-groups.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberArrayLike, TypedArray } from "../../utils/typed-array.js";
import { VolumeProcessing } from "../../volumes/processor.js";
import { VolumeSamplingSubdivisionProcessor, VolumeSamplingSubdivisionProcessingWithDual, VolumeProcessingWithSampling, VolumeProcessingContextWithSampling, VolumeSamplingSubdivisionProcessingContextWithDual, VolumeSamplingSubdivisionProcessingContext, VolumeSamplingSubdivisionProcessing, SamplingKey, SpaceKey } from "../../volumes/sampling/index.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/volume.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";

export const SurfaceNetKey = "surface"

export type SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups = {
    [SurfaceNetKey]: {
        cells: {
            surfacePoints: MultiObjectsGroupsTemplateLeaf
            
            /**
             * polygons_by_edge[dual_cell layer][(12 * dual_cell local index) + diagonal direction] = reference to polygon
             * 
             * diagonal directions = (4 * plane) | quadrant
             * 
             * * 0 = (y- z-)
             * * 1 = (y+ z-)
             * * 2 = (y- z+)
             * * 3 = (y+ z+)
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
        cells: {
            surfacePoints: MultiObjectsGroupsTemplate_Leaf,
            
            /**
             * polygons_by_edge[dual_cell layer][(12 * dual_cell local index) + diagonal direction] = reference to polygon
             * 
             * diagonal directions = (4 * plane) | quadrant
             * 
             * * 0 = (y- z-)
             * * 1 = (y+ z-)
             * * 2 = (y- z+)
             * * 3 = (y+ z+)
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
        cells: {
            surfacePoints: number
            
            /**
             * polygons_by_edge[dual_cell layer][(12 * dual_cell local index) + diagonal direction] = reference to polygon
             * 
             * diagonal directions = (4 * plane) | quadrant
             * 
             * * 0 = (y- z-)
             * * 1 = (y+ z-)
             * * 2 = (y- z+)
             * * 3 = (y+ z+)
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
        cells: {
            surfacePoints: Float64Array
            
            /**
             * polygons_by_edge[dual_cell layer][(12 * dual_cell local index) + diagonal direction] = reference to polygon
             * 
             * diagonal directions = (4 * plane) | quadrant
             * 
             * * 0 = (y- z-)
             * * 1 = (y+ z-)
             * * 2 = (y- z+)
             * * 3 = (y+ z+)
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
        cells: {
            surfacePoints: TypedArrayOctTree<number, Float64Array>
            
            /**
             * polygons_by_edge[dual_cell layer][(12 * dual_cell local index) + diagonal direction] = reference to polygon
             * 
             * diagonal directions = (4 * plane) | quadrant
             * 
             * * 0 = (y- z-)
             * * 1 = (y+ z-)
             * * 2 = (y- z+)
             * * 3 = (y+ z+)
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

export type SurfaceNetVolumeSamplingSubdivisionProcessing<
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
                        VolumeSampleT,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeT
                    > =
                VolumeProcessing<
                        VolumeLocationT,
                        VolumeSampleT,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeT
                    >
    > =
    VolumeSamplingSubdivisionProcessingWithDual<
        IndicesT,
        VolumeLocationT,
        VolumeSampleT,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        VolumeProcessingT
    > &
    VolumeSamplingSubdivisionProcessing<
        IndicesT,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValue,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayer, // <IndicesT>,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped, // <IndicesT>,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped, // <IndicesT>,
        VolumeLocationT,
        VolumeSampleT,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        VolumeProcessingT
    >

export type SurfaceNetVolumeSamplingSubdivisionProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeProcessingContextT extends
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValue,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayer, // <IndicesT>,
                    OctTreeWithDualLayersGrouped, // <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > =
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValue,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayer, // <IndicesT>,
                    OctTreeWithDualLayersGrouped, // <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                >
    > =
    VolumeSamplingSubdivisionProcessingContextWithDual<
        IndicesT,
        VolumeLocationT,
        VolumeSampleT,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeProcessingContextT
    > &
    VolumeSamplingSubdivisionProcessingContext<
        IndicesT,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValue,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayer, // <IndicesT>,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped, // <IndicesT>,
        SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped, // <IndicesT>,
        VolumeLocationT,
        VolumeSampleT,
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
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValue,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayer, // <IndicesT>,
                    OctTreeWithDualLayersGrouped, /// <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValue,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayer, // <IndicesT>,
                    OctTreeWithDualLayersGrouped, /// <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValue,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayer, // <IndicesT>,
                    OctTreeWithDualLayersGrouped, /// <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > =
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValue,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayer, // <IndicesT>,
                    OctTreeWithDualLayersGrouped, /// <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                >,
    > implements
    VolumeSamplingSubdivisionProcessor<
            IndicesT,
            OctTreeWithDualGroups,
            OctTreeWithDualValue,
            OctTreeWithDualValuesGrouped,
            OctTreeWithDualLayer, // <IndicesT>,
            OctTreeWithDualLayersGrouped, /// <IndicesT>,
            OctTreeWithDualOctTreesGrouped, // <IndicesT>
            VolumeLocationT,
            VolumeSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            VolumeProcessingT,
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValue,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayer, // <IndicesT>,
                    OctTreeWithDualLayersGrouped, /// <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT//,
                    // VolumeProcessingContextT
                >,
            WithEncapsulating<VolumeProcessingT> &
                SurfaceNetVolumeSamplingSubdivisionProcessing<
                        IndicesT,
                        VolumeLocationT,
                        VolumeSampleT,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeT,
                        VolumeProcessingT
                    >, //, 
            SurfaceNetVolumeSamplingSubdivisionProcessingContext<
                IndicesT,
                VolumeLocationT,
                VolumeSampleT,
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
                VolumeSampleT,
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
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    VolumeProcessingT
                >,
        context: SurfaceNetVolumeSamplingSubdivisionProcessingContext<
                IndicesT,
                VolumeLocationT,
                VolumeSampleT,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeProcessingContextT
            >): void {
        const subdivision = context[SubdivisionKey]
        const layer = subdivision.depth
        const parent_layer = layer - 1
        
        if (parent_layer === -1) {
            context[SurfaceNetKey] = {
                cells: {
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
                cells: {
                    surfacePoints: context[SurfaceNetKey].cells.surfacePoints.subdivide(0),
                    polygons_by_edge: context[SurfaceNetKey].cells.polygons_by_edge.subdivide(0),
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
        }
        // else if (parent_layer === 0) {
            
        // }
        else {
            const number_subdivided_primary_cells = subdivision.layer_sizes[layer]
            const dual_cells = context[DualKey]
            const primary_samples = context.samples
            const primary_parent_children_localIndex_offset_references = subdivision.references.local.layers[parent_layer]
            const new_dual_cells = item[DualKey]
            const number_new_dual_cells = new_dual_cells.cells.vertices.layers.length / 8

            const invalid_layer = 255
            const invalid_localIndex = subdivision.invalid

            const space = context[SpaceKey]

            const surface_level = 0.5 //context[EncapsulatingKey][SamplingKey][VolumeSurfaces].surfaceLevel or context.surfaceLevel

            const references_subdivided_children = subdivision.references.local.layers[parent_layer]
            const references_parents = subdivision.references.parents.layers[parent_layer]

            const {
                layers: new_polygon_edges_layers,
                localIndices: new_polygon_edges_localIndices,
            } = context[SurfaceNetKey].cells.polygons_by_edge.subdivide(12 * number_new_dual_cells)

            context[SurfaceNetKey].cells.surfacePoints.subdivide(number_new_dual_cells)

            /**
             * this recommendation will be, for each dual cell,
             * the XOR of whether it used to be intersected
             * by a polygon and whether it still is
             */
            const dual_cell_subdivide_recommendation_surfaceIntersects = new OctTreeCellsMaskOctTree()
            for (const layer_size of subdivision.layer_sizes)
                dual_cell_subdivide_recommendation_surfaceIntersects.subdivide(layer_size)
            
            //TODO: compute whether each dual cell used to be intersected
            // perhaps this isn't even desired if the it is desired that the surface have an even positioning of vertices

            function invalidate_polygons(
                dual_cell_layer: number,
                dual_cell_localIndex: number,
            ) {
                // invalidate any polygon made around an edge of this dual cell
                for (let edge = 0; edge < 12; edge++) {
                    const polygon_layer = context[SurfaceNetKey].cells.polygons_by_edge.layers.layers[dual_cell_layer][(12 * dual_cell_localIndex) + edge]
                    if (polygon_layer !== invalid_layer) {
                        const polygon_localIndex = context[SurfaceNetKey].cells.polygons_by_edge.localIndices.layers[dual_cell_layer][(12 * dual_cell_localIndex) + edge]
        
                        context[SurfaceNetKey].polygons.edges.layers.layers[polygon_layer][(2 * polygon_localIndex) + 0] = invalid_layer
                        context[SurfaceNetKey].polygons.edges.layers.layers[polygon_layer][(2 * polygon_localIndex) + 1] = invalid_layer
                        context[SurfaceNetKey].polygons.edges.localIndices.layers[polygon_layer][(2 * polygon_localIndex) + 0] = invalid_localIndex
                        context[SurfaceNetKey].polygons.edges.localIndices.layers[polygon_layer][(2 * polygon_localIndex) + 1] = invalid_localIndex

                        // const polygon_triangle_offset = context[SurfaceNetKey].polygons.triangles.offsets.layers[polygon_layer][polygon_localIndex]
                        // const polygon_triangle_offset_next = context[SurfaceNetKey].polygons.triangles.offsets.layers[polygon_layer][polygon_localIndex + 1]
                        // context[SurfaceNetKey].polygons.triangles.indices.layers[polygon_layer].fill(invalid_uint32, polygon_triangle_offset, polygon_triangle_offset_next)
        
                        const polygon_dual_cells_offset = context[SurfaceNetKey].polygons.vertices.offsets.layers[polygon_layer][polygon_localIndex]
                        const polygon_dual_cells_offset_next = context[SurfaceNetKey].polygons.vertices.offsets.layers[polygon_layer][polygon_localIndex + 1]
                        for (let dual_cell_i = polygon_dual_cells_offset; dual_cell_i < polygon_dual_cells_offset_next; dual_cell_i++) {
                            const dual_cell_layer = context[SurfaceNetKey].polygons.vertices.dual_cells.layers.layers[polygon_layer][dual_cell_i]
                            const dual_cell_localIndex = context[SurfaceNetKey].polygons.vertices.dual_cells.localIndices.layers[polygon_layer][dual_cell_i]

                            for (let edge_1 = 0; edge_1 < 12; edge_1++) {
                                const referenced_polygon_layer = context[SurfaceNetKey].cells.polygons_by_edge.layers.layers[dual_cell_layer][(12 * dual_cell_localIndex) + edge]
                                const referenced_polygon_localIndex = context[SurfaceNetKey].cells.polygons_by_edge.localIndices.layers[dual_cell_layer][(12 * dual_cell_localIndex) + edge]
                                if (referenced_polygon_layer === polygon_layer && referenced_polygon_localIndex === polygon_localIndex) {
                                    context[SurfaceNetKey].cells.polygons_by_edge.layers.layers[dual_cell_layer][(12 * dual_cell_localIndex) + edge] = invalid_layer
                                    context[SurfaceNetKey].cells.polygons_by_edge.localIndices.layers[dual_cell_layer][(12 * dual_cell_localIndex) + edge] = invalid_localIndex
                                }
                            }
                        }
                    }
                }
            }

            // invalidate all polygons formed around edges of any of the previous triagonal neighbor dual cells
            // = the dual cells that used to be cornered by the primary parent vertex
            for (let primary_parent_i = 0; primary_parent_i < number_subdivided_primary_cells; primary_parent_i++) {
                const primary_parent_localIndex = references_parents[primary_parent_i]
                // const primary_localIndex_offset = 8 * primary_parent_i
                for (let corner = 0; corner < 8; corner++) {
                    const dual_cell_layer = dual_cells.cells.lookup.corners.layers.layers[parent_layer][(8 * primary_parent_localIndex) | corner]
                    if (dual_cell_layer !== invalid_layer) {
                        const dual_cell_localIndex = dual_cells.cells.lookup.corners.localIndices.layers[parent_layer][(8 * primary_parent_localIndex) | corner]

                        invalidate_polygons(dual_cell_layer, dual_cell_localIndex)
                    }
                }
            }

            // if the state of a dual cell is represented with 8 bits, one per vertex,
            // each meaning whether the vertex is at or above surface level(1) or below it(0)
            // then 256 cases can be precalculated to know if there are multiple interior islands -
            // if there are at least two vertices at or above surface level that don't touch each other
            const dual_cell_state_hasMultipleInteriorIslands = new Uint8Array(256)
            function precalculate_dual_cell_state_hasMultipleInteriorIslands() {
                const islands = new Uint8Array(8)
                const adjacency = new Uint8Array([
                    0b01101000,
                    0b10010100,
                    0b10010010,
                    0b01100001,
                    0b10000110,
                    0b01001001,
                    0b00101001,
                    0b00010110,
                ])
                for (let state = 0; state < 256; state++) {
                    islands.fill(0)
                    
                    for (let power = 0; power < 4; power++) {
                        for (let vertex = 0; vertex < 8; vertex++) {
                            if ((state & (1 << vertex)) !== 0) {
                                const vertex_adjacency = adjacency[vertex]

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

            //TODO: pack subdivision recommendations into single array

            const subdivide_recommendation_isolateMultipleInteriorIslands = new Uint8Array(number_subdivided_primary_cells)

            const dual_cell_corners_alpha = new Float64Array(8)
            const dual_cell_corners_positions = new Float64Array(3 * 8)
            // update surface points for every dual cell related to each subdivided primary vertex
            // = every dual cell cornered by each child cell of every subdivided primary parent
            function update_surface_point(dual_cell_layer: number, dual_cell_localIndex: number) {
                if (dual_cell_layer === invalid_layer)
                    return

                if (!isNaN(context[SurfaceNetKey].cells.surfacePoints.layers[dual_cell_layer][dual_cell_localIndex]))
                    return
                
                const dual_cell_corners_offset = (8 * dual_cell_localIndex)
                
                let vertex_layer: number, vertex_localIndex: number
                for (let corner = 0; corner < 8; corner++) {
                    vertex_layer = dual_cells.cells.vertices.layers.layers[dual_cell_layer][dual_cell_corners_offset | corner]
                    vertex_localIndex = dual_cells.cells.vertices.localIndices.layers[dual_cell_layer][dual_cell_corners_offset | corner]
                    dual_cell_corners_alpha[corner] = primary_samples.layers[vertex_layer][vertex_localIndex].alpha
                    //read vertex positions
                    for (let component = 0; component < 3; component++)
                        dual_cell_corners_positions[(3 * corner) + component] = space.positions.layers[vertex_layer][(3 * vertex_localIndex) + component]
                }

                let n_crossed_edges = 0
                let p_x = 0
                let p_y = 0
                let p_z = 0

                for (let axis0 = 0; axis0 < 3; axis0++) {
                    const axis1 = (axis0 + 1) % 3
                    const axis2 = (axis0 + 2) % 3

                    const cell0 = 1 << axis0
                    const cell1 = 1 << axis1
                    const cell2 = 1 << axis2

                    for (let quadrant_a = 0; quadrant_a < 4; quadrant_a++) {
                        const quadrant_b = quadrant_a - 1

                        const direction_1c = (quadrant_a >> 0) & 1
                        const direction_2c = (quadrant_a >> 1) & 1
                        const direction_1d = (quadrant_b >> 0) & 1
                        const direction_2d = (quadrant_b >> 1) & 1

                        for (let direction_0 = 0; direction_0 < 2; direction_0++) {
                            const vertex_corner_c = (direction_0 === 0 ? 0 : cell0) | (direction_1c === 0 ? 0 : cell1) | (direction_2c === 0 ? 0 : cell2)
                            const vertex_corner_d = (direction_0 === 0 ? 0 : cell0) | (direction_1d === 0 ? 0 : cell1) | (direction_2d === 0 ? 0 : cell2)

                            const vertex_alpha_c = dual_cell_corners_alpha[vertex_corner_c]
                            const vertex_alpha_d = dual_cell_corners_alpha[vertex_corner_d]

                            if (((vertex_alpha_c < surface_level) && (vertex_corner_d > surface_level)) ||
                                ((vertex_alpha_c > surface_level) && (vertex_alpha_d < surface_level))) {
                                
                                const p_x_c = dual_cell_corners_positions[(3 * vertex_alpha_c) + 0]
                                const p_y_c = dual_cell_corners_positions[(3 * vertex_alpha_c) + 1]
                                const p_z_c = dual_cell_corners_positions[(3 * vertex_alpha_c) + 2]

                                const p_x_d = dual_cell_corners_positions[(3 * vertex_alpha_c) + 0]
                                const p_z_d = dual_cell_corners_positions[(3 * vertex_alpha_c) + 2]
                                const p_y_d = dual_cell_corners_positions[(3 * vertex_alpha_c) + 1]

                                const t = (surface_level - vertex_alpha_c) / (vertex_alpha_d - vertex_alpha_c)
                                const s = 1 - t

                                p_x += (s * p_x_c) + (t * p_x_d)
                                p_y += (s * p_y_c) + (t * p_y_d)
                                p_z += (s * p_z_c) + (t * p_z_d)

                                n_crossed_edges++
                            }
                        }
                    }
                }

                if (n_crossed_edges > 0) {
                    context[SurfaceNetKey].cells.surfacePoints.layers[dual_cell_layer][(3 * dual_cell_localIndex) + 0] = p_x / n_crossed_edges
                    context[SurfaceNetKey].cells.surfacePoints.layers[dual_cell_layer][(3 * dual_cell_localIndex) + 1] = p_y / n_crossed_edges
                    context[SurfaceNetKey].cells.surfacePoints.layers[dual_cell_layer][(3 * dual_cell_localIndex) + 2] = p_z / n_crossed_edges
                }
                else {
                    context[SurfaceNetKey].cells.surfacePoints.layers[dual_cell_layer][(3 * dual_cell_localIndex) + 0] = Infinity
                    context[SurfaceNetKey].cells.surfacePoints.layers[dual_cell_layer][(3 * dual_cell_localIndex) + 1] = Infinity
                    context[SurfaceNetKey].cells.surfacePoints.layers[dual_cell_layer][(3 * dual_cell_localIndex) + 2] = Infinity
                }

                // TODO: recommend subdividing if there are two vertices below surface level that are not connected
                let cubeState = 0
                for (let corner = 0; corner < 8; corner++)
                    if(dual_cell_corners_alpha[corner] >= surface_level)
                        cubeState |= (1 << corner)
                
                if (dual_cell_state_hasMultipleInteriorIslands[cubeState] !== 0) {
                    for (let corner = 0; corner < 8; corner++) {
                        const primary_vertex_layer = dual_cells.cells.vertices.layers.layers[dual_cell_layer][(8 * dual_cell_localIndex) | corner]
                        if (primary_vertex_layer === layer) {
                            const primary_vertex_localIndex = dual_cells.cells.vertices.localIndices.layers[dual_cell_layer][(8 * dual_cell_localIndex) | corner]
                            subdivide_recommendation_isolateMultipleInteriorIslands[primary_vertex_localIndex] |= 1
                        }
                    }
                }
            }

            for (let primary_parent_localIndex = 0; primary_parent_localIndex < number_subdivided_primary_cells; primary_parent_localIndex++) {
                const primary_children_localIndex_offset = primary_parent_children_localIndex_offset_references[primary_parent_localIndex]
                // const dual_cell_interior_layer = layer
                // const dual_cell_interior_localIndex = new_dual_cells.cells.lookup.corners.localIndices[(8 * primary_children_localIndex_offset) + 7]

                // update surface points for each dual cell cornered by each primary child
                for (let primary_child_subcell = 0; primary_child_subcell < 8; primary_child_subcell++) {
                    const vertex_layer = layer
                    const vertex_localIndex = primary_children_localIndex_offset | primary_child_subcell
                    const vertex_localIndex_times_8 = 8 * vertex_localIndex

                    for (let dual_cell_corner = 0; dual_cell_corner < 8; dual_cell_corner++) {
                        update_surface_point(
                            dual_cells.cells.lookup.corners.layers.layers[vertex_layer][vertex_localIndex_times_8 | dual_cell_corner],
                            dual_cells.cells.lookup.corners.localIndices.layers[vertex_layer][vertex_localIndex_times_8 | dual_cell_corner]
                        )
                    }
                }
            }

            let new_polygon_localIndex = 0
            const max_number_new_polygons = (number_new_dual_cells * 12) + (9 * 8 * number_subdivided_primary_cells)

            const new_polygon_vertices_offsets = new Uint32Array(max_number_new_polygons).fill(0)
            const new_polygon_vertices_dualCells_layers: NumberArrayLike = [] // new Uint8Array(max_number_new_polygons * max_number_vertices_per_polygon)
            const new_polygon_vertices_dualCells_localIndices: NumberArrayLike = [] // new subdivision.typedArray(max_number_new_polygons * max_number_vertices_per_polygon)

            const new_polygon_triangulation_start = new Int32Array(max_number_new_polygons)

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

            // form polygons for every edge of every dual cell cornered by any primary child vertex
            function form_polygon(
                dual_cell_layer_initial: number,
                dual_cell_localIndex_initial: number,
                edge_axis: Axis,
                edge_quadrant_initial: Quadrant,
            ) {
                const edge_initial = (4 * edge_axis) | edge_quadrant_initial

                if (context[SurfaceNetKey].cells.polygons_by_edge.layers.layers[dual_cell_layer_initial][(12 * dual_cell_localIndex_initial) + edge_initial] !== invalid_layer)
                    return false
                
                const axis_1 = (edge_axis + 1) % 3
                const axis_2 = (edge_axis + 2) % 3
                const cell_0 = 1 << edge_axis
                const cell_1 = 1 << axis_1
                const cell_2 = 1 << axis_2

                const edge_initial_direction_1 = <Direction>((edge_quadrant_initial >> 0) & 1)
                const edge_initial_direction_2 = <Direction>((edge_quadrant_initial >> 1) & 1)
                const vertex_initial_a = (edge_initial_direction_1 === 0 ? 0 : cell_1) | (edge_initial_direction_2 === 0 ? 0 : cell_2)
                const vertex_initial_b = vertex_initial_a | cell_0

                const edge_vertex_layer_a = dual_cells.cells.vertices.layers.layers[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_a]
                const edge_vertex_layer_b = dual_cells.cells.vertices.layers.layers[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_b]
                const edge_vertex_localIndex_a = dual_cells.cells.vertices.localIndices.layers[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_a]
                const edge_vertex_localIndex_b = dual_cells.cells.vertices.localIndices.layers[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_b]

                if (edge_vertex_layer_a === edge_vertex_layer_b &&
                    edge_vertex_localIndex_a === edge_vertex_localIndex_b)
                    return false

                const edge_vertex_value_a = context.samples.layers[edge_vertex_layer_a][edge_vertex_localIndex_a].alpha
                const edge_vertex_value_b = context.samples.layers[edge_vertex_layer_b][edge_vertex_localIndex_b].alpha
                const edge_vertex_above_a = edge_vertex_value_a > surface_level
                const edge_vertex_above_b = edge_vertex_value_b > surface_level

                if (edge_vertex_above_a === edge_vertex_above_b)
                    return false

                const polygon_vertices_offset = new_polygon_vertices_offsets[new_polygon_localIndex]

                /**
                 * invalidates references for the half-formed polygon in context[SurfaceNetKey].cells.polygons_by_edge
                 * modified copy-and-paste of the following code
                 * @returns false for convenience
                 */
                function invalidate() {
                    let polygon_points = 0

                    // these faces are not ordered by edge_quadrant, but by a circular quadrant
                    // this number wraps around by adjacent quadrants, like in algebra
                    let circular_quadrant: Quadrant = (edge2circular_quadrant_mapping[edge_quadrant_initial] + 2) & 0b11

                    let dual_cell_layer_current = dual_cell_layer_initial
                    let dual_cell_localIndex_current = dual_cell_localIndex_initial

                    do {
                        const edge_quadrant_current = circular2edge_quadrant_mapping[circular_quadrant]
                        const edge_current = (4 * edge_axis) | edge_quadrant_current
                    
                        context[SurfaceNetKey].cells.polygons_by_edge.layers.layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = invalid_layer
                        context[SurfaceNetKey].cells.polygons_by_edge.localIndices.layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = invalid_localIndex

                        // new_polygon_vertices_dualCells_layers[polygon_vertices_offset + polygon_points] = dual_cell_layer_current
                        // new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + polygon_points] = dual_cell_localIndex_current

                        const face_next = faces_next[circular_quadrant]
                    
                        const dual_cell_layer_adjacent = dual_cells.cells.neighbors.layers.layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                        if (dual_cell_layer_adjacent === invalid_layer) {
                            // if there is no face in this direction because the focus edge makes two edges in this dual cell, like a tent,
                            // then continue in the previous direction that would have been before this dual cell
                            // otherwise a polygon cannot be formed around this edge
                        
                            // edge_quadrant_test 

                            const circular_quadrant_test = (circular_quadrant + 1) & 0b11
                            const edge_quadrant_test = circular2edge_quadrant_mapping[circular_quadrant_test]
                            const edge_direction_1 = <Direction>((edge_quadrant_test >> 0) & 1)
                            const edge_direction_2 = <Direction>((edge_quadrant_test >> 1) & 1)
                            const vertex_test_a = (edge_direction_1 === 0 ? 0 : cell_1) | (edge_direction_2 === 0 ? 0 : cell_2)
                            const vertex_test_b = vertex_test_a | cell_0

                            const test_matches = (
                                (dual_cells.cells.vertices.layers.layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_layer_a) &&
                                (dual_cells.cells.vertices.layers.layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_layer_b) &&
                                (dual_cells.cells.vertices.localIndices.layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_localIndex_a) &&
                                (dual_cells.cells.vertices.localIndices.layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_localIndex_b)
                            )

                            if (!test_matches)
                                break
                        
                            const edge_test = (4 * edge_axis) | edge_quadrant_test
                            context[SurfaceNetKey].cells.polygons_by_edge.layers.layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = invalid_layer
                            context[SurfaceNetKey].cells.polygons_by_edge.localIndices.layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = invalid_localIndex
                        
                            const circular_quadrant_prev = (circular_quadrant + 3) & 0b11
                            const face_next = faces_next[circular_quadrant_prev]

                            const dual_cell_layer_adjacent = dual_cells.cells.neighbors.layers.layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                            const dual_cell_localIndex_adjacent = dual_cells.cells.neighbors.localIndices.layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]

                            // it should be valid because a "tent" can only be formed between two triagonal corners 

                            dual_cell_layer_current = dual_cell_layer_adjacent
                            dual_cell_localIndex_current = dual_cell_localIndex_adjacent
                        }
                        else {
                            const dual_cell_localIndex_adjacent = dual_cells.cells.neighbors.localIndices.layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                        
                            dual_cell_layer_current = dual_cell_layer_adjacent
                            dual_cell_localIndex_current = dual_cell_localIndex_adjacent

                            if (++circular_quadrant == 4) circular_quadrant = 0
                        }

                        polygon_points++
                    } while (!(
                        (dual_cell_layer_current === dual_cell_layer_initial) &&
                        (dual_cell_localIndex_current === dual_cell_localIndex_initial)
                    ))
                    
                    return false
                }
                
                let polygon_points = 0

                // these faces are not ordered by edge_quadrant, but by a circular quadrant
                // this number wraps around by adjacent quadrants, like in algebra
                let circular_quadrant: Quadrant = (edge2circular_quadrant_mapping[edge_quadrant_initial] + 2) & 0b11

                let dual_cell_layer_current = dual_cell_layer_initial
                let dual_cell_localIndex_current = dual_cell_localIndex_initial

                let triangulation_start_vertex = -1

                do {
                    const edge_quadrant_current = circular2edge_quadrant_mapping[circular_quadrant]
                    const edge_current = (4 * edge_axis) | edge_quadrant_current
                    
                    context[SurfaceNetKey].cells.polygons_by_edge.layers.layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = layer // = new_polygon_layer
                    context[SurfaceNetKey].cells.polygons_by_edge.localIndices.layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = new_polygon_localIndex

                    new_polygon_vertices_dualCells_layers[polygon_vertices_offset + polygon_points] = dual_cell_layer_current
                    new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + polygon_points] = dual_cell_localIndex_current

                    const face_next = faces_next[circular_quadrant]
                    
                    const dual_cell_layer_adjacent = dual_cells.cells.neighbors.layers.layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                    if (dual_cell_layer_adjacent === invalid_layer) {
                        // if there is no face in this direction because the focus edge makes two edges in this dual cell, like a tent,
                        // then continue in the previous direction that would have been before this dual cell
                        // otherwise a polygon cannot be formed around this edge
                        
                        // edge_quadrant_test 

                        const circular_quadrant_test = (circular_quadrant + 1) & 0b11
                        const edge_quadrant_test = circular2edge_quadrant_mapping[circular_quadrant_test]
                        const edge_direction_1 = <Direction>((edge_quadrant_test >> 0) & 1)
                        const edge_direction_2 = <Direction>((edge_quadrant_test >> 1) & 1)
                        const vertex_test_a = (edge_direction_1 === 0 ? 0 : cell_1) | (edge_direction_2 === 0 ? 0 : cell_2)
                        const vertex_test_b = vertex_test_a | cell_0

                        const test_matches = (
                            (dual_cells.cells.vertices.layers.layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_layer_a) &&
                            (dual_cells.cells.vertices.layers.layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_layer_b) &&
                            (dual_cells.cells.vertices.localIndices.layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_localIndex_a) &&
                            (dual_cells.cells.vertices.localIndices.layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_localIndex_b)
                        )

                        if (!test_matches)
                            return invalidate()
                        
                        const edge_test = (4 * edge_axis) | edge_quadrant_test
                        context[SurfaceNetKey].cells.polygons_by_edge.layers.layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = layer // = new_polygon_layer
                        context[SurfaceNetKey].cells.polygons_by_edge.localIndices.layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = new_polygon_localIndex
                        
                        const circular_quadrant_prev = (circular_quadrant + 3) & 0b11
                        const face_next = faces_next[circular_quadrant_prev]

                        const dual_cell_layer_adjacent = dual_cells.cells.neighbors.layers.layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                        const dual_cell_localIndex_adjacent = dual_cells.cells.neighbors.localIndices.layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]

                        // it should be valid because a "tent" can only be formed between two triagonal corners 

                        dual_cell_layer_current = dual_cell_layer_adjacent
                        dual_cell_localIndex_current = dual_cell_localIndex_adjacent
                    }
                    else {
                        const dual_cell_localIndex_adjacent = dual_cells.cells.neighbors.localIndices.layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                        
                        dual_cell_layer_current = dual_cell_layer_adjacent
                        dual_cell_localIndex_current = dual_cell_localIndex_adjacent

                        if (triangulation_start_vertex === -1)
                            triangulation_start_vertex = polygon_points

                        if (++circular_quadrant == 4) circular_quadrant = 0
                    }

                    polygon_points++
                } while (!(
                    (dual_cell_layer_current === dual_cell_layer_initial) &&
                    (dual_cell_localIndex_current === dual_cell_localIndex_initial)
                ))
                
                if (dual_cell_layer_current === invalid_layer)
                    return invalidate()
                
                const polygon_index = new_polygon_localIndex++
                
                new_polygon_vertices_offsets[new_polygon_localIndex] = polygon_vertices_offset + polygon_points
                
                new_polygon_edges_layers[(2 * polygon_index) + 0] = edge_vertex_above_a ? edge_vertex_layer_a : edge_vertex_layer_b
                new_polygon_edges_layers[(2 * polygon_index) + 1] = edge_vertex_above_b ? edge_vertex_layer_a : edge_vertex_layer_b
                new_polygon_edges_localIndices[(2 * polygon_index) + 0] = edge_vertex_above_a ? edge_vertex_localIndex_a : edge_vertex_localIndex_b
                new_polygon_edges_localIndices[(2 * polygon_index) + 1] = edge_vertex_above_b ? edge_vertex_localIndex_a : edge_vertex_localIndex_b

                //TODO: is this the right time to triangulate the polygon?
                let x: number, y: number, z: number

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
                    const array = context[SurfaceNetKey].cells.surfacePoints.layers[dual_cell_layer]
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
                    const zig_zag_lines = polygon_points - 3
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

                new_polygon_triangulation_start[polygon_index] = zigZagLength(0) > zigZagLength(1) ? triangulation_start_vertex : -(1 + triangulation_start_vertex)

                for (let point = 0; point < polygon_points; point++) {
                    const polygon_vertex_dual_cell_layer = new_polygon_vertices_dualCells_layers[polygon_vertices_offset + point]
                    const polygon_vertex_dual_cell_localIndex = new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + point]
                    
                    dual_cell_subdivide_recommendation_surfaceIntersects.set(
                        polygon_vertex_dual_cell_layer, polygon_vertex_dual_cell_localIndex,
                        !dual_cell_subdivide_recommendation_surfaceIntersects.get(
                            polygon_vertex_dual_cell_layer, polygon_vertex_dual_cell_localIndex
                        )
                    )
                }

                return true
            }

            for (let primary_parent_i = 0; primary_parent_i < number_subdivided_primary_cells; primary_parent_i++) {
                const primary_children_localIndex_offset = subdivision.references.local.layers[parent_layer][references_parents[primary_parent_i]]
                for (let primary_subcell = 0; primary_subcell < 8; primary_subcell++) {
                    const primary_child_layer = layer
                    const primary_child_localIndex = primary_children_localIndex_offset | primary_subcell
                    for (let corner = 0; corner < 8; corner++) {
                        const dual_cell_layer = dual_cells.cells.lookup.corners.layers.layers[primary_child_layer][(8 * primary_child_localIndex) | corner]
                        const dual_cell_localIndex = dual_cells.cells.lookup.corners.localIndices.layers[primary_child_layer][(8 * primary_child_localIndex) | corner]
                        for (let edge_axis = 0; edge_axis < 3; edge_axis++) {
                            for (let edge_quadrant = 0; edge_quadrant < 4; edge_quadrant++) {
                                form_polygon(
                                    dual_cell_layer,
                                    dual_cell_localIndex,
                                    edge_axis,
                                    edge_quadrant
                                )
                            }
                        }
                    }
                }
            }

            // save results
            const number_polygons_added = new_polygon_localIndex
            function copy<
                T extends TypedArray<number>,
                Groups extends MultiObjectsGroupsTemplateOrLeaf,
                Dst extends MultiObjectsGroupsOrLeafMapped<Groups, T> = MultiObjectsGroupsOrLeafMapped<Groups, T>
            >(
                    src: MultiObjectsGroupsOrLeafMapped<Groups, T | number[]>,
                    dst: Dst
                ): Dst {
                if (dst instanceof Array ||
                    dst instanceof Uint8Array ||
                    dst instanceof Uint8ClampedArray ||
                    dst instanceof Int8Array ||
                    dst instanceof Uint16Array ||
                    dst instanceof Int16Array ||
                    dst instanceof Uint32Array ||
                    dst instanceof Int32Array ||
                    dst instanceof Float32Array ||
                    dst instanceof Float64Array) {
                    if (src instanceof Array || dst instanceof Array)
                        for (let i = 0; i < dst.length; i++)
                            dst[i] = src[i]
                    else
                        dst.set((src as TypedArray<number>).subarray(0, dst.length))
                }
                else {
                    for (const key of Reflect.ownKeys(src))
                        copy((src as any)[key], dst[key])
                }

                return dst
            }

            item[SurfaceNetKey] = {
                cells: {
                    surfacePoints: context[SurfaceNetKey].cells.surfacePoints.layers[layer],
                    polygons_by_edge: {
                        layers: context[SurfaceNetKey].cells.polygons_by_edge.layers.layers[layer],
                        localIndices: context[SurfaceNetKey].cells.polygons_by_edge.localIndices.layers[layer]
                    }
                },
                polygons: {
                    edges: {
                        // already in the context tree
                        layers: new_polygon_edges_layers,
                        localIndices: new_polygon_edges_localIndices,
                    },
                    vertices: {
                        offsets: copy(new_polygon_vertices_offsets, context[SurfaceNetKey].polygons.vertices.offsets.subdivide(number_polygons_added + 1)),
                        dual_cells: copy(
                            {
                                layers: new_polygon_vertices_dualCells_layers,
                                localIndices: new_polygon_vertices_dualCells_localIndices
                            },
                            context[SurfaceNetKey].polygons.vertices.dual_cells.subdivide(new_polygon_vertices_offsets[new_polygon_localIndex])
                        ),
                    },
                    triangulation_start: copy(new_polygon_triangulation_start, context[SurfaceNetKey].polygons.triangulation_start.subdivide(number_polygons_added)),
                }
            }
            
            const subdivide_recommendation_surfaceIntersects_primary = new Uint8Array(8 * number_subdivided_primary_cells)
            const dual_cells_lookup_corners_layers_newLayer = dual_cells.cells.lookup.corners.layers.layers[layer]
            const dual_cells_lookup_corners_localIndices_newLayer = dual_cells.cells.lookup.corners.localIndices.layers[layer]
            
            for (let primary_parent_i = 0; primary_parent_i < number_subdivided_primary_cells; primary_parent_i++) {
                const primary_children_localIndex_offset = references_subdivided_children[references_parents[primary_parent_i]]
                for (let primary_child_subcell = 0; primary_child_subcell < 8; primary_child_subcell++) {
                    const primary_child_localIndex = primary_children_localIndex_offset | primary_child_subcell
                    for (let triagonal_corner = 0; triagonal_corner < 8; triagonal_corner++) {
                        const dual_cell_layer = dual_cells_lookup_corners_layers_newLayer[(8 * primary_child_localIndex) | triagonal_corner]
                        const dual_cell_localIndex = dual_cells_lookup_corners_localIndices_newLayer[(8 * primary_child_localIndex) | triagonal_corner]
                        if (dual_cell_subdivide_recommendation_surfaceIntersects.get(dual_cell_layer, dual_cell_localIndex)) {
                            subdivide_recommendation_surfaceIntersects_primary[primary_child_localIndex] |= 1
                            break
                        }
                    }
                }
            }

            const subdivision_recommendation = item[SubdivisionKey].recommendation.layers[layer]
            for (let primary_child_localIndex = 0; primary_child_localIndex < subdivision_recommendation.length; primary_child_localIndex++) {
                subdivision_recommendation[primary_child_localIndex] += (
                    subdivide_recommendation_isolateMultipleInteriorIslands[primary_child_localIndex] +
                    subdivide_recommendation_surfaceIntersects_primary[primary_child_localIndex]
                )
            }
        }
    }

    private constructor() { }
    public static readonly instance = new this()
}