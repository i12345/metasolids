import { ComposingSampleDomain, ConstantSampleDomain, IdentitySampleDomain, MappingSampleDomain } from "../../fields/domains/index.js";
import { defaultField } from "../../fields/fields/index.js";
import { FieldPointVectorContainerStatic } from "../../fields/vectorized/index.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsTemplate, PropertyMapping, PropertyPath } from "../../paradigm/trees/index.js";
import { Cloneable, clone, makeClone } from "../../utils/cloneable.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "../texture.js";
import { Texturer } from "../texturer.js";

type InputsT = {
    value: MultiObjectsGroupsTemplateLeaf
}

type InputTexelTypesGrouped<
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureIntermediateT extends TextureSample = TextureSample,
        TextureSampleT extends TextureSample = TextureSample,
    > = {
    value: TextureIntermediateT
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

export class MappingTexturer<
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureIntermediateT extends TextureSample = TextureSample,
        TextureIntermediateElementType extends TextureSample = TextureIntermediateT,
        TextureIntermediateFuseMode extends TextureSample = TextureIntermediateT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>
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
        TextureIntermediateT,
        TextureIntermediateElementType,
        TextureIntermediateFuseMode,
        InputTexelTypesGrouped<TextureLocationT, TextureIntermediateT, TextureSampleT>,
        InputTexelTypesGrouped<TextureLocationElementType, TextureIntermediateElementType, TextureSampleElementType>,
        InputTexelTypesGrouped<TextureLocationFuseMode, TextureIntermediateFuseMode, TextureSampleFuseMode>
    >
    implements Cloneable<MappingTexturer<
        TextureableT,
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureIntermediateT,
        TextureIntermediateElementType,
        TextureIntermediateFuseMode,
        TextureSampleT,
        TextureSampleElementType,
        TextureSampleFuseMode,
        TextureSamplingContextT
    >> {
    constructor(
        mappings?: {
            inputs: MultiObjectsGroupsMapped<InputsT, PropertyPath>,
            outputs: MultiObjectsGroupsMapped<OutputsT, PropertyPath>,
        },
        public remappings: PropertyMapping[] = [{
            from: [],
            to: []
        }]
    ) {
        super(template, mappings)
    }

    [clone]() {
        return new MappingTexturer<
                TextureableT,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureIntermediateT,
                TextureIntermediateElementType,
                TextureIntermediateFuseMode,
                TextureSampleT,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSamplingContextT
            >(
                makeClone(this.mappings),
                makeClone(this.remappings)
            )
    }

    protected factory(
            { value }: TexturesTemplated<
                    InputsT,
                    TextureIntermediateT,
                    TextureIntermediateElementType,
                    TextureIntermediateFuseMode,
                    InputTexelTypesGrouped<TextureLocationT, TextureIntermediateT, TextureSampleT>,
                    InputTexelTypesGrouped<TextureLocationElementType, TextureIntermediateElementType, TextureSampleElementType>,
                    InputTexelTypesGrouped<TextureLocationFuseMode, TextureIntermediateFuseMode, TextureSampleFuseMode>,
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
            value: new ComposingSampleDomain <
                    MultiObjectsTemplate,
                    IndicesTypedArray,
                    FieldPointVectorContainerStatic<IndicesTypedArray>,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureIntermediateT,
                    TextureIntermediateElementType,
                    TextureIntermediateFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>
                >(
                    value,
                    new MappingSampleDomain<
                            TextureIntermediateT,
                            TextureIntermediateElementType,
                            TextureIntermediateFuseMode,
                            FieldPointVectorContainerStatic<NumberTypedArray>,
                                
                            TextureSampleT,
                            TextureSampleElementType,
                            TextureSampleFuseMode,
                            FieldPointVectorContainerStatic<NumberTypedArray>,
                        
                            MultiObjectsTemplate,
                            IndicesTypedArray,
                            FieldPointVectorContainerStatic<IndicesTypedArray>
                        >(this.remappings)
                )
        }
    }
}