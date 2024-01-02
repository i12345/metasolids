import { Vec3 } from "playcanvas-physics-advanced";
import { Field } from "../../fields/field.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext, defaultVolumeSampleField } from "../volume.js";
import { Cloneable, clone } from "../../utils/cloneable.js";

export class HalfspaceVolume implements Volume, Cloneable<HalfspaceVolume> {
    readonly field: Field<VolumeSample> = defaultVolumeSampleField;

    [clone](): HalfspaceVolume {
        return new HalfspaceVolume()
    }
    
    init(context: VolumeSamplingContext<VolumeLocation, any>): void {
    }

    sample(location: VolumeLocation, context: VolumeSamplingContext): VolumeSample {
        return {
            alpha: 1 / (1 + Math.exp(-location.p.y)),
            gradient: Vec3.UP
        }
    }
}