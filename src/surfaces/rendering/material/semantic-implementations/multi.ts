import { MultiObjectsGroupsTemplate, MultiObjectsTemplate } from "../../../../paradigm/trees/index.js";
import { field_point_sum } from "../../../../fields/index.js";
import { VolumeLocation } from "../../../../volumes/volume.js";
import { LevelOfDetailInfo } from "../../mesh/LOD-info.js";
import { SurfaceRendererIndividual } from "../../renderer.js";
import { Cost, MaterialSemanticImplementation, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { IndicesTypedArray } from "../../../../utils/indices-array.js";

export class MaterialSemanticImplementation_Multi<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementation<Objects, ObjIDsT, VolumeLocationT> {
    readonly cost: Cost
    readonly stage: number

    constructor(public readonly components: MaterialSemanticImplementation<Objects, ObjIDsT, VolumeLocationT>[]) {
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

    implement(renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>): RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[] {
        return this.components.flatMap(component => component.implement(renderer))
    }
}