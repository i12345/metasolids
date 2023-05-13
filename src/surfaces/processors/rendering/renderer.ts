import { Entity, MeshInstance } from "playcanvas-extended"
import { VolumeLocation } from "../../../volumes/volume.js"
import { MaterialRendererIndividual, MaterialRendererShared } from "./material/renderer.js"
import { SurfaceWithRendering, SurfaceProcessingContextWithRendering } from "./surface.js"
import { MeshRendererIndividual, MeshRendererShared } from "./mesh/renderer.js"
import { MultiObjectsGroupsTemplate } from "../../../fields/index.js"

export class SurfaceRendererShared<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > {
    readonly mesh: MeshRendererShared<VolumeLocationT, SurfaceTextureLocationGroup>
    readonly material: MaterialRendererShared<VolumeLocationT, SurfaceTextureLocationGroup>

    constructor(
        readonly surface: SurfaceWithRendering<VolumeLocationT, SurfaceTextureLocationGroup>,
        readonly context: SurfaceProcessingContextWithRendering<VolumeLocationT, SurfaceTextureLocationGroup>
    ) {
        this.mesh = new MeshRendererShared(this)
        this.material = new MaterialRendererShared(this)
    }

    individualize(entity: Entity): SurfaceRendererIndividual<VolumeLocationT, SurfaceTextureLocationGroup> {
        ///@ts-ignore
        return new SurfaceRendererIndividual(this, entity)
    }
}

export class SurfaceRendererIndividual<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceTextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > {
    readonly mesh: MeshRendererIndividual<VolumeLocationT, SurfaceTextureLocationGroup>
    readonly material: MaterialRendererIndividual<VolumeLocationT, SurfaceTextureLocationGroup>
    readonly implementation!: MeshInstance

    constructor(
            public readonly shared: SurfaceRendererShared<VolumeLocationT, SurfaceTextureLocationGroup>,
            public readonly entity: Entity
        ) {
        this.mesh = shared.mesh.individualize(this)
        this.material = shared.material.individualize(this)
    }

    update(invalidateStagesSince = 1) {
        this.mesh.update()
        this.material.update(invalidateStagesSince)
    }
}
