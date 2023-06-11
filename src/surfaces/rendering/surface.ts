import { Material_Groups_TextureContexts, Material_Groups_Textures } from "./material/material-texture.js";
import { VolumeLocation } from "../../volumes/volume.js";
import { SurfaceRendererIndividual, SurfaceRendererShared } from "./renderer.js";
import { MultiObjectsGroupsTemplate } from "../../paradigm/multi-objects.js";
import { Material_Groups, Material_Groups_Template } from "./material/groups.js";
import { Surface, SurfaceInstance, SurfaceSample, UVunwrapping, VolumeProcessingWithSurfacesInstancer, texturing } from "../index.js";
import { Instancer } from "../../processing/instance.js";
import { Entity } from "playcanvas-extended";

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

export interface SurfaceWithRendering_TexturesTemplated<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    material: {
        textures: Material_Groups_Textures<VolumeLocationT>
    }
    rendering?: {
        textureContexts?: Material_Groups_TextureContexts<VolumeLocationT>
    }
}

export type SurfaceWithRendering<
        SampleT extends SurfaceSample = SurfaceSample,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    Surface<SampleT> &
    UVunwrapping.SurfaceWithUVUnwrapping<SurfaceUVUnwrappingGroup> &
    SurfaceWithRendering_TexturesTemplated<VolumeLocationT> & {
    renderer: SurfaceRendererShared<VolumeLocationT>
}

export type SurfaceInstanceWithRendering<
        SampleT extends SurfaceSample = SurfaceSample,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    SurfaceInstance<
        SurfaceWithRendering<
            SampleT,
            VolumeLocationT,
            SurfaceUVUnwrappingGroup
        >
    > & {
    renderer: SurfaceRendererIndividual<VolumeLocationT>
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
        surfaceUVUnwrappingGroup?: SurfaceUVUnwrappingGroup
        textures?: Material_Groups_TextureContexts<VolumeLocationT>
    }
}

export class SurfaceWithRenderingInstancer<
        SampleT extends SurfaceSample = SurfaceSample,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >
    implements
    Instancer<
        SurfaceWithRendering<SampleT, VolumeLocationT, SurfaceUVUnwrappingGroup>,
        SurfaceInstanceWithRendering<SampleT, VolumeLocationT, SurfaceUVUnwrappingGroup>
    > {
    instantiate(
        shared: SurfaceWithRendering<SampleT, VolumeLocationT, SurfaceUVUnwrappingGroup>,
        entity: Entity
    ): SurfaceInstanceWithRendering<SampleT, VolumeLocationT, SurfaceUVUnwrappingGroup> {
        return {
            shared,
            entity,
            renderer: shared.renderer.individualize(entity)
        }
    }

    set_enabled(
        instance: SurfaceInstanceWithRendering<SampleT, VolumeLocationT, SurfaceUVUnwrappingGroup>,
        enabled: boolean
    ): void {
        instance.renderer.attached = enabled
    }

    private constructor() { }
    static readonly instance = new this()
}

export const VolumeProcessingWithSurfacesWithRenderingInstancer = new VolumeProcessingWithSurfacesInstancer(SurfaceWithRenderingInstancer.instance)

// let a: SurfaceProcessingContextWithRendering<VolumeLocation, { a: MultiObjectsGroupsTemplateLeaf }, SurfaceSampleProcessingContextWithIndividualTextureLocations<{ a: MultiObjectsGroupsTemplateLeaf }>>
// a[SurfaceIndividualTexturesGroupKindKey].material.textures.diffuse // MultiObjectsGroupsTemplateLeaf
// a.material.textures.diffuse // Material_Texture_Context<VolumeLocation>
