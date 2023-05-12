import { Color } from "playcanvas-extended";
import { FieldPoint, objectValuePaths, groupKindObjectsGrouped, groupKinds, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsMapped, MultiObjectsMappedAgainGrouped, MultiObjectsProcessingContext, MultiObjectsTemplate } from "../../../../fields/index.js";
import { Processor } from "../../../../processor/processor.js";
import { Texture, TextureLocation, TextureSample, TexturesTemplated, TexturesTemplatedWithObjects, VertexInterpolatingTexture } from "../../../../textures/index.js";
import { onlyOne, PropertyPath, makeExtractor, intract } from "../../../../utils/index.js";
import { Surface, SurfaceSample } from "../../../surface.js";
import { SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceProcessingContextWithIndividualTextures, SurfaceProcessingContextWithObjectsTexturesUsingSurfaceLocation, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleWithIndividualTextureLocations, SurfaceTextureLocationsGroupKindsTemplate, SurfaceWithIndividualTextures, SurfaceWithObjectsTextures } from "../types.js";

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

export type SurfaceSampleWithObjectsInterpolatingValues<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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

export type SurfaceSampleProcessingContextWithObjectsInterpolatingValues<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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

export type SurfaceWithObjectsInterpolatingValueTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleT extends
            SurfaceSampleWithObjectsInterpolatingValues<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                > =
            SurfaceSampleWithObjectsInterpolatingValues<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                >
    > =
    Surface<SurfaceSampleT> &
    TexturesTemplatedWithObjects<
            Objects,
            InterpolatingGroups,
            ObjectsInterpolatingGrouped,
            InterpolatingValue,
            InterpolatingValuesGrouped
        >

export type SurfaceProcessingContextWithObjectsInterpolatingValueTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsInterpolatingValues<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds
                > =
            SurfaceSampleProcessingContextWithObjectsInterpolatingValues<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds
                >
    > =
    SurfaceProcessingContextWithObjectsTexturesUsingSurfaceLocation<
            Objects,
            SurfaceTextureLocationGroup,
            InterpolatingGroups,
            ObjectsInterpolatingGrouped,
            SampleProcessingContextT
        > &
    MultiObjectsGroupsProcessingContext<
            InterpolatingGroups,
            InterpolatingGroupKinds
        >

export class SurfaceWithObjectsInterpolatingValueTexturesProcessor<
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
            SurfaceSampleWithObjectsInterpolatingValues<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                > =
            SurfaceSampleWithObjectsInterpolatingValues<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                >,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsInterpolatingValues<
                Objects,
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                ObjectsInterpolatingGrouped,
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithObjectsInterpolatingValues<
                Objects,
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                ObjectsInterpolatingGrouped,
                InterpolatingGroupKinds
            >
    > implements
    Processor<
            SurfaceWithObjectsInterpolatingValueTextures<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleT
                >,
            SurfaceProcessingContextWithObjectsInterpolatingValueTextures<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds,
                    SurfaceSampleProcessingContextT
                >
        > {
    private _dependencies: PropertyPath[]
    
    get dependencies() {
        return this._dependencies
    }
    
    constructor(
        public interpolatingGroupsKinds?: InterpolatingGroupKinds,
        public interpolatingGroups?: InterpolatingGroups,
        public surfaceTextureLocationGroup?: SurfaceTextureLocationGroup
    ) {
    }
    
    init(context: SurfaceProcessingContextWithObjectsInterpolatingValueTextures<
            Objects,
            SurfaceTextureLocationGroup,
            InterpolatingGroups,
            ObjectsInterpolatingGrouped,
            InterpolatingGroupKinds,
            SurfaceSampleProcessingContextT
        >): void {
        const { group: surfaceTextureLocationGroup } =
            onlyOne(groupKinds(
                    context,
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
            surfaceTextureLocationGroup.path,
            ...[...interpolatingGroups].map(({ group: { path } }) => path)
        ]
    }

    process(
            surface: SurfaceWithObjectsInterpolatingValueTextures<
                    Objects,
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleT
                >,
            context: SurfaceProcessingContextWithObjectsInterpolatingValueTextures<
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
                    context,
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