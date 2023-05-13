import { SurfaceProcessor } from "../../processor.js";
import { Surface } from "../../surface.js";
import { MeshData } from "../../../meshing/types.js";
import { SurfaceIndividualTextureLocationsGroupKindsTemplate, SurfaceProcessingContextWithIndividualTextureLocations, SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleWithIndividualTextureLocations } from "./types.js";
import { MultiObjectsGroupsTemplate, groupKinds, groups } from "../../../fields/index.js";
import { GeneratorType } from "../../../utils/generator-type.js";
import { onlyOne } from "../../../utils/only-one.js";
import { TextureLocation } from "../../../textures/texture.js";

export class SurfaceUVUnwrappingProcessor<
        SurfaceTextureLocationGroup extends
            MultiObjectsGroupsTemplate =
            MultiObjectsGroupsTemplate,
        Sample extends
            SurfaceSampleWithIndividualTextureLocations<SurfaceTextureLocationGroup> =
            SurfaceSampleWithIndividualTextureLocations<SurfaceTextureLocationGroup>,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations<SurfaceTextureLocationGroup> =
            SurfaceSampleProcessingContextWithIndividualTextureLocations<SurfaceTextureLocationGroup>
    > implements
    SurfaceProcessor<
            Sample,
            SampleProcessingContextT,
            Surface<Sample>,
            SurfaceProcessingContextWithIndividualTextureLocations<
                    SurfaceTextureLocationGroup,
                    SampleProcessingContextT
                >
        > {
    readonly dependencies = [['samples']]
    readonly algorithm: SurfaceUVUnwrappingAlgorithm
    
    private surfaceTextureLocationGroup_set?: GeneratorType<ReturnType<typeof groups>>["set"]

    constructor(
        algorithm: SurfaceUVUnwrappingAlgorithm | keyof typeof SurfaceUVUnwrappingAlgorithms,
        public readonly surfaceTextureLocationGroup?: SurfaceTextureLocationGroup
    ) {
        if (typeof algorithm === 'string')
            this.algorithm = SurfaceUVUnwrappingAlgorithms[algorithm]
        else this.algorithm = algorithm
    }

    process(surface: Surface<Sample>): void {
        const textureLocations = this.algorithm.unwrap(surface.mesh)
        for (let i = 0; i < surface.samples.length; i++) {
            this.surfaceTextureLocationGroup_set!(
                surface.samples[i],
                textureLocations[i]
            )
        }
    }

    init(context: SurfaceProcessingContextWithIndividualTextureLocations<
            SurfaceTextureLocationGroup,
            SampleProcessingContextT
        >): void {
        this.surfaceTextureLocationGroup_set = onlyOne(groupKinds(
            context.sample,
            SurfaceIndividualTextureLocationsGroupKindsTemplate,
            this.surfaceTextureLocationGroup
        )).group.set
    }
}

export interface SurfaceUVUnwrappingAlgorithm {
    unwrap(mesh: MeshData): TextureLocation[]
}

export const SurfaceUVUnwrappingAlgorithms = {
    conformalLeastSquares: {
        unwrap(mesh) {
            // https://members.loria.fr/Bruno.Levy/papers/LSCM_SIGGRAPH_2002.pdf

            throw new Error('not implemented')
        }
    } as SurfaceUVUnwrappingAlgorithm
}