import { groupKindObjectsGrouped, groupKinds, MultiObjectsCombinedValue, MultiObjectsGrouped, MultiObjectsGroupsTemplate, MultiObjectsInfluences, MultiObjectsInfluencesGrouped, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesProcessingContext, MultiObjectsMapped, MultiObjectsMappedAndCombinedGrouped, MultiObjectsMappedGrouped, MultiObjectsTemplate } from "../../../fields/index.js";
import { Processor } from "../../../processor/processor.js";
import { ObjectsCombiningTexture, Texture, TextureSample, VertexInterpolatingTexture } from "../../../textures/index.js";
import { onlyOne } from "../../../utils/only-one.js";
import { PropertyPath } from "../../../utils/property-path.js";
import { Surface } from "../../surface.js";
import { SurfaceProcessingContextWithIndividualTextures, SurfaceProcessingContextWithObjectsTextures, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleProcessingContextWithObjectsTextureLocations, SurfaceSampleWithIndividualTextureLocations, SurfaceTextureLocation, SurfaceTextureLocationsGroupKindsTemplate, SurfaceTexturesGroupKindsTemplate, SurfaceWithObjectsTextures } from "./types.js";
import { SurfaceSampleWithInterpolatingValues } from "./vertex-interpolating.js";

export type SurfaceSampleWithSurfaceAndObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation,
        ValueTextureLocationsGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation,
    > =
    SurfaceSampleWithInterpolatingValues<
            SurfaceTextureLocationGroup,
            ValueTextureLocationsGroups,
            MultiObjectsMappedGrouped<
                Objects,
                ValueTextureLocationsGroups,
                ValueTextureLocationT
            >
        > &
    MultiObjectsInfluencesGrouped<Objects, InfluenceGroup> &
    // = SurfaceSampleWithObjectsTextureLocations<
    //         Objects,
    //         ValueTextureLocationsGroups,
    //         ValueTextureLocationT
    //     > &
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
        ValueTextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsValueTextureLocationsGrouped extends
            MultiObjectsGrouped<Objects, ValueTextureLocationGroups> =
            MultiObjectsGrouped<Objects, ValueTextureLocationGroups>,
    > =
    MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroup, ObjectsInfluencesGrouped> &
    SurfaceSampleProcessingContextWithObjectsTextureLocations<
        Objects,
        ValueTextureLocationGroups,
        ObjectsValueTextureLocationsGrouped
    > &
    SurfaceSampleProcessingContextWithIndividualTextureLocations<SurfaceTextureLocationGroup>

export type SurfaceWithSurfaceAndObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation,
        ValueTexturesGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation,
        ValueTextureSampleT extends TextureSample = TextureSample,
        ValueTextureT extends
            Texture<ValueTextureLocationT, ValueTextureSampleT> =
            Texture<ValueTextureLocationT, ValueTextureSampleT>,
        SurfaceSampleT extends
            SurfaceSampleWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    SurfaceTextureLocationGroup,
                    SurfaceTextureLocationT,
                    ValueTexturesGroups,
                    ValueTextureLocationT
                > =
            SurfaceSampleWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    SurfaceTextureLocationGroup,
                    SurfaceTextureLocationT,
                    ValueTexturesGroups,
                    ValueTextureLocationT
                >,
    > =
    // SurfaceSampleT is added separately here to avoid 'too much complexity' error
    Surface<SurfaceSampleT> &
    SurfaceWithObjectsTextures<
        Objects,
        ValueTexturesGroups,
        ValueTextureLocationT,
        ValueTextureSampleT,
        ValueTextureT
        // SurfaceSampleT
    > &
    MultiObjectsMappedAndCombinedGrouped<
        Objects,
        ValueTexturesGroups,
        ValueTextureT,
        ObjectsCombiningTexture<
            Objects,
            SurfaceTextureLocationT,
            ValueTextureLocationT,
            ValueTextureSampleT,
            ValueTextureT
        >
    >

export type SurfaceProcessingContextWithSurfaceAndObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInfluencesGrouped extends
            MultiObjectsGrouped<Objects, InfluenceGroup> =
            MultiObjectsGrouped<Objects, InfluenceGroup>,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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
                    ValueTextureGroups,
                    ObjectsValueTexturesGrouped
                > =
            SurfaceSampleProcessingContextWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    SurfaceTextureLocationGroup,
                    ValueTextureGroups,
                    ObjectsValueTexturesGrouped
                >
    > =
    SurfaceProcessingContextWithObjectsTextures<
        Objects,
        ValueTextureGroups,
        ObjectsValueTexturesGrouped,
        SampleProcessingContextT
    > &
    SurfaceProcessingContextWithIndividualTextures<
        SurfaceTextureLocationGroup,
        SampleProcessingContextT
    >

