import { fields, processing, surfaces, textures, volumes } from "../index.js";
import { MultiObjectsGroupsTemplate } from "../paradigm/index.js";
import { VolumeT } from "./types.js";

export class ComponentData<ID = string> extends processing.ComponentData<ID> {
    volume?: VolumeT
    texturers?: textures.Texturer[]
    interpolatingGroups?: MultiObjectsGroupsTemplate[]
    extraLocationParameters?: fields.FieldsPoint
    samplerSettings?: volumes.VolumeSamplerSettings
    meshingSettings?: surfaces.meshing.MeshingSettings
}