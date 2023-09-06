import { MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupedObjectsKey, mapGroups, MultiObjectsGroupsCombinedTemplate, MultiObjectsGroupsKindsTemplateMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsCombined, MultiObjectsGrouped, MultiObjectsTemplate, MultiObjectsProcessingContext, MultiObjectsProcessingContextGroupKinds, MultiObjectsProcessingContextObjectsGrouped, mergeGroups, MultiObjectsGroupsCombinedMapped, mergeGroupsInplace, groupPaths, MultiObjectsGroupsMapped, MultiObjectsIDs } from "../paradigm/trees/index.js";
import { FieldPoint, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesProcessingContext, MultiObjectsInfluencesGroupsDefault, MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate, MultiObjectsInfluencesGroupsDefaultTemplate, MultiObjectsInfluencesGroupKinds, MultiObjectsWithGroupFieldsProcessingContext, GroupWithField, GroupFieldKey, Field, MultiObjectsGroupsWithFieldsProcessingContext, WithInfluenceProcessingContext } from "../fields/index.js"
import { textures, volumes, surfaces, solids, fields } from "../index.js"
import { onlyOne } from "../utils/only-one.js"
import { octtree } from "../paradigm/index.js";
import { MultiObjectsField } from "../fields/fields/multi-objects.js";
import { TypedArrayConstructor } from "../utils/typed-array.js";
import { mergeObjects } from "../utils/merge-objects.js";
import { FieldPointVectorContainerStatic } from "../fields/vectorized/point.js";

export type IndicesT = Uint32Array

export type VolumeLocationT = volumes.VolumeLocation
export type VolumeLocationElementType = volumes.VolumeLocation
export type VolumeLocationFuseMode = volumes.VolumeLocation

export type Objects = MultiObjectsTemplate
export type ObjIDsT = Uint32Array
export const ObjIDsType: TypedArrayConstructor<number, ObjIDsT> = Uint32Array
export type ObjIDsContainer = FieldPointVectorContainerStatic<ObjIDsT>

export type InfluenceGroup = MultiObjectsInfluencesGroupsDefault
export const InfluenceGroupTemplate = MultiObjectsInfluencesGroupsDefaultTemplate
export type ObjectsInfluencesGrouped = MultiObjectsGrouped<Objects, InfluenceGroup>

export type SurfaceIndividualTextureLocationsGroupsT = surfaces.texturing.SurfaceIndividualTextureLocationsGroupDefault

export type SurfaceObjectsTextureLocationsGroupsT = surfaces.texturing.SurfaceObjectsTextureLocationsGroupsDefault
export type ObjectsSurfaceObjectsTextureLocationsGrouped = MultiObjectsGrouped<Objects, SurfaceObjectsTextureLocationsGroupsT>

export const SurfaceObjectsTextureLocationsGroupsTemplate: SurfaceObjectsTextureLocationsGroupsT = surfaces.texturing.SurfaceObjectsTextureLocationsGroupsDefaultTemplate

export type SurfaceIndividualTextureLocationT = textures.TextureLocation
export type SurfaceObjectsTextureLocationsT = textures.TextureLocation

export type SurfaceIndividualTextureSampleT = textures.TextureSample
export type SurfaceObjectsTextureSamplesT = textures.TextureSample

export const SurfaceIndividualTextureLocationsGroupsField = ():
    MultiObjectsGroupsMapped<SurfaceIndividualTextureLocationsGroupsT, GroupWithField<fields.Field<SurfaceIndividualTextureLocationT>>> =>
    mapGroups(
        surfaces.texturing.SurfaceIndividualTextureLocationsGroupDefaultTemplate,
        () => ({
            [GroupFieldKey]: textures.defaultTextureLocationField
        })
    )

export const SurfaceObjectsTextureLocationsGroupsField = (multiObjectsIDs: MultiObjectsIDs<Objects, ObjIDsT>):
    MultiObjectsGroupsMapped<SurfaceObjectsTextureLocationsGroupsT, GroupWithField<fields.fields.MultiObjectsField<SurfaceObjectsTextureLocationsT, Objects, ObjIDsT>>> =>
    mapGroups(
        SurfaceObjectsTextureLocationsGroupsTemplate,
        () => ({
            [GroupFieldKey]: new MultiObjectsField(textures.defaultTextureLocationField, multiObjectsIDs)
        })
    )

export const SurfaceTextureLocationsGroupsFields = (multiObjectsIDs: MultiObjectsIDs<Objects, ObjIDsT>):
    ReturnType<typeof SurfaceIndividualTextureLocationsGroupsField> &
    ReturnType<typeof SurfaceObjectsTextureLocationsGroupsField> =>
    mergeObjects(<any[]>[
        SurfaceIndividualTextureLocationsGroupsField(),
        SurfaceObjectsTextureLocationsGroupsField(multiObjectsIDs),
    ])

export type SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
        surfaces.texturing.SurfaceTextureLocationsGroupKinds &
        surfaces.texturing.SurfaceObjectsTextureLocationsGroupKinds,
        SurfaceObjectsTextureLocationsGroupsT
    >

export const SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsTemplate: SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsT = {
    [surfaces.texturing.SurfaceObjectsTextureLocationsGroupKindKey]: SurfaceObjectsTextureLocationsGroupsTemplate,
    [surfaces.texturing.SurfaceTextureLocationsGroupKindKey]: SurfaceObjectsTextureLocationsGroupsTemplate
}

