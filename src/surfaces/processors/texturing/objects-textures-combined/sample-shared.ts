// import { groupKindObjectsGrouped, groupKinds, MultiObjectsCombinedValue, MultiObjectsGrouped, MultiObjectsGroupsCombined, MultiObjectsGroupsCombinedMapped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsInfluences, MultiObjectsInfluencesGrouped, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesProcessingContext, MultiObjectsMapped, MultiObjectsMappedAndCombinedGrouped, MultiObjectsTemplate } from "../../../../fields/index.js";
// import { Processor } from "../../../../processor/processor.js";
// import { ObjectsCombiningTexture, ObjectsCombiningTexturesTemplated, ObjectsTextureLocationsTextureSample, Texture, TextureLocation, TextureSample, TextureSamplesExtracted, TextureSamplesExtracted1, VertexInterpolatingTexture } from "../../../../textures/index.js";
// import { onlyOne } from "../../../../utils/only-one.js";
// import { PropertyPath, PROPERTYKEY_ALL } from "../../../../utils/property-path.js";
// import { SurfaceProcessingContextWithIndividualTextures, SurfaceProcessingContextWithObjectsTextures, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleProcessingContextWithObjectsTextureLocations, SurfaceSampleWithIndividualTextureLocations, SurfaceWithObjectsTextures, SurfaceSampleWithObjectsTextureLocations, SurfaceObjectsTexturesGroupKindsTemplate, SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceWithIndividualTextures, SurfaceObjectsTextureLocationsGroupKindsTemplate, SurfaceWithObjectsTexturesUsingObjectsSampleTextureLocations, SurfaceWithIndividualTexturesUsingSampleTextureLocations, SurfaceProcessingContextWithObjectsTexturesUsingObjectsSampleTextureLocations, SurfaceProcessingContextWithIndividualTexturesUsingSampleTextureLocations } from "../types.js";

// export type SurfaceSampleForSurfaceWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//         SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         SurfaceTextureLocationT extends TextureLocation = TextureLocation,
//         Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
//         InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ValueTextureLocationsGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ValueTextureLocationT extends TextureLocation = TextureLocation,
//     > =
//     MultiObjectsInfluencesGrouped<Objects, InfluenceGroup> &
//     SurfaceSampleWithObjectsTextureLocations<
//             Objects,
//             ValueTextureLocationsGroup,
//             ValueTextureLocationT
//         > &
//     SurfaceSampleWithIndividualTextureLocations<
//             SurfaceTextureLocationGroup,
//             SurfaceTextureLocationT
//         >

// export type SurfaceSampleProcessingContextForSurfaceWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//         SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
//         InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ObjectsInfluencesGrouped extends
//             MultiObjectsGrouped<Objects, InfluenceGroup> =
//             MultiObjectsGrouped<Objects, InfluenceGroup>,
//         ValueTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ObjectsValueTextureLocationsGrouped extends
//             MultiObjectsGrouped<Objects, ValueTextureLocationGroup> =
//             MultiObjectsGrouped<Objects, ValueTextureLocationGroup>,
//     > =
//     MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroup, ObjectsInfluencesGrouped> &
//     SurfaceSampleProcessingContextWithObjectsTextureLocations<
//             Objects,
//             ValueTextureLocationGroup,
//             ObjectsValueTextureLocationsGrouped
//         > &
//     SurfaceSampleProcessingContextWithIndividualTextureLocations<SurfaceTextureLocationGroup>

// // let a: SurfaceSampleProcessingContextWithIndividualTextureLocations
// // let b: SurfaceSampleProcessingContextWithObjectsTextureLocations
// // let c: SurfaceSampleProcessingContextWithSurfaceAndObjectsTextureLocations
// // a = c // works
// // b = c // works
// // c = a // error
// // c = b // error

