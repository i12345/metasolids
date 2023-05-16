import { MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate } from "../../../../fields/multi-objects-fields-point.js";
import { SurfaceProcessingContext } from "../../../processor.js";
import { Surface, SurfaceSample } from "../../../surface.js";
import { SurfaceIndividualTextureLocationsGroupKinds, SurfaceTextureLocationsGroupKinds } from "../types.js";
import { SurfaceUVUnwrapping } from "./algorithm.js";

export type SurfaceWithUVUnwrapping<
        Sample extends SurfaceSample = SurfaceSample,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    Surface<Sample> &
    MultiObjectsGroupsMapped<SurfaceTextureLocationGroup, SurfaceUVUnwrapping>

export type SurfaceProcessingContextWithUVUnwrapping<
        SampleProcessingContextT = any,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsGroupsProcessingContext<
        SurfaceTextureLocationGroup,
        SurfaceIndividualTextureLocationsGroupKinds
    > &
    MultiObjectsGroupsProcessingContext<
        SurfaceTextureLocationGroup,
        SurfaceTextureLocationsGroupKinds
    >