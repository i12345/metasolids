import { MultiObjectsSampleDomain } from "../../fields/domains/multi-objects.js";
import { ArithmeticPrimitiveFuseModeOp } from "../../fields/vectorized/fuse-modes/arithmetic.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, PropertyPath } from "../../paradigm/trees/index.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "../texture.js";
import { Texturer } from "../texturer.js";

type InputsT = {
    f1: MultiObjectsGroupsTemplateLeaf
    f2: MultiObjectsGroupsTemplateLeaf
}

type InputTexelTypesGrouped<
        F1 extends TextureSample = TextureSample,
        F2 extends TextureSample = TextureSample,
    > = {
    f1: F1
    f2: F2
}

type OutputsT = {
    value: MultiObjectsGroupsTemplateLeaf
}

const InputsTemplate: InputsT = {
    f1: MultiObjectsGroupsTemplate_Leaf,
    f2: MultiObjectsGroupsTemplate_Leaf,
}

const OutputsTemplate: OutputsT = {
    value: MultiObjectsGroupsTemplate_Leaf
}

const template = {
    inputs: InputsTemplate,
    outputs: OutputsTemplate
}

export class ComposingTexturer<
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleF1 extends TextureSample = TextureSample,
        TextureSampleF2 extends TextureSample = TextureSample,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleElementTypeF1 extends TextureSample = TextureSampleF1,
        TextureSampleFuseModeF1 extends TextureSample = TextureSampleF1,
        TextureSampleElementTypeF2 extends TextureSample = TextureSampleF2,
        TextureSampleFuseModeF2 extends TextureSample = TextureSampleF2,
        TextureSamplingContextF1 extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureSamplingContextF2 extends
            TextureSamplingContext<TextureSampleF1, TextureSampleElementTypeF1, TextureSampleFuseModeF1> =
            TextureSamplingContext<TextureSampleF1, TextureSampleElementTypeF1, TextureSampleFuseModeF1>,
    >
    extends Texturer<
        TextureableT,
        TextureLocationT,
        TextureSampleF2,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureSampleElementTypeF2,
        TextureSampleFuseModeF2,
        TextureSamplingContextF1,
        OutputsT,
        InputsT,
        TextureSampleF2,
        TextureSampleElementTypeF2,
        TextureSampleFuseModeF2,
        InputTexelTypesGrouped<TextureLocationT, TextureSampleF2, TextureSampleF2>,
        InputTexelTypesGrouped<TextureLocationElementType, TextureSampleElementType, TextureSampleElementType>,
        InputTexelTypesGrouped<TextureLocationFuseMode, TextureSampleFuseMode, TextureSampleFuseMode>
    > {
    constructor(
        mappings?: {
            inputs: MultiObjectsGroupsMapped<InputsT, PropertyPath>,
            outputs: MultiObjectsGroupsMapped<OutputsT, PropertyPath>,
        }
    ) {
        super(template, mappings)
    }

    protected factory(
            { f1, f2 }: TexturesTemplated<
                InputsT,
                TextureSampleF2,
                TextureSampleElementTypeF2,
                TextureSampleFuseModeF2,
                InputTexelTypesGrouped<TextureLocationT, TextureSampleF2, TextureSampleF2>,
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
                TextureLocationT, TextureSampleF2,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSamplingContextT
            >
        > {
        return {
            value: MultiObjectsSampleDomain.compositeArithmetic(this.op, a, b)
        }
    }
}