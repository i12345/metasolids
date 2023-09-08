import { groupKinds, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsTemplate, WithMultiObjectsIDs, MultiObjectsIDsKey } from "../../../paradigm/trees/index.js";
import { Processor } from "../../../paradigm/processing/processor.js";
import { Field, FieldPoint, MultiObjectsGroupsWithFieldsProcessingContext, groupKindsWithFields } from "../../../fields/index.js";
import { TextureLocation, TexturesTemplated, VertexInterpolatingTexture } from "../../../textures/index.js";
import { IndicesTypedArray, NumberTypedArray, onlyOne } from "../../../utils/index.js";
import { SurfaceSample } from "../../surface.js";
import { SurfaceUVUnwrapping } from "../../uv-unwrapping/algorithm.js";
import { SurfaceWithUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate } from "../../uv-unwrapping/surface.js";
import { SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping } from "../types.js";
import { FieldPointVector, FieldPointVectorContainerStatic, field_point_vector_append_scattered_same } from "../../../fields/vectorized/index.js";

// type A = {
//     a: {
//         b: MultiObjectsGroupsTemplateLeaf
//     },
//     c: MultiObjectsGroupsTemplateLeaf
// }
// type A_Values_Mapped = MultiObjectsGroupsMapped<A, FieldPoint>
// type A_Values_Specialized = {
//     a: {
//         b: number
//     }
//     c: Color
// }

// let a1: A_Values_Mapped
// let a2: A_Values_Specialized
// a1 = a2 // works
// a2 = a1 // error

// type A_Special_Extends_Map = A_Values_Specialized extends A_Values_Mapped ? true : false
// let _extends: A_Special_Extends_Map = true

export type SurfaceSampleWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>
    > =
    SurfaceSample &
    InterpolatingValuesGrouped

export type SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValueElementType extends FieldPoint = InterpolatingValue,
        InterpolatingValueFuseMode extends FieldPoint = InterpolatingValue,
        InterpolatingValueField extends
            Field<InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode> =
            Field<InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode>
    > =
    MultiObjectsGroupsWithFieldsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupsKind,
        InterpolatingValue,
        InterpolatingValueElementType,
        InterpolatingValueFuseMode,
        InterpolatingValueField
    >

export type SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleElementType extends
            SurfaceSampleWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                > =
            SurfaceSampleWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                >
    > =
    // expression produces union too complex to represent
    // SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
    //     SurfaceUVUnwrappingGroup,
    //     InterpolatingGroups,
    //     TextureLocation,
    //     TextureSample,
    //     Texture,
    //     TexturesTemplated<InterpolatingGroups, InterpolatingValuesGrouped>,
    //     SurfaceSampleT
    // > =
    SurfaceWithUVUnwrapping<
            IndicesT,
            SurfaceUVUnwrappingGroup,
            SurfaceSampleElementType
        > &
    TexturesTemplated<InterpolatingGroups, InterpolatingValuesGrouped>

export type SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValueElementType extends FieldPoint = InterpolatingValue,
        InterpolatingValueFuseMode extends FieldPoint = InterpolatingValue,
        InterpolatingValueField extends
            Field<InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode> =
            Field<InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode>,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                InterpolatingGroups,
                InterpolatingGroupKinds,
                InterpolatingValue,
                InterpolatingValueElementType,
                InterpolatingValueFuseMode,
                InterpolatingValueField
            > =
            SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                InterpolatingGroups,
                InterpolatingGroupKinds,
                InterpolatingValue,
                InterpolatingValueElementType,
                InterpolatingValueFuseMode,
                InterpolatingValueField
            >
    > =
    Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> &
    SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup,
        SampleProcessingContextT,
        InterpolatingGroups
    > &
    MultiObjectsGroupsWithFieldsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupKinds,
        InterpolatingValue,
        InterpolatingValueElementType,
        InterpolatingValueFuseMode,
        InterpolatingValueField
    >

