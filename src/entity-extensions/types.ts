import { FieldPoint, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupedObjectsKey, mapGroups, MultiObjectsGroupsCombinedTemplate, MultiObjectsGroupsKindsTemplateMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate_Leaf, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsGroupsCombined, MultiObjectsInfluencesProcessingContext, MultiObjectsGrouped, MultiObjectsInfluencesGroupsDefault, MultiObjectsTemplate, MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate, MultiObjectsProcessingContext, MultiObjectsProcessingContextGroupKinds, MultiObjectsProcessingContextObjectsGrouped, mergeGroups, MultiObjectsProcessingContext_Groups } from "../fields/index.js"
import { textures, volumes, surfaces, solids } from "../index.js"

export type VolumeLocationT = volumes.VolumeLocation

export type Objects = MultiObjectsTemplate
export type InfluenceGroup = MultiObjectsInfluencesGroupsDefault
export const InfluenceGroupTemplate = MultiObjectsInfluencesGroupsDefaultTemplate
export type ObjectsInfluencesGrouped = MultiObjectsGrouped<Objects, InfluenceGroup>

export type SurfaceObjectsTextureLocationsGroupsT = surfaces.SurfaceObjectsTextureLocationsGroupsDefault
export type ObjectsSurfaceObjectsTextureLocationsGrouped = MultiObjectsGrouped<Objects, SurfaceObjectsTextureLocationsGroupsT>
export type SurfaceCombinedTextureLocationGroupT = surfaces.SurfaceIndividualTextureLocationsGroupDefault

export const SurfaceObjectsTextureLocationsGroupsTemplate: SurfaceObjectsTextureLocationsGroupsT = surfaces.SurfaceObjectsTextureLocationsGroupsDefaultTemplate
export const SurfaceCombinedTextureLocationGroupTemplate: SurfaceCombinedTextureLocationGroupT = surfaces.SurfaceIndividualTextureLocationsGroupDefaultTemplate

export type SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsT = 
    MultiObjectsGroupsKindsTemplateMapped<
        surfaces.SurfaceTextureLocationsGroupKinds &
        surfaces.SurfaceObjectsTextureLocationsGroupKinds,
        SurfaceObjectsTextureLocationsGroupsT
    >

export type SurfaceCombinedTextureLocationsGroupsKindsMappedGroupsT =
    MultiObjectsGroupsKindsTemplateMapped<
        surfaces.SurfaceTextureLocationsGroupKinds &
        surfaces.SurfaceIndividualTextureLocationsGroupKinds,
        SurfaceCombinedTextureLocationGroupT
    >

export type SurfaceTextureLocationsGroupsKindsMappedGroupsT =
    SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsT &
    SurfaceCombinedTextureLocationsGroupsKindsMappedGroupsT

export const SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsTemplate: SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsT = {
    [surfaces.SurfaceObjectsTextureLocationsGroupKindKey]: SurfaceObjectsTextureLocationsGroupsTemplate,
    [surfaces.SurfaceTextureLocationsGroupKindKey]: SurfaceObjectsTextureLocationsGroupsTemplate
}

export const SurfaceCombinedTextureLocationsGroupsKindsMappedGroupsTemplate: SurfaceCombinedTextureLocationsGroupsKindsMappedGroupsT = {
    [surfaces.SurfaceIndividualTextureLocationsGroupKindKey]: SurfaceCombinedTextureLocationGroupTemplate,
    [surfaces.SurfaceTextureLocationsGroupKindKey]: SurfaceCombinedTextureLocationGroupTemplate
}

export const SurfaceTextureLocationsGroupsKindsMappedGroupsTemplate = {
    [surfaces.SurfaceObjectsTextureLocationsGroupKindKey]: SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsTemplate[surfaces.SurfaceObjectsTextureLocationsGroupKindKey],
    [surfaces.SurfaceIndividualTextureLocationsGroupKindKey]: SurfaceCombinedTextureLocationsGroupsKindsMappedGroupsTemplate[surfaces.SurfaceIndividualTextureLocationsGroupKindKey],
    [surfaces.SurfaceTextureLocationsGroupKindKey]: mergeGroups(
        SurfaceObjectsTextureLocationsGroupsKindsMappedGroupsTemplate[surfaces.SurfaceTextureLocationsGroupKindKey],
        SurfaceCombinedTextureLocationsGroupsKindsMappedGroupsTemplate[surfaces.SurfaceTextureLocationsGroupKindKey]
    )
} as SurfaceTextureLocationsGroupsKindsMappedGroupsT

