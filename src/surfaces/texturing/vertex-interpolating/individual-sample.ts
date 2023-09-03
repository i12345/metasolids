import { Processor } from "../../../paradigm/processing/processor.js";
import { PROPERTYKEY_ALL, groupKinds, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate } from "../../../paradigm/trees/index.js";
import { Field, FieldPoint, MultiObjectsGroupsWithFieldsProcessingContext, groupKindsWithFields } from "../../../fields/index.js";
import { TextureLocation, TexturesTemplated, VertexInterpolatingTexture } from "../../../textures/index.js";
import { IndicesTypedArray, NumberTypedArray, TypedArray, onlyOne } from "../../../utils/index.js";
import { Surface, SurfaceSample } from "../../surface.js";
import { SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceProcessingContextWithIndividualTexturesUsingSampleTextureLocations, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleWithIndividualTextureLocations } from "../types.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../../../fields/vectorized/point.js";
import { Vec2 } from "playcanvas-extended";

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

export type SurfaceSampleWithIndividualInterpolatingValuesUsingSampleTextureLocations<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>
    > =
    SurfaceSample &
    SurfaceSampleWithIndividualTextureLocations<SurfaceTextureLocationGroup> &
    InterpolatingValuesGrouped

export type SurfaceSampleProcessingContextWithIndividualInterpolatingValuesUsingSampleTextureLocations<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValueElementType extends FieldPoint = InterpolatingValue,
        InterpolatingValueFuseMode extends FieldPoint = InterpolatingValue,
        InterpolatingValueField extends
            Field<InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode> =
            Field<InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode>,
    > =
    SurfaceSampleProcessingContextWithIndividualTextureLocations<SurfaceTextureLocationGroup> &
    MultiObjectsGroupsWithFieldsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupsKind,
        InterpolatingValue,
        InterpolatingValueElementType,
        InterpolatingValueFuseMode,
        InterpolatingValueField
    >

export type SurfaceWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
        MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
        MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleElementType extends
            SurfaceSampleWithIndividualInterpolatingValuesUsingSampleTextureLocations<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingValue,
                InterpolatingValuesGrouped
            > =
            SurfaceSampleWithIndividualInterpolatingValuesUsingSampleTextureLocations<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingValue,
                InterpolatingValuesGrouped
            >
    > =
    // Expression produces a union type that is too complex to represent
    // SurfaceWithIndividualTexturesUsingSampleTextureLocations<
    //     SurfaceTextureLocationGroup,
    //     InterpolatingGroups,
    //     TextureLocation,
    //     InterpolatingValue,
    //     Texture<TextureLocation, InterpolatingValue>,
    //     TexturesTemplated<
    //             InterpolatingGroups,
    //             InterpolatingValue,
    //             InterpolatingValuesGrouped,
    //             TextureLocation
    //         >,
    //     SurfaceSampleT
    // > =
    // SurfaceWithIndividualTextures<
    //     InterpolatingGroups,
    //     TextureLocation,
    //     InterpolatingValue,
    //     Texture<TextureLocation, InterpolatingValue>,
    //     TexturesTemplated<
    //             InterpolatingGroups,
    //             InterpolatingValue,
    //             InterpolatingValuesGrouped,
    //             TextureLocation
    //         >,
    //     SurfaceSampleT
    // > =
    Surface<IndicesT, SurfaceSampleElementType> &
    TexturesTemplated<
            InterpolatingGroups,
            InterpolatingValue,
            InterpolatingValuesGrouped,
            TextureLocation
        >

