import { Material_Groups_TextureContexts, Material_Groups_Textures } from "./material/material-texture.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/volume.js";
import { SurfaceRendererIndividual, SurfaceRendererShared } from "./renderer.js";
import { MultiObjectsGroupsTemplate, MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { Material_Groups, Material_Groups_Template } from "./material/groups.js";
import { InstanceContext, Instancer } from "../../paradigm/processing/instance.js";
import { IndicesTypedArray } from "../../paradigm/arrays/indices-array.js";
import { Surface, SurfaceInstance, SurfaceSample } from "../surface.js";
import * as UVunwrapping from "../unwrapping/uv/index.js"
import * as texturing from "../texturing/index.js"
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesInstancer, VolumeSurfaceProcessing } from "../volume-surfaces.js";
import { FieldPointVector, FieldPointVectorContainer } from "../../fields/vectorized/index.js";
import { NumberTypedArray } from "../../paradigm/arrays/typed-array.js";
import { Component } from "../../paradigm/processing/component.js";

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
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    material: {
        textures: Material_Groups_Textures<Objects, ObjIDsT, VolumeLocationT>
    }
    rendering?: {
        textureContexts?: Material_Groups_TextureContexts<Objects, ObjIDsT, VolumeLocationT>
    }
}

export type SurfaceWithRendering<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > =
    Surface<IndicesT, SurfaceSampleElementType, SurfaceSampleContainer, SurfaceSampleVector> &
    UVunwrapping.SurfaceWithUVUnwrapping<IndicesT, SurfaceUVUnwrappingGroup> &
    SurfaceWithRendering_TexturesTemplated<Objects, ObjIDsT, VolumeLocationT> & {
    renderer: SurfaceRendererShared<Objects, ObjIDsT, VolumeLocationT>
}

export type SurfaceInstanceWithRendering<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > =
    SurfaceInstance<
        SurfaceWithRendering<
            Objects,
            ObjIDsT,
            IndicesT,
            SurfaceUVUnwrappingGroup,
            VolumeLocationT,
            SurfaceSampleElementType,
            SurfaceSampleContainer,
            SurfaceSampleVector
        >
    > & {
    renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>
}

export interface SurfaceProcessingContextWithRendering<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleProcessingContextT = any,
    > extends
    texturing.SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup,
        VolumeSampleProcessingContextT,
        SurfaceWithRendering_TextureGroups
    > {
    material: {
        surfaceUVUnwrappingGroup?: SurfaceUVUnwrappingGroup
        textures: Material_Groups_TextureContexts<Objects, ObjIDsT, VolumeLocationT>
    }
}

export class SurfaceWithRenderingInstancer<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            SurfaceWithRendering<
                    Objects,
                    ObjIDsT,
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    VolumeLocationT,
                    VolumeSampleElementType,
                    VolumeSampleContainer,
                    VolumeSampleVector
                > =
            SurfaceWithRendering<
                    Objects,
                    ObjIDsT,
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    VolumeLocationT,
                    VolumeSampleElementType,
                    VolumeSampleContainer,
                    VolumeSampleVector
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >
    >
    implements
    Instancer<
        SurfaceWithRendering<
            Objects,
            ObjIDsT,
            IndicesT,
            SurfaceUVUnwrappingGroup,
            VolumeLocationT,
            VolumeSampleElementType,
            VolumeSampleContainer,
            VolumeSampleVector
        >,
        SurfaceInstanceWithRendering<
            Objects,
            ObjIDsT,
            IndicesT,
            SurfaceUVUnwrappingGroup,
            VolumeLocationT,
            VolumeSampleElementType,
            VolumeSampleContainer,
            VolumeSampleVector
        >,
        VolumeSurfaceProcessing<
            IndicesT,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleContainer,
            VolumeSampleVector,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT
        >
    > {
    instantiate(
            shared: VolumeSurfaceProcessing<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleContainer,
                VolumeSampleVector,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
                SurfaceT
            >,
            { entity, componentID }: InstanceContext
        ): SurfaceInstanceWithRendering<
            Objects,
            ObjIDsT,
                IndicesT,
                SurfaceUVUnwrappingGroup,
                VolumeLocationT,
                VolumeSampleElementType,
                VolumeSampleContainer,
                VolumeSampleVector
            > {
        const component = entity.c[componentID]
        for (const render of entity.findComponents('render'))
            if ((<Component>render.entity.c[componentID])?.root === component)
            render.entity.removeComponent('render')
        
        return {
            shared,
            entity,
            renderer: shared.renderer.individualize(entity)
        }
    }

    set_enabled(
        instance: SurfaceInstanceWithRendering<
                Objects,
                ObjIDsT,
                IndicesT,
                SurfaceUVUnwrappingGroup,
                VolumeLocationT,
                VolumeSampleElementType,
                VolumeSampleContainer,
                VolumeSampleVector
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
