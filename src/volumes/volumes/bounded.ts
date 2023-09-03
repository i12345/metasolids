import { BoundingBox } from "playcanvas-extended";
import { VolumeLocation, VolumeSample, VolumeSamplingContext, Volume } from "../volume.js";

export interface VolumeWithBoundingBox<
        Location extends VolumeLocation = VolumeLocation,
        LocationElementType extends VolumeLocation = Location,
        LocationFuseMode extends VolumeLocation = Location,
        Sample extends VolumeSample = VolumeSample,
        SampleElementType extends VolumeSample = Sample,
        SampleFuseMode extends VolumeSample = Sample,
        SampleProcessingContextT = any,
        Context extends
            VolumeSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    SampleProcessingContextT
                > =
            VolumeSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    SampleProcessingContextT
                >
    > extends Volume<
        Location,
        LocationElementType,
        LocationFuseMode,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleProcessingContextT,
        Context
    > {
    /**
     * the world-space bounding box that encloses where this volume has positive presence
     */
    boundingBox: BoundingBox
}