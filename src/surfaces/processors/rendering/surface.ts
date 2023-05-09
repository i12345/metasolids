import { Surface, SurfaceSample } from "../../surface.js";
import { SurfaceProcessingContext } from "../../processor.js";
import { Material_Groups_Textures, Material_Texture_Context } from "./material/material-texture.js";
import { VolumeLocation } from "../../../volumes/volume.js";
import { SurfaceSampleProcessingContextWithIndividualTextureLocations } from "../texturing/types.js";
import { SurfaceRendererShared } from "./renderer.js";
import { MultiObjectsGroupsMapped } from "../../../fields/multi-objects-fields-point.js";
import { Material_Groups, Material_Groups_Template } from "./material/groups.js";

export const SurfaceWithRendering_TexturesGroupsTemplate = {
    textures: Material_Groups_Template
}

export interface SurfaceWithRendering
    <Sample extends SurfaceSample = SurfaceSample>
    extends Surface<Sample> {
    renderer: SurfaceRendererShared
    textures: Material_Groups_Textures
}

export interface SurfaceProcessingContextWithRendering<
        VolumeLocationT extends
            VolumeLocation =
            VolumeLocation,
        SampleContextTemplate extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations =
            SurfaceSampleProcessingContextWithIndividualTextureLocations,
    >
    extends SurfaceProcessingContext<SampleContextTemplate> {
    textures: MultiObjectsGroupsMapped<Material_Groups, Material_Texture_Context<VolumeLocationT>>
}