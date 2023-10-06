import { fields } from "../index.js"
import { octtree, processing } from "../paradigm/index.js";
import { MultiObjectsGroupsTemplate } from "../paradigm/trees/index.js";
import { SolidT, SurfaceT, VolumeProcessingT, VolumeT } from "./types.js";

export class ComponentData<ID = string> extends processing.ComponentData<ID> {
    volume?: VolumeT
    interpolatingGroups?: MultiObjectsGroupsTemplate[]
    extraLocationParameters?: fields.FieldsPoint
    factories?: {
        volume?: processing.processors.FactoryProcessor<any, any, any, any, VolumeProcessingT>[]
        surfaces?: processing.processors.FactoryProcessor<any, any, any, any, SurfaceT>[]
        solids?: processing.processors.FactoryProcessor<any, any, any, any, SolidT>[]
    }

    //TODO: these settings should be stored in a better way
    volumeSamplingSettings?: octtree.OctTreeSubdivisionSettings
    surfaceLevel?: number
}