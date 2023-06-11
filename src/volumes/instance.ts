import { Instance, Instancer } from "../processing/instance.js";
import { VolumeProcessing } from "./processor.js";
import { SpaceTransformation } from "./space-transformation.js";
import { VolumeSample } from "./volume.js";

export interface VolumeProcessingInstance<
        SampleT extends VolumeSample = VolumeSample,
        VolumeProcessingT extends
            VolumeProcessing<SampleT> =
            VolumeProcessing<SampleT>
    > extends
    Instance<VolumeProcessingT> {
    spaceTransformations: SpaceTransformation[]
}

export interface VolumeProcessingInstancer<
        SampleT extends VolumeSample = VolumeSample,
        VolumeProcessingT extends
            VolumeProcessing<SampleT> =
            VolumeProcessing<SampleT>,
        VolumeProcessingInstanceT extends
            VolumeProcessingInstance<SampleT, VolumeProcessingT> =
            VolumeProcessingInstance<SampleT, VolumeProcessingT>
    > extends
    Instancer<
        VolumeProcessingT,
        VolumeProcessingInstanceT
    > { }