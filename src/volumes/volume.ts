import { Mat4, Vec3 } from "playcanvas-extended";
import { SampleDomain, SamplingContext } from "../fields/index.js"
import { FieldsField, ScalarField, Vec3Field } from "../fields/fields/index.js";

export type VolumeLocation = {
    /**
     * The point to sample the volume at
     */
    p: Vec3
}

export const defaultVolumeLocationField = new FieldsField<VolumeLocation>({
    p: Vec3Field.instance
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
    // alpha: new ScalarField(<FuseMode<number>>fuseModes.ArithmeticPrimitiveFuseMode.max),
    gradient: Vec3Field.instance,
})

export const VolumeSampleKey = Symbol("volume.sample")
export const VolumeWorldTransformKey = Symbol("world")

export interface VolumeSamplingContext<
        Location extends VolumeLocation = VolumeLocation,
        LocationElementType extends VolumeLocation = Location,
        LocationFuseMode extends VolumeLocation = Location,
        SampleProcessingContextT = any,
    > extends
    SamplingContext<Location, LocationElementType, LocationFuseMode> {
    [VolumeSampleKey]: SampleProcessingContextT
    [VolumeWorldTransformKey]: Mat4
}

export interface Volume<
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
    > extends SampleDomain<
        Location, Sample,
        LocationElementType,
        LocationFuseMode,
        SampleElementType,
        SampleFuseMode,
        Context
    > {
}