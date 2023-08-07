import { Vec3 } from "playcanvas-extended";
import { Field, FieldsPoint, FieldsPointMapped, SampleDomain, SamplingContext } from "../fields/index.js"
import { FieldsField, ScalarField, Vec3Field } from "../fields/fields/index.js";

export type VolumeLocation = {
    /**
     * The point to sample the volume at
     */
    p: Vec3
}

export const defaultVolumeLocationField = new FieldsField<VolumeLocation>({
    p: new Vec3Field()
})

export type VolumeSample = {
    /**
     * The presence of the volume at the sampled point, in [0, 1]
     * 
     * The threshhold of the mesher will determine whether this is
     * inside or outside a mesh
     */
    alpha: number

    /**
     * The derivative of presence with respect to position
     * 
     * The gradient points to greater presence
     */
    gradient: Vec3
}

export const defaultVolumeSampleField = new FieldsField<VolumeSample>({
    alpha: ScalarField.instance,
    gradient: Vec3Field.instance,
})

export const VolumeSampleKey = Symbol("volume.sample")

export interface VolumeSamplingContext<
        Location extends VolumeLocation = VolumeLocation,
        SampleProcessingContextT = any
    > extends
    SamplingContext<Location> {
    [VolumeSampleKey]: SampleProcessingContextT
}

export interface Volume<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        Context extends
            VolumeSamplingContext<Location, SampleProcessingContextT> =
            VolumeSamplingContext<Location, SampleProcessingContextT>
    > extends SampleDomain<Location, Sample, Context> {
}