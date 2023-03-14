import { AppBase, ComponentSystem, Entity } from "playcanvas-extended"
import { MultiObjectsGroupsTemplate, MultiObjectsGroupsKindsTemplate } from "../fields/multi-objects-fields-point.js"
import { solids, surfaces, volumes } from "../index.js"
import { VolumeProcessor } from "../volumes/processor.js"
import { VolumeComponent } from "./component.js"
import { VolumeComponentData } from "./data.js"

export class VolumeComponentSystem extends ComponentSystem {
    id: 'volume'
    ComponentType: typeof VolumeComponent
    DataType: typeof VolumeComponentData
    
    processors: VolumeProcessor[] = [
        new volumes.VolumeSamplingProcessor(),
        new surfaces.VolumeSurfaceMeshingProcessor(),
        // new solids.SolidWithEnclosingVolumeProcessor(),
    ]
    multiObj: {
        groupKinds: MultiObjectsGroupsKindsTemplate,
        groups: MultiObjectsGroupsTemplate
    }

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