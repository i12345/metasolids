import { Material_Groups_Textures, Material_Texture_Context } from "./material/material-texture.js";
import { VolumeLocation } from "../../volumes/volume.js";
import { SurfaceRendererShared } from "./renderer.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate } from "../../fields/multi-objects-fields-point.js";
import { Material_Groups, Material_Groups_Template } from "./material/groups.js";
import { texturing } from "../index.js";

export type SurfaceWithRendering_TextureGroups = {
    material: {
        textures: Material_Groups
    }
}

export const SurfaceWithRendering_TextureGroupsTemplate = {
    material: {
        textures: Material_Groups_Template
    }
}

export interface SurfaceWithRender_TexturesTemplated<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    material: {
        textures: Material_Groups_Textures<VolumeLocationT>
    }
}

export type SurfaceWithRendering<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    texturing.SurfaceWithUVUnwrapping<SurfaceUVUnwrappingGroup> &
    SurfaceWithRender_TexturesTemplated<VolumeLocationT> & {
    renderer: SurfaceRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>
}

export interface SurfaceProcessingContextWithRendering<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > extends
    texturing.SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup,
        SurfaceWithRendering_TextureGroups
    > {
    material: {
        textures?: MultiObjectsGroupsMapped<
            Material_Groups,
            Material_Texture_Context<VolumeLocationT>
        >
    }
}

// let a: SurfaceProcessingContextWithRendering<VolumeLocation, { a: MultiObjectsGroupsTemplateLeaf }, SurfaceSampleProcessingContextWithIndividualTextureLocations<{ a: MultiObjectsGroupsTemplateLeaf }>>
// a[SurfaceIndividualTexturesGroupKindKey].material.textures.diffuse // MultiObjectsGroupsTemplateLeaf
// a.material.textures.diffuse // Material_Texture_Context<VolumeLocation>
