import { intract, objectValuePaths, groupKinds, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsTemplate, MultiObjectsMappedAgainGrouped, MultiObjectsIDsKey, WithMultiObjectsIDs, extract, MultiObjectsGroupedObjectsKey, MultiObjectsMapped, MultiObjectsMappedAgainGroupTypes } from "../../../paradigm/trees/index.js";
import { FieldPoint, FieldPointType, MultiObjectsGroupsWithFieldsProcessingContext, MultiObjectsWithGroupFieldsProcessingContext, groupKindObjectsGroupedWithFields } from "../../../fields/index.js";
import { Processor } from "../../../paradigm/processing/processor.js";
import { Texture, TextureLocation, VertexInterpolatingTexture } from "../../../textures/index.js";
import { IndicesTypedArray, NumberTypedArray, onlyOne } from "../../../utils/index.js";
import { SurfaceSample } from "../../surface.js";
import { SurfaceUVUnwrapping } from "../../uv-unwrapping/algorithm.js";
import { SurfaceWithUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate } from "../../uv-unwrapping/surface.js";
import { SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping } from "../types.js";
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

export type SurfaceSampleWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        //TODO: let groups hold different objects and let these be typed by the value groups
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>
    > =
    SurfaceSample &
    MultiObjectsMappedAgainGrouped<
            Objects,
            InterpolatingGroups,
            InterpolatingValue,
            InterpolatingValuesGrouped
        >

export type SurfaceSampleElementTypeWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        //TODO: let groups hold different objects and let these be typed by the value groups
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>
    > =
    SurfaceSample &
    MultiObjectsMappedAgainGroupTypes<
            Objects,
            InterpolatingGroups,
            InterpolatingValue,
            InterpolatingValuesGrouped
        >

export type SurfaceSampleFuseModeWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        //TODO: let groups hold different objects and let these be typed by the value groups
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>
    > =
    SurfaceSample &
    InterpolatingValuesGrouped

export type SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingGroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValues extends FieldPoint = FieldPoint,
    > =
    MultiObjectsWithGroupFieldsProcessingContext<
            Objects,
            InterpolatingGroups,
            ObjectsInterpolatingGrouped,
            InterpolatingGroupsKind,
            InterpolatingValues
        >

export type SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleT extends
            SurfaceSampleWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
                Objects,
                InterpolatingGroups,
                ObjectsInterpolatingGrouped,
                InterpolatingValue,
                InterpolatingValuesGrouped
            > =
            SurfaceSampleWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
                Objects,
                InterpolatingGroups,
                ObjectsInterpolatingGrouped,
                InterpolatingValue,
                InterpolatingValuesGrouped
            >
    > =
    // expression produces union too complex to represent
    // SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
    //         SurfaceUVUnwrappingGroup,
    //         Objects,
    //         InterpolatingGroups,
    //         TextureLocation,
    //         InterpolatingValue,
    //         Texture<TextureLocation, InterpolatingValue>,
    //         TexturesTemplated<
    //                 InterpolatingGroups,
    //                 InterpolatingValue,
    //                 InterpolatingValuesGrouped,
    //                 TextureLocation
    //             >
    //     > =
    SurfaceWithUVUnwrapping<
        IndicesT,
        SurfaceUVUnwrappingGroup,
        SurfaceSampleT
    > &
    {} // then compile will finish
    // MultiObjectsMappedAgainGrouped<
    //     Objects,
    //     InterpolatingGroups,
    //     Texture<TextureLocation, InterpolatingValue>,
    //     TexturesTemplated<
    //             InterpolatingGroups,
    //             InterpolatingValue,
    //             InterpolatingValuesGrouped,
    //             TextureLocation
    //         >
    // >

export type SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds,
                    InterpolatingValue
                > =
            SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds,
                    InterpolatingValue
                >
    > =
    WithMultiObjectsIDs<Objects, ObjIDsT> &
    SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            SampleProcessingContextT,
            Objects,
            InterpolatingGroups,
            ObjectsInterpolatingGrouped
        > &
    MultiObjectsGroupsWithFieldsProcessingContext<
            InterpolatingGroups,
            InterpolatingGroupKinds,
            InterpolatingValue
        >

