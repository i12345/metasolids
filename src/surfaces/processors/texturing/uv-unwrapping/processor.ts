import { SurfaceProcessor } from "../../../processor.js";
import { SurfaceSample } from "../../../surface.js";
import { SurfaceIndividualTextureLocationsGroupKindsTemplate } from "../types.js";
import { MultiObjectsGroupsTemplate, groupKinds } from "../../../../fields/index.js";
import { onlyOne } from "../../../../utils/only-one.js";
import { SurfaceUVUnwrappingAlgorithms } from "./algorithms.js";
import { SurfaceUVUnwrappingAlgorithm } from "./algorithm.js";
import { SurfaceProcessingContextWithUVUnwrapping, SurfaceWithUVUnwrapping } from "./surface.js";

export class SurfaceUVUnwrappingProcessor<
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Sample extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any
    > implements
    SurfaceProcessor<
            Sample,
            SampleProcessingContextT,
            SurfaceWithUVUnwrapping<Sample, SurfaceTextureLocationGroup>,
            SurfaceProcessingContextWithUVUnwrapping<SampleProcessingContextT, SurfaceTextureLocationGroup>
        > {
    readonly dependencies = [['samples']]
    readonly algorithm: SurfaceUVUnwrappingAlgorithm

    constructor(
        algorithm: SurfaceUVUnwrappingAlgorithm | keyof typeof SurfaceUVUnwrappingAlgorithms,
        public readonly surfaceTextureLocationGroup?: SurfaceTextureLocationGroup
    ) {
        if (typeof algorithm === 'string')
            this.algorithm = SurfaceUVUnwrappingAlgorithms[algorithm]
        else this.algorithm = algorithm
    }

    process(
            surface: SurfaceWithUVUnwrapping<Sample, SurfaceTextureLocationGroup>,
            context: SurfaceProcessingContextWithUVUnwrapping<
                SampleProcessingContextT,
                SurfaceTextureLocationGroup
            >
        ): void {
        const surfaceTextureLocationGroup = onlyOne(groupKinds(
            context,
            SurfaceIndividualTextureLocationsGroupKindsTemplate,
            this.surfaceTextureLocationGroup
        )).group

        const unwrapping = this.algorithm.unwrap(surface.mesh)

        surfaceTextureLocationGroup.set(surface, unwrapping)
    }

    init(context: SurfaceProcessingContextWithUVUnwrapping<
            SampleProcessingContextT,
            SurfaceTextureLocationGroup
        >): void {
        this.algorithm.init()
    }
}