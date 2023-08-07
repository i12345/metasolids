import { PROPERTYKEY_ALL, PropertyPath, groupKinds, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate } from "../../../paradigm/trees/index.js";
import { Processor } from "../../../paradigm/processing/processor.js";
import { FieldPoint } from "../../../fields/index.js";
import { TexturesTemplated, VertexInterpolatingTexture } from "../../../textures/index.js";
import { IndicesTypedArray, onlyOne } from "../../../utils/index.js";
import { SurfaceSample } from "../../surface.js";
import { SurfaceUVUnwrapping } from "../../uv-unwrapping/algorithm.js";
import { SurfaceWithUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate } from "../../uv-unwrapping/surface.js";
import { SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping } from "../types.js";
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
        InterpolatingGroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
    > =
    MultiObjectsGroupsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupsKind
    >

export type SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleT extends
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
            SurfaceSampleT
        > &
    TexturesTemplated<InterpolatingGroups, InterpolatingValuesGrouped> 

export type SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                InterpolatingGroups,
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                InterpolatingGroups,
                InterpolatingGroupKinds
            >
    > =
    SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
        SurfaceUVUnwrappingGroup,
        SampleProcessingContextT,
        InterpolatingGroups
    > &
    MultiObjectsGroupsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupKinds
    >

export class SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        InterpolatingValuesGrouped extends
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue> =
            MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>,
        SurfaceSampleT extends
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
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                InterpolatingGroups,
                InterpolatingGroupKinds
            >
    > implements
    Processor<
            SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,        
                    SurfaceUVUnwrappingGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    InterpolatingValuesGrouped,
                    SurfaceSampleT
                >,
            SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    InterpolatingGroups,
                    InterpolatingGroupKinds,
                    SurfaceSampleProcessingContextT
                >
        > {
    constructor(
        public interpolatingGroupsKinds?: InterpolatingGroupKinds,
        public interpolatingGroups?: InterpolatingGroups,
        public surfaceUVunwrappingGroup?: SurfaceUVUnwrappingGroup
    ) {
    }
    
    init(context: SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    InterpolatingGroups,
                    InterpolatingGroupKinds,
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
                ...interpolatingGroups.map(({ group: { path } }) => ['samples', PROPERTYKEY_ALL, ...path])
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
                    SurfaceSampleT
                >,
            context: SurfaceProcessingContextWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    InterpolatingGroups,
                    InterpolatingGroupKinds,
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
            groupKinds(
                    context.samples,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )
        
        for (const { group: interpolatingGroup } of interpolatingGroups) {
            const values = surface.samples.map(sample => interpolatingGroup.get<InterpolatingValue>(sample))
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
            interpolatingGroup.set(surface, texture)
        }
    }
}