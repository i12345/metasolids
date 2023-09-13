import { FieldPointVector, FieldPointVectorContainer } from "../../fields/vectorized/point.js";
import { MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { SurfaceProcessingContext } from "../processing.js";
import { Surface, SurfaceSample } from "../surface.js";
import { SurfaceUVUnwrapping } from "./algorithm.js";

export const SurfaceUVUnwrappingGroupKindKey = Symbol('group-kind:surface:uv-unwrapping')
export type SurfaceUVUnwrappingGroupKinds = {
    [SurfaceUVUnwrappingGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceUVUnwrappingGroupKindsTemplate: SurfaceUVUnwrappingGroupKinds = {
    [SurfaceUVUnwrappingGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const SurfaceUVUnwrappingGroupsDefaultKey = Symbol("surface:uv-unwrapping")
export type SurfaceUVUnwrappingGroupsDefault = {
    [SurfaceUVUnwrappingGroupsDefaultKey]: MultiObjectsGroupsTemplateLeaf
}
export const SurfaceUVUnwrappingGroupsDefaultTemplate: SurfaceUVUnwrappingGroupsDefault = {
    [SurfaceUVUnwrappingGroupsDefaultKey]: MultiObjectsGroupsTemplate_Leaf
}

export type SurfaceWithUVUnwrapping<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
    > =
    Surface<IndicesT, SurfaceSampleElementType, SurfaceSampleContainer, SurfaceSampleVector> &
    MultiObjectsGroupsMapped<SurfaceUVUnwrappingGroup, SurfaceUVUnwrapping>

export type SurfaceProcessingContextWithUVUnwrapping<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleProcessingContextT = any
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsGroupsProcessingContext<
        SurfaceUVUnwrappingGroup,
        SurfaceUVUnwrappingGroupKinds
    >