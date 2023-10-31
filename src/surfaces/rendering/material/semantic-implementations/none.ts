import { MultiObjectsTemplate } from "../../../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../../../paradigm/arrays/indices-array.js";
import { VolumeLocation } from "../../../../volumes/volume.js";
import { Cost, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { MaterialSemanticImplementation_Immediate } from "./immediate.js";

export class MaterialSemanticImplementation_None<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT> {
    readonly cost: Cost = { space: { elements: 0 }, time: 0 }
    readonly stage = 0

    private constructor() { }

    quality(): number {
        return 1
    }

    implement(): RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[] {
        return []
    }

    equals(that: MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT>): boolean {
        return that instanceof MaterialSemanticImplementation_None
    }

    static readonly instance = new this()
}