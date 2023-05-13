import { Color } from "playcanvas-extended";
import { FieldPoint, groupKinds, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf } from "../../../../fields/index.js";
import { Processor } from "../../../../processor/processor.js";
import { Texture, TextureLocation, TextureSample, TexturesTemplated, VertexInterpolatingTexture } from "../../../../textures/index.js";
import { onlyOne, PropertyPath } from "../../../../utils/index.js";
import { Surface, SurfaceSample } from "../../../surface.js";
import { SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceProcessingContextWithIndividualTextures, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleWithIndividualTextureLocations, SurfaceTextureLocationsGroupKindsTemplate, SurfaceWithIndividualTextures } from "../types.js";

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

export type SurfaceSampleWithIndividualInterpolatingValues<
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

export type SurfaceSampleProcessingContextWithIndividualInterpolatingValues<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
    > =
    SurfaceSampleProcessingContextWithIndividualTextureLocations<SurfaceTextureLocationGroup> &
    MultiObjectsGroupsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupsKind
    >

export type SurfaceWithIndividualInterpolatingValueTextures<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleT extends
            SurfaceSampleWithIndividualInterpolatingValues<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                > =
            SurfaceSampleWithIndividualInterpolatingValues<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                >
    > =
    // SurfaceWithIndividualTextures<
    //     InterpolatingGroups,
    //     TextureLocation,
    //     TextureSample,
    //     Texture,
    //     MultiObjectsGroupsMapped<InterpolatingGroups, Texture>,
    //     SurfaceSampleT
    // > =
    Surface<SurfaceSampleT> &
    TexturesTemplated<InterpolatingGroups, InterpolatingValuesGrouped> 

export type SurfaceProcessingContextWithIndividualInterpolatingValueTextures<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualInterpolatingValues<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithIndividualInterpolatingValues<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            >
    > =
    SurfaceProcessingContextWithIndividualTextures<
        SurfaceTextureLocationGroup,
        InterpolatingGroups,
        SampleProcessingContextT
    > &
    MultiObjectsGroupsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupKinds
    >

export class SurfaceWithIndividualInterpolatingValueTexturesProcessor<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleT extends
            SurfaceSampleWithIndividualInterpolatingValues<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                > =
            SurfaceSampleWithIndividualInterpolatingValues<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped
                >,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualInterpolatingValues<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithIndividualInterpolatingValues<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            >
    > implements
    Processor<
            SurfaceWithIndividualInterpolatingValueTextures<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleT
                >,
            SurfaceProcessingContextWithIndividualInterpolatingValueTextures<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
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
    
    init(context: SurfaceProcessingContextWithIndividualInterpolatingValueTextures<
            SurfaceTextureLocationGroup,
            InterpolatingGroups,
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
            surfaceTextureLocationGroup.path,
            ...[...interpolatingGroups].map(({ group: { path } }) => path)
        ]
    }

    process(
            surface: SurfaceWithIndividualInterpolatingValueTextures<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleT
                >,
            context: SurfaceProcessingContextWithIndividualInterpolatingValueTextures<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
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
            groupKinds(
                    context.sample,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )

        for (const { group: interpolatingGroup } of interpolatingGroups) {
            const values = surface.samples.map(sample => interpolatingGroup.get<InterpolatingValue>(sample))
            const texture = new VertexInterpolatingTexture(values, UVs, surface.mesh.triangles)
            interpolatingGroup.set(surface, texture)
        }
    }
}