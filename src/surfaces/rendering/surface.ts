import { Material_Groups_TextureContexts, Material_Groups_Textures } from "./material/material-texture.js";
import { VolumeLocation } from "../../volumes/volume.js";
import { SurfaceRendererIndividual, SurfaceRendererShared } from "./renderer.js";
import { MultiObjectsGroupsTemplate } from "../../paradigm/trees/index.js";
import { Material_Groups, Material_Groups_Template } from "./material/groups.js";
import { Surface, SurfaceInstance, SurfaceSample, UVunwrapping, VolumeProcessingWithSurfacesInstancer, texturing } from "../index.js";
import { Instancer } from "../../paradigm/processing/instance.js";
import { Entity } from "playcanvas-extended";
import { IndicesTypedArray } from "../../utils/indices-array.js";

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
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceSampleT extends SurfaceSample = SurfaceSample,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    Surface<IndicesT, SurfaceSampleT> &
    UVunwrapping.SurfaceWithUVUnwrapping<IndicesT, SurfaceUVUnwrappingGroup> &
    SurfaceWithRendering_TexturesTemplated<VolumeLocationT> & {
    renderer: SurfaceRendererShared<VolumeLocationT>
}

export type SurfaceInstanceWithRendering<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,    
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceSampleT extends SurfaceSample = SurfaceSample,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    SurfaceInstance<
        SurfaceWithRendering<
            IndicesT,
            VolumeLocationT,
            SurfaceSampleT,
            SurfaceUVUnwrappingGroup
        >
    > & {
    renderer: SurfaceRendererIndividual<VolumeLocationT>
}

export interface SurfaceProcessingContextWithRendering<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        VolumeSampleProcessingContextT = any,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > extends
    texturing.SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup,
        VolumeSampleProcessingContextT,
        SurfaceWithRendering_TextureGroups
    > {
    material: {
        surfaceUVUnwrappingGroup?: SurfaceUVUnwrappingGroup
        textures?: Material_Groups_TextureContexts<VolumeLocationT>
    }
}

export class SurfaceWithRenderingInstancer<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,    
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceSampleT extends SurfaceSample = SurfaceSample,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >
    implements
    Instancer<
        SurfaceWithRendering<
                IndicesT,
                VolumeLocationT,
                SurfaceSampleT,
                SurfaceUVUnwrappingGroup
            >,
        SurfaceInstanceWithRendering<
                IndicesT,
                VolumeLocationT,
                SurfaceSampleT,
                SurfaceUVUnwrappingGroup
            >
    > {
    instantiate(
        shared: SurfaceWithRendering<
                IndicesT,
                VolumeLocationT,
                SurfaceSampleT,
                SurfaceUVUnwrappingGroup
            >,
        entity: Entity
    ): SurfaceInstanceWithRendering<
                IndicesT,
                VolumeLocationT,
                SurfaceSampleT,
                SurfaceUVUnwrappingGroup
            > {
        return {
            shared,
            entity,
            renderer: shared.renderer.individualize(entity)
        }
    }

    set_enabled(
        instance: SurfaceInstanceWithRendering<
                IndicesT,
                VolumeLocationT,
                SurfaceSampleT,
                SurfaceUVUnwrappingGroup
            >,
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
