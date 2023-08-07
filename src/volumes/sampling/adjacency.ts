import { SubdivisionAdjacency } from "../../paradigm/octtree/adjacency.js";
import { SubdivisionKey } from "../../paradigm/octtree/processor.js";
import { ArrayLikeTemplated, OctTreesTemplated } from "../../paradigm/octtree/templated.js";
import { ProcessorInitialization } from "../../paradigm/processing/processor.js";
import { MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped } from "../../paradigm/trees/multi-objects-groups.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { VolumeProcessingContext, VolumeProcessor } from "../processor.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../volume.js";
import { VolumeWithBoundingBox } from "../volumes/bounded.js";
import { SamplingKey, VolumeProcessingWithSampling } from "./types.js";

export const AdjacencyKey = Symbol("adjacency")

export interface VolumeProcessingWithSamplingWithAdjacency<
            IndicesT extends IndicesTypedArray = IndicesTypedArray,
            OctTreeGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            OctTreeT = any,
            OctTreeTGrouped extends
                MultiObjectsGroupsMapped<
                        OctTreeGroups,
                        OctTreeT
                    > =
                MultiObjectsGroupsMapped<
                        OctTreeGroups,
                        OctTreeT
                    >,
            OctTreeLayer extends ArrayLike<OctTreeT> = ArrayLike<OctTreeT>,
            OctTreeLayersGrouped extends
                // MultiObjectsGroupsMapped<
                //         OctTreeGroups,
                //         OctTreeLayer
                //     > &
                ArrayLikeTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped
                    > =
                // MultiObjectsGroupsMapped<
                //         OctTreeGroups,
                //         OctTreeLayer
                //     > &
                ArrayLikeTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped
                    >,
            OctTreesGrouped extends
                OctTreesTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped,
                        OctTreeLayer,
                        OctTreeLayersGrouped
                    > =
                OctTreesTemplated<
                        OctTreeGroups,
                        OctTreeT,
                        OctTreeTGrouped,
                        OctTreeLayer,
                        OctTreeLayersGrouped
                    >,
            VolumeLocationT extends VolumeLocation = VolumeLocation,
            VolumeSampleT extends VolumeSample = VolumeSample,
            VolumeSampleProcessingContextT = any,
            VolumeSamplingContextT extends
                VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
                VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
            VolumeT extends
                VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
                VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>
        >
    extends VolumeProcessingWithSampling<
            IndicesT,
            OctTreeGroups,
            OctTreeT,
            OctTreeTGrouped,
            OctTreeLayer,
            OctTreeLayersGrouped,
            OctTreesGrouped,
            VolumeLocationT,
            VolumeSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT
        > {
    [SamplingKey]: VolumeProcessingWithSampling<
        IndicesT,
        OctTreeGroups,
        OctTreeT,
        OctTreeTGrouped,
        OctTreeLayer,
        OctTreeLayersGrouped,
        OctTreesGrouped,
        VolumeLocationT,
        VolumeSampleT,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT
    >[typeof SamplingKey] & {
        [AdjacencyKey]: SubdivisionAdjacency<IndicesT>
    }
}

export class VolumeWithSamplingWithAdjacencyProcessor<
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
            VolumeProcessingWithSamplingWithAdjacency<
                    IndicesT,
                    {},
                    any,
                    {},
                    any,
                    {},
                    {},
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSamplingWithAdjacency<
                    IndicesT,
                    {},
                    any,
                    {},
                    any,
                    {},
                    {},
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingContext<VolumeSampleProcessingContextT> =
            VolumeProcessingContext<VolumeSampleProcessingContextT>,
    > implements
    VolumeProcessor<
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
                inputs: [[SamplingKey, SubdivisionKey]],
                outputs: [[SamplingKey, AdjacencyKey]]
            }
        }
    }

    process(item: VolumeProcessingT, context: VolumeProcessingContextT): void {
        item[SamplingKey][AdjacencyKey] = new SubdivisionAdjacency(item[SamplingKey][SubdivisionKey])
    }
}