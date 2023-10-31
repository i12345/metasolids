import { FieldPointVector, FieldPointVectorContainer } from "../../../fields/vectorized/index.js"
import { IndicesTypedArray } from "../../../paradigm/arrays/indices-array.js"
import { NumberTypedArray } from "../../../paradigm/arrays/typed-array.js"
import { SurfaceProcessor } from "../../processing.js"
import { SurfaceSample } from "../../surface.js"
import * as tf from "@tensorflow/tfjs"
import { SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping } from "../../texturing/types.js"
import { MultiObjectsGroupsTemplate, groupKinds } from "../../../paradigm/trees/index.js"
import { TextureLocation, TextureSamplingContext } from "../../../textures/index.js"
import { ScalarN } from "../../../utils/tf-rank.js"
import { SurfaceUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate } from "../uv/index.js"
import { onlyOne } from "../../../utils/only-one.js"
import { SpaceStretchTexture } from "./texture.js"
import { SurfaceWithSpaceStretch, SpaceStretchTextureGroup, SpaceStretchKey } from "./surface.js"


export class SurfaceWithSpaceStretchProcessor<
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
        SurfaceSampleVector extends FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> = FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
        SampleProcessingContextT = any,
        SurfaceT extends
            SurfaceWithSpaceStretch<
                IndicesT,
                SurfaceUVUnwrappingGroup,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSamplingContextT,
                SurfaceSampleElementType,
                SurfaceSampleContainer,
                SurfaceSampleVector
            > =
            SurfaceWithSpaceStretch<
                IndicesT,
                SurfaceUVUnwrappingGroup,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSamplingContextT,
                SurfaceSampleElementType,
                SurfaceSampleContainer,
                SurfaceSampleVector
            >,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
                SurfaceUVUnwrappingGroup,
                SampleProcessingContextT,
                SpaceStretchTextureGroup,
                ScalarN<tf.Rank.R2>
            > =
            SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
                SurfaceUVUnwrappingGroup,
                SampleProcessingContextT,
                SpaceStretchTextureGroup,
                ScalarN<tf.Rank.R2>
            >
    >
    implements SurfaceProcessor<
        IndicesT,
        SurfaceSampleElementType,
        SurfaceSampleContainer,
        SurfaceSampleVector,
        SampleProcessingContextT,
        SurfaceT,
        SurfaceProcessingContextT
    > {
    constructor(
        public readonly UVunwrappingGroup?: SurfaceUVUnwrappingGroup
    ) { }

    init(context: SurfaceProcessingContextT) {
        const UVunwrappingGroup = onlyOne(groupKinds(context, SurfaceUVUnwrappingGroupKindsTemplate, this.UVunwrappingGroup))

        const connections = {
            inputs: [
                ['mesh'],
                UVunwrappingGroup.group.path
            ],
            outputs: [
                [SpaceStretchKey]
            ]
        }

        return { connections }
    }

    process(item: SurfaceT, context: SurfaceProcessingContextT): void {
        const UVunwrappingGroup = onlyOne(groupKinds(context, SurfaceUVUnwrappingGroupKindsTemplate, this.UVunwrappingGroup))
        const UVunwrapping = UVunwrappingGroup.group.get<SurfaceUVUnwrapping>(item)
        const mesh = item.mesh
        item[SpaceStretchKey] = new SpaceStretchTexture(mesh, UVunwrapping)
    }
}
