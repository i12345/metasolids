import { FieldPoint, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupedObjectsKey, mapGroups, MultiObjectsGroupsCombinedTemplate, MultiObjectsGroupsKindsTemplateMapped, MultiObjectsGroupsProcessingContext, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsGroupsCombined, MultiObjectsInfluencesProcessingContext, MultiObjectsGrouped, MultiObjectsInfluencesGroupsDefault, MultiObjectsTemplate, MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate, MultiObjectsProcessingContext, MultiObjectsProcessingContextGroupKinds, MultiObjectsProcessingContextObjectsGrouped, mergeGroups, MultiObjectsInfluencesGroupsDefaultTemplate, MultiObjectsGroupsCombinedMapped, MultiObjectsInfluencesGroupKinds, MultiObjectsDomainInternalPreservedGroupsKindsTemplate, MultiObjectsDomainInternalPreservedGroupsKinds, mergeGroupsInplace, MultiObjectsDomainInternalPreservedGroupsKindsKey, groupPaths } from "../fields/index.js"
import { textures, volumes, surfaces, solids } from "../index.js"
import { onlyOne } from "../utils/only-one.js"
import { MetaShapeVolumeMultiObjectsInternalPreservedGroups, MetaShapeVolumeMultiObjectsInternalPreservedGroupsTemplate } from "../volumes/metashapes/metashape.js"

export type VolumeLocationT = volumes.VolumeLocation

export type Objects = MultiObjectsTemplate
export type InfluenceGroup = MultiObjectsInfluencesGroupsDefault
export const InfluenceGroupTemplate = MultiObjectsInfluencesGroupsDefaultTemplate
export type ObjectsInfluencesGrouped = MultiObjectsGrouped<Objects, InfluenceGroup>

export type SurfaceObjectsTextureLocationsGroupsT = surfaces.texturing.SurfaceObjectsTextureLocationsGroupsDefault
export type ObjectsSurfaceObjectsTextureLocationsGrouped = MultiObjectsGrouped<Objects, SurfaceObjectsTextureLocationsGroupsT>

export const SurfaceObjectsTextureLocationsGroupsTemplate: SurfaceObjectsTextureLocationsGroupsT = surfaces.texturing.SurfaceObjectsTextureLocationsGroupsDefaultTemplate

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

export type SurfaceObjectsTextureLocationsT = textures.TextureLocation
export type SurfaceCombinedTextureLocationT = textures.TextureLocation

export type SurfaceUVUnwrappingGroupT = surfaces.texturing.SurfaceUVUnwrappingGroupsDefault
export const SurfaceUVUnwrappingGroupTemplate: SurfaceUVUnwrappingGroupT = surfaces.texturing.SurfaceUVUnwrappingGroupsDefaultTemplate
export const SurfaceUVUnwrappingGroup_Path = onlyOne(groupPaths(SurfaceUVUnwrappingGroupTemplate))

export type SurfaceUVUnwrappingGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
        surfaces.texturing.SurfaceUVUnwrappingGroupKinds,
        SurfaceUVUnwrappingGroupT
    >

