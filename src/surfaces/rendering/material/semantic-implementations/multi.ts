import { MultiObjectsGroupsTemplate } from "../../../../paradigm/trees/index.js";
import { field_point_sum } from "../../../../fields/index.js";
import { VolumeLocation } from "../../../../volumes/volume.js";
import { LevelOfDetailInfo } from "../../mesh/LOD-info.js";
import { SurfaceRendererIndividual } from "../../renderer.js";
import { Cost, MaterialSemanticImplementation, RenderedBufferForSemanticWithImplementation } from "../implementation.js";

export class MaterialSemanticImplementation_Multi<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementation<VolumeLocationT> {
    readonly cost: Cost
    readonly stage: number

    constructor(public readonly components: MaterialSemanticImplementation<VolumeLocationT>[]) {
        this.cost = components.length === 0 ?
            { time: 0, space: { elements: 0 } } :
            field_point_sum(components.map<Cost>(({ cost }) => cost))
        this.stage = Math.max(0, ...components.map<number>(({ stage }) => stage))
    }

    quality(info: LevelOfDetailInfo): number {
        ///@ts-ignore
        return this.components.reduce(
            (prod, component) => prod * component.quality(info),
            1
        )
    }

    implement(renderer: SurfaceRendererIndividual<VolumeLocationT>): RenderedBufferForSemanticWithImplementation<VolumeLocationT>[] {
        return this.components.flatMap(component => component.implement(renderer))
    }
}