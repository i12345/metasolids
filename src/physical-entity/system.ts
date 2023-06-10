import { AppBase } from "playcanvas-extended"
import { fields, processing, solids, surfaces, textures, volumes } from "../index.js"
import { InterpolatingGroupsKindsTemplate, InterpolatingGroupsTemplate, SampleProcessingContextT, SampleT, VolumeProcessingContextT, VolumeProcessingT, VolumeProcessorT, VolumeSolidProcessorT, VolumeSurfaceProcessorT } from "./types.js"
import { Component } from "./component.js"
import { ComponentData } from "./data.js"
import { StorageService } from "../utils/index.js"

export const SYSTEM_ID = 'volume'

const processors: VolumeProcessorT[] = [
    volumes.VolumeSamplingProcessor.instance,
    surfaces.meshing.VolumeSurfaceMeshingProcessor.instance,
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer.instance,
        surfaces.measuring.SurfaceWithSurfaceAreaProcessor.instance
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer.instance,
        new processing.processors.ParallelizingProcessor(
            surfaces.SurfaceSampleParallelizer.instance,
            new fields.MultiObjectsInfluencesNormalizingProcessor() as any
        ) as unknown as VolumeSurfaceProcessorT
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer.instance,
        new surfaces.UVunwrapping.SurfaceUVUnwrappingProcessor(
            "xAtlas"
        ) as VolumeSurfaceProcessorT
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer.instance,
        new surfaces.texturing.SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor(
            InterpolatingGroupsKindsTemplate
        ) as unknown as VolumeSurfaceProcessorT
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer.instance,
        surfaces.rendering.SurfaceWithRenderingProcessor.instance as unknown as VolumeSurfaceProcessorT
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer.instance,
        solids.VolumeSurfaceSolidifyingProcessor.instance as VolumeSurfaceProcessorT,
    ),
    new processing.processors.ParallelizingProcessor(
        solids.VolumeSolidsParallelizer.instance,
        solids.SolidWithEnclosingVolumeProcessor.instance as VolumeSolidProcessorT
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer.instance,
        ///@ts-ignore
        textures.TextureableProcessor.instance as VolumeSurfaceProcessorT
    ),
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