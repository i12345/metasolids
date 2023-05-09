import { RenderedBufferForSemantic } from "./packer.js"
import { MaterialSemanticImplementation_Immediate } from "./semantic-implementations/immediate.js"
import { LevelOfDetailInfo } from "../mesh/LOD-info.js"
import { SurfaceRendererIndividual, SurfaceRendererShared } from "../renderer.js"

export type Cost_Space = {
    /**
     * Number of floats
     */
    elements: number
}

export type Cost_Space_VertexColors =
    Cost_Space & {
    vertexColorChannels: number
    
    /**
     * Number of vertices times vertex color channels
     */
    elements: number
}

export type Cost_Space_Texture =
    Cost_Space & {
    /**
     * Number of texels times channels per texel
     */
    elements: number
}

export type Cost = {
    /**
     * Time = number of texture samples taken
     */
    time: number

    /**
     * Space = storage costs
     */
    space: Cost_Space
}

export interface MaterialSemanticImplementationStorageClass {
    readonly $class: symbol

    startingSpace(renderer: SurfaceRendererIndividual): Cost_Space

    instance(renderer: SurfaceRendererShared): MaterialSemanticImplementationStorageClassInstanceShared
}

export interface MaterialSemanticImplementationStorageClassInstanceShared {
    readonly $class: MaterialSemanticImplementationStorageClass
    readonly renderer: SurfaceRendererShared

    individualize(renderer: SurfaceRendererIndividual): MaterialSemanticImplementationStorageClassInstanceIndividual
}

export interface MaterialSemanticImplementationStorageClassInstanceIndividual {
    readonly $class: MaterialSemanticImplementationStorageClassInstanceShared
    readonly rendered: RenderedBufferForSemanticWithImplementation[]
    readonly renderer: SurfaceRendererIndividual

    preoptimize(
        add: RenderedBufferForSemanticWithImplementation[],
        remove: RenderedBufferForSemanticWithImplementation[]
    ): void

    apply(
        add: RenderedBufferForSemanticWithImplementation[],
        remove: RenderedBufferForSemanticWithImplementation[]
    ): void
}

export interface RenderedBufferForSemanticWithImplementation extends RenderedBufferForSemantic {
    implementation: MaterialSemanticImplementation_Immediate
    storageClass: symbol
}

export interface MaterialSemanticImplementation {
    stage: number
    cost: Cost
    quality(info: LevelOfDetailInfo): number
    implement(renderer: SurfaceRendererIndividual): RenderedBufferForSemanticWithImplementation[]
}