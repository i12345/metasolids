import { groupKindObjectsGrouped, groupKinds, MultiObjectsCombined, MultiObjectsCombinedValue, MultiObjectsGrouped, MultiObjectsGroupsCombined, MultiObjectsGroupsCombinedMapped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsInfluences, MultiObjectsInfluencesGrouped, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesProcessingContext, MultiObjectsMapped, MultiObjectsMappedAndCombinedGrouped, MultiObjectsTemplate } from "../../../fields/index.js";
import { Processor } from "../../../processor/processor.js";
import { ObjectsCombiningTexture, ObjectsCombiningTexturesTemplated, ObjectsTextureLocationsTextureSample, Texture, TextureLocation, TextureSample, TextureSamplesExtracted, TextureSamplesExtracted1, VertexInterpolatingTexture } from "../../../textures/index.js";
import { onlyOne } from "../../../utils/only-one.js";
import { PropertyPath, PROPERTYKEY_ANY } from "../../../utils/property-path.js";
import { SurfaceProcessingContextWithIndividualTextures, SurfaceProcessingContextWithObjectsTextures, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleProcessingContextWithObjectsTextureLocations, SurfaceSampleWithIndividualTextureLocations, SurfaceWithObjectsTextures, SurfaceSampleWithObjectsTextureLocations, SurfaceObjectsTexturesGroupKindsTemplate, SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceWithIndividualTextures, SurfaceObjectsTextureLocationsGroupKindsTemplate } from "./types.js";

/**
 * The surface texture location group is singular, and it is not just "an"
 * individual texture location group, but the only one here considered.
 * 
 * The value texture location group is similarly singular, and will be used for
 * every value texture group.
 */
export type SurfaceSampleWithSurfaceAndObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationT extends TextureLocation = TextureLocation,
        ValueTextureLocationsGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationT extends TextureLocation = TextureLocation,
    > =
    MultiObjectsInfluencesGrouped<Objects, InfluenceGroup> &
    SurfaceSampleWithObjectsTextureLocations<
            Objects,
            ValueTextureLocationsGroup,
            ValueTextureLocationT
        > &
    SurfaceSampleWithIndividualTextureLocations<
            SurfaceTextureLocationGroup,
            SurfaceTextureLocationT
        >

export type SurfaceSampleProcessingContextWithSurfaceAndObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInfluencesGrouped extends
            MultiObjectsGrouped<Objects, InfluenceGroup> =
            MultiObjectsGrouped<Objects, InfluenceGroup>,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsValueTextureLocationsGrouped extends
            MultiObjectsGrouped<Objects, ValueTextureLocationGroup> =
            MultiObjectsGrouped<Objects, ValueTextureLocationGroup>,
    > =
    MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroup, ObjectsInfluencesGrouped> &
    SurfaceSampleProcessingContextWithObjectsTextureLocations<
            Objects,
            ValueTextureLocationGroup,
            ObjectsValueTextureLocationsGrouped
        > &
    SurfaceSampleProcessingContextWithIndividualTextureLocations<SurfaceTextureLocationGroup>

// let a: SurfaceSampleProcessingContextWithIndividualTextureLocations
// let b: SurfaceSampleProcessingContextWithObjectsTextureLocations
// let c: SurfaceSampleProcessingContextWithSurfaceAndObjectsTextureLocations
// a = c // works
// b = c // works
// c = a // error
// c = b // error

/**
 * A surface with value textures for objects that are also combined for each
 * value texture group, weighted using the influences group for all value
 * textures.
 * 
 * The value texture location group does not have to be the value texture
 * groups; there is just one value texture location group but there can be many
 * value texture groups. The value texture group must be an objects texture
 * locations group.
 * 
 * The combining textures, for each value texture group, are placed in the
 * `[MultiObjectsCombinedValue]` key of the root of each value texture group.
 */
export type SurfaceWithSurfaceAndObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationT extends TextureLocation = TextureLocation,
        ValueTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTexturesGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationT extends TextureLocation = TextureLocation,
        ValueTextureSampleT extends TextureSample = TextureSample,
        ValueTextureT extends
            Texture<ValueTextureLocationT, ValueTextureSampleT> =
            Texture<ValueTextureLocationT, ValueTextureSampleT>,
        ValueTexturesGrouped extends
            MultiObjectsGroupsMapped<ValueTexturesGroups, ValueTextureT> =
            MultiObjectsGroupsMapped<ValueTexturesGroups, ValueTextureT>,
        SurfaceSampleT extends
            SurfaceSampleWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    SurfaceTextureLocationGroup,
                    SurfaceTextureLocationT,
                    ValueTextureLocationGroup,
                    ValueTextureLocationT
                > =
            SurfaceSampleWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    SurfaceTextureLocationGroup,
                    SurfaceTextureLocationT,
                    ValueTextureLocationGroup,
                    ValueTextureLocationT
                >,
    > =
    SurfaceWithObjectsTextures<
            Objects,
            ValueTextureLocationGroup,
            ValueTextureLocationT,
            ValueTextureSampleT,
            ValueTexturesGroups,
            ValueTextureT,
            ValueTexturesGrouped,
            SurfaceSampleT
        > &
    SurfaceWithIndividualTextures<
            MultiObjectsGroupsCombined<ValueTexturesGroups>,
            SurfaceTextureLocationT,
            ValueTextureSampleT,
            ObjectsCombiningTexture<
                    Objects,
                    SurfaceTextureLocationT,
                    ValueTextureLocationT,
                    ValueTextureSampleT,
                    ValueTextureT
                >
            // MultiObjectsGroupsCombinedMapped<
            //         ValueTexturesGroups,
            //         ObjectsCombiningTexture<
            //                 Objects,
            //                 SurfaceTextureLocationT,
            //                 ValueTextureLocationT,
            //                 ValueTextureSampleT,
            //                 ValueTextureT
            //             >,
            //         ObjectsCombiningTexturesTemplated<
            //                 Objects,
            //                 ValueTexturesGroups,
            //                 SurfaceTextureLocationT,
            //                 ValueTextureLocationT,
            //                 ValueTextureSampleT,
            //                 TextureSamplesExtracted<
            //                         ValueTexturesGroups,
            //                         ValueTextureT,
            //                         ValueTexturesGrouped
            //                     >,
            //                 ValueTextureT,
            //                 ValueTexturesGrouped
            //             >
            //     >,
            // SurfaceSampleT
        >
    // MultiObjectsMappedAndCombinedGrouped<
    //     Objects,
    //     ValueTexturesGroups,
    //     ValueTextureT,
    //     ObjectsCombiningTexture<
    //         Objects,
    //         SurfaceTextureLocationT,
    //         ValueTextureLocationT,
    //         ValueTextureSampleT,
    //         ValueTextureT
    //     >
    // >

export type SurfaceProcessingContextWithSurfaceAndObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInfluencesGrouped extends
            MultiObjectsGrouped<Objects, InfluenceGroup> =
            MultiObjectsGrouped<Objects, InfluenceGroup>,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsValueTextureLocationsGrouped extends
            MultiObjectsGrouped<Objects, ValueTextureLocationGroups> =
            MultiObjectsGrouped<Objects, ValueTextureLocationGroups>,
        ValueTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsValueTexturesGrouped extends
            MultiObjectsGrouped<Objects, ValueTextureGroups> =
            MultiObjectsGrouped<Objects, ValueTextureGroups>,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    SurfaceTextureLocationGroup,
                    ValueTextureLocationGroups,
                    ObjectsValueTextureLocationsGrouped
                > =
            SurfaceSampleProcessingContextWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    SurfaceTextureLocationGroup,
                    ValueTextureLocationGroups,
                    ObjectsValueTextureLocationsGrouped
                >
    > =
    SurfaceProcessingContextWithObjectsTextures<
        Objects,
        ValueTextureLocationGroups,
        ObjectsValueTextureLocationsGrouped,
        ValueTextureGroups,
        ObjectsValueTexturesGrouped,
        SampleProcessingContextT
    > &
    SurfaceProcessingContextWithIndividualTextures<
        SurfaceTextureLocationGroup,
        MultiObjectsGroupsCombined<ValueTextureGroups>,
        SampleProcessingContextT
    >

