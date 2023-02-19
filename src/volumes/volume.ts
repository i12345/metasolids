import { BoundingBox, Vec3 } from "playcanvas-extended";
import { FieldsPoint, SampleDomain, SamplingContext } from "../fields";

export interface VolumeLocation extends FieldsPoint {
    /**
     * The point to sample the volume at
     */
    p: Vec3
}

export interface VolumeSample extends FieldsPoint {
    /**
     * The presence of the volume at the sampled point
     * 
     * The threshhold of the mesher will determine whether this is
     * inside or outside a mesh
     */
    presence: number

    /**
     * The derivative of presence with respect to position
     * 
     * The gradient points to greater presence
     */
    gradient: Vec3
}

export interface VolumeSamplingContext
    <Location extends VolumeLocation = VolumeLocation> extends
    SamplingContext<Location> {
}

export interface Volume<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        Context extends VolumeSamplingContext<Location> = VolumeSamplingContext<Location>
    > extends SampleDomain<Location, Sample, Context> {
    /**
     * Calculates a bounding box that encloses this volume, in world space
     */
    boundingBox: BoundingBox
}