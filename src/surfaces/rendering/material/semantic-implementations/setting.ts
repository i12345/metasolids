import { StandardMaterial } from "playcanvas-extended";
import { Cost, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { SurfaceRendererIndividual } from "../../renderer.js";
import { MaterialSemanticImplementation_Immediate } from "./immediate.js";
import { MultiObjectsGroupsTemplate } from "../../../../paradigm/multi-objects.js";
import { VolumeLocation } from "../../../../volumes/volume.js";

export class MaterialSemanticImplementation_Setting<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >
    implements MaterialSemanticImplementation_Immediate<VolumeLocationT, SurfaceUVUnwrappingGroup> {
    readonly cost: Cost = { space: { elements: 0 }, time: 0 }

    constructor(
            public readonly key: keyof StandardMaterial,
            public readonly value: StandardMaterial[keyof StandardMaterial],
            public readonly stage: number
        ) { }

    quality(): number {
        return 1
    }

    equals(that: MaterialSemanticImplementation_Immediate<VolumeLocationT, SurfaceUVUnwrappingGroup>): boolean {
        return that instanceof MaterialSemanticImplementation_Setting &&
            ///@ts-ignore
            this.key === that.key &&
            this.value === that.value
    }

    implement(renderer: SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>): RenderedBufferForSemanticWithImplementation[] {
        (renderer.material.implementation as any)[this.key] = this.value
        return []
    }
}