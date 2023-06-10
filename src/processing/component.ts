import * as pc from "playcanvas-extended";
import { ComponentSystem } from "./component-system.js";
import { Instance } from "./instance.js";
import { Entity, GraphNode } from "playcanvas-extended";
import { GraphProcessor } from "./processors/graph.js";

export class ComponentData<ID = string> {
    enabled = true
    makeRoot = false
    id?: ID
}

class ProcessingObjects<
        SharedT,
        InstanceT extends Instance<SharedT> = Instance<SharedT>,
        ContextT = any,
        ID = string
    > {
    private _id?: ID
    private _shared?: SharedT
    private _instance?: InstanceT

    get id() {
        return this._id
    }

    set id(id) {
        const oldValue = this._id
        const newValue = this._id = id
        if (oldValue !== newValue)
            this.change_handlers.id.call(this.component, oldValue, newValue)
    }

    get shared() {
        return this._shared
    }

    set shared(shared) {
        const oldValue = this._shared
        const newValue = this._shared = shared
        if (oldValue !== newValue)
            this.change_handlers.shared.call(this.component, oldValue, newValue)
    }

    get instance() {
        return this._instance
    }

    set instance(instance) {
        const oldValue = this._instance
        const newValue = this._instance = instance
        if(oldValue !== newValue)
        this.change_handlers.instance.call(this.component, oldValue, newValue)
    }

    constructor(
        private readonly component: Component<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >,
        private readonly change_handlers: {
            id: (
                this: Component<
                        SharedT,
                        InstanceT,
                        ContextT,
                        ID
                    >,
                oldValue: ID | undefined,
                newValue: ID | undefined
            ) => void,
            shared: (
                this: Component<
                        SharedT,
                        InstanceT,
                        ContextT,
                        ID
                    >,
                oldValue: SharedT | undefined,
                newValue: SharedT | undefined
            ) => void,
            instance: (
                this: Component<
                        SharedT,
                        InstanceT,
                        ContextT,
                        ID
                    >,
                oldValue: InstanceT | undefined,
                newValue: InstanceT | undefined
            ) => void,
        }
    ) { }
}

export abstract class Component<
        SharedT,
        InstanceT extends Instance<SharedT> = Instance<SharedT>,
        ContextT = any,
        ID = string
    > extends pc.Component {
    readonly processing: {
        id?: ID
        shared?: SharedT
        instance?: InstanceT
    } = new ProcessingObjects(this, {
        id: this._processing_id_changed,
        shared: this._processing_shared_changed,
        instance: this._processing_instance_changed,
    })
    
    private _root: Component<SharedT, InstanceT, ContextT, ID>
    private _makeRoot = false

    get root() {
        return this._root
    }

    get makeRoot() {
        return this._makeRoot
    }

    set makeRoot(makeRoot) {
        this._makeRoot = makeRoot
        this._root = this.findRoot()
    }

    get isRoot() {
        return this.root === this
    }

    constructor(
        system: ComponentSystem<SharedT, InstanceT, ContextT, ID>,
        entity: Entity
    ) {
        super(system, entity)

        this._root = this.findRoot()
    }

    protected abstract initializeProcessingFromRaw(): {
        processing: SharedT
        context: ContextT
    }

    processFromRaw() {
        if (!this.isRoot)
            throw new Error("Non-root component cannot process from raw")

        type SystemT = ComponentSystem<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >

        const system = this.system as SystemT

        const { processing, context } = this.initializeProcessingFromRaw()
        const graph = new GraphProcessor(system.processors)
        graph.init(context)
        graph.process(processing, context)
        this.processing.shared = processing

        if (this.processing.id)
            system.instancerManager.save(this.processing.id, processing)
    }

    onEnable(): void {
        if (!this.isRoot)
            throw new Error("Enabling/disabling non-root component has no effect")
        
        type SystemT = ComponentSystem<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >

        const system = this.system as SystemT

        if (this.processing.instance)
            system.instancerManager.set_enabled(this.processing.instance, true)
    }

    onDisable(): void {
        if (!this.isRoot)
            throw new Error("Enabling/disabling non-root component has no effect")
        
        type SystemT = ComponentSystem<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >

        const system = this.system as SystemT

        if (this.processing.instance)
            system.instancerManager.set_enabled(this.processing.instance, false)
    }

    private _processing_id_changed(oldValue: ID | undefined, newValue: ID | undefined) {
        if (!this.isRoot && newValue !== undefined)
            throw new Error("Cannot set processing on non-root component")
        
        type SystemT = ComponentSystem<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >

        const system = this.system as SystemT

        if(this.processing.id)
            this.processing.shared = system.instancerManager.load(this.processing.id)
        else
            this.processing.shared = undefined
    }

    private _processing_shared_changed(oldValue: SharedT | undefined, newValue: SharedT | undefined) {
        if (!this.isRoot && newValue !== undefined)
            throw new Error("Cannot set processing on non-root component")
        
        type SystemT = ComponentSystem<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >

        const system = this.system as SystemT

        if(this.processing.shared)
            this.processing.instance = system.instancerManager.instantiate(this.processing.shared, this.entity)
        else
            this.processing.instance = undefined
    }

    private _processing_instance_changed(oldValue?: InstanceT, newValue?: InstanceT) {
        if (!this.isRoot && newValue !== undefined)
            throw new Error("Cannot set processing on non-root component")

        type SystemT = ComponentSystem<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >

        const system = this.system as SystemT

        if (oldValue)
            system.instancerManager.set_enabled(oldValue, false)
        if (newValue)
            system.instancerManager.set_enabled(newValue, true)
    }

    private findRoot() {
        type SystemT = ComponentSystem<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >

        const system = this.system as SystemT

        if (this.makeRoot)
            return this

        for (let entity: GraphNode = this.entity; entity !== entity.root; entity = entity.parent) {
            if (entity instanceof Entity) {
                const entity_component = entity.c[system.id] as Component<SharedT, InstanceT, ContextT, ID>
                if (entity_component)
                    return entity_component.root
            }
        }

        return this
    }
}