export class SurfaceWithObjectsTexturesCombiningProcessor<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInfluencesGrouped extends
            MultiObjectsGrouped<Objects, InfluenceGroup> =
            MultiObjectsGrouped<Objects, InfluenceGroup>,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation,
        ValueTextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsValueTexturesGrouped extends
            MultiObjectsGrouped<Objects, ValueTextureGroups> =
            MultiObjectsGrouped<Objects, ValueTextureGroups>,
        ValueTextureLocationT extends
            SurfaceTextureLocation =
            SurfaceTextureLocation,
        ValueTextureSampleT extends TextureSample = TextureSample,
        ValueTextureT extends
            Texture<ValueTextureLocationT, ValueTextureSampleT> =
            Texture<ValueTextureLocationT, ValueTextureSampleT>,
        SurfaceSampleT extends
            SurfaceSampleWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    SurfaceTextureLocationGroup,
                    SurfaceTextureLocationT,
                    ValueTextureGroups,
                    ValueTextureLocationT
                > =
            SurfaceSampleWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    SurfaceTextureLocationGroup,
                    SurfaceTextureLocationT,
                    ValueTextureGroups,
                    ValueTextureLocationT
                >,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    SurfaceTextureLocationGroup,
                    ValueTextureGroups,
                    ObjectsValueTexturesGrouped
                > =
            SurfaceSampleProcessingContextWithSurfaceAndObjectsTextureLocations<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    SurfaceTextureLocationGroup,
                    ValueTextureGroups,
                    ObjectsValueTexturesGrouped
                >
    > implements
    Processor<
        SurfaceWithSurfaceAndObjectsTextures<
            Objects,
            InfluenceGroup,
            SurfaceTextureLocationGroup,
            SurfaceTextureLocationT,
            ValueTextureGroups,
            ValueTextureLocationT,
            ValueTextureSampleT,
            ValueTextureT,
            SurfaceSampleT
        >,
        SurfaceProcessingContextWithSurfaceAndObjectsTextures<
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            SurfaceTextureLocationGroup,
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
    ) {}

    init(context: SurfaceProcessingContextWithSurfaceAndObjectsTextures<
            Objects,
            InfluenceGroup,
            ObjectsInfluencesGrouped,
            SurfaceTextureLocationGroup,
            ValueTextureGroups,
            ObjectsValueTexturesGrouped,
            SurfaceSampleProcessingContextT
        >): void {
        const surfaceTextureLocationGroup = onlyOne(groupKinds(
            context.sample,
            SurfaceTextureLocationsGroupKindsTemplate,
            this.surfaceTextureLocationGroup
        )).group
        
        const influencesGroup = onlyOne(groupKinds(
            context.sample,
            MultiObjectsInfluencesGroupKindsTemplate,
            this.influenceGroup
        )).group

        const valueTextureGroups = groupKinds(
            context,
            SurfaceTexturesGroupKindsTemplate,
            this.valueTextureGroups
        )

        this._dependencies = [
            surfaceTextureLocationGroup.path,
            influencesGroup.path,
            ...[...valueTextureGroups].map(({ group: { path } }) => path)
        ]
    }

    process(
            surface: SurfaceWithSurfaceAndObjectsTextures<
                    Objects,
                    InfluenceGroup,
                    SurfaceTextureLocationGroup,
                    SurfaceTextureLocationT,
                    ValueTextureGroups,
                    ValueTextureLocationT,
                    ValueTextureSampleT,
                    ValueTextureT,
                    SurfaceSampleT
                >,
            context: SurfaceProcessingContextWithSurfaceAndObjectsTextures<
                    Objects,
                    InfluenceGroup,
                    ObjectsInfluencesGrouped,
                    SurfaceTextureLocationGroup,
                    ValueTextureGroups,
                    ObjectsValueTexturesGrouped,
                    SurfaceSampleProcessingContextT
                >
        ): void {
        const surfaceTextureLocationGroup = onlyOne(groupKinds(
            context.sample,
            SurfaceTextureLocationsGroupKindsTemplate,
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
                SurfaceTexturesGroupKindsTemplate,
                this.valueTextureGroups
            )

        for (const { group, objects: { value, template } } of valueTextureGroups) {
            const locations = surface.samples.map(sample =>
                group.get<MultiObjectsMapped<Objects, ValueTextureLocationT>>(sample))
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