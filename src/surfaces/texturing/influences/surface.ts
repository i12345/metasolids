import { Field, MultiObjectsFieldPointElement, MultiObjectsWithGroupFieldsProcessingContext } from "../../../fields/index.js";
import { ScalarField, MultiObjectsField } from "../../../fields/fields/index.js";
import { MultiObjectsInfluences, MultiObjectsInfluencesGroupKinds, MultiObjectsInfluencesGroupKindsTemplate } from "../../../fields/multi-objects.js";
import { MultiObjectsGrouped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsProcessingContext, MultiObjectsTemplate } from "../../../paradigm/trees/index.js";
import { Texture, TextureLocation } from "../../../textures/texture.js";
import { IndicesTypedArray } from "../../../utils/indices-array.js";
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
        InfluencesGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        // ObjIDsT extends IndicesTypedArray = Uint32Array
    > =
    MultiObjectsWithGroupFieldsProcessingContext<
            Objects,
            InfluencesGroup,
            MultiObjectsGrouped<Objects, InfluencesGroup>,
            MultiObjectsInfluencesGroupKinds,
            number
        > &
    SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
        InfluencesGroup,
        MultiObjectsInfluencesGroupKinds,
        MultiObjectsInfluences<Objects>,
        MultiObjectsFieldPointElement<number>,
        number,
        MultiObjectsField<number, Objects>
    >

export type SurfaceWithInfluencesTextureUsingSurfaceUVUnwrapping<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluencesGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceSampleT extends SurfaceSample = SurfaceSample
    > =
    SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
            IndicesT,
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
            SampleProcessingContextT,
            InfluencesGroup
        >

export class SurfaceWithInfluencesTextureUsingSurfaceUVUnwrappingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
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
            IndicesT,
            SurfaceUVUnwrappingGroup,
            InfluencesGroup,
            MultiObjectsInfluencesGroupKinds,
            MultiObjectsInfluences<Objects>,
            MultiObjectsFieldPointElement<number>,
            number,
            MultiObjectsField<number, Objects>,
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