import { RenderedBufferForSemantic } from "./packer.js"
import { MaterialSemanticImplementation_Immediate } from "./semantic-implementations/immediate.js"
import { LevelOfDetailInfo } from "../mesh/LOD-info.js"
import { SurfaceRendererIndividual, SurfaceRendererShared } from "../renderer.js"
import { VolumeLocation } from "../../../volumes/index.js"
import { MultiObjectsTemplate } from "../../../paradigm/trees/index.js"
import { IndicesTypedArray } from "../../../paradigm/arrays/indices-array.js"

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

    startingSpace<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array,
        >(
            renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>
        ): Cost_Space

    instance<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array,
        >(
            renderer: SurfaceRendererShared<Objects, ObjIDsT, VolumeLocationT>
        ): MaterialSemanticImplementationStorageClassInstanceShared<Objects, ObjIDsT, VolumeLocationT>
}

export interface MaterialSemanticImplementationStorageClassInstanceShared<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    readonly $class: MaterialSemanticImplementationStorageClass<VolumeLocationT>
    readonly renderer: SurfaceRendererShared<Objects, ObjIDsT, VolumeLocationT>

    individualize(renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>): MaterialSemanticImplementationStorageClassInstanceIndividual<Objects, ObjIDsT, VolumeLocationT>
}

export interface MaterialSemanticImplementationStorageClassInstanceIndividual<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    readonly $class: MaterialSemanticImplementationStorageClassInstanceShared<Objects, ObjIDsT, VolumeLocationT>
    readonly rendered: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[]
    readonly renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>

    preoptimize(
        add: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[],
        remove: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[]
    ): void

    apply(
        add: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[],
        remove: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[]
    ): void
}

export interface RenderedBufferForSemanticWithImplementation<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > extends RenderedBufferForSemantic {
    implementation: MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT>
    storageClass: symbol
}

export interface MaterialSemanticImplementation<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    stage: number
    cost: Cost
    quality(info: LevelOfDetailInfo): number
    implement(renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>): RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[]
}