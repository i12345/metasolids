import { MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsMappedAgainGrouped, MultiObjectsProcessingContext, MultiObjectsTemplate } from "../../../fields/multi-objects-fields-point.js";
import { Texture, TextureLocation, TextureSample } from "../../../textures/texture.js";
import { SurfaceProcessingContext } from "../../processor.js";
import { Surface, SurfaceSample } from "../../surface.js";
import { SurfaceIndividualTexturesGroupKinds, SurfaceObjectsTexturesGroupKinds, SurfaceTexturesGroupKinds } from "../types.js";
import { SurfaceUVUnwrapping } from "./algorithm.js";

export const SurfaceUVUnwrappingGroupKindKey = Symbol('group-kind:surface:uv-unwrapping')
export type SurfaceUVUnwrappingGroupKinds = {
    [SurfaceUVUnwrappingGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceUVUnwrappingGroupKindsTemplate: SurfaceUVUnwrappingGroupKinds = {
    [SurfaceUVUnwrappingGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceUVUnwrappingGroupsDefaultKey = Symbol("surface:uv-unwrapping")
export type SurfaceUVUnwrappingGroupsDefault = {
    [SurfaceUVUnwrappingGroupsDefaultKey]: MultiObjectsGroupsTemplateLeaf
}
export const SurfaceUVUnwrappingGroupsDefaultTemplate: SurfaceUVUnwrappingGroupsDefault = {
    [SurfaceUVUnwrappingGroupsDefaultKey]: MultiObjectsGroupsTemplate_Leaf
}

export type SurfaceWithUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Sample extends SurfaceSample = SurfaceSample
    > =
    Surface<Sample> &
    MultiObjectsGroupsMapped<SurfaceUVUnwrappingGroup, SurfaceUVUnwrapping>

export type SurfaceProcessingContextWithUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT = any
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsGroupsProcessingContext<
        SurfaceUVUnwrappingGroup,
        SurfaceUVUnwrappingGroupKinds
    >

export type SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureT extends
            Texture<TextureLocationT, TextureSampleT> =
            Texture<TextureLocationT, TextureSampleT>,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT> =
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT>,
        Sample extends SurfaceSample = SurfaceSample
    > =
    SurfaceWithUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            Sample
        > &
    TexturesGrouped

export type SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureT extends
            Texture<TextureLocationT, TextureSampleT> =
            Texture<TextureLocationT, TextureSampleT>,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<ObjectsTextureGroups, TextureT> =
            MultiObjectsGroupsMapped<ObjectsTextureGroups, TextureT>,
        Sample extends SurfaceSample = SurfaceSample
    > =
    SurfaceWithUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            Sample
        > &
    MultiObjectsMappedAgainGrouped<Objects, ObjectsTextureGroups, TextureT, TexturesGrouped>

export type SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT = any
    > =
    SurfaceProcessingContextWithUVUnwrapping<
        SurfaceUVUnwrappingGroup,
        SampleProcessingContextT
    > &
    MultiObjectsGroupsProcessingContext<
        IndividualTextureGroups,
        SurfaceIndividualTexturesGroupKinds
    > &
    MultiObjectsGroupsProcessingContext<
        IndividualTextureGroups,
        SurfaceTexturesGroupKinds
    >

export type SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, ObjectsTextureGroups> =
            MultiObjectsGrouped<Objects, ObjectsTextureGroups>,
        SampleProcessingContextT = any
    > =
    SurfaceProcessingContextWithUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            SampleProcessingContextT
        > &
    MultiObjectsProcessingContext<
            Objects,
            ObjectsTextureGroups,
            ObjectsTexturesGrouped,
            SurfaceObjectsTexturesGroupKinds
        > &
    MultiObjectsProcessingContext<
            Objects,
            ObjectsTextureGroups,
            ObjectsTexturesGrouped,
            SurfaceTexturesGroupKinds
        >