export type SurfaceCombinedTextureLocationT = textures.TextureLocation
export type SurfaceObjectsTextureLocationsT = textures.TextureLocation

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
    // SurfaceCombinedTextureLocationGroupT (it is automatically included, being a child of the objects texture location group) &
    OtherInterpolatingGroupsT &
    {}

export const InterpolatingGroupsTemplate: InterpolatingGroupsT = {
    ...MultiObjectsInfluencesGroupsDefaultTemplate,
    // ...SurfaceIndividualTextureLocationsGroupDefaultTemplate,
    ...SurfaceObjectsTextureLocationsGroupsTemplate,
    ...({} as OtherInterpolatingGroupsT)
}

export type SampleT = volumes.VolumeSample &
    surfaces.SurfaceSampleWithSurfaceAndObjectsTextureLocations<
            Objects,
            InfluenceGroup,
            SurfaceCombinedTextureLocationGroupT,
            SurfaceCombinedTextureLocationT,
            SurfaceObjectsTextureLocationsGroupsT,
            SurfaceObjectsTextureLocationsT
        > &
    surfaces.SurfaceSampleWithObjectsInterpolatingValues<
            Objects,
            SurfaceCombinedTextureLocationGroupT,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingValuesT,
            OtherInterpolatingValuesGrouped
        > &
    {}

export type SampleProcessingContextT = {} &
    surfaces.SurfaceSampleProcessingContextWithSurfaceAndObjectsTextureLocations<
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            SurfaceCombinedTextureLocationGroupT,
            SurfaceObjectsTextureLocationsGroupsT
        > &
    surfaces.SurfaceSampleProcessingContextWithObjectsInterpolatingValues<
            Objects,
            SurfaceCombinedTextureLocationGroupT,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingGroupsKindsT
        > &
    {}

// let l0: MultiObjectsGroupsKindsTemplateMapped<MultiObjectsInfluencesGroupKinds, MultiObjectsInfluencesGroupsDefault>
// l0 = MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate
// let l0_0 = l0[MultiObjectsInfluencesGroupKindKey][MultiObjectsInfluencesGroupsDefaultKey]

// let l1: MultiObjectsInfluencesProcessingContext<
//         Objects,
//         InfluenceGroup,
//         ObjectsInfluencesGrouped
//     > = {
// let l1: MultiObjectsProcessingContext<
//         Objects,
//         InfluenceGroup,
//         MultiObjectsGrouped<Objects, InfluenceGroup>,
//         MultiObjectsInfluencesGroupKinds
//     > = {
//     [MultiObjectsProcessingContextObjectsGrouped]: {
//         [MultiObjectsInfluencesGroupsDefaultKey]: {
//             [MultiObjectsGroupedObjectsKey]: { } as Objects
//         }
//     },
//     [MultiObjectsProcessingContextGroupKinds]: MultiObjectsInfluencesGroupKindsTemplate,
//     // ...MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate
//     [MultiObjectsInfluencesGroupKindKey]: {
//         [MultiObjectsInfluencesGroupsDefaultKey]: MultiObjectsGroupsTemplate_Leaf
//     }
// }
// let l2 = l1[MultiObjectsProcessingContextObjectsGrouped][MultiObjectsInfluencesGroupsDefaultKey][MultiObjectsGroupedObjectsKey]
// l2 = ({} as Objects)

// let m1: MultiObjectsProcessingContext<Objects, InfluenceGroup, MultiObjectsGrouped<Objects, InfluenceGroup>, MultiObjectsInfluencesGroupKinds>
// let m2: MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroup, MultiObjectsGrouped<Objects, InfluenceGroup>>
// let m1_a = m1[MultiObjectsProcessingContextObjectsGrouped][MultiObjectsInfluencesGroupsDefaultKey][MultiObjectsGroupedObjectsKey]
// let m2_a = m2[MultiObjectsProcessingContextObjectsGrouped][MultiObjectsInfluencesGroupsDefaultKey][MultiObjectsGroupedObjectsKey]
// // m1 = m2
// // m2 = m1

// const n1_1: MultiObjectsGroupsKindsTemplateMapped<MultiObjectsInfluencesGroupKinds, MultiObjectsInfluencesGroupsDefault> = {
//     [MultiObjectsInfluencesGroupKindKey]: MultiObjectsInfluencesGroupsDefaultTemplate
// }

