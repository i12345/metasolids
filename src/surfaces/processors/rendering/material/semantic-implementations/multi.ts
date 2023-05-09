import { field_point_sum } from "../../../../../fields/index.js";
import { LevelOfDetailInfo } from "../../mesh/LOD-info.js";
import { SurfaceRendererIndividual } from "../../renderer.js";
import { Cost, MaterialSemanticImplementation, RenderedBufferForSemanticWithImplementation } from "../implementation.js";

export class MaterialSemanticImplementation_Multi
    <Component extends MaterialSemanticImplementation = MaterialSemanticImplementation>
    implements MaterialSemanticImplementation {
    readonly cost: Cost
    readonly stage: number

    constructor(public readonly components: Component[]) {
        this.cost = field_point_sum(components.map(({ cost }) => cost))
        this.stage = Math.max(...components.map(({ stage }) => stage))
    }

    quality(info: LevelOfDetailInfo): number {
        return this.components.reduce(
            (prod, component) => prod * component.quality(info),
            1
        )
    }

    implement(renderer: SurfaceRendererIndividual): RenderedBufferForSemanticWithImplementation[] {
        return this.components.flatMap(component => component.implement(renderer))
    }
}