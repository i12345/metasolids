import { MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
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
        SurfaceSampleT extends SurfaceSample = SurfaceSample
    > =
    Surface<IndicesT, SurfaceSampleT> &
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