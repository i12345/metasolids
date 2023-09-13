import { Field, MultiObjectsFieldPointElement, MultiObjectsWithGroupFieldsProcessingContext } from "../../../fields/index.js";
import { ScalarField, MultiObjectsField } from "../../../fields/fields/index.js";
import { MultiObjectsInfluences, MultiObjectsInfluencesElementType, MultiObjectsInfluencesFuseMode, MultiObjectsInfluencesGroupKinds, MultiObjectsInfluencesGroupKindsTemplate } from "../../../fields/multi-objects.js";
import { MultiObjectsGrouped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsProcessingContext, MultiObjectsTemplate } from "../../../paradigm/trees/index.js";
import { Texture, TextureLocation, TextureSamplingContext } from "../../../textures/texture.js";
import { IndicesTypedArray } from "../../../utils/indices-array.js";
import { SurfaceSample } from "../../surface.js";
import { SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping, SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping } from "../types.js";
import { SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping, SurfaceSampleWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping, SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor } from "../vertex-interpolating/individual-surface.js";
import { FieldPointVector, FieldPointVectorContainer } from "../../../fields/vectorized/index.js";
import { NumberTypedArray } from "../../../utils/typed-array.js";

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
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>
    > =
    SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
            IndicesT,
            SurfaceUVUnwrappingGroup,
            InfluencesGroup,
            TextureLocation,
            TextureLocation,
            TextureLocation,
            MultiObjectsInfluences<Objects>,
            MultiObjectsInfluencesElementType<Objects>,
            MultiObjectsInfluencesFuseMode<Objects>,
            TextureSamplingContext,
            Texture<
                    TextureLocation,
                    MultiObjectsInfluences<Objects>,
                    TextureLocation,
                    TextureLocation,
                    MultiObjectsInfluencesElementType<Objects>,
                    MultiObjectsInfluencesFuseMode<Objects>
                >,
            MultiObjectsGroupsMapped<
                    InfluencesGroup,
                    Texture<
                            TextureLocation,
                            MultiObjectsInfluences<Objects>,
                            TextureLocation,
                            TextureLocation,
                            MultiObjectsInfluencesElementType<Objects>,
                            MultiObjectsInfluencesFuseMode<Objects>
                        >
                >,
            SurfaceSampleElementType,
            SurfaceSampleContainer,
            SurfaceSampleVector
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
            InfluencesGroup,
            MultiObjectsInfluences<Objects>,
            MultiObjectsInfluencesElementType<Objects>,
            MultiObjectsInfluencesFuseMode<Objects>,
            MultiObjectsField<number, Objects>
        >

export class SurfaceWithInfluencesTextureUsingSurfaceUVUnwrappingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        InfluencesGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceSampleElementType extends
            SurfaceSampleWithInfluences<Objects, InfluencesGroup> =
            SurfaceSampleWithInfluences<Objects, InfluencesGroup>,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithInfluences<Objects, InfluencesGroup> =
            SurfaceSampleProcessingContextWithInfluences<Objects, InfluencesGroup>
    > extends
    SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor<
            IndicesT,
            Objects,
            ObjIDsT,
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
            SurfaceSampleElementType,
            SurfaceSampleContainer,
            SurfaceSampleVector,
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