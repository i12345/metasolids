import { FieldPoint, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupedObjectsKey, mapGroups, MultiObjectsGroupsCombinedTemplate, MultiObjectsGroupsKindsTemplateMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate_Leaf, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsGroupsCombined, MultiObjectsInfluencesProcessingContext, MultiObjectsGrouped, MultiObjectsInfluencesGroupsDefault, MultiObjectsTemplate, MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate, MultiObjectsProcessingContext, MultiObjectsProcessingContextGroupKinds, MultiObjectsProcessingContextObjectsGrouped, mergeGroups, MultiObjectsInfluencesGroupsDefaultTemplate, MultiObjectsGroupsCombinedMapped, MultiObjectsInfluencesGroupsKindsMappedGroupsDefault, MultiObjectsInfluencesGroupKinds } from "../fields/index.js"
import { textures, volumes, surfaces, solids } from "../index.js"

export type VolumeLocationT = volumes.VolumeLocation

export type Objects = MultiObjectsTemplate
export type InfluenceGroup = MultiObjectsInfluencesGroupsDefault
export const InfluenceGroupTemplate = MultiObjectsInfluencesGroupsDefaultTemplate
export type ObjectsInfluencesGrouped = MultiObjectsGrouped<Objects, InfluenceGroup>

export type SurfaceObjectsTextureLocationsGroupsT = surfaces.SurfaceObjectsTextureLocationsGroupsDefault
export type ObjectsSurfaceObjectsTextureLocationsGrouped = MultiObjectsGrouped<Objects, SurfaceObjectsTextureLocationsGroupsT>

export const SurfaceObjectsTextureLocationsGroupsTemplate: SurfaceObjectsTextureLocationsGroupsT = surfaces.SurfaceObjectsTextureLocationsGroupsDefaultTemplate

export type SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsT = 
    MultiObjectsGroupsKindsTemplateMapped<
        surfaces.SurfaceTextureLocationsGroupKinds &
        surfaces.SurfaceObjectsTextureLocationsGroupKinds,
        SurfaceObjectsTextureLocationsGroupsT
    >

export const SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsTemplate: SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsT = {
    [surfaces.SurfaceObjectsTextureLocationsGroupKindKey]: SurfaceObjectsTextureLocationsGroupsTemplate,
    [surfaces.SurfaceTextureLocationsGroupKindKey]: SurfaceObjectsTextureLocationsGroupsTemplate
}

export type SurfaceObjectsTextureLocationsT = textures.TextureLocation
export type SurfaceCombinedTextureLocationT = textures.TextureLocation

export type SurfaceUVUnwrappingGroupT = surfaces.SurfaceUVUnwrappingGroupsDefault
export const SurfaceUVUnwrappingGroupTemplate: SurfaceUVUnwrappingGroupT = surfaces.SurfaceUVUnwrappingGroupsDefaultTemplate
export type SurfaceUVUnwrappingGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
        surfaces.SurfaceUVUnwrappingGroupKinds,
        SurfaceUVUnwrappingGroupT
    >

export const SurfaceUVUnwrappingGroupsKindsMappedGroupsTemplate: SurfaceUVUnwrappingGroupsKindsMappedGroupsT = {
    [surfaces.SurfaceUVUnwrappingGroupKindKey]: SurfaceUVUnwrappingGroupTemplate
}

/**
 * Customizeable
 */
export type OtherInterpolatingGroupsT = {
    rigidity: MultiObjectsGroupsTemplateLeaf
    hair: {
        density: MultiObjectsGroupsTemplateLeaf
        length: MultiObjectsGroupsTemplateLeaf
    }
}

/**
 * Customizeable
 */
export const OtherInterpolatingGroupsTemplate: OtherInterpolatingGroupsT = {
    rigidity: MultiObjectsGroupsTemplate_Leaf,
    hair: {
        density: MultiObjectsGroupsTemplate_Leaf,
        length: MultiObjectsGroupsTemplate_Leaf,
    }
}

