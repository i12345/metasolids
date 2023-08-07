import { Entity } from "playcanvas-extended"
import { MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate } from "../trees/index.js"
import { mergeObjects } from "../../utils/index.js"

export interface Instance<SharedT> {
    /**
     * The processing this instance is based on
     */
    shared: SharedT
    //TODO: should this be replaced with a ProcessingPair<SharedT, ContextT>?

    /**
     * The entity this instance is attached to
     */
    entity: Entity
}

export interface Instancer<
        SharedT,
        InstanceT extends Instance<SharedT> = Instance<SharedT>
    > {
    instantiate(
        shared: SharedT,
        entity: Entity
    ): InstanceT

    set_enabled(instance: InstanceT, enabled: boolean): void
}

export class MultiInstancer<
        SharedT,
        InstanceT extends Instance<SharedT> = Instance<SharedT>
    > implements
    Instancer<SharedT, InstanceT> {
    constructor(public readonly instancers: Instancer<SharedT, InstanceT>[]) { }

    instantiate(shared: SharedT, entity: Entity): InstanceT {
        const instances = this.instancers.map(instancer => instancer.instantiate(shared, entity))
        return mergeObjects(instances)
    }

    set_enabled(instance: InstanceT, enabled: boolean): void {
        for (const instancer of this.instancers)
            instancer.set_enabled(instance, enabled)
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
