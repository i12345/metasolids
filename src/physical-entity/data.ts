import { fields, textures } from "../index.js"
import { octtree, processing } from "../paradigm/index.js";
import { MultiObjectsGroupsTemplate } from "../paradigm/trees/index.js";
import { VolumeT } from "./types.js";

export class ComponentData<ID = string> extends processing.ComponentData<ID> {
    volume?: VolumeT
    texturers?: textures.Texturer[]
    interpolatingGroups?: MultiObjectsGroupsTemplate[]
    extraLocationParameters?: fields.FieldsPoint

    //TODO: these settings should be stored in a better way
    volumeSamplingSettings?: octtree.OctTreeSubdivisionSettings
    surfaceLevel?: number
}