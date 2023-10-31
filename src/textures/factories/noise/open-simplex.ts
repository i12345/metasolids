import { FusedVectorSamplingContext } from "../../../fields/domains/fusing.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "../../../fields/vectorized/point.js";
import { FactoryMappings, FactoryProcessor, FactoryTemplate } from "../../../paradigm/processing/processors/factory.js";
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsTemplate } from "../../../paradigm/trees/index.js";
import { Cloneable, clone, makeClone } from "../../../utils/cloneable.js";
import { IndicesTypedArray } from "../../../paradigm/arrays/indices-array.js";
import { NumberTypedArray } from "../../../paradigm/arrays/typed-array.js";
import { TextureLocation, TextureSample, TextureSamplingContext } from "../../texture.js";
import { OpenSimplexNoiseTexture, OpenSimplexNoiseTextureVersion } from "../../textures/noise/open-simplex.js";

export type OpenSimplexNoiseTextureFactoryInputs = {}

export type OpenSimplexNoiseTextureFactoryOutputs = MultiObjectsGroupsTemplateLeaf

export const OpenSimplexNoiseTextureFactoryInputsTemplate: OpenSimplexNoiseTextureFactoryInputs = {}

export const OpenSimplexNoiseTextureFactoryOutputsTemplate: OpenSimplexNoiseTextureFactoryOutputs = MultiObjectsGroupsTemplate_Leaf

export const OpenSimplexNoiseTextureFactoryTemplate: FactoryTemplate<OpenSimplexNoiseTextureFactoryInputs, OpenSimplexNoiseTextureFactoryOutputs> = {
    inputs: OpenSimplexNoiseTextureFactoryInputsTemplate,
    outputs: OpenSimplexNoiseTextureFactoryOutputsTemplate,
}

export type OpenSimplexNoiseTextureFactoryInputValues = {}

export type OpenSimplexNoiseTextureFactoryOutputValues<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureLocationContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSampleContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        ContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        LocationVector extends
            FieldPointVector<TextureLocationElementType, TextureLocationContainer> =
            FieldPointVector<TextureLocationElementType, TextureLocationContainer>,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    number,
                    TextureSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    number,
                    TextureSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureLocationContainer,
                    number,
                    number,
                    number,
                    TextureSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    ContextT,
                    LocationVector,
                    SampleVector
                > =
            FusedVectorSamplingContext<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureLocationContainer,
                    number,
                    number,
                    number,
                    TextureSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    ContextT,
                    LocationVector,
                    SampleVector
                >,
    > =
    OpenSimplexNoiseTexture<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            TextureSampleContainer,
            ContextT,
            LocationVector,
            SampleVector,
            VectorContext
        >

export class OpenSimplexNoiseTextureFactory<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureLocationContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSampleContainer extends
            FieldPointVectorContainerStatic<NumberTypedArray> =
            FieldPointVectorContainerStatic<NumberTypedArray>,
        ContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        LocationVector extends
            FieldPointVector<TextureLocationElementType, TextureLocationContainer> =
            FieldPointVector<TextureLocationElementType, TextureLocationContainer>,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    number,
                    TextureSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    number,
                    TextureSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureLocationContainer,
                    number,
                    number,
                    number,
                    TextureSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    ContextT,
                    LocationVector,
                    SampleVector
                > =
            FusedVectorSamplingContext<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureLocationContainer,
                    number,
                    number,
                    number,
                    TextureSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    ContextT,
                    LocationVector,
                    SampleVector
                >,
        Item = any,
        Context = any,
    >
    extends FactoryProcessor<
        OpenSimplexNoiseTextureFactoryInputs,
        OpenSimplexNoiseTextureFactoryOutputs,
        OpenSimplexNoiseTextureFactoryInputValues,
        OpenSimplexNoiseTextureFactoryOutputValues<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            TextureSampleContainer,
            ContextT,
            LocationVector,
            SampleVector,
            VectorContext
        >,
        Item,
        Context
    >
    implements Cloneable<OpenSimplexNoiseTextureFactory<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureLocationContainer,
        TextureSampleContainer,
        ContextT,
        LocationVector,
        SampleVector,
        VectorContext,
        Item,
        Context
    >> {
    constructor(
            public version?: OpenSimplexNoiseTextureVersion,
            mappings?: FactoryMappings<OpenSimplexNoiseTextureFactoryInputs, OpenSimplexNoiseTextureFactoryOutputs>
        ) {
        super(
            OpenSimplexNoiseTextureFactoryTemplate,
            mappings
        )
    }
    
    [clone](): OpenSimplexNoiseTextureFactory<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            TextureSampleContainer,
            ContextT,
            LocationVector,
            SampleVector,
            VectorContext,
            Item,
            Context
        > {
        return new OpenSimplexNoiseTextureFactory(
            this.version,
            makeClone(this.mappings)
        )
    }

    protected factory(inputs: OpenSimplexNoiseTextureFactoryInputValues, item: Item, context: Context): OpenSimplexNoiseTextureFactoryOutputValues<Objects, ObjIDsT, ObjIDsContainer, TextureLocationT, TextureLocationElementType, TextureLocationFuseMode, TextureLocationContainer, TextureSampleContainer, ContextT, LocationVector, SampleVector, VectorContext> {
        return new OpenSimplexNoiseTexture()
    }
}