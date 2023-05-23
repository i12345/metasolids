import { Entity, MeshInstance } from "playcanvas-extended"
import { VolumeLocation } from "../../../volumes/volume.js"
import { MaterialRendererIndividual, MaterialRendererShared } from "./material/renderer.js"
import { SurfaceWithRendering, SurfaceProcessingContextWithRendering } from "./surface.js"
import { MeshRendererIndividual, MeshRendererShared } from "./mesh/renderer.js"
import { MultiObjectsGroupsTemplate } from "../../../fields/index.js"

export class SurfaceRendererShared<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > {
    readonly mesh: MeshRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>
    readonly material: MaterialRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>

    constructor(
        public readonly surface: SurfaceWithRendering<VolumeLocationT, SurfaceUVUnwrappingGroup>,
        public readonly context: SurfaceProcessingContextWithRendering<VolumeLocationT, SurfaceUVUnwrappingGroup>,
        public readonly surfaceUVUnwrappingGroup?: SurfaceUVUnwrappingGroup
    ) {
        this.mesh = new MeshRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>(this)
        this.material = new MaterialRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>(this)
        
        this.material.init()
    }

    individualize(entity: Entity): SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup> {
        ///@ts-ignore
        return new SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>(this, entity)
    }
}

export class SurfaceRendererIndividual<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > {
    readonly mesh: MeshRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>
    readonly material: MaterialRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>
    readonly implementation!: MeshInstance

    constructor(
            public readonly shared: SurfaceRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>,
            public readonly entity: Entity
        ) {
        this.mesh = shared.mesh.individualize(this)
        this.material = shared.material.individualize(this)

        this.material.init()

        this.implementation = new MeshInstance(this.mesh.implementation, this.material.implementation)
    }

    update(invalidateStagesSince = 1) {
        this.mesh.update()
        this.material.update(invalidateStagesSince)
    }
}
