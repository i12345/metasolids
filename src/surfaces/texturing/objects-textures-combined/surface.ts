import { PropertyPath, PROPERTYKEY_ALL, groupKindObjectsGrouped, groupKinds, MultiObjectsCombined, MultiObjectsCombinedValue, MultiObjectsGrouped, MultiObjectsGroupsCombined, MultiObjectsGroupsCombinedMapped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsMappedAndCombinedGrouped, MultiObjectsTemplate, MultiObjectsIDsKey, WithMultiObjectsIDs, MultiObjectsTemplate_Leaf } from "../../../paradigm/trees/index.js";
import { Processor } from "../../../paradigm/processing/processor.js";
import { MultiObjectsInfluences, MultiObjectsInfluencesGrouped, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesProcessingContext } from "../../../fields/multi-objects.js";
import { ObjectsCombiningTexture, ObjectsCombiningTexturesTemplated, ObjectsTextureLocationsTextureSample, Texture, TextureLocation, TextureSample, TextureSamplesExtracted, TextureSamplesExtracted1, VertexInterpolatingTexture } from "../../../textures/index.js";
import { IndicesTypedArray, NumberTypedArray, onlyOne } from "../../../utils/index.js";
import { SurfaceUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate } from "../../uv-unwrapping/index.js";
import { SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping, SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping, SurfaceWithInfluencesTextureUsingSurfaceUVUnwrapping } from "../index.js";
import { SurfaceProcessingContextWithIndividualTextures, SurfaceProcessingContextWithObjectsTextures, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleProcessingContextWithObjectsTextureLocations, SurfaceSampleWithIndividualTextureLocations, SurfaceWithObjectsTextures, SurfaceSampleWithObjectsTextureLocations, SurfaceObjectsTexturesGroupKindsTemplate, SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceWithIndividualTextures, SurfaceObjectsTextureLocationsGroupKindsTemplate, SurfaceWithObjectsTexturesUsingObjectsSampleTextureLocations, SurfaceWithIndividualTexturesUsingSampleTextureLocations, SurfaceProcessingContextWithObjectsTexturesUsingObjectsSampleTextureLocations, SurfaceProcessingContextWithIndividualTexturesUsingSampleTextureLocations } from "../types.js";
import { Vec2 } from "playcanvas-extended";
import { FieldPointVector, FieldPointVectorContainerStatic, field_point_vector_append_scattered_same } from "../../../fields/vectorized/point.js";
import { Field } from "../../../fields/index.js";
import { MultiObjectsField } from "../../../fields/fields/multi-objects.js";

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
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
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
    SurfaceWithInfluencesTextureUsingSurfaceUVUnwrapping<
            IndicesT,
            SurfaceUVUnwrappingGroup,
            Objects,
            InfluenceGroup,
            SurfaceSampleT
        > &
    SurfaceWithObjectsTexturesUsingObjectsSampleTextureLocations<
            IndicesT,
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
            IndicesT,
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
        SampleProcessingContextT,
        MultiObjectsGroupsCombined<ValueTextureGroups>
    >

export class SurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrappingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
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
            IndicesT,
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
    constructor(
        public readonly valueTextureSampleField: Field<ValueTextureSampleT>,
        public readonly valueTextureLocationField: Field<ValueTextureLocationT>,
        public readonly valueTextureGroups: ValueTextureGroups,
        public readonly influenceGroup?: InfluenceGroup,
        public readonly surfaceUVUnwrappingGroup?: SurfaceUVUnwrappingGroup,
        public readonly valueTextureLocationGroup?: ValueTextureLocationGroup,
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
        >) {
        const valueTextureGroups = [...groupKinds(
            context,
            SurfaceObjectsTexturesGroupKindsTemplate,
            this.valueTextureGroups
        )]

        const influencesGroup = onlyOne(groupKinds(
            context.samples,
            MultiObjectsInfluencesGroupKindsTemplate,
            this.influenceGroup
        )).group
        
        const surfaceUVUnwrappingGroup = onlyOne(groupKinds(
            context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            this.surfaceUVUnwrappingGroup
        )).group
        
        const valueTextureLocationGroups = onlyOne(groupKinds(
            context.samples,
            SurfaceObjectsTextureLocationsGroupKindsTemplate,
            this.valueTextureLocationGroup
        )).group
        
        //TODO: currently, any processor depending on the combined value would
        // be satisfied by this processor's input requirements, thus it may not
        // receive the real combined value.

        const connections = {
            inputs: [
                surfaceUVUnwrappingGroup.path,
                influencesGroup.path,
                ['samples', PROPERTYKEY_ALL, ...valueTextureLocationGroups.path],
                ...valueTextureGroups.map(({ group: { path } }) => path)
            ],
            outputs: [
                ...valueTextureGroups.map(({ group: { path } }) => [...path, MultiObjectsCombinedValue])
            ]
        }

        return { connections }
    }

    process(
        surface: SurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
                    IndicesT,
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
            context.samples,
            MultiObjectsInfluencesGroupKindsTemplate,
            this.influenceGroup
        )).group
        const influences_texture = influencesGroup.get<VertexInterpolatingTexture<TextureLocation, MultiObjectsInfluences<Objects>>>(surface)

        const valueTextureGroups = groupKindObjectsGrouped(
            surface,
            context,
            SurfaceObjectsTexturesGroupKindsTemplate,
            this.valueTextureGroups
        )

        const valueTextureLocationGroup = onlyOne(groupKinds(
            context.samples,
            SurfaceObjectsTextureLocationsGroupKindsTemplate,
            this.valueTextureLocationGroup
        )).group
        
        type ObjIDsT = Uint32Array

        type ObjectLocationsT = MultiObjectsMapped<Objects, ValueTextureLocationT>
        type ObjectLocationsContainer = FieldPointVectorContainerStatic<NumberTypedArray>
        type ObjectLocationsVector = FieldPointVector<ObjectLocationsT, ObjectLocationsContainer>

        const multiObjectsIDs = (<WithMultiObjectsIDs<Objects, ObjIDsT>><unknown>context)[MultiObjectsIDsKey]

        const locations_field = new MultiObjectsField<ValueTextureLocationT, Objects, ObjIDsT>(this.valueTextureLocationField, multiObjectsIDs)

        const locations_original = valueTextureLocationGroup.get<ObjectLocationsVector>(surface.samples)
        const locations_UVunwrapped = field_point_vector_append_scattered_same<
                ObjectLocationsT,
                ObjectLocationsContainer,
                MultiObjectsTemplate,
                ObjIDsT,
                FieldPointVectorContainerStatic<ObjIDsT>,
                ObjectLocationsVector
            >(
                <any>locations_field,
                locations_original,
                UVunwrapping.duplicatedVerts,
                multiObjectsIDs
            )

        const locations_texture = new VertexInterpolatingTexture<TextureLocation, ObjectLocationsT, ObjectLocationsContainer, ObjectLocationsVector>(locations_UVunwrapped, UVunwrapping.UVs, UVunwrapping.finalIndices, <any>locations_field)

        for (const { objects: { value, template } } of valueTextureGroups) {            

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