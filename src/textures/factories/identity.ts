import { FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "../../fields/vectorized/point.js";
import { FactoryMappings, FactoryProcessor, FactoryTemplate } from "../../paradigm/processing/processors/factory.js";
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";
import { IdentityTexture } from "../textures/identity.js";

export type IdentityTextureFactoryInputs = {}

export type IdentityTextureFactoryOutputs = MultiObjectsGroupsTemplateLeaf

export const IdentityTextureFactoryInputsTemplate: IdentityTextureFactoryInputs = {}

export const IdentityTextureFactoryOutputsTemplate: IdentityTextureFactoryOutputs = MultiObjectsGroupsTemplate_Leaf

export const IdentityTextureFactoryTemplate: FactoryTemplate<IdentityTextureFactoryInputs, IdentityTextureFactoryOutputs> = {
    inputs: IdentityTextureFactoryInputsTemplate,
    outputs: IdentityTextureFactoryOutputsTemplate,
}

export type IdentityTextureFactoryInputValues = {}

export type IdentityTextureFactoryOutputValues<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        TextureLocationSampleT extends TextureLocation & TextureSample = TextureLocation & TextureSample,
        TextureLocationSampleElementType extends TextureLocation = TextureLocationSampleT,
        TextureLocationSampleFuseMode extends TextureLocation = TextureLocationSampleT,
        TextureLocationSampleContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureContext extends
            TextureSamplingContext<TextureLocationSampleT, TextureLocationSampleElementType, TextureLocationSampleFuseMode> =
            TextureSamplingContext<TextureLocationSampleT, TextureLocationSampleElementType, TextureLocationSampleFuseMode>,
        TextureLocationSampleVector extends
            FieldPointVectorWithMultiObjects<
                    TextureLocationSampleElementType,
                    TextureLocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    TextureLocationSampleElementType,
                    TextureLocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
    > =
    IdentityTexture<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            TextureLocationSampleT,
            TextureLocationSampleElementType,
            TextureLocationSampleFuseMode,
            TextureLocationSampleContainer,
            TextureContext,
            TextureLocationSampleVector
        >

export class IdentityTextureFactory<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        TextureLocationSampleT extends TextureLocation & TextureSample = TextureLocation & TextureSample,
        TextureLocationSampleElementType extends TextureLocation = TextureLocationSampleT,
        TextureLocationSampleFuseMode extends TextureLocation = TextureLocationSampleT,
        TextureLocationSampleContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureContext extends
            TextureSamplingContext<TextureLocationSampleT, TextureLocationSampleElementType, TextureLocationSampleFuseMode> =
            TextureSamplingContext<TextureLocationSampleT, TextureLocationSampleElementType, TextureLocationSampleFuseMode>,
        TextureLocationSampleVector extends
            FieldPointVectorWithMultiObjects<
                    TextureLocationSampleElementType,
                    TextureLocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    TextureLocationSampleElementType,
                    TextureLocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        Item = any,
        Context = any,
    >
    extends FactoryProcessor<
        IdentityTextureFactoryInputs,
        IdentityTextureFactoryOutputs,
        IdentityTextureFactoryInputValues,
        IdentityTextureFactoryOutputValues<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            TextureLocationSampleT,
            TextureLocationSampleElementType,
            TextureLocationSampleFuseMode,
            TextureLocationSampleContainer,
            TextureContext,
            TextureLocationSampleVector
        >,
        Item,
        Context
    > {
    constructor(
            mappings?: FactoryMappings<IdentityTextureFactoryInputs, IdentityTextureFactoryOutputs>
        ) {
        super(
            IdentityTextureFactoryTemplate,
            mappings
        )
    }
    
    protected factory(inputs: IdentityTextureFactoryInputValues, item: Item, context: Context): IdentityTextureFactoryOutputValues<Objects, ObjIDsT, ObjIDsContainer, TextureLocationSampleT, TextureLocationSampleElementType, TextureLocationSampleFuseMode, TextureLocationSampleContainer, TextureContext, TextureLocationSampleVector> {
        return new IdentityTexture()
    }
}