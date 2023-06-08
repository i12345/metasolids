import { AppBase, ComponentSystem, Entity } from "playcanvas-extended"
import { fields, paradigm, solids, surfaces, volumes } from "../index.js"
import { VolumeComponent } from "./component.js"
import { VolumeComponentData } from "./data.js"
import { InterpolatingGroupsKindsTemplate, InterpolatingGroupsTemplate, SampleProcessingContextT, SampleT, VolumeProcessorT, VolumeSolidProcessorT, VolumeSurfaceProcessorT } from "./types.js"

export class VolumeComponentSystem extends ComponentSystem {
    id: 'volume'
    ComponentType: typeof VolumeComponent
    DataType: typeof VolumeComponentData
    
    readonly processors: VolumeProcessorT[] = [
        new volumes.VolumeSamplingProcessor(),
        new surfaces.meshing.VolumeSurfaceMeshingProcessor(),
        new paradigm.processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new surfaces.measuring.SurfaceWithSurfaceAreaProcessor()
        ),
        new paradigm.processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new paradigm.processors.ParallelizingProcessor(
                surfaces.SurfaceSampleParallelizer.instance,
                new fields.MultiObjectsInfluencesNormalizingProcessor() as any
            ) as unknown as VolumeSurfaceProcessorT
        ),
        new paradigm.processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new surfaces.UVunwrapping.SurfaceUVUnwrappingProcessor(
                "xAtlas"
            ) as VolumeSurfaceProcessorT
        ),
        new paradigm.processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new surfaces.texturing.SurfaceWithObjectsInterpolatingValueTexturesUsingSurfaceUVUnwrappingProcessor(
                InterpolatingGroupsKindsTemplate
            ) as unknown as VolumeSurfaceProcessorT
        ),
        new paradigm.processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new surfaces.rendering.SurfaceWithRenderingProcessor(this.app) as unknown as VolumeSurfaceProcessorT
        ),
        new paradigm.processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new solids.VolumeSurfaceSolidifyingProcessor() as VolumeSurfaceProcessorT,
        ),
        new paradigm.processors.ParallelizingProcessor(
            solids.VolumeSolidsParallelizer.instance,
            new solids.SolidWithEnclosingVolumeProcessor() as VolumeSolidProcessorT
        ),
    ]

    constructor(app: AppBase) {
        super(app)

        this.id = 'volume'

        this.ComponentType = VolumeComponent
        this.DataType = VolumeComponentData;

        this.on('beforeremove', this._onBeforeRemove, this);
    }

    initializeComponentData(component: VolumeComponent, data: VolumeComponentData, properties: any) {
        component.enabled = data.hasOwnProperty('enabled') ? !!data.enabled : true;
    }

    cloneComponent(entity: Entity, clone: Entity) {
        throw new Error('not implemented')

        const component = entity.findComponent('volume') as VolumeComponent
        
        const data: VolumeComponentData = {
            enabled: component.enabled
        };

        return this.addComponent(clone, data);
    }

    private _onBeforeRemove(entity: Entity, component: VolumeComponent) {
        //TODO: is this already handled?
        component.fire('remove');
    }
}