import { AppBase, ComponentSystem, Entity } from "playcanvas-extended"
import { processors, solids, surfaces, volumes } from "../index.js"
import { VolumeComponent } from "./component.js"
import { VolumeComponentData } from "./data.js"
import { GroupsKindsMappedGroupsTemplate, GroupsKindsTemplate, InterpolatingGroupsTemplate, SurfaceCombinedTextureLocationGroupTemplate, VolumeProcessorT, VolumeSolidProcessorT, VolumeSurfaceProcessorT } from "./types.js"

export class VolumeComponentSystem extends ComponentSystem {
    id: 'volume'
    ComponentType: typeof VolumeComponent
    DataType: typeof VolumeComponentData
    
    readonly processors: VolumeProcessorT[] = [
        new volumes.VolumeSamplingProcessor(),
        new surfaces.VolumeSurfaceMeshingProcessor(),
        new processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new surfaces.SurfaceWithSurfaceAreaProcessor()
        ),
        new processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new surfaces.SurfaceUVUnwrappingProcessor(
                "conformalLeastSquares",
                SurfaceCombinedTextureLocationGroupTemplate
            ) as VolumeSurfaceProcessorT
        ),
        new processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new surfaces.SurfaceWithIndividualInterpolatingValueTexturesProcessor(
                undefined,
                InterpolatingGroupsTemplate,
                SurfaceCombinedTextureLocationGroupTemplate
            ) as unknown as VolumeSurfaceProcessorT
        ),
        new processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new solids.VolumeSurfaceSolidifyingProcessor() as VolumeSurfaceProcessorT,
        ),
        new processors.ParallelizingProcessor(
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

    initializeComponentData(component: VolumeComponent, data: VolumeComponentData, properties) {
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