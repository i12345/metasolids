import { BoundingBox } from "playcanvas-extended";
import { VolumeLocation, VolumeSample, VolumeSamplingContext, Volume } from "../volume.js";

export interface VolumeWithBoundingBox<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        Context extends
            VolumeSamplingContext<Location, SampleProcessingContextT> =
            VolumeSamplingContext<Location, SampleProcessingContextT>
    > extends Volume<Location, Sample, SampleProcessingContextT, Context> {
    /**
     * the world-space bounding box that encloses where this volume has positive presence
     */
    boundingBox: BoundingBox
}