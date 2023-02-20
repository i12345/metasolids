import { FieldPoint, groupKindObjectsGrouped, groupKinds, MultiObjectsCombinedValue, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsInfluences, MultiObjectsInfluencesGrouped, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesProcessingContext, MultiObjectsMapped, MultiObjectsMappedAndCombinedGrouped, MultiObjectsMappedGrouped, MultiObjectsProcessingContext, MultiObjectsTemplate } from "../../fields/index.js";
import { Processor } from "../../processor/processor.js";
import { ObjectsCombiningTexture, Texture, TextureLocation, TextureSample, VertexInterpolatingTexture } from "../../textures/index.js";
import { onlyOne } from "../../utils/only-one.js";
import { SurfaceProcessingContext } from "../processor.js";
import { Surface, SurfaceSample } from "../surface.js";

export const SurfaceTexturesGroupKindKey = Symbol('ground-kind:surface-textures')
export interface SurfaceTexturesGroupKinds
    extends MultiObjectsGroupsKindsTemplate {
    [SurfaceTexturesGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceTexturesGroupKindsTemplate: SurfaceTexturesGroupKinds = {
    [SurfaceTexturesGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceTextureLocationsGroupKindKey = Symbol('ground-kind:surface-texture-locations')
export interface SurfaceTextureLocationsGroupKinds
    extends MultiObjectsGroupsKindsTemplate {
    [SurfaceTextureLocationsGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceTextureLocationsGroupKindsTemplate: SurfaceTextureLocationsGroupKinds = {
    [SurfaceTextureLocationsGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export type SurfaceSampleProcessingContextWithIndividualTextureLocations<
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    MultiObjectsGroupsProcessingContext<
        TextureLocationGroups,
        SurfaceTextureLocationsGroupKinds
    >

export type SurfaceSampleProcessingContextWithObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, TextureLocationGroups> =
            MultiObjectsGrouped<Objects, TextureLocationGroups>
    > =
    MultiObjectsProcessingContext<
        Objects,
        TextureLocationGroups,
        ObjectsGrouped,
        SurfaceTextureLocationsGroupKinds
    >

export type SurfaceProcessingContextWithIndividualTextureLocations<
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations<TextureLocationGroups> =
            SurfaceSampleProcessingContextWithIndividualTextureLocations<TextureLocationGroups>
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsGroupsProcessingContext<
        TextureLocationGroups,
        SurfaceTextureLocationsGroupKinds
    >

export type SurfaceProcessingContextWithObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, TextureLocationGroups> =
            MultiObjectsGrouped<Objects, TextureLocationGroups>,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsTextureLocations<Objects, TextureLocationGroups, ObjectsGrouped> =
            SurfaceSampleProcessingContextWithObjectsTextureLocations<Objects, TextureLocationGroups, ObjectsGrouped>
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsProcessingContext<
        Objects,
        TextureLocationGroups,
        ObjectsGrouped,
        SurfaceTextureLocationsGroupKinds
    >

export type SurfaceProcessingContextWithIndividualTextures<
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations<TextureGroups> =
            SurfaceSampleProcessingContextWithIndividualTextureLocations<TextureGroups>
    > =
    SurfaceProcessingContextWithIndividualTextureLocations<
            TextureGroups,
            SampleProcessingContextT
        > &
    MultiObjectsGroupsProcessingContext<
            TextureGroups,
            SurfaceTexturesGroupKinds
        >

export type SurfaceProcessingContextWithObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, TextureGroups> =
            MultiObjectsGrouped<Objects, TextureGroups>,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsTextureLocations<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped
                > =
            SurfaceSampleProcessingContextWithObjectsTextureLocations<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped
                >
    > =
    SurfaceProcessingContextWithObjectsTextureLocations<
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            SampleProcessingContextT
        > &
    MultiObjectsProcessingContext<
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            SurfaceTexturesGroupKinds
        >

export interface SurfaceTextureLocation<
        SurfaceSampleT extends SurfaceSample = SurfaceSample
    > extends TextureLocation {
    surface: SurfaceSampleT
}

export type SurfaceSampleWithIndividualTextureLocations<
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation
    > =
    SurfaceSample &
    MultiObjectsGroupsMapped<TextureLocationGroups, TextureLocationT>

export type SurfaceSampleWithObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureLocationGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation
    > =
    SurfaceSample &
    MultiObjectsMappedAndCombinedGrouped<Objects, TextureLocationGroups, TextureLocationT>

export type SurfaceWithIndividualTextures<
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureT extends
            Texture<TextureLocationT, TextureSampleT> =
            Texture<TextureLocationT, TextureSampleT>,
        SurfaceSampleT extends
            SurfaceSampleWithIndividualTextureLocations<TextureGroups, TextureLocationT> =
            SurfaceSampleWithIndividualTextureLocations<TextureGroups, TextureLocationT>
    > =
    Surface<SurfaceSampleT> &
    MultiObjectsGroupsMapped<TextureGroups, TextureT>

export type SurfaceWithObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureT extends
            Texture<TextureLocationT, TextureSampleT> =
            Texture<TextureLocationT, TextureSampleT>,
        SurfaceSampleT extends
            SurfaceSampleWithObjectsTextureLocations<Objects, TextureGroups, TextureLocationT> =
            SurfaceSampleWithObjectsTextureLocations<Objects, TextureGroups, TextureLocationT>
    > =
    Surface<SurfaceSampleT> &
    MultiObjectsMappedAndCombinedGrouped<Objects, TextureGroups, TextureT>

export type SurfaceSampleWithInterpolatingValue<
        TextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
    > =
    SurfaceSample &
    SurfaceSampleWithIndividualTextureLocations<TextureLocationGroup> &
    MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>

export type SurfaceSampleProcessingContextWithInterpolatingValues<
        TextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
    > =
    SurfaceSampleProcessingContextWithIndividualTextureLocations<TextureLocationGroup> &
    MultiObjectsGroupsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupsKind
    >

export type SurfaceWithInterpolatingValueTextures<
        TextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        SurfaceSampleT extends
            SurfaceSampleWithInterpolatingValue<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue
                > =
            SurfaceSampleWithInterpolatingValue<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue
                >
    > =
    Surface<SurfaceSampleT> &
    MultiObjectsGroupsMapped<
        InterpolatingGroups,
        VertexInterpolatingTexture<InterpolatingValue>
    >

export type SurfaceWithInterpolatingValueTexturesProcessingContext<
        TextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithInterpolatingValues<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithInterpolatingValues<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            >
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsGroupsProcessingContext<
        TextureLocationGroup,
        SurfaceTextureLocationsGroupKinds
    > &
    MultiObjectsGroupsProcessingContext<
        InterpolatingGroups,
        SurfaceTexturesGroupKinds
    >

export class SurfaceWithInterpolatingValueTexturesProcessor<
        TextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        SurfaceSampleT extends
            SurfaceSampleWithInterpolatingValue<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue
                > =
            SurfaceSampleWithInterpolatingValue<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue
                >,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithInterpolatingValues<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithInterpolatingValues<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            >,
        SurfaceT extends
            SurfaceWithInterpolatingValueTextures<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    SurfaceSampleT
                > =
            SurfaceWithInterpolatingValueTextures<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    SurfaceSampleT
                >,
        SurfaceProcessingContextT extends
            SurfaceWithInterpolatingValueTexturesProcessingContext<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds,
                SurfaceSampleProcessingContextT
            > =
            SurfaceWithInterpolatingValueTexturesProcessingContext<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds,
                SurfaceSampleProcessingContextT
            >
    > implements
    Processor<SurfaceT, SurfaceProcessingContextT> {
    dependencies: Function[];
    
    constructor(
        public interpolatingGroupsKinds: InterpolatingGroupKinds,
        public interpolatingGroups?: InterpolatingGroups,
        public textureLocationGroup?: TextureLocationGroup
    ) { }
    init(context: SurfaceProcessingContextT): void {
    }

    process(surface: SurfaceT, context: SurfaceProcessingContextT): void {
        const { group: textureLocationGroup } =
            onlyOne(groupKinds(
                    context,
                    SurfaceTextureLocationsGroupKindsTemplate,
                    this.textureLocationGroup
                ))
        
        const UVs = surface.samples.map(sample =>
            textureLocationGroup.get<TextureLocation>(sample).uv)

        const interpolatingGroups =
            groupKinds(
                    context.sample,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )

        for (const { group: interpolatingGroup } of interpolatingGroups) {
            const values = surface.samples.map(sample => interpolatingGroup.get<InterpolatingValue>(sample))
            const texture = new VertexInterpolatingTexture(values, UVs, surface.mesh.triangles)
            interpolatingGroup.set(surface, texture)
        }
    }
}

export type SurfaceSampleWithSurfaceAndObjectsTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceTextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation,
        ValueTextureLocationsGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueTextureLocationT extends SurfaceTextureLocation = SurfaceTextureLocation,
    > =
    SurfaceSampleWithInterpolatingValue<
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
    dependencies: Function[];

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
        const surfaceTexturelocationGroup = onlyOne(groupKinds(
            context.sample,
            SurfaceTextureLocationsGroupKindsTemplate,
            this.surfaceTextureLocationGroup
        )).group
        
        const surfaceTextureLocations = surface.samples.map(sample =>
            surfaceTexturelocationGroup.get<SurfaceTextureLocationT>(sample))
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