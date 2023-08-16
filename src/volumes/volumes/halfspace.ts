import { Vec3 } from "playcanvas-extended";
import { Field } from "../../fields/field.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext, defaultVolumeSampleField } from "../volume.js";

export class HalfspaceVolume implements Volume {
    readonly field: Field<VolumeSample> = defaultVolumeSampleField

    init(context: VolumeSamplingContext<VolumeLocation, any>): void {
    }

    sample(location: VolumeLocation, context: VolumeSamplingContext): VolumeSample {
        return {
            alpha: 1 / (1 + Math.exp(-location.p.y)),
            gradient: Vec3.UP
        }
    }
}