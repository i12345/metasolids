import { MultiObjectsDomainInternalPreservedGroupsKinds, ObjectsFilteredFusingSampleDomain } from "../../fields/domains/index.js";
import { FieldPointVectorContainerStatic } from "../../fields/vectorized/index.js";
import { FactoryMappings, FactoryProcessor, FactoryTemplate } from "../../paradigm/processing/processors/factory.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsOrLeafMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsTemplate, PropertyPath, WithMultiObjectsIDs, mapGroups } from "../../paradigm/trees/index.js";
import { Cloneable, clone, makeClone } from "../../utils/cloneable.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { ObjectsFilteredFusingTexture } from "../index.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "../texture.js";

export type ObjectsFilteredFusingTextureFactoryInputs = MultiObjectsGroupsTemplateLeaf

export type ObjectsFilteredFusingTextureFactoryOutputs = MultiObjectsGroupsTemplateLeaf

export const ObjectsFilteredFusingTextureFactoryInputsTemplate: ObjectsFilteredFusingTextureFactoryInputs = MultiObjectsGroupsTemplate_Leaf

export const ObjectsFilteredFusingTextureFactoryOutputsTemplate: ObjectsFilteredFusingTextureFactoryOutputs = MultiObjectsGroupsTemplate_Leaf

export const ObjectsFilteredFusingTextureFactoryTemplate: FactoryTemplate<ObjectsFilteredFusingTextureFactoryInputs, ObjectsFilteredFusingTextureFactoryOutputs> = {
    inputs: ObjectsFilteredFusingTextureFactoryInputsTemplate,
    outputs: ObjectsFilteredFusingTextureFactoryOutputsTemplate
}

export type ObjectsFilteredFusingTextureFactoryInputValues<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureLocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSampleFuseMode extends TextureSample = TextureSample,
        TextureResultSampleT extends TextureSample = TextureSampleFuseMode,
        TextureResultSampleElementType extends TextureSample = TextureResultSampleT,
        TextureInnerSampleT extends TextureSample = TextureSampleFuseMode,
        TextureInnerSampleElementType extends TextureSample = TextureInnerSampleT,
        TextureSampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSamplingContextT extends
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
    > =
    Texture<
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            TextureInnerSampleT,
            TextureInnerSampleElementType,
            TextureSampleFuseMode,
            TextureSampleContainer,
            TextureSamplingContextT,
            Objects,
            ObjIDsT,
            ObjIDsContainer
        >

export type ObjectsFilteredFusingTextureFactoryOutputValues<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureLocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSampleFuseMode extends TextureSample = TextureSample,
        TextureResultSampleT extends TextureSample = TextureSampleFuseMode,
        TextureResultSampleElementType extends TextureSample = TextureResultSampleT,
        TextureInnerSampleT extends TextureSample = TextureSampleFuseMode,
        TextureInnerSampleElementType extends TextureSample = TextureInnerSampleT,
        TextureSampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSamplingContextT extends
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
    > =
    ObjectsFilteredFusingTexture<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SampleGroups,
        SampleGroupKinds,
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureLocationContainer,
        TextureSampleFuseMode,
        TextureResultSampleT,
        TextureResultSampleElementType,
        TextureInnerSampleT,
        TextureInnerSampleElementType,
        TextureSampleContainer,
        TextureSamplingContextT
    >

export class ObjectsFilteredFusingTextureFactory<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureLocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSampleFuseMode extends TextureSample = TextureSample,
        TextureResultSampleT extends TextureSample = TextureSampleFuseMode,
        TextureResultSampleElementType extends TextureSample = TextureResultSampleT,
        TextureInnerSampleT extends TextureSample = TextureSampleFuseMode,
        TextureInnerSampleElementType extends TextureSample = TextureInnerSampleT,
        TextureSampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSamplingContextT extends
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        Item = any,
        Context = any
    >
    extends FactoryProcessor<
        ObjectsFilteredFusingTextureFactoryInputs,
        ObjectsFilteredFusingTextureFactoryOutputs,
        ObjectsFilteredFusingTextureFactoryInputValues<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureLocationContainer,
                TextureSampleFuseMode,
                TextureResultSampleT,
                TextureResultSampleElementType,
                TextureInnerSampleT,
                TextureInnerSampleElementType,
                TextureSampleContainer,
                TextureSamplingContextT
            >,
        ObjectsFilteredFusingTextureFactoryOutputValues<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureLocationContainer,
                TextureSampleFuseMode,
                TextureResultSampleT,
                TextureResultSampleElementType,
                TextureInnerSampleT,
                TextureInnerSampleElementType,
                TextureSampleContainer,
                TextureSamplingContextT
            >,
        Item,
        Context
    >
    implements Cloneable<ObjectsFilteredFusingTextureFactory<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SampleGroups,
        SampleGroupKinds,
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureLocationContainer,
        TextureSampleFuseMode,
        TextureResultSampleT,
        TextureResultSampleElementType,
        TextureInnerSampleT,
        TextureInnerSampleElementType,
        TextureSampleContainer,
        TextureSamplingContextT,
        Item,
        Context
    >> {
    constructor(
        mappings: FactoryMappings<ObjectsFilteredFusingTextureFactoryInputs, ObjectsFilteredFusingTextureFactoryOutputs> = mapGroups(ObjectsFilteredFusingTextureFactoryTemplate, () => []),
        public objIDs?: ObjIDsT
    ) {
        super(ObjectsFilteredFusingTextureFactoryTemplate, mappings)
    }

    [clone]() {
        return new ObjectsFilteredFusingTextureFactory<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureLocationContainer,
                TextureSampleFuseMode,
                TextureResultSampleT,
                TextureResultSampleElementType,
                TextureInnerSampleT,
                TextureInnerSampleElementType,
                TextureSampleContainer,
                TextureSamplingContextT,
                Item,
                Context
            >(
                makeClone(this.mappings),
                makeClone(this.objIDs)
            )
    }

    protected factory(inputs: ObjectsFilteredFusingTextureFactoryInputValues<Objects, ObjIDsT, ObjIDsContainer, SampleGroups, SampleGroupKinds, TextureLocationT, TextureLocationElementType, TextureLocationFuseMode, TextureLocationContainer, TextureSampleFuseMode, TextureResultSampleT, TextureResultSampleElementType, TextureInnerSampleT, TextureInnerSampleElementType, TextureSampleContainer, TextureSamplingContextT>, item: Item, context: Context): ObjectsFilteredFusingTextureFactoryOutputValues<Objects, ObjIDsT, ObjIDsContainer, SampleGroups, SampleGroupKinds, TextureLocationT, TextureLocationElementType, TextureLocationFuseMode, TextureLocationContainer, TextureSampleFuseMode, TextureResultSampleT, TextureResultSampleElementType, TextureInnerSampleT, TextureInnerSampleElementType, TextureSampleContainer, TextureSamplingContextT> {
        return new ObjectsFilteredFusingTexture(
            inputs,
            this.objIDs
        )
    }
}