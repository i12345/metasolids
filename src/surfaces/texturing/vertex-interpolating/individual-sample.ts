import { Color } from "playcanvas-extended";
import { Processor } from "../../../processing/processor.js";
import { groupKinds, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf } from "../../../paradigm/index.js";
import { FieldPoint } from "../../../fields/index.js";
import { Texture, TextureLocation, TextureSample, TexturesTemplated, VertexInterpolatingTexture } from "../../../textures/index.js";
import { onlyOne, PROPERTYKEY_ALL, PropertyPath } from "../../../utils/index.js";
import { Surface, SurfaceSample } from "../../surface.js";
import { SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceProcessingContextWithIndividualTextures, SurfaceProcessingContextWithIndividualTexturesUsingSampleTextureLocations, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleWithIndividualTextureLocations, SurfaceTextureLocationsGroupKindsTemplate, SurfaceWithIndividualTextures, SurfaceWithIndividualTexturesUsingSampleTextureLocations } from "../types.js";

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
        InterpolatingGroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
    > =
    SurfaceSampleProcessingContextWithIndividualTextureLocations<SurfaceTextureLocationGroup> &
    MultiObjectsGroupsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupsKind
    >

export type SurfaceWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
        MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
        MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleT extends
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
    Surface<SurfaceSampleT> &
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
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualInterpolatingValuesUsingSampleTextureLocations<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithIndividualInterpolatingValuesUsingSampleTextureLocations<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            >
    > =
    SurfaceProcessingContextWithIndividualTexturesUsingSampleTextureLocations<
        SurfaceTextureLocationGroup,
        InterpolatingGroups,
        SampleProcessingContextT
    > &
    MultiObjectsGroupsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupKinds
    >

export class SurfaceWithIndividualInterpolatingValueTexturesUsingSampleTextureLocationsProcessor<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleT extends
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
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithIndividualInterpolatingValuesUsingSampleTextureLocations<
                SurfaceTextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            >
    > implements
    Processor<
            SurfaceWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleT
                >,
            SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingGroupKinds,
                    SurfaceSampleProcessingContextT
                >
        > {
    private _connections!: {
        inputs: PropertyPath[]
        outputs: PropertyPath[]
    }
    
    get connections() {
        return this._connections
    }
    
    constructor(
        public interpolatingGroupsKinds?: InterpolatingGroupKinds,
        public interpolatingGroups?: InterpolatingGroups,
        public surfaceTextureLocationGroup?: SurfaceTextureLocationGroup
    ) {
    }

    //TODO: work further on vertex interplating texture
    // also objects-combining texture
    // integrate changes to surface with texture types

    init(context: SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
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
            [...groupKinds(
                    context.sample,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )]
        
        this._connections = {
            inputs: [
                ['samples', PROPERTYKEY_ALL, ...surfaceTextureLocationGroup.path],
                ...interpolatingGroups.map(({ group: { path } }) => ['samples', PROPERTYKEY_ALL, ...path])
            ],
            outputs: [
                ...interpolatingGroups.map(({ group: { path } }) => path)
            ]
        }
    }

    process(
            surface: SurfaceWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
                    SurfaceTextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleT
                >,
            context: SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSampleTextureLocations<
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