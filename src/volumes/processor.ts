import { Processor } from "../paradigm/processing/index.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSampleKey, VolumeSamplingContext } from "./volume.js";

export const VolumeKey = Symbol("volume")

export interface VolumeProcessing<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            Volume<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>
    > {
    [VolumeKey]: VolumeT
}

export interface VolumeProcessingContext<
        VolumeSampleProcessingContextT = any,
    > {
    [VolumeSampleKey]: VolumeSampleProcessingContextT
}

export interface VolumeProcessor<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            Volume<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        VolumeProcessingT extends
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
                >,
        VolumeProcessingContextT extends
            VolumeProcessingContext<VolumeSampleProcessingContextT> =
            VolumeProcessingContext<VolumeSampleProcessingContextT>,
    > extends
    Processor<VolumeProcessingT, VolumeProcessingContextT> {
}