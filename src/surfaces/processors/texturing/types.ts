import { MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplate_Leaf, MultiObjectsMappedAndCombinedGrouped, MultiObjectsProcessingContext, MultiObjectsTemplate } from "../../../fields/index.js";
import { Texture, TextureLocation, TextureSample } from "../../../textures/index.js";
import { SurfaceProcessingContext } from "../../processor.js";
import { Surface, SurfaceSample } from "../../surface.js";

export const SurfaceTexturesGroupKindKey = Symbol('ground-kind:surface-textures')
export interface SurfaceTexturesGroupKinds
    extends MultiObjectsGroupsKindsTemplate {
    [SurfaceTexturesGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceTexturesGroupKindsTemplate: SurfaceTexturesGroupKinds = {
    [SurfaceTexturesGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceTextureLocationsGroupKindKey = Symbol("group-kind:surface-location")
export interface SurfaceTextureLocationsGroupKinds
    extends MultiObjectsGroupsKindsTemplate {
    [SurfaceTextureLocationsGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceTextureLocationsGroupKindsTemplate: SurfaceTextureLocationsGroupKinds = {
    [SurfaceTextureLocationsGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceTextureLocationsGroupsDefaultKey = Symbol("surface-location")
export interface SurfaceTextureLocationsGroupsDefault extends MultiObjectsGroupsTemplate {
    [SurfaceTextureLocationsGroupsDefaultKey]: typeof MultiObjectsGroupsTemplate_Leaf
}
export const SurfaceTextureLocationsGroupsDefaultTemplate: SurfaceTextureLocationsGroupsDefault = {
    [SurfaceTextureLocationsGroupsDefaultKey]: MultiObjectsGroupsTemplate_Leaf
}

export type SurfaceSampleProcessingContextWithIndividualTextureLocations<
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    MultiObjectsGroupsProcessingContext<
        TextureLocationGroups,
        SurfaceTextureLocationsGroupKinds
    >

export type SurfaceSampleProcessingContextWithObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, TextureLocationGroups> =
            MultiObjectsGrouped<Objects, TextureLocationGroups>
    > =
    MultiObjectsProcessingContext<
        Objects,
        TextureLocationGroups,
        ObjectsGrouped,
        SurfaceTextureLocationsGroupKinds
    >

export type SurfaceProcessingContextWithIndividualTextureLocations<
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations<TextureLocationGroups> =
            SurfaceSampleProcessingContextWithIndividualTextureLocations<TextureLocationGroups>
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsGroupsProcessingContext<
        TextureLocationGroups,
        SurfaceTextureLocationsGroupKinds
    >

export type SurfaceProcessingContextWithObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, TextureLocationGroups> =
            MultiObjectsGrouped<Objects, TextureLocationGroups>,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsTextureLocations<Objects, TextureLocationGroups, ObjectsGrouped> =
            SurfaceSampleProcessingContextWithObjectsTextureLocations<Objects, TextureLocationGroups, ObjectsGrouped>
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsProcessingContext<
        Objects,
        TextureLocationGroups,
        ObjectsGrouped,
        SurfaceTextureLocationsGroupKinds
    >

export type SurfaceProcessingContextWithIndividualTextures<
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations<TextureGroups> =
            SurfaceSampleProcessingContextWithIndividualTextureLocations<TextureGroups>
    > =
    SurfaceProcessingContextWithIndividualTextureLocations<
            TextureGroups,
            SampleProcessingContextT
        > &
    MultiObjectsGroupsProcessingContext<
            TextureGroups,
            SurfaceTexturesGroupKinds
        >

export type SurfaceProcessingContextWithObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, TextureGroups> =
            MultiObjectsGrouped<Objects, TextureGroups>,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsTextureLocations<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped
                > =
            SurfaceSampleProcessingContextWithObjectsTextureLocations<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped
                >
    > =
    SurfaceProcessingContextWithObjectsTextureLocations<
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            SampleProcessingContextT
        > &
    MultiObjectsProcessingContext<
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            SurfaceTexturesGroupKinds
        >

// this type might not be needed except when actually calculating the location
// to sample a texture at and by some textures that use this information
export type SurfaceTextureLocation<
        SurfaceSampleT extends SurfaceSample = SurfaceSample
    > = TextureLocation & {
    surface: SurfaceSampleT
}

export type SurfaceSampleWithIndividualTextureLocations<
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation
    > =
    SurfaceSample &
    MultiObjectsGroupsMapped<TextureLocationGroups, TextureLocationT>

export type SurfaceSampleWithObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation
    > =
    SurfaceSample &
    MultiObjectsMappedAndCombinedGrouped<Objects, TextureLocationGroups, TextureLocationT>

export type SurfaceWithIndividualTextures<
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureT extends
            Texture<TextureLocationT, TextureSampleT> =
            Texture<TextureLocationT, TextureSampleT>,
        SurfaceSampleT extends
            SurfaceSampleWithIndividualTextureLocations<TextureGroups, TextureLocationT> =
            SurfaceSampleWithIndividualTextureLocations<TextureGroups, TextureLocationT>
    > =
    Surface<SurfaceSampleT> &
    MultiObjectsGroupsMapped<TextureGroups, TextureT>

export type SurfaceWithObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureT extends
            Texture<TextureLocationT, TextureSampleT> =
            Texture<TextureLocationT, TextureSampleT>,
        SurfaceSampleT extends
            SurfaceSampleWithObjectsTextureLocations<Objects, TextureGroups, TextureLocationT> =
            SurfaceSampleWithObjectsTextureLocations<Objects, TextureGroups, TextureLocationT>
    > =
    Surface<SurfaceSampleT> &
    MultiObjectsMappedAndCombinedGrouped<Objects, TextureGroups, TextureT>