export class SurfaceWithObjectsTexturesCombiningProcessor<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInfluencesGrouped extends
            MultiObjectsGrouped<Objects, InfluenceGroup> =
            MultiObjectsGrouped<Objects, InfluenceGroup>,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationT extends TextureLocation = TextureLocation,
        ValueTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsValueTextureLocationsGrouped extends
            MultiObjectsGrouped<Objects, ValueTextureLocationGroup> =
            MultiObjectsGrouped<Objects, ValueTextureLocationGroup>,
        ValueTextureLocationT extends TextureLocation = TextureLocation,
        ValueTextureSampleT extends TextureSample = TextureSample,
        ValueTextureT extends
            Texture<ValueTextureLocationT, ValueTextureSampleT> =
            Texture<ValueTextureLocationT, ValueTextureSampleT>,
        ValueTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTexturesGrouped extends
            MultiObjectsGroupsMapped<ValueTextureGroups, ValueTextureT> =
            MultiObjectsGroupsMapped<ValueTextureGroups, ValueTextureT>,
        ObjectsValueTexturesGrouped extends
            MultiObjectsGrouped<Objects, ValueTextureGroups> =
            MultiObjectsGrouped<Objects, ValueTextureGroups>,
        SurfaceSampleT extends
            SurfaceSampleWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    SurfaceTextureLocationGroup,
                    SurfaceTextureLocationT,
                    ValueTextureLocationGroup,
                    ValueTextureLocationT
                > =
            SurfaceSampleWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    SurfaceTextureLocationGroup,
                    SurfaceTextureLocationT,
                    ValueTextureLocationGroup,
                    ValueTextureLocationT
                >,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    SurfaceTextureLocationGroup,
                    ValueTextureLocationGroup,
                    ObjectsValueTextureLocationsGrouped
                > =
            SurfaceSampleProcessingContextWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    SurfaceTextureLocationGroup,
                    ValueTextureLocationGroup,
                    ObjectsValueTextureLocationsGrouped
                >
    > implements
    Processor<
        SurfaceWithSurfaceAndObjectsTextures<
            Objects,
            InfluenceGroup,
            SurfaceTextureLocationGroup,
            SurfaceTextureLocationT,
            ValueTextureLocationGroup,
            ValueTextureGroups,
            ValueTextureLocationT,
            ValueTextureSampleT,
            ValueTextureT,
            ValueTexturesGrouped,
            SurfaceSampleT
        >,
        SurfaceProcessingContextWithSurfaceAndObjectsTextures<
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            SurfaceTextureLocationGroup,
            ValueTextureLocationGroup,
            ObjectsValueTextureLocationsGrouped,
            ValueTextureGroups,
            ObjectsValueTexturesGrouped,
            SurfaceSampleProcessingContextT
        >
    > {
    private _dependencies: PropertyPath[]
    
    get dependencies() {
        return this._dependencies
    }

    constructor(
        public valueTextureGroups: ValueTextureGroups,
        public influenceGroup?: InfluenceGroup,
        public surfaceTextureLocationGroup?: SurfaceTextureLocationGroup,
        public valueTextureLocationGroup?: ValueTextureLocationGroup,
    ) { }
    
    init(context: SurfaceProcessingContextWithSurfaceAndObjectsTextures<
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            SurfaceTextureLocationGroup,
            ValueTextureLocationGroup,
            ObjectsValueTextureLocationsGrouped,
            ValueTextureGroups,
            ObjectsValueTexturesGrouped,
            SurfaceSampleProcessingContextT
        >): void {
        const valueTextureGroups = [...groupKinds(
            context,
            SurfaceObjectsTexturesGroupKindsTemplate,
            this.valueTextureGroups
        )]

        const influencesGroup = onlyOne(groupKinds(
            context.sample,
            MultiObjectsInfluencesGroupKindsTemplate,
            this.influenceGroup
        )).group
        
        const surfaceTextureLocationGroup = onlyOne(groupKinds(
            context.sample,
            SurfaceIndividualTextureLocationsGroupKindsTemplate,
            this.surfaceTextureLocationGroup
        )).group
        
        const valueTextureLocationGroups = onlyOne(groupKinds(
            context.sample,
            SurfaceObjectsTextureLocationsGroupKindsTemplate,
            this.valueTextureLocationGroup
        )).group

        const sampleDependencies = [
            influencesGroup.path,
            surfaceTextureLocationGroup.path,
            valueTextureLocationGroups.path,
        ]
        
        this._dependencies = [
            ...sampleDependencies.map(path => ['samples', PROPERTYKEY_ANY, ...path]),
            ...valueTextureGroups.map(({ group: { path } }) => path)
        ]
    }

    process(
            surface: SurfaceWithSurfaceAndObjectsTextures<
                    Objects,
                    InfluenceGroup,
                    SurfaceTextureLocationGroup,
                    SurfaceTextureLocationT,
                    ValueTextureLocationGroup,
                    ValueTextureGroups,
                    ValueTextureLocationT,
                    ValueTextureSampleT,
                    ValueTextureT,
                    ValueTexturesGrouped,
                    SurfaceSampleT
                >,
            context: SurfaceProcessingContextWithSurfaceAndObjectsTextures<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    SurfaceTextureLocationGroup,
                    ValueTextureLocationGroup,
                    ObjectsValueTextureLocationsGrouped,
                    ValueTextureGroups,
                    ObjectsValueTexturesGrouped,
                    SurfaceSampleProcessingContextT
                >
        ): void {
        const surfaceTextureLocationGroup = onlyOne(groupKinds(
            context.sample,
            SurfaceIndividualTextureLocationsGroupKindsTemplate,
            this.surfaceTextureLocationGroup
        )).group
        
        const surfaceTextureLocations = surface.samples.map(sample =>
            surfaceTextureLocationGroup.get<SurfaceTextureLocationT>(sample))
        const UVs = surfaceTextureLocations.map(location => location.uv)

        const influencesGroup = onlyOne(groupKinds(
            context.sample,
            MultiObjectsInfluencesGroupKindsTemplate,
            this.influenceGroup
        )).group
        const influenceValues = surface.samples.map(sample =>
            influencesGroup.get<MultiObjectsInfluences<Objects>>(sample))
        const influences_texture = new VertexInterpolatingTexture(influenceValues, UVs, surface.mesh.triangles)

        const valueTextureGroups = groupKindObjectsGrouped(
            surface,
            context,
            SurfaceObjectsTexturesGroupKindsTemplate,
            this.valueTextureGroups
        )

        const valueTextureLocationGroup = onlyOne(groupKinds(
            context.sample,
            SurfaceObjectsTextureLocationsGroupKindsTemplate,
            this.valueTextureLocationGroup
        )).group
        
        for (const { group, objects: { value, template } } of valueTextureGroups) {
            const locations = surface.samples.map((sample: SurfaceSampleWithObjectsTextureLocations<Objects, ValueTextureLocationGroup, ValueTextureLocationT>) =>
                valueTextureLocationGroup.get<ObjectsTextureLocationsTextureSample<Objects, ValueTextureLocationT>>(sample))
            const locations_texture = new VertexInterpolatingTexture(locations, UVs, surface.mesh.triangles)

            const combined = new ObjectsCombiningTexture(
                template,
                influences_texture,
                locations_texture,
                value
            )

            value[MultiObjectsCombinedValue] = combined
        }
    }
}