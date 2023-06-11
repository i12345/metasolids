import { VolumeLocation } from "../../../../volumes/volume.js";
import { MaterialSemanticImplementation } from "../implementation.js";

export interface MaterialSemanticImplementation_Immediate<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    extends MaterialSemanticImplementation<VolumeLocationT> {
    equals(that: MaterialSemanticImplementation_Immediate<VolumeLocationT>): boolean
}