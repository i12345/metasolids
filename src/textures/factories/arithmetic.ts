import { ArithmeticPrimitiveFuseModeOp } from "../../fields/vectorized/fuse-modes/arithmetic.js";
import { FieldPointVectorContainerStatic } from "../../fields/vectorized/point.js";
import { FactoryMappings, FactoryProcessor, FactoryTemplate } from "../../paradigm/processing/processors/factory.js";
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/index.js";
import { Cloneable, clone, makeClone } from "../../utils/cloneable.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { ArithmeticTexture } from "../index.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";

export type ArithmeticTextureFactoryInputs = {
    a: MultiObjectsGroupsTemplateLeaf
    b: MultiObjectsGroupsTemplateLeaf
}

export type ArithmeticTextureFactoryOutputs = MultiObjectsGroupsTemplateLeaf

export const ArithmeticTextureFactoryInputsTemplate: ArithmeticTextureFactoryInputs = {
    a: MultiObjectsGroupsTemplate_Leaf,
    b: MultiObjectsGroupsTemplate_Leaf,
}

export const ArithmeticTextureFactoryOutputsTemplate: ArithmeticTextureFactoryOutputs = MultiObjectsGroupsTemplate_Leaf

export const ArithmeticTextureFactoryTemplate: FactoryTemplate<ArithmeticTextureFactoryInputs, ArithmeticTextureFactoryOutputs> = {
    inputs: ArithmeticTextureFactoryInputsTemplate,
    outputs: ArithmeticTextureFactoryOutputsTemplate,
}

export type ArithmeticTextureFactoryInputValues<
        // A extends FieldPoint = FieldPoint,
        // B extends FieldPoint = FieldPoint,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureLocationContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSampleContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        Context extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>
    > = {
    a: Texture<
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSampleContainer,
            Context
        >
    b: Texture<
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSampleContainer,
            Context
        >
}

export type ArithmeticTextureFactoryOutputValues<
        // C extends FieldPoint = FieldPoint,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureLocationContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSampleContainer extends
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
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSampleContainer,
            Context
        >

export class ArithmeticTextureFactory<
        // A extends FieldPoint = FieldPoint,
        // B extends FieldPoint = FieldPoint,
        // C extends FieldPoint = FieldPoint,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureLocationContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSampleContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureContext extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        Item = any,
        Context = any,
    >
    extends FactoryProcessor<
        ArithmeticTextureFactoryInputs,
        ArithmeticTextureFactoryOutputs,
        ArithmeticTextureFactoryInputValues<
            // A,
            // B,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSampleContainer,
            TextureContext
        >,
        ArithmeticTextureFactoryOutputValues<
            // C,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSampleContainer,
            TextureContext
        >,
        Item,
        Context
    >
    implements Cloneable<ArithmeticTextureFactory<
        // A,
        // B,
        // C,
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureLocationContainer,
        TextureSampleT,
        TextureSampleElementType,
        TextureSampleFuseMode,
        TextureSampleContainer,
        TextureContext,
        Item,
        Context
    >> {
    constructor(
            public op: ArithmeticPrimitiveFuseModeOp,
            mappings?: FactoryMappings<ArithmeticTextureFactoryInputs, ArithmeticTextureFactoryOutputs>
        ) {
        super(
            ArithmeticTextureFactoryTemplate,
            mappings
        )
    }
    
    [clone](): ArithmeticTextureFactory<
            // A,
            // B,
            // C,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            TextureSampleT,
            TextureSampleElementType,
            TextureSampleFuseMode,
            TextureSampleContainer,
            TextureContext,
            Item,
            Context
        > {
        return new ArithmeticTextureFactory(
            this.op,
            makeClone(this.mappings)
        )
    }

    protected factory(
            inputs:
                ArithmeticTextureFactoryInputValues<
                    // A,
                    // B,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureLocationContainer,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSampleContainer,
                    TextureContext
                >,
            item: Item,
            context: Context
        ): ArithmeticTextureFactoryOutputValues<
                // C,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureLocationContainer,
                TextureSampleT,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSampleContainer,
                TextureContext
            > {
        return new ArithmeticTexture(this.op, [inputs.a, inputs.b])
    }
}