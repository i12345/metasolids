import { VectorSamplingContext } from "../../fields/domains/index.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../../fields/vectorized/index.js";
import { FactoryMappings, FactoryProcessor, FactoryTemplate } from "../../paradigm/processing/processors/factory.js";
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsTemplate, PropertyMapping } from "../../paradigm/trees/index.js";
import { Cloneable, clone, makeClone } from "../../utils/cloneable.js";
import { IndicesTypedArray } from "../../paradigm/arrays/indices-array.js";
import { NumberTypedArray } from "../../paradigm/arrays/typed-array.js";
import { MappingTexture } from "../index.js";
import { TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";

export type MappingTextureFactoryInputs = MultiObjectsGroupsTemplateLeaf

export type MappingTextureFactoryOutputs = MultiObjectsGroupsTemplateLeaf

export const MappingTextureFactoryInputsTemplate: MappingTextureFactoryInputs = MultiObjectsGroupsTemplate_Leaf

export const MappingTextureFactoryOutputsTemplate: MappingTextureFactoryOutputs = MultiObjectsGroupsTemplate_Leaf

export const MappingTextureFactoryTemplate: FactoryTemplate<MappingTextureFactoryInputs, MappingTextureFactoryOutputs> = {
    inputs: MappingTextureFactoryInputsTemplate,
    outputs: MappingTextureFactoryOutputsTemplate
}

export type MappingTextureFactoryInputValues = {}

export type MappingTextureFactoryOutputValues<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
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
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        VectorContext extends
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
    MappingTexture<
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
            SampleVector,
            VectorContext
        >

export class MappingTextureFactory<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
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
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        VectorContext extends
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
        MappingTextureFactoryInputs,
        MappingTextureFactoryOutputs,
        MappingTextureFactoryInputValues,
        MappingTextureFactoryOutputValues<
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
                SampleVector,
                VectorContext
            >,
        Item,
        Context
    >
    implements Cloneable<MappingTextureFactory<
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
        SampleVector,
        VectorContext,
        Item,
        Context
    >> {
    constructor(
        public remappings: PropertyMapping[] = [{
            from: [],
            to: []
        }],
        mappings?: FactoryMappings<MappingTextureFactoryInputs, MappingTextureFactoryOutputs>
    ) {
        super(MappingTextureFactoryTemplate, mappings)
    }

    [clone]() {
        return new MappingTextureFactory<
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
                SampleVector,
                VectorContext,
                Item,
                Context
            >(
                makeClone(this.remappings),
                makeClone(this.mappings)
            )
    }

    protected factory(inputs: MappingTextureFactoryInputValues, item: Item, context: Context): MappingTextureFactoryOutputValues<Location, LocationElementType, LocationFuseMode, LocationContainer, Sample, SampleElementType, SampleFuseMode, SampleContainer, Objects, ObjIDsT, ObjIDsContainer, SingularContext, LocationVector, SampleVector, VectorContext> {
        return new MappingTexture(this.remappings)
    }
}