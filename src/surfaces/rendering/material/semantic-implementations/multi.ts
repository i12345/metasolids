import { MultiObjectsGroupsTemplate, field_point_sum } from "../../../../fields/index.js";
import { VolumeLocation } from "../../../../volumes/volume.js";
import { LevelOfDetailInfo } from "../../mesh/LOD-info.js";
import { SurfaceRendererIndividual } from "../../renderer.js";
import { Cost, MaterialSemanticImplementation, RenderedBufferForSemanticWithImplementation } from "../implementation.js";

export class MaterialSemanticImplementation_Multi<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >
    implements MaterialSemanticImplementation<VolumeLocationT, SurfaceUVUnwrappingGroup> {
    readonly cost: Cost
    readonly stage: number

    constructor(public readonly components: MaterialSemanticImplementation<VolumeLocationT, SurfaceUVUnwrappingGroup>[]) {
        this.cost = field_point_sum(components.map<Cost>(({ cost }) => cost))
        this.stage = Math.max(...components.map<number>(({ stage }) => stage))
    }

    quality(info: LevelOfDetailInfo): number {
        return this.components.reduce(
            (prod, component) => prod * component.quality(info),
            1
        )
    }

    implement(renderer: SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>): RenderedBufferForSemanticWithImplementation[] {
        return this.components.flatMap(component => component.implement(renderer))
    }
}