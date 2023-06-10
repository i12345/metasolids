import { MultiObjectsGroupsCombined, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplate_Leaf, MultiObjectsMappedGrouped, MultiObjectsProcessingContext, MultiObjectsTemplate, MultiObjectsGroupsCombinedTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsMappedAgainGrouped } from "../../paradigm/index.js";
import { Texture, TextureLocation, TextureSample } from "../../textures/index.js";
import { SurfaceProcessingContext } from "../surface-samples.js";
import { Surface, SurfaceSample } from "../surface.js";
import { SurfaceProcessingContextWithUVUnwrapping, SurfaceWithUVUnwrapping } from "../uv-unwrapping/index.js";

//TODO: this could be abstracted to be more generic and usable for solids

export const SurfaceTexturesGroupKindKey = Symbol('group-kind:surface:textures')
export type SurfaceTexturesGroupKinds = {
    [SurfaceTexturesGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceTexturesGroupKindsTemplate: SurfaceTexturesGroupKinds = {
    [SurfaceTexturesGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceIndividualTexturesGroupKindKey = Symbol('group-kind:surface:textures.individual')
export type SurfaceIndividualTexturesGroupKinds = {
    [SurfaceIndividualTexturesGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceIndividualTexturesGroupKindsTemplate: SurfaceIndividualTexturesGroupKinds = {
    [SurfaceIndividualTexturesGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceObjectsTexturesGroupKindKey = Symbol('group-kind:surface:textures.objects')
export type SurfaceObjectsTexturesGroupKinds = {
    [SurfaceObjectsTexturesGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceObjectsTexturesGroupKindsTemplate: SurfaceObjectsTexturesGroupKinds = {
    [SurfaceObjectsTexturesGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceTextureLocationsGroupKindKey = Symbol("group-kind:surface:texture-locations")
export type SurfaceTextureLocationsGroupKinds = {
    [SurfaceTextureLocationsGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceTextureLocationsGroupKindsTemplate: SurfaceTextureLocationsGroupKinds = {
    [SurfaceTextureLocationsGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceIndividualTextureLocationsGroupKindKey = Symbol("group-kind:surface:texture-locations.individual")
export type SurfaceIndividualTextureLocationsGroupKinds = {
    [SurfaceIndividualTextureLocationsGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceIndividualTextureLocationsGroupKindsTemplate: SurfaceIndividualTextureLocationsGroupKinds = {
    [SurfaceIndividualTextureLocationsGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceObjectsTextureLocationsGroupKindKey = Symbol("group-kind:surface:texture-locations.objects")
export type SurfaceObjectsTextureLocationsGroupKinds = {
    [SurfaceObjectsTextureLocationsGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceObjectsTextureLocationsGroupKindsTemplate: SurfaceObjectsTextureLocationsGroupKinds = {
    [SurfaceObjectsTextureLocationsGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceObjectsTextureLocationsGroupsDefaultKey = Symbol("surface:texture-locations.objects")
export type SurfaceObjectsTextureLocationsGroupsDefault = {
    [SurfaceObjectsTextureLocationsGroupsDefaultKey]: MultiObjectsGroupsTemplateLeaf
}
export const SurfaceObjectsTextureLocationsGroupsDefaultTemplate: SurfaceObjectsTextureLocationsGroupsDefault = {
    [SurfaceObjectsTextureLocationsGroupsDefaultKey]: MultiObjectsGroupsTemplate_Leaf
}

export type SurfaceIndividualTextureLocationsGroupDefault = MultiObjectsGroupsCombined<SurfaceObjectsTextureLocationsGroupsDefault>

export const SurfaceIndividualTextureLocationsGroupDefaultTemplate: SurfaceIndividualTextureLocationsGroupDefault =
    MultiObjectsGroupsCombinedTemplate(SurfaceObjectsTextureLocationsGroupsDefaultTemplate)

export type SurfaceSampleWithIndividualTextureLocations<
        IndividualTextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation
    > =
    SurfaceSample &
    MultiObjectsGroupsMapped<IndividualTextureLocationGroups, TextureLocationT>

export type SurfaceSampleWithObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation
    > =
    SurfaceSample &
    MultiObjectsMappedGrouped<Objects, ObjectsTextureLocationGroups, TextureLocationT>

export type SurfaceSampleProcessingContextWithIndividualTextureLocations<
        IndividualTextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    MultiObjectsGroupsProcessingContext<
        IndividualTextureLocationGroups,
        SurfaceIndividualTextureLocationsGroupKinds
    > & 
    MultiObjectsGroupsProcessingContext<
        IndividualTextureLocationGroups,
        SurfaceTextureLocationsGroupKinds
    >

export type SurfaceSampleProcessingContextWithObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, ObjectsTextureLocationGroups> =
            MultiObjectsGrouped<Objects, ObjectsTextureLocationGroups>
    > =
    MultiObjectsProcessingContext<
        Objects,
        ObjectsTextureLocationGroups,
        ObjectsGrouped,
        SurfaceObjectsTextureLocationsGroupKinds
    > &
    MultiObjectsProcessingContext<
        Objects,
        ObjectsTextureLocationGroups,
        ObjectsGrouped,
        SurfaceTextureLocationsGroupKinds
    >

export type SurfaceWithIndividualTextures<
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureT extends
            Texture<TextureLocationT, TextureSampleT> =
            Texture<TextureLocationT, TextureSampleT>,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT> =
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT>,
        SurfaceSampleT extends SurfaceSample = SurfaceSample
    > =
    Surface<SurfaceSampleT> &
    TexturesGrouped

export type SurfaceWithObjectsTextures<
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
        SurfaceSampleT extends SurfaceSample = SurfaceSample
    > =
    Surface<SurfaceSampleT> &
    MultiObjectsMappedAgainGrouped<Objects, ObjectsTextureGroups, TextureT, TexturesGrouped>

export type SurfaceWithIndividualTexturesUsingSampleTextureLocations<
        IndividualTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureT extends
            Texture<TextureLocationT, TextureSampleT> =
            Texture<TextureLocationT, TextureSampleT>,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT> =
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT>,
        SurfaceSampleT extends
            SurfaceSampleWithIndividualTextureLocations<IndividualTextureLocationGroup, TextureLocationT> =
            SurfaceSampleWithIndividualTextureLocations<IndividualTextureLocationGroup, TextureLocationT>
    > =
    SurfaceWithIndividualTextures<
            IndividualTextureGroups,
            TextureLocationT,
            TextureSampleT,
            TextureT,
            TexturesGrouped,
            SurfaceSampleT
        >

export type SurfaceWithObjectsTexturesUsingSharedSampleTextureLocations<
        SharedTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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
        SurfaceSampleT extends
            SurfaceSampleWithIndividualTextureLocations<SharedTextureLocationGroup, TextureLocationT> =
            SurfaceSampleWithIndividualTextureLocations<SharedTextureLocationGroup, TextureLocationT>
    > =
    SurfaceWithObjectsTextures<
            Objects,
            ObjectsTextureGroups,
            TextureLocationT,
            TextureSampleT,
            TextureT,
            TexturesGrouped,
            SurfaceSampleT
        >

export type SurfaceWithObjectsTexturesUsingObjectsSampleTextureLocations<
        ObjectsTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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
        SurfaceSampleT extends
            SurfaceSampleWithObjectsTextureLocations<Objects, ObjectsTextureLocationGroup, TextureLocationT> =
            SurfaceSampleWithObjectsTextureLocations<Objects, ObjectsTextureLocationGroup, TextureLocationT>
    > =
    SurfaceWithObjectsTextures<
            Objects,
            ObjectsTextureGroups,
            TextureLocationT,
            TextureSampleT,
            TextureT,
            TexturesGrouped,
            SurfaceSampleT
        >

export type SurfaceProcessingContextWithIndividualTextures<
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT = any
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsGroupsProcessingContext<
            IndividualTextureGroups,
            SurfaceIndividualTexturesGroupKinds
        > &
    MultiObjectsGroupsProcessingContext<
            IndividualTextureGroups,
            SurfaceTexturesGroupKinds
        >

export type SurfaceProcessingContextWithObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, ObjectsTextureGroups> =
            MultiObjectsGrouped<Objects, ObjectsTextureGroups>,
        SampleProcessingContextT = any
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
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

export type SurfaceProcessingContextWithIndividualTexturesUsingSampleTextureLocations<
        IndividualTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations<IndividualTextureLocationGroup> =
            SurfaceSampleProcessingContextWithIndividualTextureLocations<IndividualTextureLocationGroup>
    > =
    SurfaceProcessingContextWithIndividualTextures<
            IndividualTextureGroups,
            SampleProcessingContextT
        >
        
export type SurfaceProcessingContextWithObjectsTexturesUsingSharedSampleTextureLocations<
        IndividualTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, ObjectsTextureGroups> =
            MultiObjectsGrouped<Objects, ObjectsTextureGroups>,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations<IndividualTextureLocationGroup> =
            SurfaceSampleProcessingContextWithIndividualTextureLocations<IndividualTextureLocationGroup>
    > =
    SurfaceProcessingContextWithObjectsTextures<
        Objects,
        ObjectsTextureGroups,
        ObjectsTexturesGrouped,
        SampleProcessingContextT
    >

export type SurfaceProcessingContextWithObjectsTexturesUsingObjectsSampleTextureLocations<
        ObjectsTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, ObjectsTextureGroups> =
            MultiObjectsGrouped<Objects, ObjectsTextureGroups>,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsTextureLocations<Objects, ObjectsTextureLocationGroup> =
            SurfaceSampleProcessingContextWithObjectsTextureLocations<Objects, ObjectsTextureLocationGroup>
    > =
    SurfaceProcessingContextWithObjectsTextures<
        Objects,
        ObjectsTextureGroups,
        ObjectsTexturesGrouped,
        SampleProcessingContextT
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