import { groupKindObjectsGrouped, groupKinds, MultiObjectsCombined, MultiObjectsCombinedValue, MultiObjectsGrouped, MultiObjectsGroupsCombined, MultiObjectsGroupsCombinedMapped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsInfluences, MultiObjectsInfluencesGrouped, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesProcessingContext, MultiObjectsMapped, MultiObjectsMappedAndCombinedGrouped, MultiObjectsTemplate } from "../../../fields/index.js";
import { Processor } from "../../../processor/processor.js";
import { ObjectsCombiningTexture, ObjectsCombiningTexturesTemplated, ObjectsTextureLocationsTextureSample, Texture, TextureLocation, TextureSample, TextureSamplesExtracted, TextureSamplesExtracted1, VertexInterpolatingTexture } from "../../../textures/index.js";
import { onlyOne, PropertyPath, PROPERTYKEY_ALL } from "../../../utils/index.js";
import { SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping, SurfaceUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate, SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping } from "../index.js";
import { SurfaceProcessingContextWithIndividualTextures, SurfaceProcessingContextWithObjectsTextures, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleProcessingContextWithObjectsTextureLocations, SurfaceSampleWithIndividualTextureLocations, SurfaceWithObjectsTextures, SurfaceSampleWithObjectsTextureLocations, SurfaceObjectsTexturesGroupKindsTemplate, SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceWithIndividualTextures, SurfaceObjectsTextureLocationsGroupKindsTemplate, SurfaceWithObjectsTexturesUsingObjectsSampleTextureLocations, SurfaceWithIndividualTexturesUsingSampleTextureLocations, SurfaceProcessingContextWithObjectsTexturesUsingObjectsSampleTextureLocations, SurfaceProcessingContextWithIndividualTexturesUsingSampleTextureLocations } from "../types.js";

export type SurfaceSampleForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationsGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationT extends TextureLocation = TextureLocation,
    > =
    MultiObjectsInfluencesGrouped<Objects, InfluenceGroup> &
    SurfaceSampleWithObjectsTextureLocations<
            Objects,
            ValueTextureLocationsGroup,
            ValueTextureLocationT
        >

export type SurfaceSampleProcessingContextForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInfluencesGrouped extends
            MultiObjectsGrouped<Objects, InfluenceGroup> =
            MultiObjectsGrouped<Objects, InfluenceGroup>,
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
        >

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
 * The final combined textures will each be in the space of the surface UV
 * unwrapping group.
 * 
 * The combining textures, for each value texture group, are placed in the
 * `[MultiObjectsCombinedValue]` key of the root of each value texture group.
 */
export type SurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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
            SurfaceSampleForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
                    Objects,
                    InfluenceGroup,
                    ValueTextureLocationGroup,
                    ValueTextureLocationT
                > =
            SurfaceSampleForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
                    Objects,
                    InfluenceGroup,
                    ValueTextureLocationGroup,
                    ValueTextureLocationT
                >
    > =
    SurfaceWithObjectsTexturesUsingObjectsSampleTextureLocations<
            ValueTextureLocationGroup,
            Objects,
            ValueTexturesGroups,
            ValueTextureLocationT,
            ValueTextureSampleT,
            ValueTextureT,
            ValueTexturesGrouped,
            SurfaceSampleT
        > &
    SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            MultiObjectsGroupsCombined<ValueTexturesGroups>,
            ValueTextureLocationT,
            ValueTextureSampleT,
            ObjectsCombiningTexture<
                    Objects,
                    TextureLocation,
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

export type SurfaceProcessingContextWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInfluencesGrouped extends
            MultiObjectsGrouped<Objects, InfluenceGroup> =
            MultiObjectsGrouped<Objects, InfluenceGroup>,
        ValueTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsValueTextureLocationsGrouped extends
            MultiObjectsGrouped<Objects, ValueTextureLocationGroup> =
            MultiObjectsGrouped<Objects, ValueTextureLocationGroup>,
        ValueTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsValueTexturesGrouped extends
            MultiObjectsGrouped<Objects, ValueTextureGroups> =
            MultiObjectsGrouped<Objects, ValueTextureGroups>,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    ValueTextureLocationGroup,
                    ObjectsValueTextureLocationsGrouped
                > =
            SurfaceSampleProcessingContextForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    ValueTextureLocationGroup,
                    ObjectsValueTextureLocationsGrouped
                >
    > =
    SurfaceProcessingContextWithObjectsTexturesUsingObjectsSampleTextureLocations<
        ValueTextureLocationGroup,
        Objects,
        ValueTextureGroups,
        ObjectsValueTexturesGrouped,
        SampleProcessingContextT
    > &
    SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup,
        MultiObjectsGroupsCombined<ValueTextureGroups>,
        SampleProcessingContextT
    >

