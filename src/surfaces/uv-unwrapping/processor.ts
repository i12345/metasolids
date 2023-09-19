import { SurfaceProcessor } from "../processing.js";
import { SurfaceSample } from "../surface.js";
import { MultiObjectsGroupsTemplate, groupKinds } from "../../paradigm/trees/index.js";
import { onlyOne } from "../../utils/only-one.js";
import { SurfaceUVUnwrappingAlgorithm } from "./algorithm.js";
import * as algorithms from './algorithms/index.js'
import { SurfaceProcessingContextWithUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate, SurfaceWithUVUnwrapping } from "./surface.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";

export class SurfaceUVUnwrappingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceSampleT extends SurfaceSample = SurfaceSample,
        VolumeSampleProcessingContextT = any,
        SurfaceT extends
            SurfaceWithUVUnwrapping<IndicesT, SurfaceUVUnwrappingGroup, SurfaceSampleT> =
            SurfaceWithUVUnwrapping<IndicesT, SurfaceUVUnwrappingGroup, SurfaceSampleT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    VolumeSampleProcessingContextT
                > =
            SurfaceProcessingContextWithUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    VolumeSampleProcessingContextT
                >
    > implements
    SurfaceProcessor<
            IndicesT,
            SurfaceSampleT,
            VolumeSampleProcessingContextT,
            SurfaceT,
            SurfaceProcessingContextT
        > {
    readonly algorithm: SurfaceUVUnwrappingAlgorithm

    constructor(
        algorithm: SurfaceUVUnwrappingAlgorithm | keyof typeof algorithms.named,
        public readonly surfaceUVUnwrappingGroup?: SurfaceUVUnwrappingGroup,
        public readonly options?: any
    ) {
        if (typeof algorithm === 'string')
            this.algorithm = algorithms.named[algorithm]
        else this.algorithm = algorithm
    }

    process(
            surface: SurfaceT,
            context: SurfaceProcessingContextT
        ): void {
        const surfaceUVUnwrappingGroup = onlyOne(groupKinds(
            context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            this.surfaceUVUnwrappingGroup
        )).group

        const unwrapping = this.algorithm.unwrap(surface.mesh, this.options)

        surfaceUVUnwrappingGroup.set(surface, unwrapping)
    }

    init(context: SurfaceProcessingContextT) {
        this.algorithm.init()

        const surfaceUVUnwrappingGroup = onlyOne(groupKinds(
            context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            this.surfaceUVUnwrappingGroup
        )).group

        return {
            connections: {
                inputs: [['mesh']],
                outputs: [surfaceUVUnwrappingGroup.path],
            }
        }
    }
}