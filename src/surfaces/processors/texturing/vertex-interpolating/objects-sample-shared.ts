import { FieldPoint, objectValuePaths, groupKindObjectsGrouped, groupKinds, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsProcessingContext, MultiObjectsTemplate, MultiObjectsMappedAgainGrouped } from "../../../../fields/index.js";
import { Processor } from "../../../../processor/processor.js";
import { Texture, TextureLocation, TextureSample, TexturesTemplated, VertexInterpolatingTexture } from "../../../../textures/index.js";
import { onlyOne, PropertyPath, makeExtractor, intract, PROPERTYKEY_ALL } from "../../../../utils/index.js";
import { Surface, SurfaceSample } from "../../../surface.js";
import { SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceProcessingContextWithObjectsTexturesUsingSharedSampleTextureLocations, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleWithIndividualTextureLocations, SurfaceWithObjectsTextures, SurfaceWithObjectsTexturesUsingSharedSampleTextureLocations } from "../types.js";

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
    Surface<SurfaceSampleT> &
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
    MultiObjectsGroupsProcessingContext<
            InterpolatingGroups,
            InterpolatingGroupKinds
        >

export class SurfaceWithObjectsInterpolatingValueTexturesUsingSharedSampleTextureLocationsProcessor<
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
                    InterpolatingGroupKinds,
                    SurfaceSampleProcessingContextT
                >
        > {
    private _dependencies!: PropertyPath[]
    
    get dependencies() {
        return this._dependencies
    }
    
    constructor(
        public interpolatingGroupsKinds?: InterpolatingGroupKinds,
        public interpolatingGroups?: InterpolatingGroups,
        public surfaceTextureLocationGroup?: SurfaceTextureLocationGroup
    ) {
    }
    
    init(context: SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSharedSampleTextureLocations<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds,
                    SurfaceSampleProcessingContextT
                >): void {
        const { group: surfaceTextureLocationGroup } =
            onlyOne(groupKinds(
                    context.sample,
                    SurfaceIndividualTextureLocationsGroupKindsTemplate,
                    this.surfaceTextureLocationGroup
                ))

        const interpolatingGroups =
            groupKinds(
                    context.sample,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )
        
        this._dependencies = [
            ['samples', PROPERTYKEY_ALL, ...surfaceTextureLocationGroup.path],
            ...[...interpolatingGroups].map(({ group: { path } }) => ['samples', PROPERTYKEY_ALL, ...path])
        ]
    }

    process(
            surface: SurfaceWithObjectsInterpolatingValueTexturesUsingSharedSampleTextureLocations<
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
                    InterpolatingGroupKinds,
                    SurfaceSampleProcessingContextT
                >
        ): void {
        const { group: surfaceTextureLocationGroup } =
            onlyOne(groupKinds(
                    context.sample,
                    SurfaceIndividualTextureLocationsGroupKindsTemplate,
                    this.surfaceTextureLocationGroup
                ))
        
        const UVs = surface.samples.map(sample =>
            surfaceTextureLocationGroup.get<TextureLocation>(sample).uv)

        const interpolatingGroups =
            groupKindObjectsGrouped<
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds,
                    Texture<TextureLocation, InterpolatingValue>
                >(
                    ///@ts-ignore
                    surface,
                    context.sample,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )
        
        for (const { group: interpolatingGroup, objects: { template } } of interpolatingGroups) {
            for (const objectRelativePath of objectValuePaths(template)) {
                const objectPath = [...interpolatingGroup.path, ...objectRelativePath]
                const extractor = makeExtractor<InterpolatingValue>(objectPath)
                
                const values = surface.samples.map(sample => extractor(sample))

                const texture = new VertexInterpolatingTexture(values, UVs, surface.mesh.triangles)
                intract(surface, objectPath, texture)
            }
        }
    }
}