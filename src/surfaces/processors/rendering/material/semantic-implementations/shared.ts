import { MultiObjectsGroupsTemplate } from "../../../../../fields/multi-objects-fields-point.js";
import { VolumeLocation } from "../../../../../volumes/volume.js";
import { LevelOfDetailInfo } from "../../mesh/LOD-info.js";
import { Cost, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { MaterialSemanticImplementation_Immediate } from "./immediate.js";

export class MaterialSemanticImplementation_Shared<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >
    implements MaterialSemanticImplementation_Immediate<VolumeLocationT, SurfaceUVUnwrappingGroup> {
    get stage() { return this.implementation.stage }
    
    readonly cost: Cost = { space: { elements: 0 }, time: 0 }
    
    constructor(
        public readonly implementation: MaterialSemanticImplementation_Immediate,
        public readonly renderedBuffers: RenderedBufferForSemanticWithImplementation[]
    ) { }
    
    equals(that: MaterialSemanticImplementation_Immediate<VolumeLocationT, SurfaceUVUnwrappingGroup>): boolean {
        ///@ts-ignore
        return this.implementation.equals(that) ||
            (that instanceof MaterialSemanticImplementation_Shared &&
                this.implementation.equals(that.implementation))
    }

    quality(info: LevelOfDetailInfo): number {
        return this.implementation.quality(info)
    }

    implement(): RenderedBufferForSemanticWithImplementation[] {
        return this.renderedBuffers
    }
}