// /**
//  * A surface with value textures for objects that are also combined for each
//  * value texture group, weighted using the influences group for all value
//  * textures.
//  * 
//  * The value texture location group does not have to be the value texture
//  * groups; there is just one value texture location group but there can be many
//  * value texture groups. The value texture group must be an objects texture
//  * locations group.
//  * 
//  * The final combined textures will each be in the space of the surface texture
//  * location group.
//  * 
//  * The combining textures, for each value texture group, are placed in the
//  * `[MultiObjectsCombinedValue]` key of the root of each value texture group.
//  */
// export type SurfaceWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//         SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         SurfaceTextureLocationT extends TextureLocation = TextureLocation,
//         Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
//         InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ValueTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ValueTexturesGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ValueTextureLocationT extends TextureLocation = TextureLocation,
//         ValueTextureSampleT extends TextureSample = TextureSample,
//         ValueTextureT extends
//             Texture<ValueTextureLocationT, ValueTextureSampleT> =
//             Texture<ValueTextureLocationT, ValueTextureSampleT>,
//         ValueTexturesGrouped extends
//             MultiObjectsGroupsMapped<ValueTexturesGroups, ValueTextureT> =
//             MultiObjectsGroupsMapped<ValueTexturesGroups, ValueTextureT>,
//         SurfaceSampleT extends
//             SurfaceSampleForSurfaceWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//                     SurfaceTextureLocationGroup,
//                     SurfaceTextureLocationT,
//                     Objects,
//                     InfluenceGroup,
//                     ValueTextureLocationGroup,
//                     ValueTextureLocationT
//                 > =
//             SurfaceSampleForSurfaceWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//                     SurfaceTextureLocationGroup,
//                     SurfaceTextureLocationT,
//                     Objects,
//                     InfluenceGroup,
//                     ValueTextureLocationGroup,
//                     ValueTextureLocationT
//                 >
//     > =
//     SurfaceWithObjectsTexturesUsingObjectsSampleTextureLocations<
//             ValueTextureLocationGroup,
//             Objects,
//             ValueTexturesGroups,
//             ValueTextureLocationT,
//             ValueTextureSampleT,
//             ValueTextureT,
//             ValueTexturesGrouped,
//             SurfaceSampleT
//         > &
//     SurfaceWithIndividualTexturesUsingSampleTextureLocations<
//             SurfaceTextureLocationGroup,
//             MultiObjectsGroupsCombined<ValueTexturesGroups>,
//             SurfaceTextureLocationT,
//             ValueTextureSampleT,
//             ObjectsCombiningTexture<
//                     Objects,
//                     SurfaceTextureLocationT,
//                     ValueTextureLocationT,
//                     ValueTextureSampleT,
//                     ValueTextureT
//                 >
//             // MultiObjectsGroupsCombinedMapped<
//             //         ValueTexturesGroups,
//             //         ObjectsCombiningTexture<
//             //                 Objects,
//             //                 SurfaceTextureLocationT,
//             //                 ValueTextureLocationT,
//             //                 ValueTextureSampleT,
//             //                 ValueTextureT
//             //             >,
//             //         ObjectsCombiningTexturesTemplated<
//             //                 Objects,
//             //                 ValueTexturesGroups,
//             //                 SurfaceTextureLocationT,
//             //                 ValueTextureLocationT,
//             //                 ValueTextureSampleT,
//             //                 TextureSamplesExtracted<
//             //                         ValueTexturesGroups,
//             //                         ValueTextureT,
//             //                         ValueTexturesGrouped
//             //                     >,
//             //                 ValueTextureT,
//             //                 ValueTexturesGrouped
//             //             >
//             //     >,
//             // SurfaceSampleT
//         >
//     // MultiObjectsMappedAndCombinedGrouped<
//     //     Objects,
//     //     ValueTexturesGroups,
//     //     ValueTextureT,
//     //     ObjectsCombiningTexture<
//     //         Objects,
//     //         SurfaceTextureLocationT,
//     //         ValueTextureLocationT,
//     //         ValueTextureSampleT,
//     //         ValueTextureT
//     //     >
//     // >

