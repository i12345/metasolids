import { AppBase, Entity } from "playcanvas-extended";
import * as pc from "playcanvas-extended"
import { Component, ComponentData } from "./component.js";
import { Instance, Instancer, MultiInstancer } from "./instance.js";
import { StorageService, DB, StoredDB } from "../../storage/index.js";
import { ProcessingPair, Processor } from "./processor.js";

const _schema = ['enabled']


//TODO: separate SharedT from ProcessingT

export class ComponentSystem<
        SharedT,
        InstanceT extends Instance<SharedT> = Instance<SharedT>,
        ContextT = any,
        ID = string,
        ComponentT extends
            Component<
                    SharedT,
                    InstanceT,
                    ContextT,
                    ID
                > =
            Component<
                    SharedT,
                    InstanceT,
                    ContextT,
                    ID
                >,
        ComponentDataT extends
            ComponentData<ID> =
            ComponentData<ID>
    > extends pc.ComponentSystem {
    readonly db: DB<ProcessingPair<SharedT, ContextT>, ID>
    readonly combinedInstancers: MultiInstancer<SharedT, InstanceT>

    constructor(
        app: AppBase,
        public readonly id: string,
        public readonly ComponentType: typeof Component,
        public readonly DataType: typeof ComponentData,
        public readonly processors: Processor<SharedT, ContextT>[],
        public readonly instancers: Instancer<SharedT, InstanceT>[],
        public readonly storage: StorageService<ID>
    ) {
        super(app)

        this.db = new StoredDB(storage)
        this.combinedInstancers = new MultiInstancer(instancers)

        this.schema = _schema

        this.on('beforeremove', this._onBeforeRemove, this);
    }

    initializeComponentData(component: ComponentT, data: ComponentDataT, properties: any) {
        component.enabled = data.hasOwnProperty('enabled') ? !!data.enabled : true;
        component.makeRoot = data.makeRoot
        component.processing.id = data.id
    }

    cloneComponent(entity: Entity, clone: Entity) {
        const component = entity.c[this.id] as ComponentT

        const data: ComponentData<ID> = {
            enabled: component.enabled,
            makeRoot: component.makeRoot,
            id: component.processing.id
        }

        return this.addComponent(clone, data)
    }

    protected _onBeforeRemove(entity: Entity, component: ComponentT) {
        if (component.processing.instance)
            this.combinedInstancers.set_enabled(component.processing.instance, false)

        component.fire('remove')
    }
}

pc.Component._buildAccessors(Component, _schema)
