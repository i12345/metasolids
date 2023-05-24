import { MultiObjectsGroupsTemplate } from "../../../../fields/multi-objects-fields-point.js";
import { VolumeLocation } from "../../../../volumes/volume.js";
import { MaterialSemanticImplementation } from "../implementation.js";

export interface MaterialSemanticImplementation_Immediate<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >
    extends MaterialSemanticImplementation<VolumeLocationT, SurfaceUVUnwrappingGroup> {
    equals(that: MaterialSemanticImplementation_Immediate<VolumeLocationT, SurfaceUVUnwrappingGroup>): boolean
}