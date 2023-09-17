import { MultiObjectsSampleDomain } from "../../fields/domains/multi-objects.js";
import { ArithmeticPrimitiveFuseModeOp } from "../../fields/vectorized/fuse-modes/arithmetic.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, PropertyPath } from "../../paradigm/trees/index.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "../texture.js";
import { Texturer } from "../texturer.js";

type InputsT = {
    a: MultiObjectsGroupsTemplateLeaf
    b: MultiObjectsGroupsTemplateLeaf
}

type InputTexelTypesGrouped<
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TexelTypeT extends TextureSample = TextureSample,
    > = {
    a: TexelTypeT
    b: TexelTypeT
}

type OutputsT = {
    value: MultiObjectsGroupsTemplateLeaf
}

const InputsTemplate: InputsT = {
    a: MultiObjectsGroupsTemplate_Leaf,
    b: MultiObjectsGroupsTemplate_Leaf,
}

const OutputsTemplate: OutputsT = {
    value: MultiObjectsGroupsTemplate_Leaf
}

const template = {
    inputs: InputsTemplate,
    outputs: OutputsTemplate
}

export class ArithmeticTexturer<
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
    >
    extends Texturer<
        TextureableT,
        TextureLocationT,
        TextureSampleT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureSampleElementType,
        TextureSampleFuseMode,
        TextureSamplingContextT,
        OutputsT,
        InputsT,
        TextureSampleT,
        TextureSampleElementType,
        TextureSampleFuseMode,
        InputTexelTypesGrouped<TextureLocationT, TextureSampleT, TextureSampleT>,
        InputTexelTypesGrouped<TextureLocationElementType, TextureSampleElementType, TextureSampleElementType>,
        InputTexelTypesGrouped<TextureLocationFuseMode, TextureSampleFuseMode, TextureSampleFuseMode>
    > {
    constructor(
        public op: ArithmeticPrimitiveFuseModeOp,
        mappings?: {
            inputs: MultiObjectsGroupsMapped<InputsT, PropertyPath>,
            outputs: MultiObjectsGroupsMapped<OutputsT, PropertyPath>,
        }
    ) {
        super(template, mappings)
    }

    protected factory(
            { a, b }: TexturesTemplated<
                InputsT,
                TextureSampleT,
                TextureSampleElementType,
                TextureSampleFuseMode,
                InputTexelTypesGrouped<TextureLocationT, TextureSampleT, TextureSampleT>,
                InputTexelTypesGrouped<TextureLocationT, TextureSampleElementType, TextureSampleElementType>,
                InputTexelTypesGrouped<TextureLocationT, TextureSampleFuseMode, TextureSampleFuseMode>,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSamplingContextT
            >
        ): MultiObjectsGroupsMapped<
            OutputsT,
            Texture<
                TextureLocationT, TextureSampleT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSamplingContextT
            >
        > {
        return {
            ///@ts-ignore
            value: MultiObjectsSampleDomain.compositeArithmetic(this.op, a, b)
        }
    }
}