export class SurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrappingProcessor<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInfluencesGrouped extends
            MultiObjectsGrouped<Objects, InfluenceGroup> =
            MultiObjectsGrouped<Objects, InfluenceGroup>,
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
            MultiObjectsGrouped<Objects, ValueTextureGroups>
    > implements
    Processor<
        SurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            Objects,
            InfluenceGroup,
            ValueTextureLocationGroup,
            ValueTextureGroups,
            ValueTextureLocationT,
            ValueTextureSampleT,
            ValueTextureT,
            ValueTexturesGrouped
        >,
        SurfaceProcessingContextWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            ValueTextureLocationGroup,
            ObjectsValueTextureLocationsGrouped,
            ValueTextureGroups,
            ObjectsValueTexturesGrouped
        >
    > {
    private _connections!: {
        inputs: PropertyPath[]
        outputs: PropertyPath[]
    }
    
    get connections() {
        return this._connections
    }

    constructor(
        public valueTextureGroups: ValueTextureGroups,
        public influenceGroup?: InfluenceGroup,
        public surfaceUVUnwrappingGroup?: SurfaceUVUnwrappingGroup,
        public valueTextureLocationGroup?: ValueTextureLocationGroup,
    ) { }
    
    init(context: SurfaceProcessingContextWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            ValueTextureLocationGroup,
            ObjectsValueTextureLocationsGrouped,
            ValueTextureGroups,
            ObjectsValueTexturesGrouped
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
        
        const surfaceUVUnwrappingGroup = onlyOne(groupKinds(
            context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            this.surfaceUVUnwrappingGroup
        )).group
        
        const valueTextureLocationGroups = onlyOne(groupKinds(
            context.sample,
            SurfaceObjectsTextureLocationsGroupKindsTemplate,
            this.valueTextureLocationGroup
        )).group

        const sampleDependencies = [
            influencesGroup.path,
            valueTextureLocationGroups.path,
        ]
        
        //TODO: currently, any processor depending on the combined value would
        // be satisfied by this processor's input requirements, thus it may not
        // receive the real combined value.

        this._connections = {
            inputs: [
                surfaceUVUnwrappingGroup.path,
                ...sampleDependencies.map(path => ['samples', PROPERTYKEY_ALL, ...path]),
                ...valueTextureGroups.map(({ group: { path } }) => path)
            ],
            outputs: [
                ...valueTextureGroups.map(({ group: { path } }) => [...path, MultiObjectsCombinedValue])
            ]
        }
    }

    process(
            surface: SurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    Objects,
                    InfluenceGroup,
                    ValueTextureLocationGroup,
                    ValueTextureGroups,
                    ValueTextureLocationT,
                    ValueTextureSampleT,
                    ValueTextureT,
                    ValueTexturesGrouped
                >,
            context: SurfaceProcessingContextWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    ValueTextureLocationGroup,
                    ObjectsValueTextureLocationsGrouped,
                    ValueTextureGroups,
                    ObjectsValueTexturesGrouped
                >
        ): void {
        const surfaceUVUnwrappingGroup = onlyOne(groupKinds(
            context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            this.surfaceUVUnwrappingGroup
        )).group
        
        const UVunwrapping = surfaceUVUnwrappingGroup.get<SurfaceUVUnwrapping>(surface)

        const influencesGroup = onlyOne(groupKinds(
            context.sample,
            MultiObjectsInfluencesGroupKindsTemplate,
            this.influenceGroup
        )).group
        const influenceValues = surface.samples.map(sample =>
            influencesGroup.get<MultiObjectsInfluences<Objects>>(sample))
        for (const duplicatedVert of UVunwrapping.duplicatedVerts)
            influenceValues.push(influenceValues[duplicatedVert])
        const influences_texture = new VertexInterpolatingTexture(influenceValues, UVunwrapping.UVs, UVunwrapping.finalIndices)

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
            for (const duplicatedVert of UVunwrapping.duplicatedVerts)
                locations.push(locations[duplicatedVert])
            
            const locations_texture = new VertexInterpolatingTexture(locations, UVunwrapping.UVs, UVunwrapping.finalIndices)

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