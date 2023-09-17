import { MultiObjectsGroupsTemplate, MultiObjectsTemplate } from "../../../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../../../utils/indices-array.js";
import { VolumeLocation } from "../../../../volumes/volume.js";
import { LevelOfDetailInfo } from "../../mesh/LOD-info.js";
import { Cost, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { MaterialSemanticImplementation_Immediate } from "./immediate.js";

export class MaterialSemanticImplementation_Shared<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT> {
    get stage() { return this.implementation.stage }

    readonly cost: Cost = { space: { elements: 0 }, time: 0 }

    constructor(
        public readonly implementation: MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT>,
        public readonly renderedBuffers: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[]
    ) { }

    equals(that: MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT>): boolean {
        ///@ts-ignore
        return this.implementation.equals(that) ||
            (that instanceof MaterialSemanticImplementation_Shared &&
                ///@ts-ignore
                this.implementation.equals(that.implementation))
    }

    quality(info: LevelOfDetailInfo): number {
        return this.implementation.quality(info)
    }

    implement(): RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[] {
        return this.renderedBuffers
    }
}