export const SurfaceUVUnwrappingGroupsKindsMappedGroupsTemplate: SurfaceUVUnwrappingGroupsKindsMappedGroupsT = {
    [surfaces.texturing.SurfaceUVUnwrappingGroupKindKey]: SurfaceUVUnwrappingGroupTemplate
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

export type Volume_Context_PreservedGroupsT =
    volumes.metashapes.MetaShapeVolumeMultiObjectsInternalPreservedGroups &
    volumes.metashapes.MetaSplineSegmentMultiObjectsInternalPreservedGroups &
    {}

export const Volume_Context_PreservedGroupsTemplate = [
    volumes.metashapes.MetaShapeVolumeMultiObjectsInternalPreservedGroupsTemplate,
    volumes.metashapes.MetaSplineSegmentMultiObjectsInternalPreservedGroupsTemplate,
].reduce(mergeGroupsInplace, {}) as Volume_Context_PreservedGroupsT

export type Volume_Context_PreservedGroupsKinds =
    MultiObjectsDomainInternalPreservedGroupsKinds

export const Volume_Context_PreservedGroupsKindsTemplate: Volume_Context_PreservedGroupsKinds = {
    ...MultiObjectsDomainInternalPreservedGroupsKindsTemplate
}

export type Volume_Context_PreservedGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
            MultiObjectsDomainInternalPreservedGroupsKinds,
            Volume_Context_PreservedGroupsT
        >

export const Volume_Context_PreservedGroupsKindsMappedGroupsTemplate: Volume_Context_PreservedGroupsKindsMappedGroupsT = {
    [MultiObjectsDomainInternalPreservedGroupsKindsKey]: Volume_Context_PreservedGroupsTemplate
}

export type Volume_Sample_PreservedGroupsT =
    {}

export const Volume_Sample_PreservedGroupsTemplate = [
].reduce(mergeGroupsInplace, {}) as Volume_Sample_PreservedGroupsT

export type Volume_Sample_PreservedGroupsKindsT =
    MultiObjectsInfluencesGroupKinds &
    surfaces.texturing.SurfaceTextureLocationsGroupKinds &
    OtherInterpolatingGroupsKindsT &
    MultiObjectsDomainInternalPreservedGroupsKinds

export const Volume_Sample_PreservedGroupsKindsTemplate: Volume_Sample_PreservedGroupsKindsT = {
    ...MultiObjectsInfluencesGroupKindsTemplate,
    ...surfaces.texturing.SurfaceTextureLocationsGroupKindsTemplate,
    ...OtherInterpolatingGroupsKindsTemplate,
    ...MultiObjectsDomainInternalPreservedGroupsKindsTemplate,
}

export type Volume_Sample_PreservedGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
            MultiObjectsDomainInternalPreservedGroupsKinds,
            Volume_Sample_PreservedGroupsT
        >

export const Volume_Sample_PreservedGroupsKindsMappedGroupsTemplate: Volume_Sample_PreservedGroupsKindsMappedGroupsT = {
    [MultiObjectsDomainInternalPreservedGroupsKindsKey]: Volume_Sample_PreservedGroupsTemplate
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
            OtherInterpolatingGroupsKindsT
        > &
    MultiObjectsProcessingContext<
            Objects,
            Volume_Sample_PreservedGroupsT,
            MultiObjectsGrouped<Objects, Volume_Sample_PreservedGroupsT>,
            MultiObjectsDomainInternalPreservedGroupsKinds
        > &
    {}

export type SampleProcessingContext_MultiObjects =
    MultiObjectsInfluencesProcessingContext<
        Objects,
        InfluenceGroup,
        ObjectsInfluencesGrouped
    > &
    MultiObjectsProcessingContext<
        Objects,
        SurfaceObjectsTextureLocationsGroupsT,
        ObjectsSurfaceObjectsTextureLocationsGrouped,
        surfaces.texturing.SurfaceObjectsTextureLocationsGroupKinds
    > &
    MultiObjectsProcessingContext<
        Objects,
        SurfaceObjectsTextureLocationsGroupsT,
        ObjectsSurfaceObjectsTextureLocationsGrouped,
        surfaces.texturing.SurfaceTextureLocationsGroupKinds
    > &
    MultiObjectsProcessingContext<
        Objects,
        OtherInterpolatingGroupsT,
        ObjectsOtherInterpolatingGrouped,
        OtherInterpolatingGroupsKindsT
    > &
    MultiObjectsProcessingContext<
        Objects,
        Volume_Sample_PreservedGroupsT,
        MultiObjectsGrouped<Objects, Volume_Sample_PreservedGroupsT>,
        MultiObjectsDomainInternalPreservedGroupsKinds
    > &
    {}

export const SampleProcessingContext_MultiObjects_Template: SampleProcessingContext_MultiObjects = {
    ...MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate,

    ...SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsTemplate,

    ...OtherInterpolatingGroupsKindsMappedGroupsTemplate,

    ...Volume_Sample_PreservedGroupsKindsMappedGroupsTemplate,

    [MultiObjectsProcessingContextObjectsGrouped]: {
        // [MultiObjectsInfluencesGroupsDefaultKey]: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
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

        ...MultiObjectsDomainInternalPreservedGroupsKindsTemplate,
    }
}

// export type Sample_MultiObjectsMappedGroups =
//     InfluenceGroup &
//     SurfaceObjectsTextureLocationsGroupsT &
//     OtherInterpolatingGroupsT &
//     {}

// export const Sample_MultiObjectsMappedGroups_Template: Sample_MultiObjectsMappedGroups = mergeGroups(
//     mergeGroups(
//         InfluenceGroupTemplate,
//         SurfaceObjectsTextureLocationsGroupsTemplate
//     ),
//     OtherInterpolatingGroupsTemplate
// )

// let a!: SampleProcessingContext_MultiObjects
// let b!: SampleProcessingContextT
// let c!: MultiObjectsProcessingContext<
//         Objects,
//         OtherInterpolatingGroupsT,
//         ObjectsOtherInterpolatingGrouped,
//         OtherInterpolatingGroupsKindsT
//     >
// a = b // works
// b = a // works
// c = a // works
// // Types are equal, although other context types may need additional
// // information than just the multi objects/groups/kinds info.

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
    
export type SurfaceCombinedTexelTypesT = SurfaceObjectsTexelTypesT
export type SurfaceCombinedTexturesTexelTypesGrouped = MultiObjectsGroupsCombinedMapped<
        SurfaceObjectsTexturesGroupsT,
        SurfaceObjectsTexelTypesT,
        SurfaceObjectsTexturesTexelTypesGrouped
    >

export type SurfaceCombinedTextureSampleT =
    OtherInterpolatingValuesT &
    {}

export type SurfaceCombinedTextureT =
    textures.Texture<SurfaceCombinedTextureLocationT, OtherInterpolatingValuesT> &
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
    surfaces.rendering.SurfaceWithRendering_TextureGroups &
    {}

export const SurfaceIndividualTexturesGroupsTemplate: SurfaceIndividualTexturesGroupsT = mergeGroups(
    SurfaceCombinedTexturesGroupsTemplate,
    surfaces.rendering.SurfaceWithRendering_TextureGroupsTemplate,
)

export type SurfaceIndividualTexturesGrouped =
    SurfaceCombinedTexturesGrouped &
    surfaces.rendering.SurfaceWithRender_TexturesTemplated<VolumeLocationT>

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

export type SurfaceT = surfaces.Surface<SampleT> &
    surfaces.measuring.SurfaceWithSurfaceArea<SampleT> &
    surfaces.texturing.SurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroupT,
            Objects,
            InfluenceGroup,
            SurfaceObjectsTextureLocationsGroupsT,
            SurfaceObjectsTexturesGroupsT,
            SurfaceObjectsTextureLocationsT,
            SurfaceCombinedTextureSampleT,
            SurfaceCombinedTextureT//,
            // SurfaceCombinedTexturesGrouped,
            // SampleT
        > &
    surfaces.texturing.SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroupT,
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingValuesT,
            OtherInterpolatingValuesGrouped,
            SampleT
        > &
    surfaces.rendering.SurfaceWithRendering<
            VolumeLocationT,
            SurfaceUVUnwrappingGroupT
        > &
    {}

export type SurfaceProcessingContextT = surfaces.SurfaceProcessingContext<SampleProcessingContextT> &
    // surfaces.SurfaceProcessingContextWithSurfaceArea<SampleProcessingContextT> (doesn't exist) &
    surfaces.texturing.SurfaceProcessingContextWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroupT,
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            SurfaceObjectsTextureLocationsGroupsT,
            MultiObjectsGrouped<Objects, SurfaceObjectsTextureLocationsGroupsT>,
            SurfaceObjectsTexturesGroupsT,
            ObjectsSurfaceObjectsTexturesGrouped,
            SampleProcessingContextT
        > &
    surfaces.texturing.SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroupT,
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingGroupsKindsT,
            SampleProcessingContextT
        > &
    textures.TextureableProcessingContext<
            SurfaceT,
            SurfaceCombinedTextureLocationT,
            SurfaceCombinedTextureSampleT,
            textures.TextureSamplingContext<SurfaceCombinedTextureLocationT>
        > &
    surfaces.rendering.SurfaceProcessingContextWithRendering<
            VolumeLocationT,
            SurfaceUVUnwrappingGroupT
        >

export type SurfaceProcessingContext_MultiObjects =
    // SampleProcessingContext_MultiObjects &
    MultiObjectsGroupsProcessingContext<
        SurfaceUVUnwrappingGroupT,
        surfaces.texturing.SurfaceUVUnwrappingGroupKinds
    > &
    MultiObjectsProcessingContext<
        Objects,
        SurfaceObjectsTexturesGroupsT,
        ObjectsSurfaceObjectsTexturesGrouped,
        surfaces.texturing.SurfaceObjectsTexturesGroupKinds
    > &
    MultiObjectsProcessingContext<
        Objects,
        SurfaceObjectsTexturesGroupsT,
        ObjectsSurfaceObjectsTexturesGrouped,
        surfaces.texturing.SurfaceTexturesGroupKinds
    > &
    MultiObjectsGroupsProcessingContext<
        SurfaceIndividualTexturesGroupsT,
        surfaces.texturing.SurfaceIndividualTexturesGroupKinds
    > &
    MultiObjectsGroupsProcessingContext<
        SurfaceIndividualTexturesGroupsT,
        surfaces.texturing.SurfaceTexturesGroupKinds
    > &
    MultiObjectsProcessingContext<
        Objects,
        OtherInterpolatingGroupsT,
        ObjectsOtherInterpolatingGrouped,
        OtherInterpolatingGroupsKindsT
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

    // ...MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate,

    ...SurfaceTexturesGroupsKindsMappedGroupsTemplate,

    ...OtherInterpolatingGroupsKindsMappedGroupsTemplate,

    [MultiObjectsProcessingContextObjectsGrouped]: {
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
        // ...MultiObjectsInfluencesGroupKindsTemplate,
        
        ...surfaces.texturing.SurfaceUVUnwrappingGroupKindsTemplate,

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
    solids.Solid<SampleT, SurfaceT> &
    solids.SolidWithEnclosingVolume<SampleT, SurfaceT> &
    {}

export type SolidProcessingContextT =
    solids.SolidProcessingContext<SampleProcessingContextT, SurfaceProcessingContextT> &
    // solids.SolidProcessingContextWithEnclosingVolume<SampleProcessingContextT, SurfaceProcessingContextT> (doesn't exist) &
    {}

export type VolumeProcessingT =
    volumes.VolumeProcessing<SampleT> &
    surfaces.meshing.VolumeSurfaceMeshingProcessing<SampleT> &
    surfaces.VolumeSurfacesProcessing<SampleT, SurfaceT> &
    solids.VolumeSolidsProcessing<
            SampleT,
            SurfaceT,
            SolidT
        >

export type VolumeProcessingContextT =
    volumes.VolumeProcessingContext<
            VolumeLocationT,
            SampleT,
            SampleProcessingContextT
        > &
    surfaces.VolumeSurfacesProcessingContext<
            VolumeLocationT,
            SampleT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
        > &
    surfaces.meshing.VolumeSurfaceMeshingProcessingContext<
            VolumeLocationT,
            SampleT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
        > &
    solids.VolumeSolidsProcessingContext<
            VolumeLocationT,
            SampleT,
            SampleProcessingContextT,
            SurfaceProcessingContextT,
            SolidProcessingContextT
        > &
    MultiObjectsProcessingContext<
            Objects,
            Volume_Context_PreservedGroupsT,
            MultiObjectsGrouped<Objects, Volume_Context_PreservedGroupsT>,
            MultiObjectsDomainInternalPreservedGroupsKinds
        > &
    {}

export type VolumeT = volumes.Volume<VolumeLocationT, SampleT, VolumeProcessingContextT>

export type VolumeProcessingContext_MultiObjects =
    MultiObjectsProcessingContext<
            Objects,
            Volume_Context_PreservedGroupsT,
            MultiObjectsGrouped<Objects, Volume_Context_PreservedGroupsT>,
            MultiObjectsDomainInternalPreservedGroupsKinds
        > &
    {}

export const VolumeProcessingContext_MultiObjects_Template: VolumeProcessingContext_MultiObjects = {
    ...Volume_Context_PreservedGroupsKindsMappedGroupsTemplate,

    [MultiObjectsProcessingContextObjectsGrouped]: {
        ...(mapGroups(
            Volume_Context_PreservedGroupsTemplate,
            () => ({ [MultiObjectsGroupedObjectsKey]: {} as Objects })
        ) as MultiObjectsGrouped<Objects, Volume_Context_PreservedGroupsT>),
    },

    [MultiObjectsProcessingContextGroupKinds]: {
        ...MultiObjectsDomainInternalPreservedGroupsKindsTemplate,
    },
}

export type VolumeProcessorT =
    volumes.VolumeProcessor<
            VolumeLocationT,
            SampleT,
            SampleProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >

export type VolumeSurfaceProcessingContextT =
    surfaces.VolumeSurfaceProcessingContext<
            VolumeLocationT,
            SampleT,
            SampleProcessingContextT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >

export type VolumeSurfaceProcessorT =
    surfaces.VolumeSurfaceProcessor<
            VolumeLocationT,
            SampleT,
            SampleProcessingContextT,
            SurfaceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >

export type VolumeSolidProcessingContextT =
    solids.VolumeSolidProcessingContext<
            VolumeLocationT,
            SampleT,
            SampleProcessingContextT,
            SurfaceProcessingContextT,
            SolidProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
    >

export type VolumeSolidProcessorT =
    solids.VolumeSolidProcessor<
            VolumeLocationT,
            SampleT,
            SampleProcessingContextT,
            SurfaceT,
            SurfaceProcessingContextT,
            SolidT,
            SolidProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >