import { Field } from "../../fields/index.js";
import { MultiObjectsGroupsWithFieldsProcessingContext, MultiObjectsWithGroupFieldsProcessingContext } from "../../fields/processing.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic } from "../../fields/vectorized/index.js";
import { MultiObjectsGroupsCombined, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplate_Leaf, MultiObjectsMappedGrouped, MultiObjectsProcessingContext, MultiObjectsTemplate, MultiObjectsGroupsCombinedTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsMappedAgainGrouped, MultiObjectsTypeGrouped } from "../../paradigm/trees/index.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../../textures/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { SurfaceProcessingContext } from "../processing.js";
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

export type SurfaceSampleElementTypeWithIndividualTextureLocations<
        IndividualTextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationElementType extends TextureLocation = TextureLocation
    > =
    SurfaceSample &
    MultiObjectsGroupsMapped<IndividualTextureLocationGroups, TextureLocationElementType>

export type SurfaceSampleFuseModeWithIndividualTextureLocations<
        IndividualTextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationFuseMode extends TextureLocation = TextureLocation
    > =
    SurfaceSample &
    MultiObjectsGroupsMapped<IndividualTextureLocationGroups, TextureLocationFuseMode>

export type SurfaceSampleWithObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation
    > =
    SurfaceSample &
    MultiObjectsMappedGrouped<Objects, ObjectsTextureLocationGroups, TextureLocationT>

export type SurfaceSampleElementTypeWithObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationElementType extends TextureLocation = TextureLocation
    > =
    SurfaceSample &
    MultiObjectsTypeGrouped<Objects, ObjectsTextureLocationGroups, TextureLocationElementType>

export type SurfaceSampleFuseModeWithObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationElementType extends TextureLocation = TextureLocation
    > =
    SurfaceSample &
    MultiObjectsGroupsMapped<ObjectsTextureLocationGroups, TextureLocationElementType>

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
        TextureLocationT extends TextureLocation = TextureLocation,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, ObjectsTextureLocationGroups> =
            MultiObjectsGrouped<Objects, ObjectsTextureLocationGroups>
    > =
    MultiObjectsWithGroupFieldsProcessingContext<
        Objects,
        ObjectsTextureLocationGroups,
        ObjectsGrouped,
        SurfaceObjectsTextureLocationsGroupKinds,
        TextureLocationT
    > &
    MultiObjectsWithGroupFieldsProcessingContext<
        Objects,
        ObjectsTextureLocationGroups,
        ObjectsGrouped,
        SurfaceTextureLocationsGroupKinds,
        TextureLocationT
    >

export type SurfaceWithIndividualTextures<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                >,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT> =
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT>,
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > =
    Surface<IndicesT, SurfaceSampleElementType, SurfaceSampleContainer, SurfaceSampleVector> &
    TexturesGrouped

export type SurfaceWithObjectsTextures<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                >,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<ObjectsTextureGroups, TextureT> =
            MultiObjectsGroupsMapped<ObjectsTextureGroups, TextureT>,
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > =
    Surface<IndicesT, SurfaceSampleElementType, SurfaceSampleContainer, SurfaceSampleVector> &
    MultiObjectsMappedAgainGrouped<Objects, ObjectsTextureGroups, TextureT, TexturesGrouped>

export type SurfaceWithIndividualTexturesUsingSampleTextureLocations<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        IndividualTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                >,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT> =
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT>,
        SurfaceSampleElementType extends
            SurfaceSampleElementTypeWithIndividualTextureLocations<IndividualTextureLocationGroup, TextureLocationT> =
            SurfaceSampleElementTypeWithIndividualTextureLocations<IndividualTextureLocationGroup, TextureLocationT>,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > =
    SurfaceWithIndividualTextures<
            IndicesT,
            IndividualTextureGroups,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSamplingContextT,
            TextureT,
            TexturesGrouped,
            SurfaceSampleElementType,
            SurfaceSampleContainer,
            SurfaceSampleVector
        >

export type SurfaceWithObjectsTexturesUsingSharedSampleTextureLocations<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SharedTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                >,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<ObjectsTextureGroups, TextureT> =
            MultiObjectsGroupsMapped<ObjectsTextureGroups, TextureT>,
        SurfaceSampleElementType extends
            SurfaceSampleElementTypeWithIndividualTextureLocations<SharedTextureLocationGroup, TextureLocationT> =
            SurfaceSampleElementTypeWithIndividualTextureLocations<SharedTextureLocationGroup, TextureLocationT>,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > =
    SurfaceWithObjectsTextures<
            IndicesT,
            Objects,
            ObjectsTextureGroups,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSamplingContextT,
            TextureT,
            TexturesGrouped,
            SurfaceSampleElementType,
            SurfaceSampleContainer,
            SurfaceSampleVector
        >

export type SurfaceWithObjectsTexturesUsingObjectsSampleTextureLocations<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        ObjectsTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                >,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<ObjectsTextureGroups, TextureT> =
            MultiObjectsGroupsMapped<ObjectsTextureGroups, TextureT>,
        SurfaceSampleElementType extends
            SurfaceSampleElementTypeWithObjectsTextureLocations<Objects, ObjectsTextureLocationGroup, TextureLocationT> =
            SurfaceSampleElementTypeWithObjectsTextureLocations<Objects, ObjectsTextureLocationGroup, TextureLocationT>,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > =
    SurfaceWithObjectsTextures<
            IndicesT,
            Objects,
            ObjectsTextureGroups,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSamplingContextT,
            TextureT,
            TexturesGrouped,
            SurfaceSampleElementType,
            SurfaceSampleContainer,
            SurfaceSampleVector
        >

