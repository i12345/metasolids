import { Processor } from "../paradigm/processing/index.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSampleKey, VolumeSamplingContext } from "./volume.js";

export const VolumeKey = Symbol("volume")

export interface VolumeProcessing<
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
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
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
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
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
                >,
        VolumeProcessingContextT extends
            VolumeProcessingContext<VolumeSampleProcessingContextT> =
            VolumeProcessingContext<VolumeSampleProcessingContextT>,
    > extends
    Processor<VolumeProcessingT, VolumeProcessingContextT> {
}