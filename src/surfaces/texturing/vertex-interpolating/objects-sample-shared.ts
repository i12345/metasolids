import { PropertyPath, makeExtractor, intract, PROPERTYKEY_ALL, objectValuePaths, groupKindObjectsGrouped, groupKinds, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsProcessingContext, MultiObjectsTemplate, MultiObjectsMappedAgainGrouped, extract } from "../../../paradigm/trees/index.js";
import { Processor } from "../../../paradigm/processing/processor.js";
import { Field, FieldPoint, MultiObjectsGroupsWithFieldsProcessingContext, groupKindObjectsGroupedWithFields } from "../../../fields/index.js";
import { Texture, TextureLocation, TextureSample, TexturesTemplated, VertexInterpolatingTexture } from "../../../textures/index.js";
import { IndicesTypedArray, NumberTypedArray, onlyOne } from "../../../utils/index.js";
import { Surface, SurfaceSample } from "../../surface.js";
import { SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceProcessingContextWithObjectsTexturesUsingSharedSampleTextureLocations, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleWithIndividualTextureLocations, SurfaceWithObjectsTextures, SurfaceWithObjectsTexturesUsingSharedSampleTextureLocations } from "../types.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../../../fields/vectorized/index.js";
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

export type SurfaceSampleWithObjectsInterpolatingValuesUsingSharedSampleTextureLocations<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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
    SurfaceSampleWithIndividualTextureLocations<SurfaceTextureLocationGroup> &
    MultiObjectsMappedAgainGrouped<
            Objects,
            InterpolatingGroups,
            InterpolatingValue,
            InterpolatingValuesGrouped
        >

export type SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSharedSampleTextureLocations<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingGroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
    > =
    SurfaceSampleProcessingContextWithIndividualTextureLocations<SurfaceTextureLocationGroup> &
    MultiObjectsProcessingContext<
            Objects,
            InterpolatingGroups,
            ObjectsInterpolatingGrouped,
            InterpolatingGroupsKind
        >

export type SurfaceWithObjectsInterpolatingValueTexturesUsingSharedSampleTextureLocations<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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
        SurfaceSampleWithObjectsInterpolatingValuesUsingSharedSampleTextureLocations<
            SurfaceTextureLocationGroup,
            Objects,
            InterpolatingGroups,
            ObjectsInterpolatingGrouped,
            InterpolatingValue,
            InterpolatingValuesGrouped
        > =
        SurfaceSampleWithObjectsInterpolatingValuesUsingSharedSampleTextureLocations<
            SurfaceTextureLocationGroup,
            Objects,
            InterpolatingGroups,
            ObjectsInterpolatingGrouped,
            InterpolatingValue,
            InterpolatingValuesGrouped
        >
    > =
    // expression produces union too complex to represent
    // SurfaceWithObjectsTexturesUsingSharedSampleTextureLocations<
    //         SurfaceTextureLocationGroup,
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
    // SurfaceWithObjectsTextures<
    //         Objects,
    //         InterpolatingGroups, // ObjectsTextureGroups,
    //         TextureLocation, // TextureLocationT,
    //         InterpolatingValue, // TextureSampleT,
    //         Texture<TextureLocation, InterpolatingValue>, // TextureT,
    //         TexturesTemplated< // TexturesGrouped,
    //                 InterpolatingGroups,
    //                 InterpolatingValue,
    //                 InterpolatingValuesGrouped,
    //                 TextureLocation
    //             >,
    //         SurfaceSampleT
    //     > =
    Surface<IndicesT, SurfaceSampleT> &
    {}
    // expression produces union too complex to represent
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

export type SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSharedSampleTextureLocations<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSharedSampleTextureLocations<
                    SurfaceTextureLocationGroup,
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds
                > =
            SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSharedSampleTextureLocations<
                    SurfaceTextureLocationGroup,
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds
                >
    > =
    SurfaceProcessingContextWithObjectsTexturesUsingSharedSampleTextureLocations<
            SurfaceTextureLocationGroup,
            Objects,
            InterpolatingGroups,
            ObjectsInterpolatingGrouped,
            SampleProcessingContextT
        > &
    MultiObjectsGroupsWithFieldsProcessingContext<
            InterpolatingGroups,
            InterpolatingGroupKinds,
            InterpolatingValue
        >

export class SurfaceWithObjectsInterpolatingValueTexturesUsingSharedSampleTextureLocationsProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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
            SurfaceSampleWithObjectsInterpolatingValuesUsingSharedSampleTextureLocations<
                    SurfaceTextureLocationGroup,
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                > =
            SurfaceSampleWithObjectsInterpolatingValuesUsingSharedSampleTextureLocations<
                    SurfaceTextureLocationGroup,
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                >,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSharedSampleTextureLocations<
                SurfaceTextureLocationGroup,
                Objects,
                InterpolatingGroups,
                ObjectsInterpolatingGrouped,
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSharedSampleTextureLocations<
                SurfaceTextureLocationGroup,
                Objects,
                InterpolatingGroups,
                ObjectsInterpolatingGrouped,
                InterpolatingGroupKinds
            >
    > implements
    Processor<
            SurfaceWithObjectsInterpolatingValueTexturesUsingSharedSampleTextureLocations<
                    IndicesT,
                    SurfaceTextureLocationGroup,
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleT
                >,
            SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSharedSampleTextureLocations<
                    Objects,
                    SurfaceTextureLocationGroup,
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
        public readonly surfaceTextureLocationGroup?: SurfaceTextureLocationGroup
    ) {
    }
    
    init(context: SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSharedSampleTextureLocations<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingGroupKinds,
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
            surface: SurfaceWithObjectsInterpolatingValueTexturesUsingSharedSampleTextureLocations<
                    IndicesT,
                    SurfaceTextureLocationGroup,
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleT
                >,
            context: SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSharedSampleTextureLocations<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingGroupKinds,
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
            groupKindObjectsGroupedWithFields<
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds,
                    Texture<TextureLocation, InterpolatingValue>,
                    InterpolatingValue,
                    Field<InterpolatingValue>
                >(
                    ///@ts-ignore
                    surface,
                    context.samples,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )
        
        type InterpolatingContainer = FieldPointVectorContainerStatic<NumberTypedArray>
        
        for (const { group: interpolatingGroup, objects: { template } } of interpolatingGroups) {
            for (const objectRelativePath of objectValuePaths(template)) {
                const objectPath = [...interpolatingGroup.path, ...objectRelativePath]
                const values = extract<FieldPointVector<InterpolatingValue, InterpolatingContainer>>(surface.samples, objectPath)

                const texture = new VertexInterpolatingTexture<TextureLocation, InterpolatingValue, InterpolatingContainer>(values, UVs, surface.mesh.triangles, interpolatingGroup.field)
                intract(surface, objectPath, texture)
            }
        }
    }
}