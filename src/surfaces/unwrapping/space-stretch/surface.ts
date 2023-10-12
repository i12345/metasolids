import { FieldPointVector, FieldPointVectorContainer } from "../../../fields/vectorized/index.js"
import { IndicesTypedArray } from "../../../utils/indices-array.js"
import { NumberTypedArray } from "../../../utils/typed-array.js"
import { SurfaceSample } from "../../surface.js"
import * as tf from "@tensorflow/tfjs"
import { SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping } from "../../texturing/types.js"
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../../paradigm/trees/index.js"
import { TextureLocation, TextureSamplingContext } from "../../../textures/index.js"
import { ScalarN } from "../../../utils/tf-rank.js"
import { SpaceStretchTexture } from "./texture.js"

export const SpaceStretchKey = "spaceStretch"

export type SpaceStretchTextureGroup = {
    [SpaceStretchKey]: MultiObjectsGroupsTemplateLeaf
}

export const SpaceStretchTextureGroupTemplate: SpaceStretchTextureGroup = {
    [SpaceStretchKey]: MultiObjectsGroupsTemplate_Leaf
}

export type SurfaceWithSpaceStretch<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > = SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
        IndicesT,
        SurfaceUVUnwrappingGroup,
        SpaceStretchTextureGroup,
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        ScalarN<tf.Rank.R2>,
        ScalarN<tf.Rank.R2>,
        ScalarN<tf.Rank.R2>,
        TextureSamplingContextT,
        SpaceStretchTexture<
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSamplingContextT
        >,
        MultiObjectsGroupsMapped<
            SpaceStretchTextureGroup,
            SpaceStretchTexture<
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSamplingContextT
            >
        >,
        SurfaceSampleElementType,
        SurfaceSampleContainer,
        SurfaceSampleVector
    >