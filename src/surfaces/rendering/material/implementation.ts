import { RenderedBufferForSemantic } from "./packer.js"
import { MaterialSemanticImplementation_Immediate } from "./semantic-implementations/immediate.js"
import { LevelOfDetailInfo } from "../mesh/LOD-info.js"
import { SurfaceRendererIndividual, SurfaceRendererShared } from "../renderer.js"
import { MultiObjectsGroupsTemplate } from "../../../paradigm/multi-objects.js"
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
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > {
    readonly $class: symbol

    startingSpace(renderer: SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>): Cost_Space

    instance(renderer: SurfaceRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>): MaterialSemanticImplementationStorageClassInstanceShared<VolumeLocationT, SurfaceUVUnwrappingGroup>
}

export interface MaterialSemanticImplementationStorageClassInstanceShared<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > {
    readonly $class: MaterialSemanticImplementationStorageClass<VolumeLocationT, SurfaceUVUnwrappingGroup>
    readonly renderer: SurfaceRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>

    individualize(renderer: SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>): MaterialSemanticImplementationStorageClassInstanceIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>
}

export interface MaterialSemanticImplementationStorageClassInstanceIndividual<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > {
    readonly $class: MaterialSemanticImplementationStorageClassInstanceShared<VolumeLocationT, SurfaceUVUnwrappingGroup>
    readonly rendered: RenderedBufferForSemanticWithImplementation[]
    readonly renderer: SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>

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

export interface MaterialSemanticImplementation<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > {
    stage: number
    cost: Cost
    quality(info: LevelOfDetailInfo): number
    implement(renderer: SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>): RenderedBufferForSemanticWithImplementation[]
}