export type SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValueElementType extends FieldPoint = InterpolatingValue,
        InterpolatingValueFuseMode extends FieldPoint = InterpolatingValue,
        InterpolatingValueField extends
            Field<InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode> =
            Field<InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode>,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualInterpolatingValuesUsingSampleTextureLocations<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds,
                InterpolatingValue,
                InterpolatingValueElementType,
                InterpolatingValueFuseMode,
                InterpolatingValueField
            > =
            SurfaceSampleProcessingContextWithIndividualInterpolatingValuesUsingSampleTextureLocations<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds,
                InterpolatingValue,
                InterpolatingValueElementType,
                InterpolatingValueFuseMode,
                InterpolatingValueField
            >
    > =
    SurfaceProcessingContextWithIndividualTexturesUsingSampleTextureLocations<
        SurfaceTextureLocationGroup,
        InterpolatingGroups,
        SampleProcessingContextT
    > &
    MultiObjectsGroupsWithFieldsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupKinds,
        InterpolatingValue,
        InterpolatingValueElementType,
        InterpolatingValueFuseMode,
        InterpolatingValueField
    >

export class SurfaceWithIndividualInterpolatingValueTexturesUsingSampleTextureLocationsProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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
            SurfaceSampleWithIndividualInterpolatingValuesUsingSampleTextureLocations<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                > =
            SurfaceSampleWithIndividualInterpolatingValuesUsingSampleTextureLocations<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                >,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualInterpolatingValuesUsingSampleTextureLocations<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds,
                InterpolatingValue,
                InterpolatingValueElementType,
                InterpolatingValueFuseMode,
                InterpolatingValueField
            > =
            SurfaceSampleProcessingContextWithIndividualInterpolatingValuesUsingSampleTextureLocations<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds,
                InterpolatingValue,
                InterpolatingValueElementType,
                InterpolatingValueFuseMode,
                InterpolatingValueField
            >
    > implements
    Processor<
            SurfaceWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
                    IndicesT,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleElementType
                >,
            SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
                    SurfaceTextureLocationGroup,
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
        public readonly surfaceTextureLocationGroup?: SurfaceTextureLocationGroup
    ) {
    }

    //TODO: work further on vertex interplating texture
    // also objects-combining texture
    // integrate changes to surface with texture types

    init(context: SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
            SurfaceTextureLocationGroup,
            InterpolatingGroups,
            InterpolatingGroupKinds,
            InterpolatingValue,
            InterpolatingValueElementType,
            InterpolatingValueFuseMode,
            InterpolatingValueField,
            SurfaceSampleProcessingContextT
        >) {
        const { group: surfaceTextureLocationGroup } =
            onlyOne(groupKinds(
                    context.samples,
                    SurfaceIndividualTextureLocationsGroupKindsTemplate,
                    this.surfaceTextureLocationGroup
                ))

        const interpolatingGroups =
            [...groupKinds(
                    context.samples,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )]

        const connections = {
            inputs: [
                ['samples', PROPERTYKEY_ALL, ...surfaceTextureLocationGroup.path],
                ...interpolatingGroups.map(({ group: { path } }) => ['samples', PROPERTYKEY_ALL, ...path])
            ],
            outputs: [
                ...interpolatingGroups.map(({ group: { path } }) => path)
            ]
        }

        return { connections }
    }

    process(
            surface: SurfaceWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
                    IndicesT,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleElementType
                >,
            context: SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingGroupKinds,
                    InterpolatingValue,
                    InterpolatingValueElementType,
                    InterpolatingValueFuseMode,
                    InterpolatingValueField,
                    SurfaceSampleProcessingContextT
                >
        ): void {
        const { group: surfaceTextureLocationGroup } =
            onlyOne(groupKinds(
                    context.samples,
                    SurfaceIndividualTextureLocationsGroupKindsTemplate,
                    this.surfaceTextureLocationGroup
                ))

        const UVs = surfaceTextureLocationGroup.get<FieldPointVector<Vec2, NumberTypedArray>>(surface.samples)

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

        for (const { group: interpolatingGroup } of interpolatingGroups) {
            const values = interpolatingGroup.get<FieldPointVector<InterpolatingValueElementType, InterpolatingContainer>>(surface.samples)
            const texture = new VertexInterpolatingTexture<TextureLocation, TextureLocation, TextureLocation, InterpolatingValue, InterpolatingValueElementType, InterpolatingValueFuseMode, InterpolatingContainer>(values, UVs, surface.mesh.triangles, <any>interpolatingGroup.field)
            interpolatingGroup.set(surface, texture)
        }
    }
}