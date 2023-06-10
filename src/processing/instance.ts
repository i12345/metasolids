import { Entity } from "playcanvas-extended"
import { PropertyPath, PROPERTYKEY_ALL } from "../paradigm/property-path.js"
import { MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate } from "../paradigm/multi-objects.js"
import { mergeObjects } from "../utils/index.js"
import { StorageService } from "../utils/storage-service.js"

export interface Instance<SharedT> {
    /**
     * The processing this instance is based on
     */
    shared: SharedT

    /**
     * The entity this instance is attached to
     */
    entity: Entity
}

export interface Instancer<
        SharedT,
        InstanceT extends Instance<SharedT> = Instance<SharedT>
    > {
    /**
    //  * The paths in the result processing where shared data is stored.
    //  * 
    //  * These paths will be merged from individual instances.
    //  * 
    //  * Use {@link PROPERTYKEY_ALL} to match multiple items.
    //  * 
    //  * This is the data that will be saved and loaded if processing happened
    //  * offline.
    //  * 
    //  * @example [['surfaces', PROPERTYKEY_ALL, 'renderer']]
    //  */
    // paths: PropertyPath
    
    instantiate(
        shared: SharedT,
        target: Entity
    ): InstanceT

    set_enabled(instance: InstanceT, enabled: boolean): void
}

export class InstancerManager<
        SharedT,
        InstanceT extends Instance<SharedT> = Instance<SharedT>,
        ID = string
    > {
    constructor(
        public readonly instancers: Instancer<SharedT, InstanceT>[],
        public readonly storage: StorageService<ID>
    ) { }
    
    instantiate(shared: SharedT, entity: Entity): InstanceT {
        const instances = this.instancers.map(instancer => instancer.instantiate(shared, entity))
        return mergeObjects(instances)
    }

    set_enabled(instance: InstanceT, enabled: boolean) {
        for(const instancer of this.instancers)
        instancer.set_enabled(instance, enabled)
    }

    load(id: ID): SharedT {
        const buffer = this.storage.read(id)

        //TODO: read about avsc and integrate
    }

    save(id: ID, shared: SharedT): void {
        //TODO: read about avsc and integrate
    }
}

export const InstantiableGroupsKindKey: unique symbol = Symbol('group-kind:instantiable')
export type InstantiableGroupsKinds = {
    [InstantiableGroupsKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const InstantiableSharedGroupsKindsTemplate: InstantiableGroupsKinds = {
    [InstantiableGroupsKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export type ProcessingContextWithInstantiableGroups<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    MultiObjectsGroupsProcessingContext<
        Groups,
        InstantiableGroupsKinds
    >
