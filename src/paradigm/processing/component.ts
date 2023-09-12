import * as pc from "playcanvas-extended";
import { ComponentSystem } from "./component-system.js";
import { Instance } from "./instance.js";
import { Entity, GraphNode } from "playcanvas-extended";
import { GraphProcessor } from "./processors/graph.js";
import { ProcessingPair } from "./processor.js";
import { extract, pathExists } from "../trees/index.js";

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
    private _shared?: ProcessingPair<SharedT, ContextT>
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
                oldValue: ProcessingPair<SharedT, ContextT> | undefined,
                newValue: ProcessingPair<SharedT, ContextT> | undefined
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
        shared?: ProcessingPair<SharedT, ContextT>
        instance?: InstanceT
    } = new ProcessingObjects(this, {
        id: this._processing_id_changed,
        shared: this._processing_shared_changed,
        instance: this._processing_instance_changed,
    })

    private _root: Component<SharedT, InstanceT, ContextT, ID> = this.findRoot()
    private _makeRoot = false

    get root() {
        return this._root
    }

    get makeRoot() {
        return this._makeRoot
    }

    set makeRoot(makeRoot) {
        this._makeRoot = makeRoot
        this.updateRoot()
    }

    get isRoot() {
        return this.root === this
    }

    constructor(
        system: ComponentSystem<SharedT, InstanceT, ContextT, ID>,
        entity: Entity
    ) {
        super(system, entity)
        this.updateRoot()
    }

    protected abstract initializeProcessingFromRaw(): ProcessingPair<SharedT, ContextT> | undefined

    processFromRaw() {
        this.updateRoot()
        if (!this.isRoot)
            throw new Error("Non-root component cannot process from raw")

        type SystemT = ComponentSystem<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >

        const system = this.system as SystemT

        const raw = this.initializeProcessingFromRaw()
        if (raw === undefined)
            this.processing.shared = undefined
        else {
            const graph = new GraphProcessor(system.processors)
            const initialization = graph.init(raw.context)
            if (!initialization.connections.inputs.every(input => pathExists(raw.item, input)))
                throw new Error("not all inputs defined")

            graph.process(raw.item, raw.context)
            this.processing.shared = raw

            if (this.processing.id)
                system.db.save(this.processing.id, raw)
        }
        
        this.fire('processed')
    }

    /**
     * Creates the instance for the current shared processing.
     */
    instantiate() {
        type SystemT = ComponentSystem<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >

        const system = this.system as SystemT

        if(this.processing.shared)
            this.processing.instance = system.combinedInstancers.instantiate(this.processing.shared.item, this.entity)
        else
            this.processing.instance = undefined
    }

    onEnable(): void {
        this.updateRoot()
        if (!this.isRoot)
            return

        type SystemT = ComponentSystem<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >

        const system = this.system as SystemT

        if (this.processing.instance)
            system.combinedInstancers.set_enabled(this.processing.instance, true)

        this.entity.on('insert', this.entity_inserted, this)
        this.entity.on('inserthierarchy', this.entity_inserted, this)
    }

    onDisable(): void {
        this.updateRoot()
        if (!this.isRoot)
            return

        type SystemT = ComponentSystem<
            SharedT,
            InstanceT,
            ContextT,
            ID
        >

        const system = this.system as SystemT

        if (this.processing.instance)
            system.combinedInstancers.set_enabled(this.processing.instance, false)

        this.entity.off('insert', this.entity_inserted, this)
        this.entity.off('inserthierarchy', this.entity_inserted, this)
    }

    private entity_inserted(parent: Entity) {
        this.updateRoot()
    }

    private async _processing_id_changed(oldValue: ID | undefined, newValue: ID | undefined) {
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
            this.processing.shared = await system.db.load(this.processing.id)
        else
            this.processing.shared = undefined
    }

    private _processing_shared_changed(
        oldValue: ProcessingPair<SharedT, ContextT> | undefined,
        newValue: ProcessingPair<SharedT, ContextT> | undefined
    ) {
        if (!this.isRoot && newValue !== undefined)
            throw new Error("Cannot set processing on non-root component")

        this.instantiate()
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
            system.combinedInstancers.set_enabled(oldValue, false)
        if (newValue)
            system.combinedInstancers.set_enabled(newValue, true)
    }

    protected updateRoot() {
        this._root = undefined!
        this._root = this.findRoot()
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
                if (entity_component && entity_component.root !== undefined)
                    return entity_component.root
            }
        }

        return this
    }
}