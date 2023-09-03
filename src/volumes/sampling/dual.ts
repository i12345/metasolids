import { OctTreeWithDualGroups, OctTreeWithDualLayersGrouped, OctTreeWithDualOctTreesGrouped, OctTreeWithDualValuesGrouped } from "../../paradigm/octtree/dual.js";
import { WithMultiObjectsIDs } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { VolumeProcessing } from "../processor.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../volume.js";
import { VolumeWithBoundingBox } from "../volumes/bounded.js";
import { VolumeProcessingContextWithSampling, VolumeSamplingSubdivisionProcessing, VolumeSamplingSubdivisionProcessingContext } from "./types.js";

export type VolumeSamplingSubdivisionProcessingWithDual<
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
    VolumeSamplingSubdivisionProcessing<
            IndicesT,
            OctTreeWithDualGroups,
            OctTreeWithDualValuesGrouped,
            OctTreeWithDualLayersGrouped, // <IndicesT>,
            OctTreeWithDualOctTreesGrouped, // <IndicesT>,
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

export type VolumeSamplingSubdivisionProcessingContextWithDual<
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
            WithMultiObjectsIDs &
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped, //<IndicesT>,
                    OctTreeWithDualOctTreesGrouped, //<IndicesT>,
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
            WithMultiObjectsIDs &
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped, //<IndicesT>,
                    OctTreeWithDualOctTreesGrouped, //<IndicesT>,
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
    > =
    VolumeSamplingSubdivisionProcessingContext<
            IndicesT,
            OctTreeWithDualGroups,
            OctTreeWithDualValuesGrouped,
            OctTreeWithDualLayersGrouped, // <IndicesT>,
            OctTreeWithDualOctTreesGrouped, //<IndicesT>,
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