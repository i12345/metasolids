import { AppBase } from "playcanvas-extended"
import { fields, processing, solids, surfaces, textures, volumes } from "../index.js"
import { InterpolatingGroupsKindsTemplate, VolumeProcessingContextT, VolumeProcessingInstanceT, VolumeProcessingT, VolumeProcessorT, VolumeSolidProcessorT, VolumeSurfaceProcessorT } from "./types.js"
import { Component } from "./component.js"
import { ComponentData } from "./data.js"
import { StorageService } from "../storage/index.js"

export const SYSTEM_ID = 'physical-entity'

const processors: VolumeProcessorT[] = [
    volumes.VolumeSamplingProcessor.instance,
    surfaces.meshing.VolumeSurfaceMeshingProcessor.instance,
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        surfaces.measuring.SurfaceWithSurfaceAreaProcessor.instance
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new processing.processors.ParallelizingProcessor(
            surfaces.SurfaceSampleParallelizer,
            new fields.MultiObjectsInfluencesNormalizingProcessor() as any
        ) as unknown as VolumeSurfaceProcessorT
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new surfaces.UVunwrapping.SurfaceUVUnwrappingProcessor(
            "xAtlas"
        ) as VolumeSurfaceProcessorT
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new surfaces.texturing.SurfaceWithInfluencesTextureUsingSurfaceUVUnwrappingProcessor(
        ) as unknown as VolumeSurfaceProcessorT
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new surfaces.texturing.SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor(
            InterpolatingGroupsKindsTemplate
        ) as unknown as VolumeSurfaceProcessorT
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        surfaces.rendering.SurfaceWithRenderingProcessor.instance as unknown as VolumeSurfaceProcessorT
    ),
    solids.VolumeSurfaceSolidifyingProcessor.instance as VolumeProcessorT,
    new processing.processors.ParallelizingProcessor(
        solids.VolumeSolidsParallelizer,
        solids.SolidWithEnclosingVolumeProcessor.instance as VolumeSolidProcessorT
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        ///@ts-ignore
        textures.TextureableProcessor.instance as VolumeSurfaceProcessorT
    ),
]

const instancers: processing.Instancer<VolumeProcessingT, VolumeProcessingInstanceT>[] = [
    surfaces.rendering.VolumeProcessingWithSurfacesWithRenderingInstancer as any,
]

export class ComponentSystem<ID = string>
    extends
    processing.ComponentSystem<
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT,
            ID,
            Component<ID>,
            ComponentData<ID>
        > {
    constructor(
        app: AppBase,
        storage: StorageService<ID>
    ) {
        super(
            app,
            SYSTEM_ID,
            Component as typeof processing.Component,
            ComponentData as typeof processing.ComponentData,
            processors,
            instancers,
            storage
        )
    }
}