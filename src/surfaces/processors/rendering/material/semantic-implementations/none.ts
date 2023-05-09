import { Cost, MaterialSemanticImplementation, RenderedBufferForSemanticWithImplementation } from "../implementation.js";

export class MaterialSemanticImplementation_None
    implements MaterialSemanticImplementation {
    readonly cost: Cost = { space: { elements: 0 }, time: 0 }
    readonly stage = 0

    private constructor() { }

    quality(): number {
        return 1
    }

    implement(): RenderedBufferForSemanticWithImplementation[] {
        return []
    }

    static readonly instance = new this()
}