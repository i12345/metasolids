import { Entity, MeshInstance } from "playcanvas-extended"
import { VolumeLocation } from "../../../volumes/volume.js"
import { SurfaceSample } from "../../surface.js"
import { SurfaceSampleProcessingContextWithIndividualTextureLocations } from "../index.js"
import { MaterialRendererIndividual, MaterialRendererShared } from "./material/renderer.js"
import { SurfaceWithRendering, SurfaceProcessingContextWithRendering } from "./surface.js"
import { MeshRendererIndividual, MeshRendererShared } from "./mesh/renderer.js"

export class SurfaceRendererShared<
        VolumeLocationT extends
            VolumeLocation =
            VolumeLocation,
        Sample extends SurfaceSample = SurfaceSample,
        SampleContextTemplate extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations =
            SurfaceSampleProcessingContextWithIndividualTextureLocations,
    > {
    readonly mesh: MeshRendererShared
    readonly material: MaterialRendererShared

    constructor(
        readonly surface: SurfaceWithRendering<Sample>,
        readonly context: SurfaceProcessingContextWithRendering<
            VolumeLocationT,
            SampleContextTemplate
        >
    ) {
        this.mesh = new MeshRendererShared(this)
        this.material = new MaterialRendererShared(this)
    }

    individualize(entity: Entity) {
        return new SurfaceRendererIndividual(this, entity)
    }
}

export class SurfaceRendererIndividual<
        VolumeLocationT extends
            VolumeLocation =
            VolumeLocation,
        Sample extends SurfaceSample = SurfaceSample,
        SampleContextTemplate extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations =
            SurfaceSampleProcessingContextWithIndividualTextureLocations,
    > {
    readonly mesh: MeshRendererIndividual
    readonly material: MaterialRendererIndividual
    readonly implementation: MeshInstance

    constructor(
            public readonly shared: SurfaceRendererShared<VolumeLocationT, Sample, SampleContextTemplate>,
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