// export type SurfaceProcessingContextWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//         SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
//         InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ObjectsInfluencesGrouped extends
//             MultiObjectsGrouped<Objects, InfluenceGroup> =
//             MultiObjectsGrouped<Objects, InfluenceGroup>,
//         ValueTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ObjectsValueTextureLocationsGrouped extends
//             MultiObjectsGrouped<Objects, ValueTextureLocationGroup> =
//             MultiObjectsGrouped<Objects, ValueTextureLocationGroup>,
//         ValueTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ObjectsValueTexturesGrouped extends
//             MultiObjectsGrouped<Objects, ValueTextureGroups> =
//             MultiObjectsGrouped<Objects, ValueTextureGroups>,
//         SampleProcessingContextT extends
//             SurfaceSampleProcessingContextForSurfaceWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//                     SurfaceTextureLocationGroup,
//                     Objects,
//                     InfluenceGroup,
//                     ObjectsInfluencesGrouped,
//                     ValueTextureLocationGroup,
//                     ObjectsValueTextureLocationsGrouped
//                 > =
//             SurfaceSampleProcessingContextForSurfaceWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//                     SurfaceTextureLocationGroup,
//                     Objects,
//                     InfluenceGroup,
//                     ObjectsInfluencesGrouped,
//                     ValueTextureLocationGroup,
//                     ObjectsValueTextureLocationsGrouped
//                 >
//     > =
//     SurfaceProcessingContextWithObjectsTexturesUsingObjectsSampleTextureLocations<
//         ValueTextureLocationGroup,
//         Objects,
//         ValueTextureGroups,
//         ObjectsValueTexturesGrouped,
//         SampleProcessingContextT
//     > &
//     SurfaceProcessingContextWithIndividualTexturesUsingSampleTextureLocations<
//         SurfaceTextureLocationGroup,
//         MultiObjectsGroupsCombined<ValueTextureGroups>,
//         SampleProcessingContextT
//     >

// export class SurfaceWithObjectsTexturesCombinedUsingSharedSampleTextureLocationProcessor<
//         SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         SurfaceTextureLocationT extends TextureLocation = TextureLocation,
//         Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
//         InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ObjectsInfluencesGrouped extends
//             MultiObjectsGrouped<Objects, InfluenceGroup> =
//             MultiObjectsGrouped<Objects, InfluenceGroup>,
//         ValueTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ObjectsValueTextureLocationsGrouped extends
//             MultiObjectsGrouped<Objects, ValueTextureLocationGroup> =
//             MultiObjectsGrouped<Objects, ValueTextureLocationGroup>,
//         ValueTextureLocationT extends TextureLocation = TextureLocation,
//         ValueTextureSampleT extends TextureSample = TextureSample,
//         ValueTextureT extends
//             Texture<ValueTextureLocationT, ValueTextureSampleT> =
//             Texture<ValueTextureLocationT, ValueTextureSampleT>,
//         ValueTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ValueTexturesGrouped extends
//             MultiObjectsGroupsMapped<ValueTextureGroups, ValueTextureT> =
//             MultiObjectsGroupsMapped<ValueTextureGroups, ValueTextureT>,
//         ObjectsValueTexturesGrouped extends
//             MultiObjectsGrouped<Objects, ValueTextureGroups> =
//             MultiObjectsGrouped<Objects, ValueTextureGroups>
//     > implements
//     Processor<
//         SurfaceWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//             SurfaceTextureLocationGroup,
//             SurfaceTextureLocationT,
//             Objects,
//             InfluenceGroup,
//             ValueTextureLocationGroup,
//             ValueTextureGroups,
//             ValueTextureLocationT,
//             ValueTextureSampleT,
//             ValueTextureT,
//             ValueTexturesGrouped
//             // SurfaceSampleT (implied)
//         >,
//         SurfaceProcessingContextWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//             SurfaceTextureLocationGroup,
//             Objects,
//             InfluenceGroup,
//             ObjectsInfluencesGrouped,
//             ValueTextureLocationGroup,
//             ObjectsValueTextureLocationsGrouped,
//             ValueTextureGroups,
//             ObjectsValueTexturesGrouped
//             // SurfaceSampleProcessingContextT (implied)
//         >
//     > {
//     private _dependencies!: PropertyPath[]
    
//     get dependencies() {
//         return this._dependencies
//     }

//     constructor(
//         public valueTextureGroups: ValueTextureGroups,
//         public influenceGroup?: InfluenceGroup,
//         public surfaceTextureLocationGroup?: SurfaceTextureLocationGroup,
//         public valueTextureLocationGroup?: ValueTextureLocationGroup,
//     ) { }
    
//     init(context: SurfaceProcessingContextWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//             SurfaceTextureLocationGroup,
//             Objects,
//             InfluenceGroup,
//             ObjectsInfluencesGrouped,
//             ValueTextureLocationGroup,
//             ObjectsValueTextureLocationsGrouped,
//             ValueTextureGroups,
//             ObjectsValueTexturesGrouped
//             // SurfaceSampleProcessingContextT (implied)
//         >): void {
//         const valueTextureGroups = [...groupKinds(
//             context,
//             SurfaceObjectsTexturesGroupKindsTemplate,
//             this.valueTextureGroups
//         )]