export type SurfaceProcessingContextWithIndividualTextures<
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT = any,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSampleField extends
            Field<TextureSampleT, TextureSampleElementType, TextureSampleFuseMode> =
            Field<TextureSampleT, TextureSampleElementType, TextureSampleFuseMode>,
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsGroupsWithFieldsProcessingContext<
            IndividualTextureGroups,
            SurfaceIndividualTexturesGroupKinds,
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSampleField
        > &
    MultiObjectsGroupsWithFieldsProcessingContext<
            IndividualTextureGroups,
            SurfaceTexturesGroupKinds,
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSampleField
        >

export type SurfaceProcessingContextWithObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, ObjectsTextureGroups> =
            MultiObjectsGrouped<Objects, ObjectsTextureGroups>,
        SampleProcessingContextT = any,
        TextureSampleT extends TextureSample = TextureSample,
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsWithGroupFieldsProcessingContext<
            Objects,
            ObjectsTextureGroups,
            ObjectsTexturesGrouped,
            SurfaceObjectsTexturesGroupKinds,
            TextureSampleT
        > &
    MultiObjectsWithGroupFieldsProcessingContext<
            Objects,
            ObjectsTextureGroups,
            ObjectsTexturesGrouped,
            SurfaceTexturesGroupKinds,
            TextureSampleT
        >

export type SurfaceProcessingContextWithIndividualTexturesUsingSampleTextureLocations<
        IndividualTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations<IndividualTextureLocationGroup> =
            SurfaceSampleProcessingContextWithIndividualTextureLocations<IndividualTextureLocationGroup>,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSampleField extends
            Field<TextureSampleT, TextureSampleElementType, TextureSampleFuseMode> =
            Field<TextureSampleT, TextureSampleElementType, TextureSampleFuseMode>,
    > =
    SurfaceProcessingContextWithIndividualTextures<
            IndividualTextureGroups,
            SampleProcessingContextT,
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSampleField
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
            SurfaceSampleProcessingContextWithIndividualTextureLocations<IndividualTextureLocationGroup>,
        TextureSampleT extends TextureSample = TextureSample,
    > =
    SurfaceProcessingContextWithObjectsTextures<
        Objects,
        ObjectsTextureGroups,
        ObjectsTexturesGrouped,
        SampleProcessingContextT,
        TextureSampleT
    >

export type SurfaceProcessingContextWithObjectsTexturesUsingObjectsSampleTextureLocations<
        ObjectsTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, ObjectsTextureGroups> =
            MultiObjectsGrouped<Objects, ObjectsTextureGroups>,
        ObjectsTextureLocationT extends TextureLocation = TextureLocation,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsTextureLocations<
                    Objects,
                    ObjectsTextureLocationGroup,
                    ObjectsTextureLocationT
                > =
            SurfaceSampleProcessingContextWithObjectsTextureLocations<
                    Objects,
                    ObjectsTextureLocationGroup,
                    ObjectsTextureLocationT
                >,
        TextureSampleT extends TextureSample = TextureSample,
    > =
    SurfaceProcessingContextWithObjectsTextures<
        Objects,
        ObjectsTextureGroups,
        ObjectsTexturesGrouped,
        SampleProcessingContextT,
        TextureSampleT
    >


export type SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                >,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT> =
            MultiObjectsGroupsMapped<IndividualTextureGroups, TextureT>,
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > =
    SurfaceWithUVUnwrapping<
            IndicesT,
            SurfaceUVUnwrappingGroup,
            SurfaceSampleElementType,
            SurfaceSampleContainer,
            SurfaceSampleVector
        > &
    TexturesGrouped

export type SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                >,
        TexturesGrouped extends
            MultiObjectsGroupsMapped<ObjectsTextureGroups, TextureT> =
            MultiObjectsGroupsMapped<ObjectsTextureGroups, TextureT>,
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > =
    SurfaceWithUVUnwrapping<
            IndicesT,
            SurfaceUVUnwrappingGroup,
            SurfaceSampleElementType,
            SurfaceSampleContainer,
            SurfaceSampleVector
        > &
    MultiObjectsMappedAgainGrouped<Objects, ObjectsTextureGroups, TextureT, TexturesGrouped>

export type SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT = any,
        IndividualTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSampleField extends
            Field<TextureSampleT, TextureSampleElementType, TextureSampleFuseMode> =
            Field<TextureSampleT, TextureSampleElementType, TextureSampleFuseMode>,
    > =
    SurfaceProcessingContextWithUVUnwrapping<
        SurfaceUVUnwrappingGroup,
        SampleProcessingContextT
    > &
    SurfaceProcessingContextWithIndividualTextures<
        IndividualTextureGroups,
        SampleProcessingContextT,
        TextureSampleT,
        TextureSampleElementType,
        TextureSampleFuseMode,
        TextureSampleField
    >

export type SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT = any,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjectsTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, ObjectsTextureGroups> =
            MultiObjectsGrouped<Objects, ObjectsTextureGroups>,
        TextureSampleT extends TextureSample = TextureSample,
    > =
    SurfaceProcessingContextWithUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            SampleProcessingContextT
        > &
    SurfaceProcessingContextWithObjectsTextures<
            Objects,
            ObjectsTextureGroups,
            ObjectsTexturesGrouped,
            SampleProcessingContextT,
            TextureSampleT
        >