// const n1_2: MultiObjectsGroupsProcessingContext<
//         MultiObjectsInfluencesGroupsDefault,
//         MultiObjectsInfluencesGroupKinds
//     > = {
//     [MultiObjectsProcessingContextGroupKinds]: {
//         [MultiObjectsInfluencesGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
//     },
//     ...n1_1
//     // [MultiObjectsInfluencesGroupKindKey]: MultiObjectsInfluencesGroupsDefaultTemplate
// }

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
    MultiObjectsGroupsProcessingContext<
        SurfaceCombinedTextureLocationGroupT,
        surfaces.SurfaceIndividualTextureLocationsGroupKinds
    > &
    MultiObjectsGroupsProcessingContext<
        SurfaceCombinedTextureLocationGroupT,
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

    ...SurfaceTextureLocationsGroupsKindsMappedGroupsTemplate,

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

// let a: SampleProcessingContext_MultiObjects
// let b: SampleProcessingContextT
// let c: MultiObjectsProcessingContext<
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

export type SurfaceObjectsTexturesTexelTypesGrouped = OtherInterpolatingValuesGrouped

export type SurfaceObjectsTexturesGrouped = textures.TexturesTemplatedWithObjects<
        Objects,
        OtherInterpolatingGroupsT,
        ObjectsOtherInterpolatingGrouped,
        OtherInterpolatingValuesT,
        OtherInterpolatingValuesGrouped,
        SurfaceObjectsTextureLocationsT
    >

export type SurfaceCombinedTexturesGroupsT = MultiObjectsGroupsCombined<SurfaceObjectsTexturesGroupsT>
export const SurfaceCombinedTexturesGroupsTemplate: SurfaceCombinedTexturesGroupsT = MultiObjectsGroupsCombinedTemplate(SurfaceObjectsTexturesGroupsTemplate)

export type SurfaceCombinedTextureSampleT =
    OtherInterpolatingValuesT &
    {}

export type SurfaceCombinedTextureT =
    textures.Texture<SurfaceCombinedTextureLocationT, OtherInterpolatingValuesT> &
    {}

export type SurfaceCombinedTexturesGrouped =
    textures.TexturesTemplated<
        OtherInterpolatingGroupsT,
        OtherInterpolatingValuesT,
        OtherInterpolatingValuesGrouped,
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

// export type GroupsKindsT =
//     MultiObjectsInfluencesGroupKinds &

//     surfaces.SurfaceTextureLocationsGroupKinds &
//     surfaces.SurfaceObjectsTextureLocationsGroupKinds &
//     surfaces.SurfaceIndividualTextureLocationsGroupKinds &
//     surfaces.SurfaceTexturesGroupKinds &
//     surfaces.SurfaceObjectsTexturesGroupKinds &
//     surfaces.SurfaceIndividualTexturesGroupKinds &

//     OtherInterpolatingGroupsKindsT &

//     {}

// export const GroupsKindsTemplate: GroupsKindsT = {
//     ...MultiObjectsInfluencesGroupKindsTemplate,

//     ...surfaces.SurfaceTextureLocationsGroupKindsTemplate,
//     ...surfaces.SurfaceObjectsTextureLocationsGroupKindsTemplate,
//     ...surfaces.SurfaceIndividualTextureLocationsGroupKindsTemplate,
//     ...surfaces.SurfaceTexturesGroupKindsTemplate,
//     ...surfaces.SurfaceObjectsTexturesGroupKindsTemplate,
//     ...surfaces.SurfaceIndividualTexturesGroupKindsTemplate,

//     ...OtherInterpolatingGroupsKindsTemplate
// }

// export const GroupsKindsMappedGroupsTemplate: MultiObjectsGroupsKindsTemplateMapped<GroupsKindsT, MultiObjectsGroupsTemplate> = {
//     ...MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate,

//     [surfaces.SurfaceTextureLocationsGroupKindKey]: {
//         ...SurfaceCombinedTextureLocationGroupTemplate,
//         ...SurfaceObjectsTextureLocationsGroupsTemplate
//     },
//     [surfaces.SurfaceIndividualTextureLocationsGroupKindKey]: SurfaceCombinedTextureLocationGroupTemplate,
//     [surfaces.SurfaceObjectsTextureLocationsGroupKindKey]: SurfaceObjectsTextureLocationsGroupsTemplate,

