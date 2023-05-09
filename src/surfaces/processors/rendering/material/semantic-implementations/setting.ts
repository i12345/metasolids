import { StandardMaterial } from "playcanvas-extended";
import { Cost, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { SurfaceRendererIndividual } from "../../renderer.js";
import { MaterialSemanticImplementation_Immediate } from "./immediate.js";

export class MaterialSemanticImplementation_Setting
    implements MaterialSemanticImplementation_Immediate {
    readonly cost: Cost = { space: { elements: 0 }, time: 0 }

    constructor(
            public readonly key: keyof StandardMaterial,
            public readonly value: StandardMaterial[keyof StandardMaterial],
            public readonly stage: number
        ) { }

    quality(): number {
        return 1
    }

    equals(that: MaterialSemanticImplementation_Immediate): boolean {
        return that instanceof MaterialSemanticImplementation_Setting &&
            this.key === that.key &&
            this.value === that.value
    }

    implement(renderer: SurfaceRendererIndividual): RenderedBufferForSemanticWithImplementation[] {
        renderer.material.implementation[this.key as PropertyKey] = this.value
        return []
    }
}