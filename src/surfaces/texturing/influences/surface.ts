import { MultiObjectsInfluences, MultiObjectsInfluencesGroupKinds, MultiObjectsInfluencesGroupKindsTemplate } from "../../../fields/multi-objects.js";
import { MultiObjectsGrouped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsProcessingContext, MultiObjectsTemplate } from "../../../paradigm/multi-objects.js";
import { Texture, TextureLocation } from "../../../textures/texture.js";
import { SurfaceSample } from "../../surface.js";
import { SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping, SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping } from "../types.js";
import { SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping, SurfaceSampleWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping, SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor } from "../vertex-interpolating/individual-surface.js";

export type SurfaceSampleWithInfluences<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluencesGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    SurfaceSampleWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
            InfluencesGroup,
            MultiObjectsInfluences<Objects>,
            MultiObjectsGroupsMapped<
                InfluencesGroup,
                MultiObjectsInfluences<Objects>
            >
        >

export type SurfaceSampleProcessingContextWithInfluences<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluencesGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    MultiObjectsProcessingContext<
            Objects,
            InfluencesGroup,
            MultiObjectsGrouped<Objects, InfluencesGroup>,
            MultiObjectsInfluencesGroupKinds
        > &
    SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
        InfluencesGroup,
        MultiObjectsInfluencesGroupKinds
    >

export type SurfaceWithInfluencesTextureUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluencesGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceSampleT extends SurfaceSample = SurfaceSample
    > =
    SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            InfluencesGroup,
            TextureLocation,
            MultiObjectsInfluences<Objects>,
            Texture<
                    TextureLocation,
                    MultiObjectsInfluences<Objects>
                >,
            MultiObjectsGroupsMapped<
                    InfluencesGroup,
                    Texture<
                            TextureLocation,
                            MultiObjectsInfluences<Objects>
                        >
                >,
            SurfaceSampleT
        >

export type SurfaceProcessingContextWithInfluencesTextureUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluencesGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithInfluences<Objects, InfluencesGroup> =
            SurfaceSampleProcessingContextWithInfluences<Objects, InfluencesGroup>
    > =
    SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            InfluencesGroup,
            SampleProcessingContextT
        >

export class SurfaceWithInfluencesTextureUsingSurfaceUVUnwrappingProcessor<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluencesGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceSampleT extends 
            SurfaceSampleWithInfluences<Objects, InfluencesGroup> =
            SurfaceSampleWithInfluences<Objects, InfluencesGroup>,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithInfluences<Objects, InfluencesGroup> =
            SurfaceSampleProcessingContextWithInfluences<Objects, InfluencesGroup>
    > extends
    SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor<
            SurfaceUVUnwrappingGroup,
            InfluencesGroup,
            MultiObjectsInfluencesGroupKinds,
            MultiObjectsInfluences<Objects>,
            MultiObjectsGroupsMapped<
                    InfluencesGroup,
                    MultiObjectsInfluences<Objects>
                >,
            SurfaceSampleT,
            SurfaceSampleProcessingContextT
        > {
    constructor(
            influencesGroups?: InfluencesGroup,
            surfaceUVunwrappingGroup?: SurfaceUVUnwrappingGroup,
        ) {
        super(
            MultiObjectsInfluencesGroupKindsTemplate,
            influencesGroups,
            surfaceUVunwrappingGroup
        )
    }
}