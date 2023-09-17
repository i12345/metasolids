import { MultiObjectsTemplate } from "../../../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../../../utils/indices-array.js";
import { VolumeLocation } from "../../../../volumes/volume.js";
import { MaterialSemanticImplementation } from "../implementation.js";

export interface MaterialSemanticImplementation_Immediate<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    extends MaterialSemanticImplementation<Objects, ObjIDsT, VolumeLocationT> {
    equals(that: MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT>): boolean
}