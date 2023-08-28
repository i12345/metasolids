// import { CompositeHadamardProductSampleDomain, CompositeSampleDomain } from "../../fields/domains/index.js";
import { MultiObjectsSampleDomain } from "../../fields/domains/multi-objects.js";
import { ArithmeticPrimitiveFuseModeOp } from "../../fields/vectorized/fuse-modes/arithmetic.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/index.js";
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

export class CompositionTexturer<
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
    constructor(public readonly op: ArithmeticPrimitiveFuseModeOp) {
        super(template)
    }
    
    protected factory(
            { a, b }: TexturesTemplated<
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
        // let factory: typeof MultiObjectsSampleDomain

        // switch (this.mode) {
        //     case "add":
        //         factory = CompositeSampleDomain
        //         break
        //     case "multiply":
        //         factory = CompositeHadamardProductSampleDomain
        //         break
        //     default:
        //         throw new Error(`mode "${this.mode}" not recognized`)
        // }
        
        // return {
        //     value: new factory([a, b])
        // }
        
        return {
            ///@ts-ignore
            value: MultiObjectsSampleDomain.compositeArithmetic(this.op, a, b)
        }
    }    
}