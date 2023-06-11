import { VolumeLocation } from "../../../../volumes/volume.js";
import { Cost, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { MaterialSemanticImplementation_Immediate } from "./immediate.js";

export class MaterialSemanticImplementation_None<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementation_Immediate<VolumeLocationT> {
    readonly cost: Cost = { space: { elements: 0 }, time: 0 }
    readonly stage = 0

    private constructor() { }

    quality(): number {
        return 1
    }

    implement(): RenderedBufferForSemanticWithImplementation<VolumeLocationT>[] {
        return []
    }

    equals(that: MaterialSemanticImplementation_Immediate<VolumeLocationT>): boolean {
        return that instanceof MaterialSemanticImplementation_None
    }

    static readonly instance = new this()
}