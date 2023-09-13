import { groupKindObjectsGrouped, groupKinds, MultiObjectsCombinedValue, MultiObjectsGrouped, MultiObjectsGroupsCombined, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsTemplate, MultiObjectsIDsKey, WithMultiObjectsIDs, MultiObjectsGroup } from "../../../paradigm/trees/index.js";
import { Processor } from "../../../paradigm/processing/processor.js";
import { MultiObjectsInfluences, MultiObjectsInfluencesElementType, MultiObjectsInfluencesFuseMode, MultiObjectsInfluencesGrouped, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesProcessingContext } from "../../../fields/multi-objects.js";
import { ObjectsCombiningTexture, Texture, TextureLocation, TextureSample, TextureSamplingContext, VertexInterpolatingTexture } from "../../../textures/index.js";
import { IndicesTypedArray, NumberTypedArray, onlyOne } from "../../../utils/index.js";
import { SurfaceUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate } from "../../uv-unwrapping/index.js";
import { SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping, SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping, SurfaceWithInfluencesTextureUsingSurfaceUVUnwrapping } from "../index.js";
import { SurfaceSampleProcessingContextWithObjectsTextureLocations, SurfaceSampleWithObjectsTextureLocations, SurfaceObjectsTexturesGroupKindsTemplate, SurfaceObjectsTextureLocationsGroupKindsTemplate, SurfaceWithObjectsTexturesUsingObjectsSampleTextureLocations, SurfaceProcessingContextWithObjectsTexturesUsingObjectsSampleTextureLocations, SurfaceSampleElementTypeWithObjectsTextureLocations, SurfaceSampleFuseModeWithObjectsTextureLocations, SurfaceObjectsTextureLocationsGroupKinds } from "../types.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, field_point_vector_append_scattered_same } from "../../../fields/vectorized/point.js";
import { groupKindsWithFields } from "../../../fields/index.js";
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

export type SurfaceSampleElementTypeForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationsGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationElementType extends TextureLocation = TextureLocation,
    > =
    MultiObjectsInfluencesGrouped<Objects, InfluenceGroup> &
    SurfaceSampleElementTypeWithObjectsTextureLocations<
            Objects,
            ValueTextureLocationsGroup,
            ValueTextureLocationElementType
        >

export type SurfaceSampleFuseModeForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationsGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationFuseMode extends TextureLocation = TextureLocation,
    > =
    MultiObjectsInfluencesGrouped<Objects, InfluenceGroup> &
    SurfaceSampleFuseModeWithObjectsTextureLocations<
            Objects,
            ValueTextureLocationsGroup,
            ValueTextureLocationFuseMode
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
        ValueTextureLocationT extends TextureLocation = TextureLocation,
    > =
    MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroup, ObjectsInfluencesGrouped> &
    SurfaceSampleProcessingContextWithObjectsTextureLocations<
            Objects,
            ValueTextureLocationGroup,
            ValueTextureLocationT,
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
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        ValueTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTexturesGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationT extends TextureLocation = TextureLocation,
        ValueTextureSampleT extends TextureSample = TextureSample,
        ValueTextureSampleElementType extends TextureSample = ValueTextureSampleT,
        ValueTextureSampleFuseMode extends TextureSample = ValueTextureSampleT,
        ValueTextureT extends
            Texture<
                        TextureLocationT & ValueTextureLocationT, ValueTextureSampleT,
                        TextureLocationElementType & ValueTextureLocationT,
                        TextureLocationFuseMode & ValueTextureLocationT,
                        ValueTextureSampleElementType,
                        ValueTextureSampleFuseMode,
                        TextureSamplingContextT &
                        TextureSamplingContext<
                            TextureLocationT & ValueTextureLocationT,
                            TextureLocationElementType & ValueTextureLocationT,
                            TextureLocationFuseMode & ValueTextureLocationT
                        >
                > =
            Texture<
                        TextureLocationT & ValueTextureLocationT, ValueTextureSampleT,
                        TextureLocationElementType & ValueTextureLocationT,
                        TextureLocationFuseMode & ValueTextureLocationT,
                        ValueTextureSampleElementType,
                        ValueTextureSampleFuseMode,
                        TextureSamplingContextT &
                        TextureSamplingContext<
                            TextureLocationT & ValueTextureLocationT,
                            TextureLocationElementType & ValueTextureLocationT,
                            TextureLocationFuseMode & ValueTextureLocationT
                        >
                >,
        ValueTexturesGrouped extends
            MultiObjectsGroupsMapped<ValueTexturesGroups, ValueTextureT> =
            MultiObjectsGroupsMapped<ValueTexturesGroups, ValueTextureT>,
        SurfaceSampleElementType extends
            SurfaceSampleElementTypeForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
                    Objects,
                    InfluenceGroup,
                    ValueTextureLocationGroup,
                    ValueTextureLocationT
                > =
            SurfaceSampleElementTypeForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
                    Objects,
                    InfluenceGroup,
                    ValueTextureLocationGroup,
                    ValueTextureLocationT
                >,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > =
    SurfaceWithInfluencesTextureUsingSurfaceUVUnwrapping<
            IndicesT,
            SurfaceUVUnwrappingGroup,
            Objects,
            InfluenceGroup,
            SurfaceSampleElementType,
            SurfaceSampleContainer,
            SurfaceSampleVector
        > &
    SurfaceWithObjectsTexturesUsingObjectsSampleTextureLocations<
            IndicesT,
            ValueTextureLocationGroup,
            Objects,
            ValueTexturesGroups,
            ValueTextureLocationT,
            ValueTextureLocationT,
            ValueTextureLocationT,
            ValueTextureSampleT,
            ValueTextureSampleElementType,
            ValueTextureSampleFuseMode,
            TextureSamplingContextT &
            TextureSamplingContext<
                    TextureLocationT & ValueTextureLocationT,
                    TextureLocationElementType & ValueTextureLocationT,
                    TextureLocationFuseMode & ValueTextureLocationT
                >,
            ValueTextureT,
            ValueTexturesGrouped,
            SurfaceSampleElementType,
            SurfaceSampleContainer,
            SurfaceSampleVector
        > &
    SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
            IndicesT,
            SurfaceUVUnwrappingGroup,
            MultiObjectsGroupsCombined<ValueTexturesGroups>,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            ValueTextureSampleT,
            ValueTextureSampleElementType,
            ValueTextureSampleFuseMode,
            TextureSamplingContextT,
            ObjectsCombiningTexture<
                    Objects,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    ValueTextureLocationT,
                    ValueTextureLocationT,
                    ValueTextureLocationT,
                    ValueTextureSampleT,
                    ValueTextureSampleElementType,
                    ValueTextureSampleFuseMode,
                    TextureSamplingContextT,
                    ValueTextureT
                >
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
        ValueTextureLocationT extends TextureLocation = TextureLocation,
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
                    ObjectsValueTextureLocationsGrouped,
                    ValueTextureLocationT
                > =
            SurfaceSampleProcessingContextForSurfaceWithObjectsTexturesCombinedUsingSurfaceUVUnwrapping<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    ValueTextureLocationGroup,
                    ObjectsValueTextureLocationsGrouped,
                    ValueTextureLocationT
                >
    > =
    SurfaceProcessingContextWithObjectsTexturesUsingObjectsSampleTextureLocations<
        ValueTextureLocationGroup,
        Objects,
        ValueTextureGroups,
        ObjectsValueTexturesGrouped,
        ValueTextureLocationT,
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
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        ValueTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsValueTextureLocationsGrouped extends
            MultiObjectsGrouped<Objects, ValueTextureLocationGroup> =
            MultiObjectsGrouped<Objects, ValueTextureLocationGroup>,
        ValueTextureLocationT extends TextureLocation = TextureLocation,
        ValueTextureSampleT extends TextureSample = TextureSample,
        ValueTextureSampleElementType extends TextureSample = ValueTextureSampleT,
        ValueTextureSampleFuseMode extends TextureSample = ValueTextureSampleT,
        ValueTextureT extends
            Texture<
                    TextureLocationT & ValueTextureLocationT, ValueTextureSampleT,
                    TextureLocationElementType & ValueTextureLocationT,
                    TextureLocationFuseMode & ValueTextureLocationT,
                    ValueTextureSampleElementType,
                    ValueTextureSampleFuseMode,
                    TextureSamplingContextT &
                    TextureSamplingContext<
                        TextureLocationT & ValueTextureLocationT,
                        TextureLocationElementType & ValueTextureLocationT,
                        TextureLocationFuseMode & ValueTextureLocationT
                    >
                > =
            Texture<
                    TextureLocationT & ValueTextureLocationT, ValueTextureSampleT,
                    TextureLocationElementType & ValueTextureLocationT,
                    TextureLocationFuseMode & ValueTextureLocationT,
                    ValueTextureSampleElementType,
                    ValueTextureSampleFuseMode,
                    TextureSamplingContextT &
                    TextureSamplingContext<
                        TextureLocationT & ValueTextureLocationT,
                        TextureLocationElementType & ValueTextureLocationT,
                        TextureLocationFuseMode & ValueTextureLocationT
                    >
                >,
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
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSamplingContextT,
            ValueTextureLocationGroup,
            ValueTextureGroups,
            ValueTextureLocationT,
            ValueTextureSampleT,
            ValueTextureSampleElementType,
            ValueTextureSampleFuseMode,
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
            ValueTextureLocationT,
            ValueTextureGroups,
            ObjectsValueTexturesGrouped
        >
    > {
    constructor(
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
            ValueTextureLocationT,
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
                ['samples', ...valueTextureLocationGroups.path],
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
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT,
                    ValueTextureLocationGroup,
                    ValueTextureGroups,
                    ValueTextureLocationT,
                    ValueTextureSampleT,
                    ValueTextureSampleElementType,
                    ValueTextureSampleFuseMode,
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
                    ValueTextureLocationT,
                    ValueTextureGroups,
                    ObjectsValueTexturesGrouped
                >
        ): void {
        type ObjIDsT = Uint32Array

        type ObjectsTextureLocationsT = MultiObjectsMapped<Objects, ValueTextureLocationT>
        type ObjectsTextureLocationsElementType = MultiObjectsGroup<ValueTextureLocationT>
        type ObjectsTextureLocationsFuseMode = ValueTextureLocationT
        type ObjectsTextureLocationsField = MultiObjectsField<ValueTextureLocationT, Objects, ObjIDsT>
        type ObjectsTextureLocationsContainer = FieldPointVectorContainerStatic<NumberTypedArray>
        type ObjectsTextureLocationsVector = FieldPointVector<ObjectsTextureLocationsElementType, ObjectsTextureLocationsContainer>


        const multiObjectsIDs = (<WithMultiObjectsIDs<Objects, ObjIDsT>><unknown>context)[MultiObjectsIDsKey]
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

        const influences_texture = influencesGroup.get<VertexInterpolatingTexture<
            Objects, ObjIDsT,
            TextureLocationT, TextureLocationElementType, TextureLocationFuseMode,
            MultiObjectsInfluences<Objects>,
            MultiObjectsInfluencesElementType<Objects>,
            MultiObjectsInfluencesFuseMode<Objects>
        >>(surface)

        const valueTextureGroups = groupKindObjectsGrouped(
            surface,
            context,
            SurfaceObjectsTexturesGroupKindsTemplate,
            this.valueTextureGroups
        )

        const valueTextureLocationGroup = onlyOne(groupKindsWithFields<
                ValueTextureLocationGroup,
                SurfaceObjectsTextureLocationsGroupKinds,
                ObjectsTextureLocationsT,
                ObjectsTextureLocationsElementType,
                ObjectsTextureLocationsFuseMode,
                ObjectsTextureLocationsField
            >(
                context.samples,
                SurfaceObjectsTextureLocationsGroupKindsTemplate,
                this.valueTextureLocationGroup
            )).group

        const location_field = valueTextureLocationGroup.field

        const locations_original = valueTextureLocationGroup.get<ObjectsTextureLocationsVector>(surface.samples)
        const locations_UVunwrapped = field_point_vector_append_scattered_same<
                ObjectsTextureLocationsElementType,
                ObjectsTextureLocationsContainer,
                MultiObjectsTemplate,
                ObjIDsT,
                FieldPointVectorContainerStatic<ObjIDsT>,
                ObjectsTextureLocationsVector
            >(
                location_field.elementType,
                {
                    vector: locations_original,
                    vectorizedRoot: <any>surface.samples
                },
                UVunwrapping.duplicatedVerts,
                multiObjectsIDs
            )

        const locations_texture = new VertexInterpolatingTexture<
                Objects,
                ObjIDsT,
                TextureLocation,
                TextureLocation,
                TextureLocation,
                ObjectsTextureLocationsT,
                ObjectsTextureLocationsElementType,
                ObjectsTextureLocationsFuseMode,
                ObjectsTextureLocationsContainer,
                ObjectsTextureLocationsVector
            >(
                locations_UVunwrapped,
                UVunwrapping.UVs,
                UVunwrapping.finalIndices,
                location_field
            )

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