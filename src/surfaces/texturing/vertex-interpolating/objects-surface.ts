import { PropertyPath, makeExtractor, intract, PROPERTYKEY_ALL, objectValuePaths, groupKindObjectsGrouped, groupKinds, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsProcessingContext, MultiObjectsTemplate, MultiObjectsMappedAgainGrouped } from "../../../paradigm/trees/index.js";
import { FieldPoint } from "../../../fields/index.js";
import { Processor } from "../../../paradigm/processing/processor.js";
import { Texture, TextureLocation, VertexInterpolatingTexture } from "../../../textures/index.js";
import { IndicesTypedArray, onlyOne } from "../../../utils/index.js";
import { SurfaceSample } from "../../surface.js";
import { SurfaceUVUnwrapping } from "../../uv-unwrapping/algorithm.js";
import { SurfaceWithUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate } from "../../uv-unwrapping/surface.js";
import { SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping } from "../types.js";
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

export type SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingGroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
    > =
    MultiObjectsProcessingContext<
            Objects,
            InterpolatingGroups,
            ObjectsInterpolatingGrouped,
            InterpolatingGroupsKind
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
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsInterpolatingGrouped extends
            MultiObjectsGrouped<Objects, InterpolatingGroups> =
            MultiObjectsGrouped<Objects, InterpolatingGroups>,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds
                > =
            SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds
                >
    > =
    SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            SampleProcessingContextT,
            Objects,
            InterpolatingGroups,
            ObjectsInterpolatingGrouped
        > &
    MultiObjectsGroupsProcessingContext<
            InterpolatingGroups,
            InterpolatingGroupKinds
        >

export class SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
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
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithObjectsInterpolatingValuesUsingSurfaceUVUnwrapping<
                Objects,
                InterpolatingGroups,
                ObjectsInterpolatingGrouped,
                InterpolatingGroupKinds
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
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds,
                    SurfaceSampleProcessingContextT
                >
        > {
    constructor(
        public interpolatingGroupsKinds?: InterpolatingGroupKinds,
        public interpolatingGroups?: InterpolatingGroups,
        public surfaceUVUnwrappingGroup?: SurfaceUVUnwrappingGroup
    ) {
    }
    
    init(context: SurfaceProcessingContextWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
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
                ...interpolatingGroups.map(({ group: { path } }) => ['samples', PROPERTYKEY_ALL, ...path])
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
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
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
            groupKindObjectsGrouped<
                    Objects,
                    InterpolatingGroups,
                    ObjectsInterpolatingGrouped,
                    InterpolatingGroupKinds,
                    Texture<TextureLocation, InterpolatingValue>
                >(
                    ///@ts-ignore
                    surface,
                    context.samples,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )
        
        for (const { group: interpolatingGroup, objects: { template } } of interpolatingGroups) {
            for (const objectRelativePath of objectValuePaths(template)) {
                const objectPath = [...interpolatingGroup.path, ...objectRelativePath]
                const extractor = makeExtractor<InterpolatingValue>(objectPath)
                
                const values = surface.samples.map(sample => extractor(sample))
                for (const duplicatedVert of UVunwrapping.duplicatedVerts)
                    values.push(values[duplicatedVert])
                
                const uvs = new Array<Vec2>(UVunwrapping.UVs.length / 2)
                for (let i = 0; i < uvs.length; i++) {
                    uvs[i] = new Vec2(
                        UVunwrapping.UVs[(2 * i) + 0],
                        UVunwrapping.UVs[(2 * i) + 1]
                    )
                }
                
                const texture = new VertexInterpolatingTexture(values, uvs, UVunwrapping.finalIndices)
                intract(surface, objectPath, texture)
            }
        }
    }
}