//     [surfaces.SurfaceTexturesGroupKindKey]: {
//         ...SurfaceObjectsTexturesGroupsTemplate,
//         ...SurfaceIndividualTexturesGroupsTemplate
//     },
//     [surfaces.SurfaceObjectsTexturesGroupKindKey]: SurfaceObjectsTexturesGroupsTemplate,
//     [surfaces.SurfaceIndividualTexturesGroupKindKey]: SurfaceIndividualTexturesGroupsTemplate,

//     ...({
//     } as MultiObjectsGroupsKindsTemplateMapped<OtherInterpolatingGroupsKindsT, MultiObjectsGroupsTemplate>)
// }

export type SurfaceT = surfaces.Surface<SampleT> &
    surfaces.SurfaceWithSurfaceArea<SampleT> &
    surfaces.SurfaceWithSurfaceAndObjectsTextures<
            Objects,
            InfluenceGroup,
            SurfaceCombinedTextureLocationGroupT,
            SurfaceCombinedTextureLocationT,
            SurfaceObjectsTextureLocationsGroupsT,
            SurfaceObjectsTexturesGroupsT,
            SurfaceObjectsTextureLocationsT,
            SurfaceCombinedTextureSampleT,
            SurfaceCombinedTextureT,
            SurfaceCombinedTexturesGrouped,
            SampleT
        > &
    surfaces.SurfaceWithObjectsInterpolatingValueTextures<
            Objects,
            SurfaceCombinedTextureLocationGroupT,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingValuesT,
            OtherInterpolatingValuesGrouped,
            SampleT
        > &
    surfaces.SurfaceWithRendering<VolumeLocationT, SampleT>

export type SurfaceProcessingContextT = surfaces.SurfaceProcessingContext<SampleProcessingContextT> &
    // surfaces.SurfaceProcessingContextWithSurfaceArea<SampleProcessingContextT> (doesn't exist) &
    surfaces.SurfaceProcessingContextWithSurfaceAndObjectsTextures<
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            SurfaceCombinedTextureLocationGroupT,
            SurfaceObjectsTextureLocationsGroupsT,
            MultiObjectsGrouped<Objects, SurfaceObjectsTextureLocationsGroupsT>,
            SurfaceObjectsTexturesGroupsT,
            ObjectsSurfaceObjectsTexturesGrouped,
            SampleProcessingContextT
        > &
    surfaces.SurfaceProcessingContextWithObjectsInterpolatingValueTextures<
            Objects,
            SurfaceCombinedTextureLocationGroupT,
            OtherInterpolatingGroupsT,
            ObjectsOtherInterpolatingGrouped,
            OtherInterpolatingGroupsKindsT,
            SampleProcessingContextT
        > &
    surfaces.SurfaceProcessingContextWithRendering<
            VolumeLocationT,
            SurfaceCombinedTextureLocationGroupT,
            SampleProcessingContextT
        >

export type SurfaceProcessingContext_MultiObjects =
    // SampleProcessingContext_MultiObjects &
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
// let a1: A1
// let a2: A2
// a1[MultiObjectsProcessingContextGroupKinds].factors
// a2[MultiObjectsProcessingContextGroupKinds].factors
// a1.factors.hair.density
// a2.factors.hair.density
// a1 = a2 // error
// a2 = a1 // works
// type A_diff = Omit<A1, keyof A2>
// let a_diff: A_diff
// a_diff.material.textures // ...
// a_diff.sample as SampleProcessingContextT

export const SurfaceProcessingContext_MultiObjects_Template: SurfaceProcessingContext_MultiObjects = {
    ...MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate,

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
        ...MultiObjectsInfluencesGroupKindsTemplate,
        
        ...surfaces.SurfaceObjectsTexturesGroupKindsTemplate,
        ...surfaces.SurfaceIndividualTexturesGroupKindsTemplate,
        ...surfaces.SurfaceTexturesGroupKindsTemplate,
        
        ...OtherInterpolatingGroupsKindsTemplate,
    }
}

// let s1: SurfaceProcessingContext_MultiObjects
// let s2: SurfaceProcessingContextT
// let s3: MultiObjectsGroupsKindsTemplateMapped<surfaces.SurfaceIndividualTexturesGroupKinds, SurfaceIndividualTexturesGroupsT>
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