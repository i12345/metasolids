import { Surface, SurfaceProcessingContext } from "../../surfaces/index.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/index.js";
import { AdjacencyKey, SamplingKey, SpaceKey, VolumeProcessingWithSamplingWithAdjacency } from '../../volumes/sampling/index.js'
import { SolidProcessingContext } from "../processor.js";
import { VolumeProcessingWithSolids, VolumeSolidProcessing, VolumeSolidProcessingContext, VolumeSolidProcessor } from "../volume-solids.js"
import { Solid } from "../solid.js";
import { EncapsulatingKey, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/index.js";
import { OctTreeReferencesOctTreeLayersGrouped } from "../../paradigm/octtree/references.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { SubdivisionKey } from "../../paradigm/octtree/processor.js";
import { DualKey, OctTreeWithDualGroups, OctTreeWithDualLayer, OctTreeWithDualLayersGrouped, OctTreeWithDualOctTreesGrouped, OctTreeWithDualValue, OctTreeWithDualValuesGrouped } from "../../paradigm/octtree/dual.js";

export const VolumeVoxelsKey = Symbol("voxels")
export const TotalVolumeKey = "totalVolume"

export interface SolidWithEnclosingVolume<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeSampleT extends VolumeSample = VolumeSample,
        SurfaceT extends Surface<IndicesT, VolumeSampleT> = Surface<IndicesT, VolumeSampleT>
    >
    extends Solid<IndicesT, VolumeSampleT, SurfaceT> {
    [VolumeVoxelsKey]: OctTreeReferencesOctTreeLayersGrouped<IndicesT>
    [TotalVolumeKey]: number
}

export type SolidVoxelsGroup = {
    [VolumeVoxelsKey]: MultiObjectsGroupsTemplateLeaf
}

export const SolidVoxelsGroupTemplate: SolidVoxelsGroup = {
    [VolumeVoxelsKey]: MultiObjectsGroupsTemplate_Leaf
}

export class SolidWithEnclosingVolumeProcessor<
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
        SurfaceT extends Surface<IndicesT, VolumeSampleT> = Surface<IndicesT, VolumeSampleT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        SolidT extends
            SolidWithEnclosingVolume<IndicesT, VolumeSampleT, SurfaceT> =
            SolidWithEnclosingVolume<IndicesT, VolumeSampleT, SurfaceT>
    > implements
    VolumeSolidProcessor<
            IndicesT,
            VolumeLocationT,
            VolumeSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceProcessingContextT,
            SolidT,
            SolidProcessingContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                > &
            VolumeProcessingWithSamplingWithAdjacency<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValue,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayer, // <IndicesT>,
                    OctTreeWithDualLayersGrouped, // <IndicesT>,
                    OctTreeWithDualOctTreesGrouped, // <IndicesT>,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >
        > {
    init(context: VolumeSolidProcessingContext<
            VolumeSampleProcessingContextT,
            SurfaceProcessingContextT
        >) {
        const connections = {
            inputs: [
                ['surface', 'mesh']
            ],
            outputs: [
                [VolumeVoxelsKey],
                [TotalVolumeKey],
            ]
        }

        return { connections }
    }

    process(
            solid: VolumeSolidProcessing<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT,
                    VolumeProcessingWithSolids<
                            IndicesT,
                            VolumeLocationT,
                            VolumeSampleT,
                            VolumeSampleProcessingContextT,
                            VolumeSamplingContextT,
                            VolumeT,
                            SurfaceT,
                            SolidT
                        > &
                    VolumeProcessingWithSamplingWithAdjacency<
                            IndicesT,
                            OctTreeWithDualGroups,
                            OctTreeWithDualValue,
                            OctTreeWithDualValuesGrouped,
                            OctTreeWithDualLayer, // <IndicesT>,
                            OctTreeWithDualLayersGrouped, // <IndicesT>,
                            OctTreeWithDualOctTreesGrouped, // <IndicesT>,
                            VolumeLocationT,
                            VolumeSampleT,
                            VolumeSampleProcessingContextT,
                            VolumeSamplingContextT,
                            VolumeT
                        >
                >,
            context: VolumeSolidProcessingContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT
            >
        ): void {
        const sampling = solid[EncapsulatingKey][SamplingKey]
        const subdivision = sampling[SubdivisionKey]
        const adjacency = sampling[AdjacencyKey]
        const surfaceLevel = context.surface.surfaceLevel

        const voxels = {
            layers: <number[]>[],
            localIndices: <number[]>[]
        }

        const initial_dual_cell_layer = solid.surface.mesh.dualCellReferences.layers[0]
        const initial_dual_cell_localIndex = solid.surface.mesh.dualCellReferences.localIndices[0]

        for (let corner = 0; corner < 8; corner++){
            const corner_primary_layer = sampling[DualKey].cells.vertices.layers.layers[initial_dual_cell_layer][(8 * initial_dual_cell_localIndex) + corner]
            const corner_primary_localIndex = sampling[DualKey].cells.vertices.localIndices.layers[initial_dual_cell_layer][(8 * initial_dual_cell_localIndex) + corner]
            
            if (sampling.samples.layers[corner_primary_layer][corner_primary_localIndex].alpha > surfaceLevel) {
                voxels.layers.push(corner_primary_layer)
                voxels.localIndices.push(corner_primary_localIndex)
                break
            }
        }

        const layersVoxelsCount = new Uint32Array(subdivision.depth + 1).fill(0)
        
        for (let i = 0; i < voxels.layers.length; i++) {
            const cell_layer = voxels.layers[i]
            const cell_localIndex = voxels.localIndices[i]

            layersVoxelsCount[cell_layer]++

            for (let adjacent_direction = 0; adjacent_direction < 6; adjacent_direction++) {
                const layout_offset = adjacency.layout.offset.layers[cell_layer][(6 * cell_localIndex) + adjacent_direction]
                const layout_count = adjacency.layout.offset.layers[cell_layer][(6 * cell_localIndex) + adjacent_direction]

                for (let reference_localIndex = 0; reference_localIndex < layout_count; reference_localIndex++) {
                    const neighbor_layer = adjacency.references.layers.layers[cell_layer][layout_offset + reference_localIndex]
                    const neighbor_localIndex = adjacency.references.localIndices.layers[cell_layer][layout_offset + reference_localIndex]

                    if (sampling.samples.layers[neighbor_layer][neighbor_localIndex].alpha < surfaceLevel) continue
                    
                    voxels.layers.push(neighbor_layer)
                    voxels.localIndices.push(neighbor_localIndex)
                }
            }
        }

        let totalVolume = 0
        for (let layer = layersVoxelsCount.length - 1; layer >= 0; layer--) {
            totalVolume /= 8
            totalVolume += layersVoxelsCount[layer]
        }
        totalVolume *= ((2 * sampling[SpaceKey].halfExtent) ** 3)

        solid[TotalVolumeKey] = totalVolume
        solid[VolumeVoxelsKey] = {
            layers: new Uint8Array(voxels.layers),
            localIndices: new subdivision.typedArray(voxels.localIndices) as IndicesT
        }
    }

    private constructor() { }

    static readonly instance = new this()
}