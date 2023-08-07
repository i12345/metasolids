import { Vec3 } from "playcanvas-extended";
import { DualKey, OctTreeWithDualGroups, OctTreeWithDualLayer, OctTreeWithDualLayersGrouped, OctTreeWithDualOctTreesGrouped, OctTreeWithDualValue, OctTreeWithDualValuesGrouped } from "../../paradigm/octtree/dual.js";
import { ProcessorInitialization } from "../../paradigm/processing/processor.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { SamplingKey, SpaceKey, VolumeProcessingContextWithSampling, VolumeProcessingWithSampling, VolumeSamplingContextKey, VolumeSamplingSubdivisionProcessing, VolumeSamplingSubdivisionProcessingContext, VolumeSamplingSubdivisionProcessor, VolumeSamplingSubdivisionSamplesGroupsTemplate } from "../../volumes/sampling/index.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/volume.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { VolumeProcessingWithSurfacesContext, VolumeSurfacesKey } from "../volume-surfaces.js";
import { OctTreeSpace } from "../../paradigm/octtree/space.js";
import { SubdivisionKey } from "../../paradigm/octtree/processor.js";
import { EncapsulatingKey, WithEncapsulating } from "../../paradigm/trees/encapsulating.js";
import { SurfaceNetKey, SurfaceNetVolumeSamplingSubdivisionProcessing, SurfaceNetVolumeSamplingSubdivisionProcessingContext, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayer, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValue, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped } from "./surface-net.js";
import { Axis, DiagonalDirection, Direction, OctTreeCell, Quadrant } from "../../paradigm/octtree/address.js";
import { SurfaceProcessingContext } from "../processing.js";
import { groupPaths } from "../../paradigm/trees/multi-objects-groups.js";

export interface VolumeSamplingContextWithSurfaceHints<
        LocationT extends VolumeLocation = VolumeLocation,
        SampleProcessingContextT = any
    >
    extends VolumeSamplingContext<
        LocationT,
        SampleProcessingContextT
    > {
    [VolumeSurfacesKey]: {
        surfaceLevel: number

        /**
         * packed xyz arrays of hint points, for each object that gives surface hints
         * 
         * The surface hint volume sampling subdivision processor will recommend
         * subdivision for each exterior primary sample that contains a hint point
         * if the sample does not form the edge of any polygon
         * 
         * Actually, these may just be used for paper-thin sampling
         */
        hints: Float32Array[]
    }
}

