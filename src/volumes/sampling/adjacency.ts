import { SubdivisionAdjacency } from "../../paradigm/octtree/adjacency.js";
import { SubdivisionKey } from "../../paradigm/octtree/processor.js";
import { OctTreesTemplated } from "../../paradigm/octtree/templated.js";
import { ProcessorInitialization } from "../../paradigm/processing/processor.js";
import { MultiObjectsGroupsTemplate } from "../../paradigm/trees/multi-objects-groups.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { VolumeProcessingContext, VolumeProcessor } from "../processor.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../volume.js";
import { VolumeWithBoundingBox } from "../volumes/bounded.js";
import { SamplingKey, VolumeProcessingWithSampling } from "./types.js";

export const AdjacencyKey = Symbol("adjacency")

export interface VolumeProcessingWithSamplingWithAdjacency<
            IndicesT extends IndicesTypedArray = IndicesTypedArray,
            OctTreeGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            OctTreeTGrouped extends any = any,
            OctTreeLayersGrouped extends any = any,
            OctTreesGrouped extends
                OctTreesTemplated<
                        OctTreeGroups,
                        OctTreeTGrouped,
                        OctTreeLayersGrouped
                    > =
                OctTreesTemplated<
                        OctTreeGroups,
                        OctTreeTGrouped,
                        OctTreeLayersGrouped
                    >,
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
        >
    extends VolumeProcessingWithSampling<
            IndicesT,
            OctTreeGroups,
            OctTreeTGrouped,
            OctTreeLayersGrouped,
            OctTreesGrouped,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT
        > {
    [SamplingKey]: VolumeProcessingWithSampling<
        IndicesT,
        OctTreeGroups,
        OctTreeTGrouped,
        OctTreeLayersGrouped,
        OctTreesGrouped,
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
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
            VolumeProcessingWithSamplingWithAdjacency<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
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
            VolumeProcessingWithSamplingWithAdjacency<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
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
            VolumeProcessingContext<VolumeSampleProcessingContextT> =
            VolumeProcessingContext<VolumeSampleProcessingContextT>,
    > implements
    VolumeProcessor<
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

    private constructor() { }
    public static readonly instance = new this()
}