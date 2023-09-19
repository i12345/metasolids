import { AppBase, Entity, Component as pc_Component } from "playcanvas-extended"
import { fields, solids, surfaces, textures, volumes } from "../index.js"
import { octtree, processing } from "../paradigm/index.js"
import { InfluenceGroupTemplate, InterpolatingGroupsKindsTemplate, RawProcessingMode, RawProcessingRequest, SolidProcessingModeGate, SolidT, SurfaceProcessingContextT, SurfaceProcessingModeGate, SurfaceProcessingModeGateTemplate, SurfaceT, SurfaceUVUnwrappingGroupTemplate, VolumeProcessingContextT, VolumeProcessingInstanceT, VolumeProcessingT, VolumeProcessorT, VolumeSolidProcessingContextT, VolumeSolidProcessorT, VolumeSurfaceProcessingContextT, VolumeSurfaceProcessorT } from "./types.js"
import { Component } from "./component.js"
import { ComponentData } from "./data.js"
import { StorageService } from "../storage/index.js"
import { MultiObjectsInfluencesGroupKindsTemplate } from "../fields/multi-objects.js"
import { makeClone } from "../utils/cloneable.js"
import { WithEncapsulating } from "../paradigm/trees/encapsulating.js"

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
        new processing.processors.RangeGateProcessor<SurfaceProcessingModeGate, RawProcessingMode, SurfaceT & WithEncapsulating<VolumeProcessingT>, VolumeSurfaceProcessingContextT>(
            surfaces.measuring.SurfaceWithSurfaceAreaProcessor.instance as any,
            [RawProcessingMode.Full]
        ),
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new processing.processors.ParallelizingProcessor(
            surfaces.SurfaceSamplesParallelizer,
            new fields.vectorized.processors.FieldPointVectorMultiObjectsNormalizingProcessor(
                MultiObjectsInfluencesGroupKindsTemplate,
                InfluenceGroupTemplate
            ) as any
        )
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new processing.processors.RangeGateProcessor<SurfaceProcessingModeGate, RawProcessingMode, SurfaceT & WithEncapsulating<VolumeProcessingT>, VolumeSurfaceProcessingContextT>(
                new surfaces.UVunwrapping.SurfaceUVUnwrappingProcessor(
                "xAtlas",
                SurfaceUVUnwrappingGroupTemplate,
                <surfaces.UVunwrapping.algorithms.XAtlasOptions>{
                    maxIterations: 0
                }
            ) as unknown as VolumeSurfaceProcessorT,
            [RawProcessingMode.RTMesh]
        ),
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new processing.processors.RangeGateProcessor<SurfaceProcessingModeGate, RawProcessingMode, SurfaceT & WithEncapsulating<VolumeProcessingT>, VolumeSurfaceProcessingContextT>(
                new surfaces.UVunwrapping.SurfaceUVUnwrappingProcessor(
                "xAtlas",
                SurfaceUVUnwrappingGroupTemplate,
            ) as unknown as VolumeSurfaceProcessorT,
            [RawProcessingMode.TexturedMesh, RawProcessingMode.Full]
        ),
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new processing.processors.RangeGateProcessor<SurfaceProcessingModeGate, RawProcessingMode, SurfaceT & WithEncapsulating<VolumeProcessingT>, VolumeSurfaceProcessingContextT>(
            new surfaces.texturing.SurfaceWithInfluencesTextureUsingSurfaceUVUnwrappingProcessor(
            ) as unknown as VolumeSurfaceProcessorT,
            [RawProcessingMode.TexturedMesh, RawProcessingMode.Full]
        ),
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new processing.processors.RangeGateProcessor<SurfaceProcessingModeGate, RawProcessingMode, SurfaceT & WithEncapsulating<VolumeProcessingT>, VolumeSurfaceProcessingContextT>(
            new surfaces.texturing.SurfaceWithIndividualInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor(
                InterpolatingGroupsKindsTemplate
            ) as unknown as VolumeSurfaceProcessorT,
            [RawProcessingMode.TexturedMesh, RawProcessingMode.Full]
        ),
    ),
    solids.processors.VolumeSurfaceSolidificationProcessor.instance,
    new processing.processors.ParallelizingProcessor(
        solids.VolumeSolidsParallelizer,
        new processing.processors.RangeGateProcessor<SolidProcessingModeGate, RawProcessingMode, SolidT & WithEncapsulating<VolumeProcessingT>, VolumeSolidProcessingContextT>(
            solids.processors.SolidWithEnclosingVolumeProcessor.instance as VolumeSolidProcessorT,
            [RawProcessingMode.Full]
        ),
    ),
    new processing.processors.ParallelizingProcessor(
        surfaces.VolumeSurfacesParallelizer,
        new processing.processors.RangeGateProcessor<SurfaceProcessingModeGate, RawProcessingMode, SurfaceT & WithEncapsulating<VolumeProcessingT>, VolumeSurfaceProcessingContextT>(
            ///@ts-ignore
            textures.TextureableProcessor.instance as VolumeSurfaceProcessorT,
            [RawProcessingMode.RTMesh, RawProcessingMode.TexturedMesh, RawProcessingMode.Full]
        )
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
            RawProcessingRequest,
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