export class SurfaceHintVolumeSamplingSubdivisionProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            > =
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            >,
        VolumeSamplingContextT extends
            VolumeSamplingContextWithSurfaceHints<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContextWithSurfaceHints<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValue,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayer,
                    OctTreeWithDualLayersGrouped,
                    OctTreeWithDualOctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValue,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayer,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped,
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
                    OctTreeWithDualLayer,
                    OctTreeWithDualLayersGrouped,
                    OctTreeWithDualOctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValue,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayer,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > &
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValue,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayer,
                    OctTreeWithDualLayersGrouped,
                    OctTreeWithDualOctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > &
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValue,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayer,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > &
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValue,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayer,
                    OctTreeWithDualLayersGrouped,
                    OctTreeWithDualOctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > &
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValue,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayer,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                >
    > implements
    VolumeSamplingSubdivisionProcessor<
            IndicesT,
            OctTreeWithDualGroups,
            OctTreeWithDualValue,
            OctTreeWithDualValuesGrouped,
            OctTreeWithDualLayer,
            OctTreeWithDualLayersGrouped,
            OctTreeWithDualOctTreesGrouped,
            VolumeLocationT,
            VolumeSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            VolumeProcessingT,
            VolumeProcessingContextT,
            WithEncapsulating<VolumeProcessingT> &
                SurfaceNetVolumeSamplingSubdivisionProcessing<
                        IndicesT,
                        VolumeLocationT,
                        VolumeSampleT,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeT,
                        VolumeProcessingT//,
                        // VolumeProcessingContextT
                    >,
            SurfaceNetVolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                >
        > {
    init(context: SurfaceNetVolumeSamplingSubdivisionProcessingContext<
            IndicesT,
            VolumeLocationT,
            VolumeSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeProcessingContextT
        >): ProcessorInitialization {
        context[VolumeSamplingContextKey][VolumeSurfacesKey] = {
            surfaceLevel: context[EncapsulatingKey][VolumeSurfacesKey].surfaceLevel,
            hints: []
        }
        
        return {
            connections: {
                //TODO: specialize for just presence
                inputs: [...groupPaths(VolumeSamplingSubdivisionSamplesGroupsTemplate<VolumeSampleT>())],
                outputs: []
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
                    VolumeProcessingT//,
                    // VolumeProcessingContextT
                >,
            context: SurfaceNetVolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                >
        ): void {
        const subdivision = context[SubdivisionKey]
        const layer = subdivision.depth
        const invalid_layer = new Uint8Array([-1])[0]
        const surfaceLevel = context[VolumeSamplingContextKey][VolumeSurfacesKey].surfaceLevel
        const dual_cells = context[DualKey].cells

        const dual_cells_lookup_layer = dual_cells.lookup.corners.layers.layers[layer]
        const dual_cells_lookup_localIndices = dual_cells.lookup.corners.localIndices.layers[layer]
        
        const polygons_by_edge_layers = context[SurfaceNetKey].cells.polygons_by_edge.layers.layers
        const polygons_by_edge_localIndices = context[SurfaceNetKey].cells.polygons_by_edge.localIndices.layers

        const recommendation_pre = new Uint8Array(subdivision.layer_sizes[layer])

        for (const hint_array of context[VolumeSamplingContextKey][VolumeSurfacesKey].hints) {
            //TODO: support different parameter & return types for vectorized functions

            const positions = new Array<Vec3>(hint_array.length / 3)
            let hint_array_offset = 0
            for (let i = 0; i < positions.length; i++)
                positions[i] = new Vec3(hint_array[hint_array_offset++], hint_array[hint_array_offset++], hint_array[hint_array_offset++])
            
            const layerLocalIndices = OctTreeSpace.vectorized.indexOfPosition.call(context[SpaceKey], positions)

            for (let i = 0; i < layerLocalIndices.length; i++) {
                if (layerLocalIndices[i].layer === layer) {
                    const localIndex = layerLocalIndices[i].local_index
                    
                    const is_interior = item.samples[localIndex].alpha >= surfaceLevel

                    let hasPolygon = false

                    if (!is_interior) {
                        for (let triagonal_corner = 0; triagonal_corner < 8; triagonal_corner++) {
                            const dual_cell_layer = dual_cells_lookup_layer[(8 * localIndex) + triagonal_corner]
                            const dual_cell_localIndex = dual_cells_lookup_localIndices[(8 * localIndex) + triagonal_corner]

                            const polygons_by_edge_offset = 12 * dual_cell_localIndex
                            const polygons_by_edge_layers_1 = polygons_by_edge_layers[dual_cell_layer]
                            const polygons_by_edge_localIndices_1 = polygons_by_edge_localIndices[dual_cell_layer]

                            for (let plane_axis = 0; plane_axis < 3; plane_axis++) {
                                const axis_1 = <Axis>((plane_axis + 1) % 3)
                                const axis_2 = <Axis>((plane_axis + 2) % 3)

                                const cell_mask_plane = <OctTreeCell>(1 << plane_axis)
                                const cell_mask_1 = <OctTreeCell>(1 << axis_1)
                                const cell_mask_2 = <OctTreeCell>(1 << axis_2)

                                const direction_1 = (triagonal_corner & cell_mask_1) === cell_mask_1 ? Direction.Positive : Direction.Negative
                                const direction_2 = (triagonal_corner & cell_mask_2) === cell_mask_2 ? Direction.Positive : Direction.Negative

                                const plane_quadrant: Quadrant = direction_1 + (2 * direction_2)

                                const diagonal_direction = <DiagonalDirection>((plane_axis * 4) + plane_quadrant)

                                const polygon_layer = polygons_by_edge_layers_1[polygons_by_edge_offset + diagonal_direction]
                                // const polygon_localIndex = polygons_by_edge_localIndices_1[polygons_by_edge_offset + diagonal_direction]

                                if (polygon_layer !== invalid_layer) {
                                    hasPolygon = true
                                    break
                                }
                            }

                            if (hasPolygon) break
                        }
                    }
                    
                    if (!hasPolygon && !is_interior)
                        recommendation_pre[localIndex]++
                }
            }
        }

        const recommendation = item[SubdivisionKey].recommendation.layers[layer]
        for (let localIndex = 0; localIndex < recommendation_pre.length; localIndex++)
            if (recommendation_pre[localIndex] > 0)
                recommendation[localIndex]++
    }

    private constructor() { }
    public static readonly instance = new this()
}