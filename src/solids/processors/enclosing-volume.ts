import { Surface, SurfaceProcessingContext } from "../../surfaces/index.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/index.js";
import { AdjacencyKey, SamplesKey, SamplingKey, SpaceKey, VolumeProcessingWithSamplingWithAdjacency, VolumeSamplingSubdivisionSamplesOctTreesGrouped } from '../../volumes/sampling/index.js'
import { SolidProcessingContext } from "../processor.js";
import { VolumeProcessingWithSolids, VolumeSolidProcessing, VolumeSolidProcessingContext, VolumeSolidProcessor } from "../volume-solids.js"
import { Solid } from "../solid.js";
import { EncapsulatingKey, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/index.js";
import { OctTreeReferencesOctTreeLayersGrouped } from "../../paradigm/octtree/references.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { SubdivisionKey } from "../../paradigm/octtree/processor.js";
import { DualKey, OctTreeWithDualGroups, OctTreeWithDualLayer, OctTreeWithDualLayersGrouped, OctTreeWithDualOctTreesGrouped, OctTreeWithDualValue, OctTreeWithDualValuesGrouped } from "../../paradigm/octtree/dual.js";
import HashTable from "@ronomon/hash-table"

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
                    OctTreeWithDualValuesGrouped,
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
                            OctTreeWithDualValuesGrouped,
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
        const sample_alpha = (<VolumeSamplingSubdivisionSamplesOctTreesGrouped>sampling)[SamplesKey].alpha.layers
        const subdivision = sampling[SubdivisionKey]
        const adjacency = sampling[AdjacencyKey]
        const surfaceLevel = context.surface.surfaceLevel

        const voxels = {
            layers: <number[]>[],
            localIndices: <number[]>[]
        }

        const lookup_key_buffer_size_min = subdivision.typedArray.BYTES_PER_ELEMENT + 1
        const lookup_key_buffer = Buffer.alloc(4 * Math.ceil(lookup_key_buffer_size_min / 4)).fill(0)
        const lookup_key_localIndex = new subdivision.typedArray(lookup_key_buffer.buffer, lookup_key_buffer.byteOffset + 0, 1)
        const lookup_key_layer = new Uint8Array(lookup_key_buffer.buffer, lookup_key_buffer.byteOffset + lookup_key_localIndex.byteLength, 1)
        const lookup_value_buffer = Buffer.alloc(1)
        const voxels_lookup = new HashTable(lookup_key_buffer.byteLength, 1, 0, subdivision.layer_sizes.reduce((acc, size) => acc + size))

        let layer: number, localIndex: number

        function add() {
            if (sample_alpha[layer][localIndex] < surfaceLevel)
                return
            
            lookup_key_layer[0] = layer
            lookup_key_localIndex[0] = localIndex
            if (voxels_lookup.exist(lookup_key_buffer, 0))
                return

            voxels.layers.push(layer)
            voxels.localIndices.push(localIndex)
            voxels_lookup.set(lookup_key_buffer, 0, lookup_value_buffer, 0)
        }

        const initial_dual_cell_layer = solid.surface.mesh.dualCellReferences.layers[0]
        const initial_dual_cell_localIndex = solid.surface.mesh.dualCellReferences.localIndices[0]

        for (let corner = 0; corner < 8; corner++){
            layer = sampling[DualKey].cells.vertices.layers.layers[initial_dual_cell_layer][(8 * initial_dual_cell_localIndex) + corner]
            localIndex = sampling[DualKey].cells.vertices.localIndices.layers[initial_dual_cell_layer][(8 * initial_dual_cell_localIndex) + corner]
            
            add()
        }

        const layersVoxelsCount = new Uint32Array(subdivision.depth + 1).fill(0)
        
        for (let i = 0; i < voxels.layers.length; i++) {
            const cell_layer = voxels.layers[i]
            const cell_localIndex = voxels.localIndices[i]

            layersVoxelsCount[cell_layer]++

            for (let adjacent_direction = 0; adjacent_direction < 6; adjacent_direction++) {
                const layout_offset = adjacency.layout.offset.layers[cell_layer][(6 * cell_localIndex) + adjacent_direction]
                const layout_count = adjacency.layout.count.layers[cell_layer][(6 * cell_localIndex) + adjacent_direction]

                for (let reference_localIndex = 0; reference_localIndex < layout_count; reference_localIndex++) {
                    layer = adjacency.references.layers.layers[cell_layer][layout_offset + reference_localIndex]
                    localIndex = adjacency.references.localIndices.layers[cell_layer][layout_offset + reference_localIndex]

                    add()
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