//         const influencesGroup = onlyOne(groupKinds(
//             context.sample,
//             MultiObjectsInfluencesGroupKindsTemplate,
//             this.influenceGroup
//         )).group
        
//         const surfaceTextureLocationGroup = onlyOne(groupKinds(
//             context.sample,
//             SurfaceIndividualTextureLocationsGroupKindsTemplate,
//             this.surfaceTextureLocationGroup
//         )).group
        
//         const valueTextureLocationGroups = onlyOne(groupKinds(
//             context.sample,
//             SurfaceObjectsTextureLocationsGroupKindsTemplate,
//             this.valueTextureLocationGroup
//         )).group

//         const sampleDependencies = [
//             influencesGroup.path,
//             surfaceTextureLocationGroup.path,
//             valueTextureLocationGroups.path,
//         ]
        
//         this._dependencies = [
//             ...sampleDependencies.map(path => ['samples', PROPERTYKEY_ALL, ...path]),
//             ...valueTextureGroups.map(({ group: { path } }) => path)
//         ]
//     }

//     process(
//             surface: SurfaceWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//                     SurfaceTextureLocationGroup,
//                     SurfaceTextureLocationT,
//                     Objects,
//                     InfluenceGroup,
//                     ValueTextureLocationGroup,
//                     ValueTextureGroups,
//                     ValueTextureLocationT,
//                     ValueTextureSampleT,
//                     ValueTextureT,
//                     ValueTexturesGrouped
//                     // SurfaceSampleT (implied)
//                 >,
//             context: SurfaceProcessingContextWithObjectsTexturesCombinedUsingSharedSampleTextureLocation<
//                     SurfaceTextureLocationGroup,
//                     Objects,
//                     InfluenceGroup,
//                     ObjectsInfluencesGrouped,
//                     ValueTextureLocationGroup,
//                     ObjectsValueTextureLocationsGrouped,
//                     ValueTextureGroups,
//                     ObjectsValueTexturesGrouped
//                     // SurfaceSampleProcessingContextT (implied)
//                 >
//         ): void {
//         const surfaceTextureLocationGroup = onlyOne(groupKinds(
//             context.sample,
//             SurfaceIndividualTextureLocationsGroupKindsTemplate,
//             this.surfaceTextureLocationGroup
//         )).group
        
//         const surfaceTextureLocations = surface.samples.map(sample =>
//             surfaceTextureLocationGroup.get<SurfaceTextureLocationT>(sample))
//         const UVs = surfaceTextureLocations.map(location => location.uv)

//         const influencesGroup = onlyOne(groupKinds(
//             context.sample,
//             MultiObjectsInfluencesGroupKindsTemplate,
//             this.influenceGroup
//         )).group
//         const influenceValues = surface.samples.map(sample =>
//             influencesGroup.get<MultiObjectsInfluences<Objects>>(sample))
//         const influences_texture = new VertexInterpolatingTexture(influenceValues, UVs, surface.mesh.triangles)

//         const valueTextureGroups = groupKindObjectsGrouped(
//             surface,
//             context,
//             SurfaceObjectsTexturesGroupKindsTemplate,
//             this.valueTextureGroups
//         )

//         const valueTextureLocationGroup = onlyOne(groupKinds(
//             context.sample,
//             SurfaceObjectsTextureLocationsGroupKindsTemplate,
//             this.valueTextureLocationGroup
//         )).group
        
//         for (const { group, objects: { value, template } } of valueTextureGroups) {
//             const locations = surface.samples.map((sample: SurfaceSampleWithObjectsTextureLocations<Objects, ValueTextureLocationGroup, ValueTextureLocationT>) =>
//                 valueTextureLocationGroup.get<ObjectsTextureLocationsTextureSample<Objects, ValueTextureLocationT>>(sample))
//             const locations_texture = new VertexInterpolatingTexture(locations, UVs, surface.mesh.triangles)

//             const combined = new ObjectsCombiningTexture(
//                 template,
//                 influences_texture,
//                 locations_texture,
//                 value
//             )

//             value[MultiObjectsCombinedValue] = combined
//         }
//     }
// }
export { }