export type ObjectsOtherInterpolatingGrouped = MultiObjectsGrouped<Objects, OtherInterpolatingGroupsT>

/**
 * Customizeable
 */
export type OtherInterpolatingGroupsKindsT = {
    factors: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

/**
 * Customizeable
 */
export const OtherInterpolatingGroupsKindsTemplate: OtherInterpolatingGroupsKindsT = {
    factors: MultiObjectsGroupsKindsTemplate_Leaf
}

export type OtherInterpolatingGroupsKindsMappedGroups = MultiObjectsGroupsKindsTemplateMapped<OtherInterpolatingGroupsKindsT, OtherInterpolatingGroupsT>

export const OtherInterpolatingGroupsKindsMappedGroupsTemplate: OtherInterpolatingGroupsKindsMappedGroups = {
    factors: OtherInterpolatingGroupsTemplate
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
    rigidity: number
    hair: {
        density: number
        length: number
    }
}

export type InterpolatingGroupsT =
    InfluenceGroup &
    SurfaceObjectsTextureLocationsGroupsT &
    OtherInterpolatingGroupsT &
    {}

export type InterpolatingGroupsKindsT =
    MultiObjectsInfluencesGroupKinds &
    surfaces.SurfaceTextureLocationsGroupKinds &
    OtherInterpolatingGroupsKindsT &
    {}

export const InterpolatingGroupsTemplate: InterpolatingGroupsT = {
    ...MultiObjectsInfluencesGroupsDefaultTemplate,
    ...SurfaceObjectsTextureLocationsGroupsTemplate,
    ...OtherInterpolatingGroupsTemplate
}

export const InterpolatingGroupsKindsTemplate: InterpolatingGroupsKindsT = {
    ...MultiObjectsInfluencesGroupKindsTemplate,
    ...surfaces.SurfaceTextureLocationsGroupKindsTemplate,
    ...OtherInterpolatingGroupsKindsTemplate,
}

export type SampleT = volumes.VolumeSample &
    surfaces.SurfaceSampleForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            Objects,
            InfluenceGroup,
            SurfaceObjectsTextureLocationsGroupsT,
            SurfaceObjectsTextureLocationsT
        > &
    surfaces.SurfaceSampleWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingValuesT,
            OtherInterpolatingValuesGrouped
        > &
    {}

export type VolumeT = volumes.Volume<VolumeLocationT, SampleT>

export type SampleProcessingContextT = {} &
    surfaces.SurfaceSampleProcessingContextForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            SurfaceObjectsTextureLocationsGroupsT
        > &
    surfaces.SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingGroupsKindsT
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
        surfaces.SurfaceObjectsTextureLocationsGroupKinds
    > &
    MultiObjectsProcessingContext<
        Objects,
        SurfaceObjectsTextureLocationsGroupsT,
        ObjectsSurfaceObjectsTextureLocationsGrouped,
        surfaces.SurfaceTextureLocationsGroupKinds
    > &
    MultiObjectsProcessingContext<
        Objects,
        OtherInterpolatingGroupsT,
        ObjectsOtherInterpolatingGrouped,
        OtherInterpolatingGroupsKindsT
    > &
    {}

export const SampleProcessingContext_MultiObjects_Template: SampleProcessingContext_MultiObjects = {
    ...MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate,

    ...SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsTemplate,

    ...OtherInterpolatingGroupsKindsMappedGroupsTemplate,

    [MultiObjectsProcessingContextObjectsGrouped]: {
        // [MultiObjectsInfluencesGroupsDefaultKey]: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
        ...(mapGroups(
            InfluenceGroupTemplate,
            () => ({ [MultiObjectsGroupedObjectsKey]: {} as Objects })
        ) as ObjectsInfluencesGrouped),

        [surfaces.SurfaceObjectsTextureLocationsGroupsDefaultKey]: { [MultiObjectsGroupedObjectsKey]: {} as Objects },

        ...({
            hair: {
                density: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
                length: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
            },
            rigidity: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
        } as MultiObjectsGrouped<Objects, OtherInterpolatingGroupsT>),
    },

    [MultiObjectsProcessingContextGroupKinds]: {
        ...MultiObjectsInfluencesGroupKindsTemplate,
        
        ...surfaces.SurfaceObjectsTextureLocationsGroupKindsTemplate,
        ...surfaces.SurfaceIndividualTextureLocationsGroupKindsTemplate,
        ...surfaces.SurfaceTextureLocationsGroupKindsTemplate,
        
        ...OtherInterpolatingGroupsKindsTemplate,
    }
}

export type Sample_MultiObjectsMappedGroups =
    InfluenceGroup &
    SurfaceObjectsTextureLocationsGroupsT &
    OtherInterpolatingGroupsT &
    {}

export const Sample_MultiObjectsMappedGroups_Template: Sample_MultiObjectsMappedGroups = mergeGroups(
    mergeGroups(
        InfluenceGroupTemplate,
        SurfaceObjectsTextureLocationsGroupsTemplate
    ),
    OtherInterpolatingGroupsTemplate
)

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
    surfaces.SurfaceWithRendering_TextureGroups &
    {}

export const SurfaceIndividualTexturesGroupsTemplate: SurfaceIndividualTexturesGroupsT = mergeGroups(
    SurfaceCombinedTexturesGroupsTemplate,
    surfaces.SurfaceWithRendering_TextureGroupsTemplate,
)

export type SurfaceIndividualTexturesGrouped =
    SurfaceCombinedTexturesGrouped &
    surfaces.SurfaceWithRender_TexturesTemplated<VolumeLocationT>

export type SurfaceObjectsTexturesGroupsKindsMappedGroupsT = 
    MultiObjectsGroupsKindsTemplateMapped<
        surfaces.SurfaceTexturesGroupKinds &
        surfaces.SurfaceObjectsTexturesGroupKinds,
        SurfaceObjectsTexturesGroupsT
    >

export type SurfaceIndividualTexturesGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
        surfaces.SurfaceTexturesGroupKinds &
        surfaces.SurfaceIndividualTexturesGroupKinds,
        SurfaceIndividualTexturesGroupsT
    >

export type SurfaceTexturesGroupsKindsMappedGroupsT =
    SurfaceObjectsTexturesGroupsKindsMappedGroupsT &
    SurfaceIndividualTexturesGroupsKindsMappedGroupsT

export const SurfaceObjectsTexturesGroupsKindsMappedGroupsTemplate: SurfaceObjectsTexturesGroupsKindsMappedGroupsT = {
    [surfaces.SurfaceObjectsTexturesGroupKindKey]: SurfaceObjectsTexturesGroupsTemplate,
    [surfaces.SurfaceTexturesGroupKindKey]: SurfaceObjectsTexturesGroupsTemplate
}

export const SurfaceIndividualTexturesGroupsKindsMappedGroupsTemplate: SurfaceIndividualTexturesGroupsKindsMappedGroupsT = {
    [surfaces.SurfaceIndividualTexturesGroupKindKey]: SurfaceIndividualTexturesGroupsTemplate,
    [surfaces.SurfaceTexturesGroupKindKey]: SurfaceIndividualTexturesGroupsTemplate
}

export const SurfaceTexturesGroupsKindsMappedGroupsTemplate = {
    [surfaces.SurfaceObjectsTexturesGroupKindKey]: SurfaceObjectsTexturesGroupsKindsMappedGroupsTemplate[surfaces.SurfaceObjectsTexturesGroupKindKey],
    [surfaces.SurfaceIndividualTexturesGroupKindKey]: SurfaceIndividualTexturesGroupsKindsMappedGroupsTemplate[surfaces.SurfaceIndividualTexturesGroupKindKey],
    [surfaces.SurfaceTexturesGroupKindKey]: mergeGroups(
        SurfaceObjectsTexturesGroupsKindsMappedGroupsTemplate[surfaces.SurfaceTexturesGroupKindKey],
        SurfaceIndividualTexturesGroupsKindsMappedGroupsTemplate[surfaces.SurfaceTexturesGroupKindKey]
    )
} as SurfaceTexturesGroupsKindsMappedGroupsT

export type SurfaceT = surfaces.Surface<SampleT> &
    surfaces.SurfaceWithSurfaceArea<SampleT> &
    surfaces.SurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
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
    surfaces.SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroupT,
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingValuesT,
            OtherInterpolatingValuesGrouped,
            SampleT
        > &
    surfaces.SurfaceWithRendering<
            VolumeLocationT,
            SurfaceUVUnwrappingGroupT
        > &
    {}

export type SurfaceProcessingContextT = surfaces.SurfaceProcessingContext<SampleProcessingContextT> &
    // surfaces.SurfaceProcessingContextWithSurfaceArea<SampleProcessingContextT> (doesn't exist) &
    surfaces.SurfaceProcessingContextWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
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
    surfaces.SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroupT,
            Objects,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingGroupsKindsT,
            SampleProcessingContextT
        > &
    surfaces.SurfaceProcessingContextWithRendering<
            VolumeLocationT,
            SurfaceUVUnwrappingGroupT
        >

export type SurfaceProcessingContext_MultiObjects =
    // SampleProcessingContext_MultiObjects &
    MultiObjectsGroupsProcessingContext<
        SurfaceUVUnwrappingGroupT,
        surfaces.SurfaceUVUnwrappingGroupKinds
    > &
    MultiObjectsProcessingContext<
        Objects,
        SurfaceObjectsTexturesGroupsT,
        ObjectsSurfaceObjectsTexturesGrouped,
        surfaces.SurfaceObjectsTexturesGroupKinds
    > &
    MultiObjectsProcessingContext<
        Objects,
        SurfaceObjectsTexturesGroupsT,
        ObjectsSurfaceObjectsTexturesGrouped,
        surfaces.SurfaceTexturesGroupKinds
    > &
    MultiObjectsGroupsProcessingContext<
        SurfaceIndividualTexturesGroupsT,
        surfaces.SurfaceIndividualTexturesGroupKinds
    > &
    MultiObjectsGroupsProcessingContext<
        SurfaceIndividualTexturesGroupsT,
        surfaces.SurfaceTexturesGroupKinds
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
// a1[MultiObjectsProcessingContextGroupKinds].factors
// a2[MultiObjectsProcessingContextGroupKinds].factors
// a1.factors.hair.density
// a2.factors.hair.density
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

        ...({
            ...({
                hair: {
                    density: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
                    length: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
                },
                rigidity: { [MultiObjectsGroupedObjectsKey]: {} as Objects },
            } as MultiObjectsGrouped<Objects, OtherInterpolatingGroupsT>),
        } as MultiObjectsGrouped<Objects, SurfaceObjectsTexturesGroupsT>),
    },

    [MultiObjectsProcessingContextGroupKinds]: {
        // ...MultiObjectsInfluencesGroupKindsTemplate,
        
        ...surfaces.SurfaceUVUnwrappingGroupKindsTemplate,

        ...surfaces.SurfaceObjectsTexturesGroupKindsTemplate,
        ...surfaces.SurfaceIndividualTexturesGroupKindsTemplate,
        ...surfaces.SurfaceTexturesGroupKindsTemplate,
        
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
    surfaces.VolumeSurfaceMeshingProcessing<SampleT> &
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
    surfaces.VolumeSurfaceMeshingProcessingContext<
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
        >

export type VolumeProcessingContext_MultiObjects =
    {}

export const VolumeProcessingContext_MultiObjects_Template: VolumeProcessingContext_MultiObjects = {
    [MultiObjectsGroupedObjectsKey]: {
    },

    [MultiObjectsProcessingContextGroupKinds]: {
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