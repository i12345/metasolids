import { Entity, MeshInstance } from "playcanvas-extended"
import { VolumeLocation } from "../../volumes/volume.js"
import { MaterialRendererIndividual, MaterialRendererShared } from "./material/renderer.js"
import { MeshRendererIndividual, MeshRendererShared } from "./mesh/renderer.js"
import { Material_Groups_TextureContexts, Material_Groups_Textures, Material_Texture_Context } from "./material/material-texture.js"
import { SurfaceUVUnwrapping } from "../uv-unwrapping/algorithm.js"
import { MeshDataWithNormals } from "../surface.js"

export class SurfaceRendererShared<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    readonly mesh: MeshRendererShared<VolumeLocationT>
    readonly material: MaterialRendererShared<VolumeLocationT>

    constructor(
        public readonly meshData: MeshDataWithNormals,
        public readonly textures: Material_Groups_Textures<VolumeLocationT>,
        public readonly textureContexts: Material_Groups_TextureContexts<VolumeLocationT>,
        public readonly surfaceUVUnwrapping: SurfaceUVUnwrapping,
    ) {
        this.mesh = new MeshRendererShared<VolumeLocationT>(this)
        this.material = new MaterialRendererShared<VolumeLocationT>(this)
        
        this.material.init()
    }

    individualize(entity: Entity): SurfaceRendererIndividual<VolumeLocationT> {
        ///@ts-ignore
        return new SurfaceRendererIndividual<VolumeLocationT>(this, entity)
    }
}

export class SurfaceRendererIndividual<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    readonly mesh: MeshRendererIndividual<VolumeLocationT>
    readonly material: MaterialRendererIndividual<VolumeLocationT>
    readonly implementation!: MeshInstance

    get attached() {
        return (
            (this.entity.render !== undefined) &&
            this.entity.render.enabled &&
            this.entity.render.meshInstances.includes(this.implementation)
        )
    }

    set attached(attached) {
        if (!this.attached && attached) {
            if (!this.entity.render)
                this.entity.addComponent('render', { enabled: true })
            else if (!this.entity.render.enabled)
                this.entity.render.enabled = true
            
            this.entity.render!.meshInstances = [...this.entity.render!.meshInstances, this.implementation]
        }
        else if (this.attached && !attached) {
            const meshInstances = [...this.entity.render!.meshInstances]
            meshInstances.splice(meshInstances.indexOf(this.implementation), 1)
            this.entity.render!.meshInstances = meshInstances
        }
    }

    constructor(
            public readonly shared: SurfaceRendererShared<VolumeLocationT>,
            public readonly entity: Entity,
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
