import { Entity } from "playcanvas-extended"
import { PropertyPath, PROPERTYKEY_ALL } from "../utils/property-path.js"
import { MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate } from "./multi-objects.js"

export interface Instance<SharedT> {
    /**
     * The processing this instance is based on
     */
    shared: SharedT
}

export interface Instancer<
        SharedT,
        InstanceT extends Instance<SharedT> = Instance<SharedT>
    > {
    /**
     * The path in the result processing where shared data is stored.
     * 
     * Use {@link PROPERTYKEY_ALL} to match multiple items.
     * 
     * This is the data that will be saved and loaded if processing happened
     * offline.
     * 
     * @example ['surfaces', PROPERTYKEY_ALL, 'renderer']
     */
    path: PropertyPath
    
    instantiate(
        shared: SharedT,
        target: Entity
    ): InstanceT
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