export type SurfaceUVUnwrappingGroupT = surfaces.UVunwrapping.SurfaceUVUnwrappingGroupsDefault
export const SurfaceUVUnwrappingGroupTemplate: SurfaceUVUnwrappingGroupT = surfaces.UVunwrapping.SurfaceUVUnwrappingGroupsDefaultTemplate
export const SurfaceUVUnwrappingGroup_Path = onlyOne(groupPaths(SurfaceUVUnwrappingGroupTemplate))

export type SurfaceUVUnwrappingGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
        surfaces.UVunwrapping.SurfaceUVUnwrappingGroupKinds,
        SurfaceUVUnwrappingGroupT
    >

export const SurfaceUVUnwrappingGroupsKindsMappedGroupsTemplate: SurfaceUVUnwrappingGroupsKindsMappedGroupsT = {
    [surfaces.UVunwrapping.SurfaceUVUnwrappingGroupKindKey]: SurfaceUVUnwrappingGroupTemplate
}

/**
 * Customizeable
 */
export type OtherInterpolatingGroupsT = {
    // rigidity: MultiObjectsGroupsTemplateLeaf
    // hair: {
    //     density: MultiObjectsGroupsTemplateLeaf
    //     length: MultiObjectsGroupsTemplateLeaf
    // }
}

/**
 * Customizeable
 */
export const OtherInterpolatingGroupsTemplate: OtherInterpolatingGroupsT = {
    // rigidity: MultiObjectsGroupsTemplate_Leaf,
    // hair: {
    //     density: MultiObjectsGroupsTemplate_Leaf,
    //     length: MultiObjectsGroupsTemplate_Leaf,
    // }
}

/**
 * Customizeable
 *
 * The values are applied per object
 */
export type OtherInterpolatingValuesT = FieldPoint

/**
 * Customizeable
 *
 * The values are applied per object
 */
export type OtherInterpolatingValuesGrouped = {
    // rigidity: number
    // hair: {
    //     density: number
    //     length: number
    // }
}

export type ObjectsOtherInterpolatingGrouped = MultiObjectsGrouped<Objects, OtherInterpolatingGroupsT>

export const OtherInterpolatingGroupsKindsKey = Symbol('group-kind:other-interpolating')

/**
 * Customizeable
 */
