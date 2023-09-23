import { ConstantSampleDomain, IdentitySampleDomain } from "../../fields/domains/index.js";
import { defaultField } from "../../fields/fields/index.js";
import { FieldPointVectorContainerStatic } from "../../fields/vectorized/index.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsTemplate, PropertyPath } from "../../paradigm/trees/index.js";
import { Cloneable, clone, makeClone } from "../../utils/cloneable.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "../texture.js";
import { Texturer } from "../texturer.js";

type InputsT = {
}

type InputTexelTypesGrouped<
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TexelTypeT extends TextureSample = TextureSample,
    > = {
}

type OutputsT = {
    value: MultiObjectsGroupsTemplateLeaf
}

const InputsTemplate: InputsT = {
}

const OutputsTemplate: OutputsT = {
    value: MultiObjectsGroupsTemplate_Leaf
}

const template = {
    inputs: InputsTemplate,
    outputs: OutputsTemplate
}

export class IdentityTexturer<
        TextureableT = any,
        TextureLocationSampleT extends TextureLocation & TextureSample = TextureLocation & TextureSample,
        TextureLocationSampleElementType extends TextureLocation & TextureSample = TextureLocationSampleT,
        TextureLocationSampleFuseMode extends TextureLocation & TextureSample = TextureLocationSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationSampleT, TextureLocationSampleElementType, TextureLocationSampleFuseMode> =
            TextureSamplingContext<TextureLocationSampleT, TextureLocationSampleElementType, TextureLocationSampleFuseMode>
    >
    extends Texturer<
        TextureableT,
        TextureLocationSampleT,
        TextureLocationSampleT,
        TextureLocationSampleElementType,
        TextureLocationSampleFuseMode,
        TextureLocationSampleElementType,
        TextureLocationSampleFuseMode,
        TextureSamplingContextT,
        OutputsT,
        InputsT,
        TextureLocationSampleT,
        InputTexelTypesGrouped<TextureLocationSampleT, TextureLocationSampleT, TextureLocationSampleT>
    >
    implements Cloneable<IdentityTexturer<
        TextureableT,
        TextureLocationSampleT,
        TextureLocationSampleElementType,
        TextureLocationSampleFuseMode,
        TextureSamplingContextT
    >> {
    constructor(
        mappings?: {
            inputs: MultiObjectsGroupsMapped<InputsT, PropertyPath>,
            outputs: MultiObjectsGroupsMapped<OutputsT, PropertyPath>,
        }
    ) {
        super(template, mappings)
    }

    [clone]() {
        return new IdentityTexturer<
                TextureableT,
                TextureLocationSampleT,
                TextureLocationSampleElementType,
                TextureLocationSampleFuseMode,
                TextureSamplingContextT
            >(
                makeClone(this.mappings),
            )
    }

    protected factory(
            { }: TexturesTemplated<
                    InputsT,
                    TextureLocationSampleT,
                    TextureLocationSampleElementType,
                    TextureLocationSampleFuseMode,
                    InputTexelTypesGrouped<TextureLocationSampleT, TextureLocationSampleT, TextureLocationSampleT>,
                    TextureLocationSampleT,
                    TextureSamplingContextT
                >
        ): MultiObjectsGroupsMapped<
                OutputsT,
                Texture<
                    TextureLocationSampleT, TextureLocationSampleT,
                    TextureLocationSampleElementType,
                    TextureLocationSampleFuseMode,
                    TextureLocationSampleElementType,
                    TextureLocationSampleFuseMode,
                    TextureSamplingContextT
                >
            > {
        return {
            value: new IdentitySampleDomain<
                MultiObjectsTemplate,
                IndicesTypedArray,
                FieldPointVectorContainerStatic<IndicesTypedArray>,
                TextureLocationSampleT,
                TextureLocationSampleElementType,
                TextureLocationSampleFuseMode,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                TextureSamplingContextT
            >()
        }
    }
}