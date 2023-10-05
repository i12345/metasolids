import { MultiObjectsDomainInternalPreservedGroupsKinds, ObjectsFilteredFusingSampleDomain } from "../../fields/domains/index.js";
import { FieldPointVectorContainerStatic } from "../../fields/vectorized/index.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsTemplate, PropertyPath } from "../../paradigm/trees/index.js";
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

export class ObjectsFilteredFusingTexturer<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        TextureableT = any,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureLocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSampleFuseMode extends TextureSample = TextureSample,
        TextureSampleT extends TextureSample = TextureSampleFuseMode,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureIntermediateT extends TextureSample = TextureSampleFuseMode,
        TextureIntermediateElementType extends TextureSample = TextureIntermediateT,
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
        TextureSampleFuseMode,
        InputTexelTypesGrouped<TextureLocationT, TextureIntermediateT, TextureSampleT>,
        InputTexelTypesGrouped<TextureLocationElementType, TextureIntermediateElementType, TextureSampleElementType>,
        InputTexelTypesGrouped<TextureLocationFuseMode, TextureSampleFuseMode, TextureSampleFuseMode>
    >
    implements Cloneable<ObjectsFilteredFusingTexturer<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SampleGroups,
        SampleGroupKinds,
        TextureableT,
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureSampleFuseMode,
        TextureSampleT,
        TextureSampleElementType,
        TextureIntermediateT,
        TextureIntermediateElementType,
        TextureSamplingContextT
    >> {
    constructor(
        mappings?: {
            inputs: MultiObjectsGroupsMapped<InputsT, PropertyPath>,
            outputs: MultiObjectsGroupsMapped<OutputsT, PropertyPath>,
        },
        public objIDs?: ObjIDsT
    ) {
        super(template, mappings)
    }

    [clone]() {
        return new ObjectsFilteredFusingTexturer<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                TextureableT,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleFuseMode,
                TextureSampleT,
                TextureSampleElementType,
                TextureIntermediateT,
                TextureIntermediateElementType,
                TextureSamplingContextT
            >(
                makeClone(this.mappings),
                makeClone(this.objIDs)
            )
    }

    protected factory(
            { value }: TexturesTemplated<
                    InputsT,
                    TextureIntermediateT,
                    TextureIntermediateElementType,
                    TextureSampleFuseMode,
                    InputTexelTypesGrouped<TextureLocationT, TextureIntermediateT, TextureSampleT>,
                    InputTexelTypesGrouped<TextureLocationElementType, TextureIntermediateElementType, TextureSampleElementType>,
                    InputTexelTypesGrouped<TextureLocationFuseMode, TextureSampleFuseMode, TextureSampleFuseMode>,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT
                >
        ): MultiObjectsGroupsMapped<
                OutputsT,
                Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT
                >
            > {
        return {
            ///@ts-ignore
            value: new ObjectsFilteredFusingSampleDomain<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SampleGroups,
                    SampleGroupKinds,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleFuseMode,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureIntermediateT,
                    TextureIntermediateElementType,
                    FieldPointVectorContainerStatic<NumberTypedArray>
                >(
                    ///@ts-ignore
                    value,
                    this.objIDs,
                )
        }
    }
}