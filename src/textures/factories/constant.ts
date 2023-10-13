import { FieldPoint } from "../../fields/point.js";
import { FieldPointVectorContainerStatic } from "../../fields/vectorized/point.js";
import { FactoryMappings, FactoryProcessor, FactoryTemplate } from "../../paradigm/processing/processors/factory.js";
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/index.js";
import { Cloneable, clone, makeClone } from "../../utils/cloneable.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureSamplingContext } from "../texture.js";
import { ConstantTexture } from "../textures/constant.js";

export type ConstantTextureFactoryInputs = {}

export type ConstantTextureFactoryOutputs = MultiObjectsGroupsTemplateLeaf

export const ConstantTextureFactoryInputsTemplate: ConstantTextureFactoryInputs = {}

export const ConstantTextureFactoryOutputsTemplate: ConstantTextureFactoryOutputs = MultiObjectsGroupsTemplate_Leaf

export const ConstantTextureFactoryTemplate: FactoryTemplate<ConstantTextureFactoryInputs, ConstantTextureFactoryOutputs> = {
    inputs: ConstantTextureFactoryInputsTemplate,
    outputs: ConstantTextureFactoryOutputsTemplate,
}

export type ConstantTextureFactoryInputValues = {}

export type ConstantTextureFactoryOutputValues<
    C extends FieldPoint = FieldPoint,
    TextureLocationT extends TextureLocation = TextureLocation,
    TextureLocationElementType extends TextureLocation = TextureLocationT,
    TextureLocationFuseMode extends TextureLocation = TextureLocationT,
    TextureLocationContainer extends
    FieldPointVectorContainerStatic<NumberTypedArray> =
    FieldPointVectorContainerStatic<NumberTypedArray>,
    ResultContainer extends
    FieldPointVectorContainerStatic<NumberTypedArray> =
    FieldPointVectorContainerStatic<NumberTypedArray>,
    Context extends
    TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
    TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>
> =
    Texture<
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureLocationContainer,
        C,
        C,
        C,
        ResultContainer,
        Context
    >

export class ConstantTextureFactory<
    C extends FieldPoint = FieldPoint,
    TextureLocationT extends TextureLocation = TextureLocation,
    TextureLocationElementType extends TextureLocation = TextureLocationT,
    TextureLocationFuseMode extends TextureLocation = TextureLocationT,
    TextureLocationContainer extends
    FieldPointVectorContainerStatic<NumberTypedArray> =
    FieldPointVectorContainerStatic<NumberTypedArray>,
    ResultContainer extends
    FieldPointVectorContainerStatic<NumberTypedArray> =
    FieldPointVectorContainerStatic<NumberTypedArray>,
    TextureContext extends
    TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
    TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
    Item = any,
    Context = any,
>
    extends FactoryProcessor<
        ConstantTextureFactoryInputs,
        ConstantTextureFactoryOutputs,
        ConstantTextureFactoryInputValues,
        ConstantTextureFactoryOutputValues<
            C,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            ResultContainer,
            TextureContext
        >,
        Item,
        Context
    >
    implements Cloneable<ConstantTextureFactory<
        C,
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureLocationContainer,
        ResultContainer,
        TextureContext,
        Item,
        Context
    >> {
    constructor(
        public value: C,
        mappings?: FactoryMappings<ConstantTextureFactoryInputs, ConstantTextureFactoryOutputs>
    ) {
        super(
            ConstantTextureFactoryTemplate,
            mappings
        )
    }

    [clone](): ConstantTextureFactory<
        C,
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureLocationContainer,
        ResultContainer,
        TextureContext,
        Item,
        Context
    > {
        return new ConstantTextureFactory(
            makeClone(this.value),
            makeClone(this.mappings)
        )
    }

    protected factory(inputs: ConstantTextureFactoryInputValues, item: Item, context: Context): ConstantTextureFactoryOutputValues<C, TextureLocationT, TextureLocationElementType, TextureLocationFuseMode, TextureLocationContainer, ResultContainer, TextureContext> {
        return new ConstantTexture<
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            C,
            C,
            C,
            ResultContainer,
            TextureContext
        >(this.value)
    }
}