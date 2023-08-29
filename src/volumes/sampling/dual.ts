import { OctTreeWithDualGroups, OctTreeWithDualLayersGrouped, OctTreeWithDualOctTreesGrouped, OctTreeWithDualValuesGrouped } from "../../paradigm/octtree/dual.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { VolumeProcessing } from "../processor.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../volume.js";
import { VolumeWithBoundingBox } from "../volumes/bounded.js";
import { VolumeProcessingContextWithSampling, VolumeSamplingSubdivisionProcessing, VolumeSamplingSubdivisionProcessingContext } from "./types.js";

export type VolumeSamplingSubdivisionProcessingWithDual<
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
    VolumeSamplingSubdivisionProcessing<
            IndicesT,
            OctTreeWithDualGroups,
            OctTreeWithDualValuesGrouped,
            OctTreeWithDualLayersGrouped, // <IndicesT>,
            OctTreeWithDualOctTreesGrouped, // <IndicesT>,
            VolumeLocationT,
            VolumeSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            VolumeProcessingT
        >
        
export type VolumeSamplingSubdivisionProcessingContextWithDual<
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
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped, //<IndicesT>,
                    OctTreeWithDualOctTreesGrouped, //<IndicesT>,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > =
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    OctTreeWithDualGroups,
                    OctTreeWithDualValuesGrouped,
                    OctTreeWithDualLayersGrouped, //<IndicesT>,
                    OctTreeWithDualOctTreesGrouped, //<IndicesT>,
                    VolumeLocationT,
                    VolumeSampleT,
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
            VolumeSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeProcessingContextT
        >