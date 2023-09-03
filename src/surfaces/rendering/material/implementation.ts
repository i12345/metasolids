import { RenderedBufferForSemantic } from "./packer.js"
import { MaterialSemanticImplementation_Immediate } from "./semantic-implementations/immediate.js"
import { LevelOfDetailInfo } from "../mesh/LOD-info.js"
import { SurfaceRendererIndividual, SurfaceRendererShared } from "../renderer.js"
import { VolumeLocation } from "../../../volumes/index.js"

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

export interface MaterialSemanticImplementationStorageClass<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    readonly $class: symbol

    startingSpace(renderer: SurfaceRendererIndividual<VolumeLocationT>): Cost_Space

    instance(renderer: SurfaceRendererShared<VolumeLocationT>): MaterialSemanticImplementationStorageClassInstanceShared<VolumeLocationT>
}

export interface MaterialSemanticImplementationStorageClassInstanceShared<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    readonly $class: MaterialSemanticImplementationStorageClass<VolumeLocationT>
    readonly renderer: SurfaceRendererShared<VolumeLocationT>

    individualize(renderer: SurfaceRendererIndividual<VolumeLocationT>): MaterialSemanticImplementationStorageClassInstanceIndividual<VolumeLocationT>
}

export interface MaterialSemanticImplementationStorageClassInstanceIndividual<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    readonly $class: MaterialSemanticImplementationStorageClassInstanceShared<VolumeLocationT>
    readonly rendered: RenderedBufferForSemanticWithImplementation<VolumeLocationT>[]
    readonly renderer: SurfaceRendererIndividual<VolumeLocationT>

    preoptimize(
        add: RenderedBufferForSemanticWithImplementation<VolumeLocationT>[],
        remove: RenderedBufferForSemanticWithImplementation<VolumeLocationT>[]
    ): void

    apply(
        add: RenderedBufferForSemanticWithImplementation<VolumeLocationT>[],
        remove: RenderedBufferForSemanticWithImplementation<VolumeLocationT>[]
    ): void
}

export interface RenderedBufferForSemanticWithImplementation<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > extends RenderedBufferForSemantic {
    implementation: MaterialSemanticImplementation_Immediate<VolumeLocationT>
    storageClass: symbol
}

export interface MaterialSemanticImplementation<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    stage: number
    cost: Cost
    quality(info: LevelOfDetailInfo): number
    implement(renderer: SurfaceRendererIndividual<VolumeLocationT>): RenderedBufferForSemanticWithImplementation<VolumeLocationT>[]
}