export class SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValueElementType extends FieldPoint = InterpolatingValue,
        InterpolatingValueFuseMode extends FieldPoint = InterpolatingValue,
        InterpolatingValueField extends
            Field<InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode> =
            Field<InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode>,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleElementType extends
            SurfaceSampleWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                > =
            SurfaceSampleWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                >,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                InterpolatingGroups,
                InterpolatingGroupKinds,
                InterpolatingValue,
                InterpolatingValueElementType,
                InterpolatingValueFuseMode,
                InterpolatingValueField
            > =
            SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                InterpolatingGroups,
                InterpolatingGroupKinds,
                InterpolatingValue,
                InterpolatingValueElementType,
                InterpolatingValueFuseMode,
                InterpolatingValueField
            >
    > implements
    Processor<
            SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleElementType
                >,
            SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    Objects,
                    ObjIDsT,
                    SurfaceUVUnwrappingGroup,
                    InterpolatingGroups,
                    InterpolatingGroupKinds,
                    InterpolatingValue,
                    InterpolatingValueElementType,
                    InterpolatingValueFuseMode,
                    InterpolatingValueField,
                    SurfaceSampleProcessingContextT
                >
        > {
    constructor(
        public readonly interpolatingGroupsKinds?: InterpolatingGroupKinds,
        public readonly interpolatingGroups?: InterpolatingGroups,
        public readonly surfaceUVunwrappingGroup?: SurfaceUVUnwrappingGroup
    ) {
    }

    init(context: SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    Objects,
                    ObjIDsT,
                    SurfaceUVUnwrappingGroup,
                    InterpolatingGroups,
                    InterpolatingGroupKinds,
                    InterpolatingValue,
                    InterpolatingValueElementType,
                    InterpolatingValueFuseMode,
                    InterpolatingValueField,
                    SurfaceSampleProcessingContextT
                >) {
        const { group: surfaceUVUnwrappingGroup } =
            onlyOne(groupKinds(
                    context,
                    SurfaceUVUnwrappingGroupKindsTemplate,
                    this.surfaceUVunwrappingGroup
                ))

        const interpolatingGroups =
            [...groupKinds(
                    context.samples,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )]

        const connections = {
            inputs: [
                surfaceUVUnwrappingGroup.path,
                ...interpolatingGroups.map(({ group: { path } }) => ['samples', ...path])
            ],
            outputs: [
                ...interpolatingGroups.map(({ group: { path } }) => path)
            ]
        }

        return { connections }
    }

    process(
            surface: SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleElementType
                >,
            context: SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    Objects,
                    ObjIDsT,
                    SurfaceUVUnwrappingGroup,
                    InterpolatingGroups,
                    InterpolatingGroupKinds,
                    InterpolatingValue,
                    InterpolatingValueElementType,
                    InterpolatingValueFuseMode,
                    InterpolatingValueField,
                    SurfaceSampleProcessingContextT
                >
        ): void {
        const { group: surfaceUVunwrappingGroup } =
            onlyOne(groupKinds(
                    context,
                    SurfaceUVUnwrappingGroupKindsTemplate,
                    this.surfaceUVunwrappingGroup
                ))

        const UVunwrapping = surfaceUVunwrappingGroup.get<SurfaceUVUnwrapping>(surface)

        const interpolatingGroups =
            groupKindsWithFields<
                    InterpolatingGroups,
                    InterpolatingGroupKinds,
                    InterpolatingValue,
                    InterpolatingValueElementType,
                    InterpolatingValueFuseMode,
                    InterpolatingValueField
                >(
                    context.samples,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )

        type InterpolatingContainer = FieldPointVectorContainerStatic<NumberTypedArray>
        type InterpolatingVector = FieldPointVector<InterpolatingValueElementType, InterpolatingContainer>

        const multiObjectsIDs = context[MultiObjectsIDsKey]

        for (const { group: interpolatingGroup } of interpolatingGroups) {
            const values_original = interpolatingGroup.get<InterpolatingVector>(surface.samples)

            const values_UVunwrapped = field_point_vector_append_scattered_same<
                    InterpolatingValueElementType,
                    InterpolatingContainer,
                    MultiObjectsTemplate,
                    ObjIDsT,
                    FieldPointVectorContainerStatic<ObjIDsT>,
                    InterpolatingVector
                >(
                    interpolatingGroup.field.elementType,
                    {
                        vector: values_original,
                        vectorizedRoot: <any>surface.samples
                    },
                    UVunwrapping.duplicatedVerts,
                    multiObjectsIDs
                )

            const texture = new VertexInterpolatingTexture<Objects, ObjIDsT, TextureLocation, TextureLocation, TextureLocation, InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode, InterpolatingContainer, InterpolatingVector>(values_UVunwrapped, UVunwrapping.UVs, UVunwrapping.finalIndices, <any>interpolatingGroup.field, multiObjectsIDs)
            interpolatingGroup.set(surface, texture)
        }
    }
}