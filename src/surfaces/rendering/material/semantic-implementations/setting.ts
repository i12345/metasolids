import { StandardMaterial } from "playcanvas-physics-advanced";
import { Cost, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { SurfaceRendererIndividual } from "../../renderer.js";
import { MaterialSemanticImplementation_Immediate } from "./immediate.js";
import { MultiObjectsTemplate } from "../../../../paradigm/trees/index.js";
import { VolumeLocation } from "../../../../volumes/volume.js";
import { IndicesTypedArray } from "../../../../utils/indices-array.js";

export class MaterialSemanticImplementation_Setting<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT> {
    readonly cost: Cost = { space: { elements: 0 }, time: 0 }

    constructor(
            public readonly key: keyof StandardMaterial,
            public readonly value: StandardMaterial[keyof StandardMaterial],
            public readonly stage: number
        ) { }

    quality(): number {
        return 1
    }

    equals(that: MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT>): boolean {
        return that instanceof MaterialSemanticImplementation_Setting &&
            ///@ts-ignore
            this.key === that.key &&
            this.value === that.value
    }

    implement(renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>): RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[] {
        (renderer.material.implementation as any)[this.key] = this.value
        return []
    }
}