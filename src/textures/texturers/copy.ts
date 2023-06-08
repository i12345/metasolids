import { ConstantSampleDomain, defaultField } from "../../fields/index.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/index.js";
import { FieldPoint } from "../../fields/point.js";
import { PropertyPath } from "../../utils/property-path.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "../texture.js";
import { TextureableProcessingContext, Texturer } from "../texturer.js";

type InputsT = {
    value: MultiObjectsGroupsTemplateLeaf
}

type InputTexelTypesGrouped<
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TexelTypeT extends TextureSample = TextureSample,
    > = {
    value: TexelTypeT
}

type OutputsT = {
    value: MultiObjectsGroupsTemplateLeaf
}

const InputsTemplate: InputsT = {
    value: MultiObjectsGroupsTemplate_Leaf
}

const OutputsTemplate: OutputsT = {
    value: MultiObjectsGroupsTemplate_Leaf
}

const template = {
    inputs: InputsTemplate,
    outputs: OutputsTemplate
}

export class CopyTexturer<
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureContextT extends
            TextureSamplingContext<TextureLocationT> =
            TextureSamplingContext<TextureLocationT>,
        TexelTypeT extends TextureSampleT = TextureSampleT
    >
    extends Texturer<
        TextureableT,
        TextureLocationT,
        TextureSampleT,
        TextureContextT,
        OutputsT,
        InputsT,
        TextureSampleT,
        InputTexelTypesGrouped<TextureLocationT, TextureSampleT, TexelTypeT>
    > {
    constructor() {
        super(template)
    }
    
    protected factory(
            { value }: TexturesTemplated<
                    InputsT,
                    TextureSampleT,
                    InputTexelTypesGrouped<TextureLocationT, TextureSampleT, TexelTypeT>,
                    TextureLocationT,
                    TextureContextT
                >
        ): MultiObjectsGroupsMapped<
                OutputsT,
                Texture<
                    TextureLocationT,
                    TextureSampleT,
                    TextureContextT
                >
            > {
        return { value }
    }    
}