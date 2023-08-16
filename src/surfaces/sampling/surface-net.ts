import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberArrayLike, TypedArray } from "../../utils/typed-array.js";
import { arrayCopy } from "../../paradigm/trees/index.js"
import { Axis, Direction, OctTreeCell, OctTreeCellsMask, Quadrant } from "../../paradigm/octtree/address.js";
import { DualKey, OctTreeWithDualGroups, OctTreeWithDualGroupsTemplate, OctTreeWithDualLayer, OctTreeWithDualLayersGrouped, OctTreeWithDualOctTreesGrouped, OctTreeWithDualValue, OctTreeWithDualValuesGrouped } from "../../paradigm/octtree/dual.js";
import { OctTreeCellsMaskOctTree } from "../../paradigm/octtree/mask.js";
import { SubdivisionKey } from "../../paradigm/octtree/processor.js";
import { OctTreeReferences, OctTreeReferencesOctTreeGroups, OctTreeReferencesOctTreeGroupsTemplate, OctTreeReferencesOctTreeLayer, OctTreeReferencesOctTreeLayersGrouped, OctTreeReferencesOctTreeValue, OctTreeReferencesOctTreeValuesGrouped, OctTreeReferencesOctTreesGrouped } from "../../paradigm/octtree/references.js";
import { TypedArrayOctTree } from "../../paradigm/octtree/typed-array.js";
import { ProcessorInitialization } from "../../paradigm/processing/processor.js";
import { EncapsulatingKey, WithEncapsulating } from "../../paradigm/trees/encapsulating.js";
import { MultiObjectsGroupsOrLeafMapped, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplateOrLeaf, MultiObjectsGroupsTemplate_Leaf, groupPaths, isGroupLeaf } from "../../paradigm/trees/multi-objects-groups.js";
import { VolumeProcessing } from "../../volumes/processor.js";
import { VolumeSamplingSubdivisionProcessor, VolumeSamplingSubdivisionProcessingWithDual, VolumeProcessingWithSampling, VolumeProcessingContextWithSampling, VolumeSamplingSubdivisionProcessingContextWithDual, VolumeSamplingSubdivisionProcessingContext, VolumeSamplingSubdivisionProcessing, SamplingKey, SpaceKey } from "../../volumes/sampling/index.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/volume.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { VolumeProcessingContextWithMeshing } from "../meshing/processing.js";
import { VolumeSurfacesKey } from "../volume-surfaces.js";
import HashTable from "@ronomon/hash-table"

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
                > &
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
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
                > &
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
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
                    OctTreeWithDualLayersGrouped, // <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > &
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
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
                > &
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
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
                >  &
            VolumeProcessingContextWithMeshing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
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
            WithEncapsulating<VolumeProcessingContextT> &
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

            item[SubdivisionKey].recommendation.layers[layer][0]++
        }
        // else if (parent_layer === 0) {
            
        // }
        else {
            const number_subdivided_primary_cells = subdivision.layer_sizes[layer] / 8
            const dual_cells = context[DualKey].cells
            const dual_cells_vertices_layers = dual_cells.vertices.layers.layers
            const dual_cells_vertices_localIndices = dual_cells.vertices.localIndices.layers
            const dual_cells_neighbors_layers = dual_cells.neighbors.layers.layers
            const dual_cells_neighbors_localIndices = dual_cells.neighbors.localIndices.layers
            const dual_cells_lookup_corners_layers = dual_cells.lookup.corners.layers.layers
            const dual_cells_lookup_corners_localIndices = dual_cells.lookup.corners.localIndices.layers

            const primary_samples = context.samples
            const new_dual_cells = item[DualKey]
            const number_new_dual_cells = new_dual_cells.cells.vertices.layers.length / 8

            const invalid_layer = 255
            const invalid_localIndex = subdivision.invalid

            const space = context[SpaceKey]
            const space_positions = space.positions.layers

            const surface_level = context[EncapsulatingKey][VolumeSurfacesKey].surfaceLevel

            const references_parents = subdivision.references.parents.layers[parent_layer]

            const new_polygons_by_edge = context[SurfaceNetKey].cells.polygons_by_edge.subdivide(12 * number_new_dual_cells)

            const {
                layers: new_polygon_by_edges_layers,
                localIndices: new_polygon_by_edges_localIndices,
            } = new_polygons_by_edge

            const cells_polygons_by_edge_layers = context[SurfaceNetKey].cells.polygons_by_edge.layers.layers
            const cells_polygons_by_edge_localIndices = context[SurfaceNetKey].cells.polygons_by_edge.localIndices.layers

            context[SurfaceNetKey].cells.surfacePoints.subdivide(3 * number_new_dual_cells).fill(NaN)
            const surfacePoints = context[SurfaceNetKey].cells.surfacePoints.layers
            const polygons_vertices_offsets = context[SurfaceNetKey].polygons.vertices.offsets.layers
            const polygon_vertices_dual_cells_layers = context[SurfaceNetKey].polygons.vertices.dual_cells.layers.layers
            const polygon_vertices_dual_cells_localIndices = context[SurfaceNetKey].polygons.vertices.dual_cells.localIndices.layers
            const polygon_triangulation_start = context[SurfaceNetKey].polygons.triangulation_start.layers

            const invalid_int32 = (2 << 31) - 1

            /**
             * this is a bitmap for whether a dual cell is part of at least one polygon or not
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
                    const polygon_layer = cells_polygons_by_edge_layers[dual_cell_layer][(12 * dual_cell_localIndex) + edge]
                    if (polygon_layer !== invalid_layer) {
                        const polygon_localIndex = cells_polygons_by_edge_localIndices[dual_cell_layer][(12 * dual_cell_localIndex) + edge]
        
                        cells_polygons_by_edge_layers[polygon_layer][(2 * polygon_localIndex) + 0] = invalid_layer
                        cells_polygons_by_edge_layers[polygon_layer][(2 * polygon_localIndex) + 1] = invalid_layer
                        cells_polygons_by_edge_localIndices[polygon_layer][(2 * polygon_localIndex) + 0] = invalid_localIndex
                        cells_polygons_by_edge_localIndices[polygon_layer][(2 * polygon_localIndex) + 1] = invalid_localIndex
                        polygon_triangulation_start[polygon_layer][polygon_localIndex] = invalid_int32

                        // const polygon_triangle_offset = context[SurfaceNetKey].polygons.triangles.offsets.layers[polygon_layer][polygon_localIndex]
                        // const polygon_triangle_offset_next = context[SurfaceNetKey].polygons.triangles.offsets.layers[polygon_layer][polygon_localIndex + 1]
                        // context[SurfaceNetKey].polygons.triangles.indices.layers[polygon_layer].fill(invalid_uint32, polygon_triangle_offset, polygon_triangle_offset_next)
        
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
                const primary_parent_localIndex = references_parents[8 * primary_localIndex_group]

                for (let corner = 0; corner < 8; corner++) {
                    const dual_cell_layer = dual_cells_lookup_corners_layers[parent_layer][(8 * primary_parent_localIndex) | corner]
                    if (dual_cell_layer !== invalid_layer) {
                        const dual_cell_localIndex = dual_cells_lookup_corners_localIndices[parent_layer][(8 * primary_parent_localIndex) | corner]

                        invalidate_polygons(dual_cell_layer, dual_cell_localIndex)
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

            //TODO: pack subdivision recommendations into single array

            const subdivide_recommendation_isolateMultipleInteriorIslands = new Uint8Array(number_subdivided_primary_cells)

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
                    dual_cell_corners_alpha[corner] = primary_samples.layers[vertex_layer][vertex_localIndex].alpha
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
                    const p_x_a = dual_cell_corners_positions[(3 * vertex_corner_a) + 0]
                    const p_y_a = dual_cell_corners_positions[(3 * vertex_corner_a) + 1]
                    const p_z_a = dual_cell_corners_positions[(3 * vertex_corner_a) + 2]

                    for (let vertex_corner_b = vertex_corner_a + 1; vertex_corner_b < 8; vertex_corner_b++) {
                        if ((adjacency & (1 << vertex_corner_b)) !== 0) {
                            const vertex_alpha_b = dual_cell_corners_alpha[vertex_corner_b]

                            if (((vertex_alpha_a < surface_level) && (vertex_alpha_b > surface_level)) ||
                                ((vertex_alpha_a > surface_level) && (vertex_alpha_b < surface_level))) {
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
                    surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 1] = Infinity
                    surfacePoints[dual_cell_layer][(3 * dual_cell_localIndex) + 2] = Infinity
                }

                // TODO: recommend subdividing if there are two vertices below surface level that are not connected
                let cubeState = 0
                for (let corner = 0; corner < 8; corner++)
                    if(dual_cell_corners_alpha[corner] >= surface_level)
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

            let new_polygon_localIndex = 0
            const max_number_new_polygons = (number_new_dual_cells * 12) + (9 * 8 * number_subdivided_primary_cells)

            const new_polygon_vertices_offsets = new Uint32Array(max_number_new_polygons).fill(0)
            const new_polygon_vertices_dualCells_layers: NumberArrayLike = [] // new Uint8Array(max_number_new_polygons * max_number_vertices_per_polygon)
            const new_polygon_vertices_dualCells_localIndices: NumberArrayLike = [] // new subdivision.typedArray(max_number_new_polygons * max_number_vertices_per_polygon)

            const new_polygon_triangulation_start = new Int32Array(max_number_new_polygons).fill(invalid_int32)

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
            const lookup_key_buffer = Buffer.alloc(4 * Math.ceil(lookup_key_buffer_size_min / 4)).fill(0)
            const lookup_key_localIndices = new subdivision.typedArray(lookup_key_buffer.buffer, lookup_key_buffer.byteOffset + 0, 2)
            const lookup_key_layers = new Uint8Array(lookup_key_buffer.buffer, lookup_key_buffer.byteOffset + lookup_key_localIndices.byteLength, 2)
            const lookup_value_buffer = Buffer.alloc(1)
            const considered_edges = new HashTable(lookup_key_buffer.byteLength, 1, 0, number_subdivided_primary_cells * 8 * 8 * 4)

            // form polygons for every edge of every dual cell cornered by any primary child vertex
            function form_polygon(
                dual_cell_layer_initial: number,
                dual_cell_localIndex_initial: number,
                edge_axis: Axis,
                edge_quadrant_initial: Quadrant,
            ) {
                const four_times_edge_axis = 4 * edge_axis
                const edge_initial = four_times_edge_axis | edge_quadrant_initial

                if (cells_polygons_by_edge_layers[dual_cell_layer_initial][(12 * dual_cell_localIndex_initial) + edge_initial] !== invalid_layer)
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

                const edge_vertex_layer_a = dual_cells_vertices_layers[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_a]
                const edge_vertex_layer_b = dual_cells_vertices_layers[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_b]
                const edge_vertex_localIndex_a = dual_cells_vertices_localIndices[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_a]
                const edge_vertex_localIndex_b = dual_cells_vertices_localIndices[dual_cell_layer_initial][(8 * dual_cell_localIndex_initial) | vertex_initial_b]

                if (edge_vertex_layer_a === edge_vertex_layer_b &&
                    edge_vertex_localIndex_a === edge_vertex_localIndex_b)
                    return false

                const edge_vertex_value_a = primary_samples.layers[edge_vertex_layer_a][edge_vertex_localIndex_a].alpha
                const edge_vertex_value_b = primary_samples.layers[edge_vertex_layer_b][edge_vertex_localIndex_b].alpha
                const edge_vertex_above_a = edge_vertex_value_a > surface_level
                const edge_vertex_above_b = edge_vertex_value_b > surface_level

                if (edge_vertex_above_a === edge_vertex_above_b)
                    return false
                
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
                    return false

                considered_edges.set(lookup_key_buffer, 0, lookup_value_buffer, 0)

                const polygon_vertices_offset = new_polygon_vertices_offsets[new_polygon_localIndex]

                let polygon_points = 0

                /**
                 * invalidates references for the half-formed polygon in context[SurfaceNetKey].cells.polygons_by_edge
                 * modified copy-and-paste of the following code
                 * @returns false for convenience
                 */
                function invalidate() {
                    // these faces are not ordered by edge_quadrant, but by a circular quadrant
                    // this number wraps around by adjacent quadrants, like in algebra
                    let circular_quadrant: Quadrant = (edge2circular_quadrant_mapping[edge_quadrant_initial] + 2) & 0b11

                    let dual_cell_layer_current = dual_cell_layer_initial
                    let dual_cell_localIndex_current = dual_cell_localIndex_initial

                    let n_polygon_points = polygon_points
                    for (let polygon_points = 0; polygon_points < n_polygon_points; polygon_points++) {
                        const current_surfacePoint_x = surfacePoints[dual_cell_layer_current][(3 * dual_cell_localIndex_current) + 0]
                        if (Number.isNaN(current_surfacePoint_x) || !Number.isFinite(current_surfacePoint_x))
                            break
    
                        const edge_quadrant_current = circular2edge_quadrant_mapping[circular_quadrant]
                        const edge_current = (four_times_edge_axis) | edge_quadrant_current
                        
                        cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = invalid_layer
                        cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = invalid_localIndex
    
                        new_polygon_vertices_dualCells_layers[polygon_vertices_offset + polygon_points] = invalid_layer
                        new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + polygon_points] = invalid_localIndex
    
                        const face_next = faces_next[four_times_edge_axis | circular_quadrant]
                        
                        const dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
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
                                (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_layer_a) &&
                                (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_layer_b) &&
                                (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_localIndex_a) &&
                                (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_localIndex_b)
                            )
    
                            if (!test_matches)
                                break
                            
                            const edge_test = (four_times_edge_axis) | edge_quadrant_test
                            cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = invalid_layer
                            cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = invalid_localIndex
                            
                            const circular_quadrant_prev = (circular_quadrant + 3) & 0b11
                            const face_next = faces_next[four_times_edge_axis | circular_quadrant_prev]
    
                            const dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                            const dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
    
                            if (dual_cell_layer_adjacent === invalid_layer)
                                break
    
                            // it should be valid because a "tent" can only be formed between two triagonal corners 
    
                            dual_cell_layer_current = dual_cell_layer_adjacent
                            dual_cell_localIndex_current = dual_cell_localIndex_adjacent
                        }
                        else {
                            const dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                            
                            dual_cell_layer_current = dual_cell_layer_adjacent
                            dual_cell_localIndex_current = dual_cell_localIndex_adjacent
    
                            if (triangulation_start_vertex === -1)
                                triangulation_start_vertex = polygon_points
    
                            if (++circular_quadrant == 4) circular_quadrant = 0
                        }
                    }
                    
                    return false
                }

                // these faces are not ordered by edge_quadrant, but by a circular quadrant
                // this number wraps around by adjacent quadrants, like in algebra
                let circular_quadrant: Quadrant = (edge2circular_quadrant_mapping[edge_quadrant_initial] + 2) & 0b11

                let dual_cell_layer_current = dual_cell_layer_initial
                let dual_cell_localIndex_current = dual_cell_localIndex_initial

                let triangulation_start_vertex = -1

                do {
                    const current_surfacePoint_x = surfacePoints[dual_cell_layer_current][(3 * dual_cell_localIndex_current) + 0]
                    if (Number.isNaN(current_surfacePoint_x) || !Number.isFinite(current_surfacePoint_x))
                        return invalidate()

                    const edge_quadrant_current = circular2edge_quadrant_mapping[circular_quadrant]
                    const edge_current = (four_times_edge_axis) | edge_quadrant_current
                    
                    cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = layer // = new_polygon_layer
                    cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_current] = new_polygon_localIndex

                    new_polygon_vertices_dualCells_layers[polygon_vertices_offset + polygon_points] = dual_cell_layer_current
                    new_polygon_vertices_dualCells_localIndices[polygon_vertices_offset + polygon_points] = dual_cell_localIndex_current

                    const face_next = faces_next[four_times_edge_axis | circular_quadrant]
                    
                    const dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
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
                            (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_layer_a) &&
                            (dual_cells_vertices_layers[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_layer_b) &&
                            (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_a] === edge_vertex_localIndex_a) &&
                            (dual_cells_vertices_localIndices[dual_cell_layer_current][(8 * dual_cell_localIndex_current) | vertex_test_b] === edge_vertex_localIndex_b)
                        )

                        if (!test_matches)
                            return invalidate()
                        
                        const edge_test = (four_times_edge_axis) | edge_quadrant_test
                        cells_polygons_by_edge_layers[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = layer // = new_polygon_layer
                        cells_polygons_by_edge_localIndices[dual_cell_layer_current][(12 * dual_cell_localIndex_current) + edge_test] = new_polygon_localIndex
                        
                        const circular_quadrant_prev = (circular_quadrant + 3) & 0b11
                        const face_next = faces_next[four_times_edge_axis | circular_quadrant_prev]

                        const dual_cell_layer_adjacent = dual_cells_neighbors_layers[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                        const dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]

                        if (dual_cell_layer_adjacent === invalid_layer)
                            return invalidate()

                        // it should be valid because a "tent" can only be formed between two triagonal corners 

                        dual_cell_layer_current = dual_cell_layer_adjacent
                        dual_cell_localIndex_current = dual_cell_localIndex_adjacent
                    }
                    else {
                        const dual_cell_localIndex_adjacent = dual_cells_neighbors_localIndices[dual_cell_layer_current][(6 * dual_cell_localIndex_current) + face_next]
                        
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
                
                new_polygon_by_edges_layers[(2 * polygon_index) + 0] = edge_vertex_above_a ? edge_vertex_layer_a : edge_vertex_layer_b
                new_polygon_by_edges_layers[(2 * polygon_index) + 1] = edge_vertex_above_b ? edge_vertex_layer_a : edge_vertex_layer_b
                new_polygon_by_edges_localIndices[(2 * polygon_index) + 0] = edge_vertex_above_a ? edge_vertex_localIndex_a : edge_vertex_localIndex_b
                new_polygon_by_edges_localIndices[(2 * polygon_index) + 1] = edge_vertex_above_b ? edge_vertex_localIndex_a : edge_vertex_localIndex_b

                //TODO: is this the right time to triangulate the polygon?
                let x: number, y: number, z: number

                // at this point, triangulation_start_vertex is >= 0

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
                    
                    dual_cell_subdivide_recommendation_surfaceIntersects.set(polygon_vertex_dual_cell_layer, polygon_vertex_dual_cell_localIndex, true)
                }

                return true
            }

            for (let primary_localIndex_group = 0; primary_localIndex_group < number_subdivided_primary_cells; primary_localIndex_group++) {
                const primary_children_localIndex_offset = 8 * primary_localIndex_group
                for (let primary_subcell = 0; primary_subcell < 8; primary_subcell++) {
                    const primary_child_layer = layer
                    const primary_child_localIndex = primary_children_localIndex_offset | primary_subcell
                    for (let corner = 0; corner < 8; corner++) {
                        const dual_cell_layer = dual_cells_lookup_corners_layers[primary_child_layer][(8 * primary_child_localIndex) | corner]
                        if (dual_cell_layer === invalid_layer) continue
                        const dual_cell_localIndex = dual_cells_lookup_corners_localIndices[primary_child_layer][(8 * primary_child_localIndex) | corner]
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

            item[SurfaceNetKey] = {
                cells: {
                    surfacePoints: surfacePoints[layer],
                    polygons_by_edge: new_polygons_by_edge
                },
                polygons: {
                    edges: {
                        // already in the context tree
                        layers: new_polygon_by_edges_layers,
                        localIndices: new_polygon_by_edges_localIndices,
                    },
                    vertices: {
                        offsets: arrayCopy(new_polygon_vertices_offsets, context[SurfaceNetKey].polygons.vertices.offsets.subdivide(number_polygons_added + 1)),
                        dual_cells: arrayCopy(
                            {
                                layers: new_polygon_vertices_dualCells_layers,
                                localIndices: new_polygon_vertices_dualCells_localIndices
                            },
                            context[SurfaceNetKey].polygons.vertices.dual_cells.subdivide(new_polygon_vertices_offsets[new_polygon_localIndex])
                        ),
                    },
                    triangulation_start: arrayCopy(new_polygon_triangulation_start, context[SurfaceNetKey].polygons.triangulation_start.subdivide(number_polygons_added)),
                }
            }
            
            const subdivide_recommendation_surfaceIntersects_primary = new Uint8Array(8 * number_subdivided_primary_cells)
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