export class SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleT extends
            SurfaceSampleWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                > =
            SurfaceSampleWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                >,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
                Objects,
                InterpolatingGroups,
                ObjectsInterpolatingGrouped,
                InterpolatingGroupKinds,
                InterpolatingValue
            > =
            SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
                Objects,
                InterpolatingGroups,
                ObjectsInterpolatingGrouped,
                InterpolatingGroupKinds,
                InterpolatingValue
            >
    > implements
    Processor<
            SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleT
                >,
            SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    Objects,
                    ObjIDsT,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingGroupKinds,
                    SurfaceSampleProcessingContextT
                >
        > {
    constructor(
        public readonly interpolatingGroupsKinds?: InterpolatingGroupKinds,
        public readonly interpolatingGroups?: InterpolatingGroups,
        public readonly surfaceUVUnwrappingGroup?: SurfaceUVUnwrappingGroup
    ) {
    }

    init(context: SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    Objects,
                    ObjIDsT,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingGroupKinds,
                    SurfaceSampleProcessingContextT
                >) {
        const { group: surfaceUVUnwrappingGroup } =
            onlyOne(groupKinds(
                    context,
                    SurfaceUVUnwrappingGroupKindsTemplate,
                    this.surfaceUVUnwrappingGroup
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
            surface: SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleT
                >,
            context: SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    Objects,
                    ObjIDsT,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingGroupKinds,
                    SurfaceSampleProcessingContextT
                >
        ): void {
        const { group: surfaceUVunwrappingGroup } =
            onlyOne(groupKinds(
                    context,
                    SurfaceUVUnwrappingGroupKindsTemplate,
                    this.surfaceUVUnwrappingGroup
                ))

        const UVunwrapping = surfaceUVunwrappingGroup.get<SurfaceUVUnwrapping>(surface)

        const interpolatingGroups =
            groupKindObjectsGroupedWithFields<
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds,
                    Texture<TextureLocation, InterpolatingValue>,
                    InterpolatingValue
                >(
                    ///@ts-ignore
                    surface,
                    context.samples,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )

        type InterpolatingValueType = { [MultiObjectsGroupedObjectsKey]: InterpolatingValue }
        type InterpolatingContainer = FieldPointVectorContainerStatic<NumberTypedArray>
        type InterpolatingVector = FieldPointVector<InterpolatingValueType, InterpolatingContainer>

        const multiObjectsIDs = context[MultiObjectsIDsKey]

        for (const { group: interpolatingGroup, objects: { template } } of interpolatingGroups) {
            for (const objectRelativePath of objectValuePaths(template)) {
                const objectPath = [...interpolatingGroup.path, ...objectRelativePath]

                const values_original = extract<InterpolatingVector>(surface.samples, objectPath)

                const values_UVunwrapped = field_point_vector_append_scattered_same<
                        InterpolatingValueType,
                        InterpolatingContainer,
                        MultiObjectsTemplate,
                        ObjIDsT,
                        FieldPointVectorContainerStatic<ObjIDsT>,
                        InterpolatingVector
                    >(
                        <FieldPointType<InterpolatingValueType>><unknown>interpolatingGroup.field.elementType,
                        {
                            vector: values_original,
                            vectorizedRoot: <any>surface.samples
                        },
                        UVunwrapping.duplicatedVerts,
                        multiObjectsIDs
                    )

                const texture = new VertexInterpolatingTexture<Objects, ObjIDsT, TextureLocation, TextureLocation, TextureLocation, MultiObjectsMapped<Objects, InterpolatingValue>, InterpolatingValueType, InterpolatingValue, InterpolatingContainer, InterpolatingVector>(values_UVunwrapped, UVunwrapping.UVs, UVunwrapping.finalIndices, <any>interpolatingGroup.field, multiObjectsIDs)
                intract(surface, objectPath, texture)
            }
        }
    }
}