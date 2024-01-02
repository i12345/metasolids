import { Vec3 } from "playcanvas-physics-advanced";
import { DualKey, OctTreeWithDualGroups, OctTreeWithDualLayer, OctTreeWithDualLayersGrouped, OctTreeWithDualOctTreesGrouped, OctTreeWithDualValue, OctTreeWithDualValuesGrouped } from "../../paradigm/octtree/dual.js";
import { ProcessorInitialization } from "../../paradigm/processing/processor.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { SpaceKey, VolumeProcessingContextWithSampling, VolumeProcessingWithSampling, VolumeSamplingContextKey, VolumeSamplingSubdivisionProcessor, VolumeSamplingSubdivisionSamplesGroupsTemplate } from "../../volumes/sampling/index.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext, defaultVolumeSampleField } from "../../volumes/volume.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { VolumeProcessingWithSurfacesContext, VolumeSurfacesKey } from "../volume-surfaces.js";
import { OctTreeSpace } from "../../paradigm/octtree/space.js";
import { SubdivisionKey } from "../../paradigm/octtree/processor.js";
import { EncapsulatingKey, WithEncapsulating } from "../../paradigm/trees/encapsulating.js";
import { SurfaceNetKey, SurfaceNetVolumeSamplingSubdivisionProcessing, SurfaceNetVolumeSamplingSubdivisionProcessingContext, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayer, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValue, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped, SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped } from "./surface-net.js";
import { Axis, DiagonalDirection, Direction, OctTreeCell, Quadrant } from "../../paradigm/octtree/address.js";
import { SurfaceProcessingContext } from "../processing.js";
import { groupPaths } from "../../paradigm/trees/multi-objects-groups.js";
import { FieldsField } from "../../fields/fields/fields.js";
import { Field, FieldsPointMapped } from "../../fields/index.js";

export interface VolumeSamplingContextWithSurfaceHints<
        LocationT extends VolumeLocation = VolumeLocation,
        LocationElementType extends VolumeLocation = LocationT,
        LocationFuseMode extends VolumeLocation = LocationT,
        SampleProcessingContextT = any
    >
    extends VolumeSamplingContext<
        LocationT,
        LocationElementType,
        LocationFuseMode,
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
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            > =
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            >,
        VolumeSamplingContextT extends
            VolumeSamplingContextWithSurfaceHints<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                > =
            VolumeSamplingContextWithSurfaceHints<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                >,
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
                    OctTreeWithDualLayersGrouped,
                    OctTreeWithDualOctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped,
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
                    OctTreeWithDualLayersGrouped,
                    OctTreeWithDualOctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped,
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
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > &
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped,
                    OctTreeWithDualOctTreesGrouped,
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
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
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
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped,
                    OctTreeWithDualOctTreesGrouped,
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
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped,
                    SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                >
    > implements
    VolumeSamplingSubdivisionProcessor<
            IndicesT,
            OctTreeWithDualGroups,
            OctTreeWithDualValuesGrouped,
            OctTreeWithDualLayersGrouped,
            OctTreeWithDualOctTreesGrouped,
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
            VolumeProcessingContextT,
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
                        VolumeProcessingT//,
                        // VolumeProcessingContextT
                    >,
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
        context[VolumeSamplingContextKey][VolumeSurfacesKey] = {
            surfaceLevel: context[EncapsulatingKey][VolumeSurfacesKey].surfaceLevel,
            hints: []
        }

        return {
            connections: {
                inputs: [...groupPaths(
                    VolumeSamplingSubdivisionSamplesGroupsTemplate(
                        new FieldsField<VolumeSampleT, VolumeSampleElementType, VolumeSampleFuseMode>({
                            alpha: defaultVolumeSampleField.fields.alpha
                        } as FieldsPointMapped<VolumeSampleT, Field>)
                    )
                )],
                outputs: []
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
                    VolumeProcessingT//,
                    // VolumeProcessingContextT
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
                >
        ): void {
        const subdivision = context[SubdivisionKey]
        const layer = subdivision.depth
        const invalid_layer = new Uint8Array([-1])[0]
        const surfaceLevel = context[VolumeSamplingContextKey][VolumeSurfacesKey].surfaceLevel
        const dual_cells = context[DualKey].cells

        const dual_cells_lookup_layer = dual_cells.lookup.corners.layers.layers[layer]
        const dual_cells_lookup_localIndices = dual_cells.lookup.corners.localIndices.layers[layer]

        const polygons_by_edge_layers = context[SurfaceNetKey].dual_cells.polygons_by_edge.layers.layers
        const polygons_by_edge_localIndices = context[SurfaceNetKey].dual_cells.polygons_by_edge.localIndices.layers

        const recommendation_pre = new Uint8Array(subdivision.layer_sizes[layer])

        for (const hint_array of context[VolumeSamplingContextKey][VolumeSurfacesKey].hints) {
            //TODO: support different parameter & return types for vectorized functions

            const { layer: layers, local_index: local_indices } = OctTreeSpace.vectorized.indexOfPosition.call(context[SpaceKey], hint_array)

            for (let i = 0; i < layers.length; i++) {
                if (layers[i] === layer) {
                    const localIndex = local_indices[i]

                    const is_interior = item.samples.alpha[localIndex] >= surfaceLevel

                    let hasPolygon = false

                    if (!is_interior) {
                        for (let triagonal_corner = 0; triagonal_corner < 8; triagonal_corner++) {
                            const dual_cell_layer = dual_cells_lookup_layer[(8 * localIndex) + triagonal_corner]
                            if(dual_cell_layer === invalid_layer) continue
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