export type OtherInterpolatingGroupsKindsT = {
    [OtherInterpolatingGroupsKindsKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

/**
 * Customizeable
 */
export const OtherInterpolatingGroupsKindsTemplate: OtherInterpolatingGroupsKindsT = {
    [OtherInterpolatingGroupsKindsKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export type OtherInterpolatingGroupsKindsMappedGroups = MultiObjectsGroupsKindsTemplateMapped<OtherInterpolatingGroupsKindsT, OtherInterpolatingGroupsT>

export const OtherInterpolatingGroupsKindsMappedGroupsTemplate: OtherInterpolatingGroupsKindsMappedGroups = {
    [OtherInterpolatingGroupsKindsKey]: OtherInterpolatingGroupsTemplate
}

export type InterpolatingGroupsT =
    InfluenceGroup &
    SurfaceObjectsTextureLocationsGroupsT &
    OtherInterpolatingGroupsT &
    {}

export type InterpolatingGroupsKindsT =
    MultiObjectsInfluencesGroupKinds &
    surfaces.texturing.SurfaceTextureLocationsGroupKinds &
    OtherInterpolatingGroupsKindsT &
    {}

export const InterpolatingGroupsTemplate: InterpolatingGroupsT = {
    ...MultiObjectsInfluencesGroupsDefaultTemplate,
    ...SurfaceObjectsTextureLocationsGroupsTemplate,
    ...OtherInterpolatingGroupsTemplate
}

export const InterpolatingGroupsKindsTemplate: InterpolatingGroupsKindsT = {
    ...MultiObjectsInfluencesGroupKindsTemplate,
    ...surfaces.texturing.SurfaceTextureLocationsGroupKindsTemplate,
    ...OtherInterpolatingGroupsKindsTemplate,
}

export type VolumeSamplingSubdividingOctTreeGroupsT =
    volumes.sampling.VolumeSamplingSubdivisionSamplesGroups<SampleT> &
    octtree.OctTreeWithDualGroups &
    surfaces.sampling.SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups &
    {}

export const VolumeSamplingSubdividingOctTreeGroupsTemplate = mergeGroups<VolumeSamplingSubdividingOctTreeGroupsT>(
    volumes.sampling.VolumeSamplingSubdivisionSamplesGroupsTemplate(<Field<SampleT, SampleElementType, SampleFuseMode>><unknown>volumes.defaultVolumeSampleField),
    octtree.OctTreeWithDualGroupsTemplate,
    surfaces.sampling.SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroupsTemplate,
)

export type VolumeSamplingSubdividingGroupsKindMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
        octtree.OctTreeSubdividingGroupsKind,
        VolumeSamplingSubdividingOctTreeGroupsT
    >

export const VolumeSamplingSubdividingGroupsKindMappedGroupsTemplate: VolumeSamplingSubdividingGroupsKindMappedGroupsT = {
    [octtree.OctTreeSubdividingGroupsKindKey]: VolumeSamplingSubdividingOctTreeGroupsTemplate
}

export type Volume_Context_PreservedGroupsT =
    solids.metasolids.MetaSolidVolumeMultiObjectsInternalPreservedGroups &
    solids.metasolids.MetaSplineSegmentMultiObjectsInternalPreservedGroups &
    {}

export const Volume_Context_PreservedGroupsTemplate = [
    solids.metasolids.MetaSolidVolumeMultiObjectsInternalPreservedGroupsTemplate,
    solids.metasolids.MetaSplineSegmentMultiObjectsInternalPreservedGroupsTemplate,
].reduce(mergeGroupsInplace, {}) as Volume_Context_PreservedGroupsT

export type Volume_Context_PreservedGroupsKinds =
    fields.domains.MultiObjectsDomainInternalPreservedGroupsKinds

export const Volume_Context_PreservedGroupsKindsTemplate: Volume_Context_PreservedGroupsKinds = {
    ...fields.domains.MultiObjectsDomainInternalPreservedGroupsKindsTemplate
}

export type Volume_Context_PreservedGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
            fields.domains.MultiObjectsDomainInternalPreservedGroupsKinds,
            Volume_Context_PreservedGroupsT
        >

export const Volume_Context_PreservedGroupsKindsMappedGroupsTemplate: Volume_Context_PreservedGroupsKindsMappedGroupsT = {
    [fields.domains.MultiObjectsDomainInternalPreservedGroupsKindsKey]: Volume_Context_PreservedGroupsTemplate
}

export type Volume_Sample_PreservedGroupsT =
    {}

export const Volume_Sample_PreservedGroupsTemplate = [
].reduce(mergeGroupsInplace, {}) as Volume_Sample_PreservedGroupsT

export type Volume_Sample_PreservedGroupsKindsT =
    MultiObjectsInfluencesGroupKinds &
    surfaces.texturing.SurfaceTextureLocationsGroupKinds &
    OtherInterpolatingGroupsKindsT &
    fields.domains.MultiObjectsDomainInternalPreservedGroupsKinds

export const Volume_Sample_PreservedGroupsKindsTemplate: Volume_Sample_PreservedGroupsKindsT = {
    ...MultiObjectsInfluencesGroupKindsTemplate,
    ...surfaces.texturing.SurfaceTextureLocationsGroupKindsTemplate,
    ...OtherInterpolatingGroupsKindsTemplate,
    ...fields.domains.MultiObjectsDomainInternalPreservedGroupsKindsTemplate,
}

export type Volume_Sample_PreservedGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
            fields.domains.MultiObjectsDomainInternalPreservedGroupsKinds,
            Volume_Sample_PreservedGroupsT
        >

export const Volume_Sample_PreservedGroupsKindsMappedGroupsTemplate: Volume_Sample_PreservedGroupsKindsMappedGroupsT = {
    [fields.domains.MultiObjectsDomainInternalPreservedGroupsKindsKey]: Volume_Sample_PreservedGroupsTemplate
}

export type SampleT = volumes.VolumeSample &
    surfaces.texturing.SurfaceSampleForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            Objects,
            InfluenceGroup,
            SurfaceObjectsTextureLocationsGroupsT,
            SurfaceObjectsTextureLocationsT
        > &
    surfaces.texturing.SurfaceSampleWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingValuesT,
            OtherInterpolatingValuesGrouped
        > &
    {}

export type SampleElementType = volumes.VolumeSample &
    surfaces.texturing.SurfaceSampleElementTypeForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            Objects,
            InfluenceGroup,
            SurfaceObjectsTextureLocationsGroupsT,
            SurfaceObjectsTextureLocationsT
        > &
    surfaces.texturing.SurfaceSampleElementTypeWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingValuesT,
            OtherInterpolatingValuesGrouped
        > &
    {}

export type SampleFuseMode = volumes.VolumeSample &
    surfaces.texturing.SurfaceSampleFuseModeForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            Objects,
            InfluenceGroup,
            SurfaceObjectsTextureLocationsGroupsT,
            SurfaceObjectsTextureLocationsT
        > &
    surfaces.texturing.SurfaceSampleFuseModeWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingValuesT,
            OtherInterpolatingValuesGrouped
        > &
    {}

export type SampleProcessingContextT = {} &
    surfaces.texturing.SurfaceSampleProcessingContextForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            SurfaceObjectsTextureLocationsGroupsT
        > &
    surfaces.texturing.SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingGroupsKindsT,
            OtherInterpolatingValuesT
        > &
    MultiObjectsProcessingContext<
            Objects,
            Volume_Sample_PreservedGroupsT,
            MultiObjectsGrouped<Objects, Volume_Sample_PreservedGroupsT>,
            fields.domains.MultiObjectsDomainInternalPreservedGroupsKinds
        > &
    fields.MultiObjectsWithGroupFieldsProcessingContext<
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            fields.MultiObjectsInfluencesGroupKinds,
            number
        >
    {}

export type SampleProcessingContext_MultiObjects =
    MultiObjectsInfluencesProcessingContext<
        Objects,
        InfluenceGroup,
        ObjectsInfluencesGrouped
    > &
    MultiObjectsWithGroupFieldsProcessingContext<
        Objects,
        SurfaceObjectsTextureLocationsGroupsT,
        ObjectsSurfaceObjectsTextureLocationsGrouped,
        surfaces.texturing.SurfaceObjectsTextureLocationsGroupKinds,
        SurfaceObjectsTextureLocationsT
    > &
    MultiObjectsWithGroupFieldsProcessingContext<
        Objects,
        SurfaceObjectsTextureLocationsGroupsT,
        ObjectsSurfaceObjectsTextureLocationsGrouped,
        surfaces.texturing.SurfaceTextureLocationsGroupKinds,
        SurfaceObjectsTextureLocationsT
    > &
    MultiObjectsWithGroupFieldsProcessingContext<
        Objects,
        OtherInterpolatingGroupsT,
        ObjectsOtherInterpolatingGrouped,
        OtherInterpolatingGroupsKindsT,
        OtherInterpolatingValuesT
    > &
    MultiObjectsProcessingContext<
        Objects,
        Volume_Sample_PreservedGroupsT,
        MultiObjectsGrouped<Objects, Volume_Sample_PreservedGroupsT>,
        fields.domains.MultiObjectsDomainInternalPreservedGroupsKinds
    > &
    {}

export const SampleProcessingContext_MultiObjects_Template: SampleProcessingContext_MultiObjects = {
    ...MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate,
    ...fields.MultiObjectsInfluencesGroupsDefaultField(undefined!),

    ...SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsTemplate,

    ...SurfaceTextureLocationsGroupsFields(undefined!),

    // ...SurfaceObjectsTextureLocationsGroupsField(undefined!),

    // ...SurfaceIndividualTextureLocationsGroupsField(),

    ...OtherInterpolatingGroupsKindsMappedGroupsTemplate,

    ...Volume_Sample_PreservedGroupsKindsMappedGroupsTemplate,

    [MultiObjectsProcessingContextObjectsGrouped]: {
        ...(mapGroups(
            InfluenceGroupTemplate,
            () => ({ [MultiObjectsGroupedObjectsKey]: {} as Objects })
        ) as ObjectsInfluencesGrouped),

        [surfaces.texturing.SurfaceObjectsTextureLocationsGroupsDefaultKey]: { [MultiObjectsGroupedObjectsKey]: {} as Objects },

        ...(mapGroups(
            Volume_Sample_PreservedGroupsTemplate,
            () => ({ [MultiObjectsGroupedObjectsKey]: {} as Objects })
        ) as MultiObjectsGrouped<Objects, Volume_Sample_PreservedGroupsT>),

        // ...({
        //     hair: {
        //         density: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
        //         length: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
        //     },
        //     rigidity: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
        // } as MultiObjectsGrouped<Objects, OtherInterpolatingGroupsT>),
    },

    [MultiObjectsProcessingContextGroupKinds]: {
        ...MultiObjectsInfluencesGroupKindsTemplate,

        ...surfaces.texturing.SurfaceObjectsTextureLocationsGroupKindsTemplate,
        ...surfaces.texturing.SurfaceIndividualTextureLocationsGroupKindsTemplate,
        ...surfaces.texturing.SurfaceTextureLocationsGroupKindsTemplate,

        ...OtherInterpolatingGroupsKindsTemplate,

        ...fields.domains.MultiObjectsDomainInternalPreservedGroupsKindsTemplate,
    }
}

export type VolumeDomainSamplingContextT =
    volumes.VolumeSamplingContext<
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleProcessingContextT
        > &
    solids.sampling.VolumeSamplingContextWithSolidHints<
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleProcessingContextT
        > &
    surfaces.sampling.VolumeSamplingContextWithSurfaceHints<
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleProcessingContextT
        > &
    WithInfluenceProcessingContext<InfluenceGroup> &
    MultiObjectsGroupsProcessingContext<
            Volume_Context_PreservedGroupsT,
            Volume_Context_PreservedGroupsKinds
        >

export type VolumeDomainSamplingContext_MultiObjects =
    WithInfluenceProcessingContext<InfluenceGroup> &
    MultiObjectsGroupsProcessingContext<
            Volume_Context_PreservedGroupsT,
            Volume_Context_PreservedGroupsKinds
        > &
    {}

export const VolumeDomainSamplingContext_MultiObjects_Template: VolumeDomainSamplingContext_MultiObjects = {
    ...Volume_Context_PreservedGroupsKindsMappedGroupsTemplate,

    ...MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate,

    [MultiObjectsProcessingContextGroupKinds]: {
        ...fields.domains.MultiObjectsDomainInternalPreservedGroupsKindsTemplate,
        ...MultiObjectsInfluencesGroupKindsTemplate,
    },
}

export type VolumeSamplingContext_MultiObjects =
    VolumeSamplingSubdividingGroupsKindMappedGroupsT &
    MultiObjectsGroupsProcessingContext<
        VolumeSamplingSubdividingOctTreeGroupsT,
        octtree.OctTreeSubdividingGroupsKind
    > &
    {}

export const VolumeSamplingContext_MultiObjects_Template: VolumeSamplingContext_MultiObjects = {
    ...VolumeSamplingSubdividingGroupsKindMappedGroupsTemplate,

    [MultiObjectsProcessingContextGroupKinds]: {
        ...octtree.OctTreeSubdividingGroupsKindTemplate,
    },
}

/**
 * Customizeable
 */
export type SurfaceObjectsTexturesGroupsT = OtherInterpolatingGroupsT

/**
 * Customizeable
 */
export const SurfaceObjectsTexturesGroupsTemplate: SurfaceObjectsTexturesGroupsT = OtherInterpolatingGroupsTemplate

export type ObjectsSurfaceObjectsTexturesGrouped = MultiObjectsGrouped<Objects, SurfaceObjectsTexturesGroupsT>

export type SurfaceObjectsTexelTypesT = OtherInterpolatingValuesT

export type SurfaceObjectsTexturesTexelTypesGrouped = OtherInterpolatingValuesGrouped

export type SurfaceObjectsTexturesGrouped = textures.TexturesTemplatedWithObjects<
        Objects,
        SurfaceObjectsTexturesGroupsT,
        MultiObjectsGrouped<Objects, SurfaceObjectsTexturesGroupsT>,
        SurfaceObjectsTexelTypesT,
        SurfaceObjectsTexturesTexelTypesGrouped,
        SurfaceObjectsTextureLocationsT
    >

export type SurfaceCombinedTexturesGroupsT = MultiObjectsGroupsCombined<SurfaceObjectsTexturesGroupsT>
export const SurfaceCombinedTexturesGroupsTemplate: SurfaceCombinedTexturesGroupsT = MultiObjectsGroupsCombinedTemplate(SurfaceObjectsTexturesGroupsTemplate)

export type SurfaceCombinedTextureLocationT = textures.TextureLocation
export type SurfaceCombinedTexelTypesT = SurfaceObjectsTexelTypesT
export type SurfaceCombinedTexturesTexelTypesGrouped = MultiObjectsGroupsCombinedMapped<
        SurfaceObjectsTexturesGroupsT,
        SurfaceObjectsTexelTypesT,
        SurfaceObjectsTexturesTexelTypesGrouped
    >

export type SurfaceCombinedTextureSampleT =
    OtherInterpolatingValuesT &
    {}

export type SurfaceCombinedTextureSamplingContextT =
    textures.TextureSamplingContext<SurfaceCombinedTextureLocationT>

export type SurfaceCombinedTextureT =
    textures.Texture<
        SurfaceCombinedTextureLocationT, OtherInterpolatingValuesT,
        SurfaceCombinedTextureLocationT,
        SurfaceCombinedTextureLocationT,
        OtherInterpolatingValuesT,
        OtherInterpolatingValuesT,
        SurfaceCombinedTextureSamplingContextT
    > &
    {}

export type SurfaceCombinedTexturesGrouped =
    textures.TexturesTemplated<
        SurfaceCombinedTexturesGroupsT,
        SurfaceCombinedTexelTypesT,
        SurfaceCombinedTexturesTexelTypesGrouped,
        SurfaceCombinedTextureLocationT
    > &
    {}

export type SurfaceIndividualTexturesGroupsT =
    SurfaceCombinedTexturesGroupsT &
    InfluenceGroup &
    surfaces.rendering.SurfaceWithRendering_TextureGroups &
    {}

export const SurfaceIndividualTexturesGroupsTemplate = mergeGroups<SurfaceIndividualTexturesGroupsT>(
    SurfaceCombinedTexturesGroupsTemplate,
    InfluenceGroupTemplate,
    surfaces.rendering.SurfaceWithRendering_TextureGroupsTemplate,
)

export type SurfaceIndividualTexturesGrouped =
    SurfaceCombinedTexturesGrouped &
    MultiObjectsGroupsMapped<InfluenceGroup, textures.Texture<SurfaceIndividualTextureLocationT, number>> &
    surfaces.rendering.SurfaceWithRendering_TexturesTemplated<VolumeLocationT>

export type SurfaceObjectsTexturesGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
        surfaces.texturing.SurfaceTexturesGroupKinds &
        surfaces.texturing.SurfaceObjectsTexturesGroupKinds,
        SurfaceObjectsTexturesGroupsT
    >

export type SurfaceIndividualTexturesGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
        surfaces.texturing.SurfaceTexturesGroupKinds &
        surfaces.texturing.SurfaceIndividualTexturesGroupKinds,
        SurfaceIndividualTexturesGroupsT
    >

export type SurfaceTexturesGroupsKindsMappedGroupsT =
    SurfaceObjectsTexturesGroupsKindsMappedGroupsT &
    SurfaceIndividualTexturesGroupsKindsMappedGroupsT

export const SurfaceObjectsTexturesGroupsKindsMappedGroupsTemplate: SurfaceObjectsTexturesGroupsKindsMappedGroupsT = {
    [surfaces.texturing.SurfaceObjectsTexturesGroupKindKey]: SurfaceObjectsTexturesGroupsTemplate,
    [surfaces.texturing.SurfaceTexturesGroupKindKey]: SurfaceObjectsTexturesGroupsTemplate
}

export const SurfaceIndividualTexturesGroupsKindsMappedGroupsTemplate: SurfaceIndividualTexturesGroupsKindsMappedGroupsT = {
    [surfaces.texturing.SurfaceIndividualTexturesGroupKindKey]: SurfaceIndividualTexturesGroupsTemplate,
    [surfaces.texturing.SurfaceTexturesGroupKindKey]: SurfaceIndividualTexturesGroupsTemplate
}

export const SurfaceTexturesGroupsKindsMappedGroupsTemplate = {
    [surfaces.texturing.SurfaceObjectsTexturesGroupKindKey]: SurfaceObjectsTexturesGroupsKindsMappedGroupsTemplate[surfaces.texturing.SurfaceObjectsTexturesGroupKindKey],
    [surfaces.texturing.SurfaceIndividualTexturesGroupKindKey]: SurfaceIndividualTexturesGroupsKindsMappedGroupsTemplate[surfaces.texturing.SurfaceIndividualTexturesGroupKindKey],
    [surfaces.texturing.SurfaceTexturesGroupKindKey]: mergeGroups(
        SurfaceObjectsTexturesGroupsKindsMappedGroupsTemplate[surfaces.texturing.SurfaceTexturesGroupKindKey],
        SurfaceIndividualTexturesGroupsKindsMappedGroupsTemplate[surfaces.texturing.SurfaceTexturesGroupKindKey]
    )
} as SurfaceTexturesGroupsKindsMappedGroupsT

export type SurfaceT = surfaces.Surface<IndicesT, SampleT> &
    surfaces.measuring.SurfaceWithSurfaceArea<IndicesT, SampleT> &
    surfaces.texturing.SurfaceWithInfluencesTextureUsingSurfaceUVUnwrapping<
            IndicesT,
            SurfaceUVUnwrappingGroupT,
            Objects,
            InfluenceGroup,
            SampleT
        > &
    surfaces.texturing.SurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            IndicesT,
            SurfaceUVUnwrappingGroupT,
            Objects,
            InfluenceGroup,
            SurfaceObjectsTextureLocationsT,
            SurfaceObjectsTextureLocationsT,
            SurfaceObjectsTextureLocationsT,
            SurfaceCombinedTextureSamplingContextT,
            SurfaceObjectsTextureLocationsGroupsT,
            SurfaceObjectsTexturesGroupsT,
            SurfaceCombinedTextureLocationT,
            SurfaceCombinedTextureSampleT,
            SurfaceCombinedTextureSampleT,
            SurfaceCombinedTextureSampleT,
            SurfaceCombinedTextureT,
            SurfaceCombinedTexturesGrouped,
            SampleElementType
        > &
    surfaces.texturing.SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
            IndicesT,
            SurfaceUVUnwrappingGroupT,
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingValuesT,
            OtherInterpolatingValuesGrouped,
            SampleElementType
        > &
    surfaces.rendering.SurfaceWithRendering<
            IndicesT,
            VolumeLocationT,
            SampleElementType,
            SurfaceUVUnwrappingGroupT
        > &
    {}

export type SurfaceInstanceT =
    surfaces.SurfaceInstance<SurfaceT> &
    surfaces.rendering.SurfaceWithRenderingInstancer<
        IndicesT,
        VolumeLocationT,
        SampleT,
        SurfaceUVUnwrappingGroupT
    > &
    {}

// let a!: SampleProcessingContextT
// a[fields.MultiObjectsInfluencesGroupsDefaultKey]

export type SurfaceProcessingContextT = surfaces.SurfaceProcessingContext<SampleProcessingContextT> &
    // surfaces.SurfaceProcessingContextWithSurfaceArea<SampleProcessingContextT> (doesn't exist) &
    surfaces.texturing.SurfaceProcessingContextWithInfluencesTextureUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroupT,
            Objects,
            InfluenceGroup,
            SampleProcessingContextT
        > &
    surfaces.texturing.SurfaceProcessingContextWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroupT,
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            SurfaceObjectsTextureLocationsGroupsT,
            MultiObjectsGrouped<Objects, SurfaceObjectsTextureLocationsGroupsT>,
            SurfaceObjectsTextureLocationsT,
            SurfaceObjectsTexturesGroupsT,
            ObjectsSurfaceObjectsTexturesGrouped,
            SampleProcessingContextT
        > &
    surfaces.texturing.SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroupT,
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingValuesT,
            OtherInterpolatingGroupsKindsT,
            SampleProcessingContextT
        > &
    textures.TextureableProcessingContext<
            SurfaceT,
            SurfaceCombinedTextureLocationT,
            SurfaceCombinedTextureSampleT,
            SurfaceCombinedTextureLocationT,
            SurfaceCombinedTextureLocationT,
            SurfaceCombinedTextureSampleT,
            SurfaceCombinedTextureSampleT,
            SurfaceCombinedTextureSamplingContextT
        > &
    surfaces.rendering.SurfaceProcessingContextWithRendering<
            SurfaceUVUnwrappingGroupT,
            SampleProcessingContextT,
            VolumeLocationT
        >

export type SurfaceProcessingContext_MultiObjects =
    MultiObjectsGroupsProcessingContext<
        SurfaceUVUnwrappingGroupT,
        surfaces.UVunwrapping.SurfaceUVUnwrappingGroupKinds
    > &
    MultiObjectsGroupsWithFieldsProcessingContext<
        InfluenceGroup,
        MultiObjectsInfluencesGroupKinds,
        fields.MultiObjectsInfluences<Objects>,
        fields.MultiObjectsInfluencesElementType<Objects>,
        fields.MultiObjectsInfluencesFuseMode<Objects>,
        fields.fields.MultiObjectsField<number, Objects>
    > &
    MultiObjectsWithGroupFieldsProcessingContext<
        Objects,
        SurfaceObjectsTexturesGroupsT,
        ObjectsSurfaceObjectsTexturesGrouped,
        surfaces.texturing.SurfaceObjectsTexturesGroupKinds,
        SurfaceObjectsTextureSamplesT
    > &
    MultiObjectsWithGroupFieldsProcessingContext<
        Objects,
        SurfaceObjectsTexturesGroupsT,
        ObjectsSurfaceObjectsTexturesGrouped,
        surfaces.texturing.SurfaceTexturesGroupKinds,
        SurfaceObjectsTextureSamplesT
    > &
    MultiObjectsGroupsWithFieldsProcessingContext<
        SurfaceIndividualTexturesGroupsT,
        surfaces.texturing.SurfaceIndividualTexturesGroupKinds,
        SurfaceIndividualTextureSampleT
    > &
    MultiObjectsGroupsWithFieldsProcessingContext<
        SurfaceIndividualTexturesGroupsT,
        surfaces.texturing.SurfaceTexturesGroupKinds,
        SurfaceIndividualTextureSampleT
    > &
    MultiObjectsWithGroupFieldsProcessingContext<
        Objects,
        OtherInterpolatingGroupsT,
        ObjectsOtherInterpolatingGrouped,
        OtherInterpolatingGroupsKindsT,
        OtherInterpolatingValuesT
    > &
    {}

// type A1 = SurfaceProcessingContextT
// type A2 = SurfaceProcessingContext_MultiObjects
// let a1!: A1
// let a2!: A2
// a1[MultiObjectsProcessingContextGroupKinds].interpolating
// a2[MultiObjectsProcessingContextGroupKinds].interpolating
// a1.interpolating.hair.density
// a2.interpolating.hair.density
// a1 = a2 // error
// a2 = a1 // works
// type A_diff = Omit<A1, keyof A2>
// let a_diff!: A_diff
// a_diff.material.textures // ...
// a_diff.sample as SampleProcessingContextT

export const SurfaceProcessingContext_MultiObjects_Template: SurfaceProcessingContext_MultiObjects = {
    ...SurfaceUVUnwrappingGroupsKindsMappedGroupsTemplate,

    // influences is a feature of the sample
    ...MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate,

    ...mapGroups(InfluenceGroupTemplate, () => ({
        [GroupFieldKey]: new fields.fields.MultiObjectsField(fields.fields.ScalarField.instance, undefined!),
    })),

    material: {
        textures: <surfaces.rendering.material.Material_Groups_TextureContexts<VolumeLocationT>>surfaces.rendering.material.Material_Groups_TextureContexts_Template
    },

    ...SurfaceTexturesGroupsKindsMappedGroupsTemplate,

    ...OtherInterpolatingGroupsKindsMappedGroupsTemplate,

    [MultiObjectsProcessingContextObjectsGrouped]: {
        // influences is a feature of the sample
        // // [MultiObjectsInfluencesGroupsDefaultKey]: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
        // ...(mapGroups(
        //     InfluenceGroupTemplate,
        //     () => ({ [MultiObjectsGroupedObjectsKey]: {} as Objects })
        // ) as ObjectsInfluencesGrouped),

        // ...({
        //     ...({
        //         hair: {
        //             density: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
        //             length: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
        //         },
        //         rigidity: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
        //     } as MultiObjectsGrouped<Objects, OtherInterpolatingGroupsT>),
        // } as MultiObjectsGrouped<Objects, SurfaceObjectsTexturesGroupsT>),
    },

    [MultiObjectsProcessingContextGroupKinds]: {
        // influences is a feature of the samplemplate,
        ...MultiObjectsInfluencesGroupKindsTemplate,

        ...surfaces.UVunwrapping.SurfaceUVUnwrappingGroupKindsTemplate,

        ...surfaces.texturing.SurfaceObjectsTexturesGroupKindsTemplate,
        ...surfaces.texturing.SurfaceIndividualTexturesGroupKindsTemplate,
        ...surfaces.texturing.SurfaceTexturesGroupKindsTemplate,

        ...OtherInterpolatingGroupsKindsTemplate,
    }
}

// let s1!: SurfaceProcessingContext_MultiObjects
// let s2!: SurfaceProcessingContextT
// let s3!: MultiObjectsGroupsKindsTemplateMapped<surfaces.SurfaceIndividualTexturesGroupKinds, SurfaceIndividualTexturesGroupsT>
// let s3_a = s3[surfaces.SurfaceIndividualTexturesGroupKindKey].material.textures.diffuse // works
// let s2_a = s2[surfaces.SurfaceIndividualTexturesGroupKindKey].material.textures.diffuse // works
// let s2_b = s2[surfaces.SurfaceIndividualTexturesGroupKindKey].material.textures.doesntExist // error
// s3 = s2 // works
// s3 = s1 // works
// s1 = s2 // works
// s2 = s1 // error, missing "sample"

export type SolidT =
    solids.Solid<IndicesT, SampleT, SurfaceT> &
    solids.processors.SolidWithEnclosingVolume<IndicesT, SampleT, SurfaceT> &
    {}

export type SolidProcessingContextT =
    solids.SolidProcessingContext<SampleProcessingContextT, SurfaceProcessingContextT> &
    // solids.SolidProcessingContextWithEnclosingVolume<SampleProcessingContextT, SurfaceProcessingContextT> (doesn't exist) &
    {}

export type VolumeProcessingT =
    volumes.VolumeProcessing<
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT,
            VolumeT
        > &
    // volumes.sampling.VolumeProcessingWithSampling<
    //         IndicesT,
    //         {},
    //         any,
    //         {},
    //         any,
    //         {},
    //         {},
    //         VolumeLocationT,
    //         SampleT,
    //         SampleProcessingContextT,
    //         VolumeSamplingContextT //,
    //         // ...
    //     > &
    volumes.sampling.VolumeProcessingWithSampling<
            IndicesT,
            {},
            {},
            {},
            {},
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT //,
            // ...
        > &
    volumes.sampling.VolumeProcessingWithSampling<
            IndicesT,
            octtree.OctTreeWithDualGroups,
            octtree.OctTreeWithDualValuesGrouped,
            octtree.OctTreeWithDualLayersGrouped,
            octtree.OctTreeWithDualOctTreesGrouped,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT //,
            // ...
        > &
    volumes.sampling.VolumeProcessingWithSamplingWithAdjacency<
            IndicesT,
            surfaces.sampling.SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
            surfaces.sampling.SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
            surfaces.sampling.SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped,
            surfaces.sampling.SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT //,
            // ...
        > &
    surfaces.meshing.VolumeProcessingWithMeshing<
            IndicesT,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT,
            VolumeT,
            SurfaceT
        > &
    surfaces.VolumeProcessingWithSurfaces<
            IndicesT,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT,
            VolumeT,
            SurfaceT
        > &
    solids.VolumeProcessingWithSolids<
            IndicesT,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT,
            VolumeT,
            SurfaceT,
            SolidT
        >

export type VolumeProcessingInstanceT =
    surfaces.VolumeProcessingWithSurfacesInstance<
        IndicesT,
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        SampleT,
        SampleElementType,
        SampleFuseMode,
        SampleProcessingContextT,
        VolumeDomainSamplingContextT,
        VolumeT,
        SurfaceT,
        SurfaceInstanceT,
        VolumeProcessingT
    >

export type VolumeProcessingContextT =
    volumes.VolumeProcessingContext<
            SampleProcessingContextT
        > &
    // volumes.sampling.VolumeProcessingContextWithSampling<
    //         IndicesT,
    //         {},
    //         any,
    //         {},
    //         any,
    //         {},
    //         {},
    //         VolumeLocationT,
    //         SampleT,
    //         SampleProcessingContextT,
    //         VolumeSamplingContextT //,
    //         // ...
    //     > &
    volumes.sampling.VolumeProcessingContextWithSampling<
            IndicesT,
            octtree.OctTreeWithDualGroups,
            octtree.OctTreeWithDualValuesGrouped,
            octtree.OctTreeWithDualLayersGrouped,
            octtree.OctTreeWithDualOctTreesGrouped,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT //,
            // ...
        > &
    volumes.sampling.VolumeProcessingContextWithSampling<
            IndicesT,
            surfaces.sampling.SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeGroups,
            surfaces.sampling.SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeValuesGrouped,
            surfaces.sampling.SurfaceNetVolumeSamplingSubdivisionProcessingOctTreeLayersGrouped,
            surfaces.sampling.SurfaceNetVolumeSamplingSubdivisionProcessingOctTreesGrouped,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT //,
            // ...
        > &
    surfaces.VolumeProcessingWithSurfacesContext<
            SampleProcessingContextT,
            SurfaceProcessingContextT
        > &
    surfaces.meshing.VolumeProcessingContextWithMeshing<
            IndicesT,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT,
            SurfaceProcessingContextT
        > &
    solids.VolumeProcessingWithSolidsContext<
            SampleProcessingContextT,
            SurfaceProcessingContextT,
            SolidProcessingContextT
        > &
    {}

export type VolumeProcessingContext_MultiObjects =
    MultiObjectsGroupsProcessingContext<{}, {}> &
    MultiObjectsProcessingContext<Objects, {}, MultiObjectsGroupsMapped<{}, Objects>, {}>

export const VolumeProcessingContext_MultiObjects_Template: VolumeProcessingContext_MultiObjects = {
    [MultiObjectsProcessingContextObjectsGrouped]: {
    },

    [MultiObjectsProcessingContextGroupKinds]: {
    }
}

export type VolumeT =
    volumes.volumes.VolumeWithBoundingBox<
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        SampleT,
        SampleElementType,
        SampleFuseMode,
        SampleProcessingContextT,
        VolumeDomainSamplingContextT
    >

export type VolumeProcessorT =
    volumes.VolumeProcessor<
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT,
            VolumeT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >

export type VolumeSurfaceProcessingContextT =
    surfaces.VolumeSurfaceProcessingContext<
            SampleProcessingContextT,
            SurfaceProcessingContextT,
            VolumeProcessingContextT
        >

export type VolumeSurfaceProcessorT =
    surfaces.VolumeSurfaceProcessor<
            IndicesT,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >

export type VolumeSolidProcessingContextT =
    solids.VolumeSolidProcessingContext<
            SampleProcessingContextT,
            SurfaceProcessingContextT,
            SolidProcessingContextT,
            VolumeProcessingContextT
        >

export type VolumeSolidProcessorT =
    solids.VolumeSolidProcessor<
            IndicesT,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            SampleT,
            SampleElementType,
            SampleFuseMode,
            SampleProcessingContextT,
            VolumeDomainSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceProcessingContextT,
            SolidT,
            SolidProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >