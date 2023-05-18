import { SurfaceProcessor } from "../../../processor.js";
import { SurfaceSample } from "../../../surface.js";
import { SurfaceIndividualTextureLocationsGroupKindsTemplate } from "../types.js";
import { MultiObjectsGroupsTemplate, groupKinds } from "../../../../fields/index.js";
import { onlyOne } from "../../../../utils/only-one.js";
import { SurfaceUVUnwrappingAlgorithms } from "./algorithms.js";
import { SurfaceUVUnwrappingAlgorithm } from "./algorithm.js";
import { SurfaceProcessingContextWithUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate, SurfaceWithUVUnwrapping } from "./surface.js";

export class SurfaceUVUnwrappingProcessor<
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleT extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any
    > implements
    SurfaceProcessor<
            SampleT,
            SampleProcessingContextT,
            SurfaceWithUVUnwrapping<SurfaceUVUnwrappingGroup, SampleT>,
            SurfaceProcessingContextWithUVUnwrapping<SurfaceUVUnwrappingGroup, SampleProcessingContextT>
        > {
    readonly dependencies = [['samples']]
    readonly algorithm: SurfaceUVUnwrappingAlgorithm

    constructor(
        algorithm: SurfaceUVUnwrappingAlgorithm | keyof typeof SurfaceUVUnwrappingAlgorithms,
        public readonly surfaceUVUnwrappingGroup?: SurfaceUVUnwrappingGroup
    ) {
        if (typeof algorithm === 'string')
            this.algorithm = SurfaceUVUnwrappingAlgorithms[algorithm]
        else this.algorithm = algorithm
    }

    process(
            surface: SurfaceWithUVUnwrapping<SurfaceUVUnwrappingGroup, SampleT>,
            context: SurfaceProcessingContextWithUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    SampleProcessingContextT
                >): void {
        const surfaceUVUnwrappingGroup = onlyOne(groupKinds(
            context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            this.surfaceUVUnwrappingGroup
        )).group

        const unwrapping = this.algorithm.unwrap(surface.mesh)

        surfaceUVUnwrappingGroup.set(surface, unwrapping)
    }

    init(context: SurfaceProcessingContextWithUVUnwrapping<
            SurfaceUVUnwrappingGroup,
            SampleProcessingContextT
        >): void {
        this.algorithm.init()
    }
}