import { VectorSamplingContext } from "../../fields/domains/index.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../../fields/vectorized/index.js";
import { FactoryMappings, FactoryProcessor, FactoryTemplate } from "../../paradigm/processing/processors/factory.js";
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsTemplate, PropertyMapping } from "../../paradigm/trees/index.js";
import { Cloneable, clone, makeClone } from "../../utils/cloneable.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { MappingTexture, RemappedTexture } from "../index.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";

export type RemappedTextureFactoryInputs = MultiObjectsGroupsTemplateLeaf

export type RemappedTextureFactoryOutputs = MultiObjectsGroupsTemplateLeaf

export const RemappedTextureFactoryInputsTemplate: RemappedTextureFactoryInputs = MultiObjectsGroupsTemplate_Leaf

export const RemappedTextureFactoryOutputsTemplate: RemappedTextureFactoryOutputs = MultiObjectsGroupsTemplate_Leaf

export const RemappedTextureFactoryTemplate: FactoryTemplate<RemappedTextureFactoryInputs, RemappedTextureFactoryOutputs> = {
    inputs: RemappedTextureFactoryInputsTemplate,
    outputs: RemappedTextureFactoryOutputsTemplate
}

export type RemappedTextureFactoryInputValues<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Intermediate extends TextureSample = TextureSample,
        IntermediateElementType extends TextureSample = Intermediate,
        IntermediateFuseMode extends TextureSample = Intermediate,
        IntermediateContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        IntermediateVector extends
            FieldPointVector<IntermediateElementType, IntermediateContainer> =
            FieldPointVector<IntermediateElementType, IntermediateContainer>,
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        IntermediateVectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                >,
        SampleVectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
        > =
    Texture<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Intermediate,
            IntermediateElementType,
            IntermediateFuseMode,
            IntermediateContainer,
            SingularContext,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LocationVector,
            IntermediateVector,
            IntermediateVectorContext
        >

export type RemappedTextureFactoryOutputValues<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Intermediate extends TextureSample = TextureSample,
        IntermediateElementType extends TextureSample = Intermediate,
        IntermediateFuseMode extends TextureSample = Intermediate,
        IntermediateContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        IntermediateVector extends
            FieldPointVector<IntermediateElementType, IntermediateContainer> =
            FieldPointVector<IntermediateElementType, IntermediateContainer>,
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        IntermediateVectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                >,
        SampleVectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
        > =
    Texture<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Sample,
            SampleElementType,
            SampleFuseMode,
            SampleContainer,
            SingularContext,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LocationVector,
            SampleVector,
            SampleVectorContext
        >

export class RemappedTextureFactory<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Intermediate extends TextureSample = TextureSample,
        IntermediateElementType extends TextureSample = Intermediate,
        IntermediateFuseMode extends TextureSample = Intermediate,
        IntermediateContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        IntermediateVector extends
            FieldPointVector<IntermediateElementType, IntermediateContainer> =
            FieldPointVector<IntermediateElementType, IntermediateContainer>,
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        IntermediateVectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                >,
        SampleVectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector
                >,
        Item = any,
        Context = any
    >
    extends FactoryProcessor<
        RemappedTextureFactoryInputs,
        RemappedTextureFactoryOutputs,
        RemappedTextureFactoryInputValues<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                Intermediate,
                IntermediateElementType,
                IntermediateFuseMode,
                IntermediateContainer,
                Sample,
                SampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                IntermediateVector,
                SampleVector,
                IntermediateVectorContext,
                SampleVectorContext
            >,
        RemappedTextureFactoryOutputValues<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                Intermediate,
                IntermediateElementType,
                IntermediateFuseMode,
                IntermediateContainer,
                Sample,
                SampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                IntermediateVector,
                SampleVector,
                IntermediateVectorContext,
                SampleVectorContext
            >,
        Item,
        Context
    >
    implements Cloneable<RemappedTextureFactory<
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Intermediate,
        IntermediateElementType,
        IntermediateFuseMode,
        IntermediateContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SingularContext,
        LocationVector,
        IntermediateVector,
        SampleVector,
        IntermediateVectorContext,
        SampleVectorContext,
        Item,
        Context
    >> {
    constructor(
        public remappings: PropertyMapping[] = [{
            from: [],
            to: []
        }],
        mappings?: FactoryMappings<RemappedTextureFactoryInputs, RemappedTextureFactoryOutputs>
    ) {
        super(RemappedTextureFactoryTemplate, mappings)
    }

    [clone]() {
        return new RemappedTextureFactory<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                Intermediate,
                IntermediateElementType,
                IntermediateFuseMode,
                IntermediateContainer,
                Sample,
                SampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                IntermediateVector,
                SampleVector,
                IntermediateVectorContext,
                SampleVectorContext,
                Item,
                Context
            >(
                makeClone(this.remappings),
                makeClone(this.mappings)
            )
    }

    protected factory(inputs: RemappedTextureFactoryInputValues<Location, LocationElementType, LocationFuseMode, LocationContainer, Intermediate, IntermediateElementType, IntermediateFuseMode, IntermediateContainer, Sample, SampleElementType, SampleFuseMode, SampleContainer, Objects, ObjIDsT, ObjIDsContainer, SingularContext, LocationVector, IntermediateVector, SampleVector, IntermediateVectorContext, SampleVectorContext>, item: Item, context: Context): RemappedTextureFactoryOutputValues<Location, LocationElementType, LocationFuseMode, LocationContainer, Intermediate, IntermediateElementType, IntermediateFuseMode, IntermediateContainer, Sample, SampleElementType, SampleFuseMode, SampleContainer, Objects, ObjIDsT, ObjIDsContainer, SingularContext, LocationVector, IntermediateVector, SampleVector, IntermediateVectorContext, SampleVectorContext> {
        return new RemappedTexture<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                Intermediate,
                IntermediateElementType,
                IntermediateFuseMode,
                IntermediateContainer,
                Sample,
                SampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                IntermediateVector,
                SampleVector,
                IntermediateVectorContext,
                SampleVectorContext
            >(
            inputs,
            this.remappings
        )
    }
}