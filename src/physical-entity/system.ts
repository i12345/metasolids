import { AppBase } from "playcanvas-extended"
import { fields, solids, surfaces, textures, volumes } from "../index.js"
import { octtree, processing } from "../paradigm/index.js"
import { InterpolatingGroupsKindsTemplate, VolumeProcessingContextT, VolumeProcessingInstanceT, VolumeProcessingT, VolumeProcessorT, VolumeSolidProcessorT, VolumeSurfaceProcessorT } from "./types.js"
import { Component } from "./component.js"
import { ComponentData } from "./data.js"
import { StorageService } from "../storage/index.js"

export const SYSTEM_ID = 'physical-entity'

const processors: VolumeProcessorT[] = [
    new volumes.sampling.VolumeSamplingSubdividingProcessor([
        octtree.OctTreeWithDualSubdivisionProcessor.instance,
        surfaces.sampling.SurfaceNetVolumeSamplingSubdivisionProcessor.instance,
        surfaces.sampling.SurfaceHintVolumeSamplingSubdivisionProcessor.instance,
        solids.sampling.SolidHintVolumeSamplingSubdivisionProcessor.instance,
    ] as any[]) as unknown as VolumeProcessorT,
    volumes.sampling.VolumeWithSamplingWithAdjacencyProcessor.instance as VolumeProcessorT,
    surfaces.meshing.SurfaceNetMeshingProcessor.instance as unknown as VolumeProcessorT,
    // surfaces.meshing.PaperThinMeshingProcessor.instance,
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        surfaces.measuring.SurfaceWithSurfaceAreaProcessor.instance as any
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new processing.processors.ParallelizingProcessor(
            surfaces.SurfaceSamplesParallelizer,
            new fields.MultiObjectsInfluencesNormalizingProcessor() as any
        ) as unknown as VolumeSurfaceProcessorT
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new surfaces.UVunwrapping.SurfaceUVUnwrappingProcessor(
            "xAtlas"
        ) as unknown as VolumeSurfaceProcessorT
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
    solids.processors.VolumeSurfaceSolidificationProcessor.instance,
    new processing.processors.ParallelizingProcessor(
        solids.VolumeSolidsParallelizer,
        solids.processors.SolidWithEnclosingVolumeProcessor.instance as VolumeSolidProcessorT
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