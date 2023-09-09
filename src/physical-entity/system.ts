import { AppBase, Entity, Component as pc_Component } from "playcanvas-extended"
import { fields, solids, surfaces, textures, volumes } from "../index.js"
import { octtree, processing } from "../paradigm/index.js"
import { InfluenceGroupTemplate, InterpolatingGroupsKindsTemplate, VolumeProcessingContextT, VolumeProcessingInstanceT, VolumeProcessingT, VolumeProcessorT, VolumeSolidProcessorT, VolumeSurfaceProcessorT } from "./types.js"
import { Component } from "./component.js"
import { ComponentData } from "./data.js"
import { StorageService } from "../storage/index.js"
import { MultiObjectsInfluencesGroupKindsTemplate } from "../fields/multi-objects.js"
import { makeClone } from "../utils/cloneable.js"

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
            new fields.vectorized.processors.FieldPointVectorMultiObjectsNormalizingProcessor(
                MultiObjectsInfluencesGroupKindsTemplate,
                InfluenceGroupTemplate
            ) as any
            // new fields.MultiObjectsInfluencesArrayNormalizingProcessor() as any
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
        // new surfaces.texturing.SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor(
        new surfaces.texturing.SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor(
            InterpolatingGroupsKindsTemplate
        ) as unknown as VolumeSurfaceProcessorT
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
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        surfaces.rendering.SurfaceWithRenderingProcessor.instance as unknown as VolumeSurfaceProcessorT
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

    initializeComponentData(component: Component<ID>, data: ComponentData<ID>, properties: any) {
        super.initializeComponentData(component, data, properties)
        component.volume = data.volume
        component.texturers = data.texturers
        component.interpolatingGroups = data.interpolatingGroups
        component.extraLocationParameters = data.extraLocationParameters
        component.volumeSamplingSettings = data.volumeSamplingSettings
        component.surfaceLevel = data.surfaceLevel
    }

    cloneComponent(entity: Entity, clone: Entity): pc_Component {
        const component = entity.c[this.id] as Component<ID>

        const data: ComponentData<ID> = {
            enabled: component.enabled,
            makeRoot: component.makeRoot,
            id: component.processing.id,
            volume: makeClone(component.volume),

            //TODO: these should be shared
            texturers: component.texturers,
            interpolatingGroups: component.interpolatingGroups,
            extraLocationParameters: component.extraLocationParameters,
            volumeSamplingSettings: component.volumeSamplingSettings,
            surfaceLevel: component.surfaceLevel,
        }

        return this.addComponent(clone, data)
    }
}