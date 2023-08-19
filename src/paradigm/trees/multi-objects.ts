import { IndicesTypedArray } from '../../utils/indices-array.js';
import { TypedArrayConstructor } from '../../utils/typed-array.js';
import { PropertyPath } from './path.js'
import { pathsToNodeWithKey, intract, leavesByValue, iterTreeByLeavesValue, pathsToValue, makeLeafInterface } from "./tree.js";

export const MultiObjectsTemplate_Leaf = Symbol("object")
export type MultiObjectsTemplate = {
    [key: PropertyKey]:
        MultiObjectsTemplate |
        typeof MultiObjectsTemplate_Leaf
}

export type MultiObjectsMapped<
        Objects extends MultiObjectsTemplate,
        T,
    > = {
    [K in keyof Objects]:
        Objects[K] extends MultiObjectsTemplate ?
            MultiObjectsMapped<Objects[K], T> :
            T
}

export interface MultiObjectsIDs<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray
    > {
    IDsType: TypedArrayConstructor<number, ObjIDsT>
    template: Objects
    IDs: MultiObjectsMapped<Objects, number>
    paths: PropertyPath[]
}

export const MultiObjectsCombinedValue = Symbol("combined")

export type MultiObjectsCombined<Combined> =
    { [MultiObjectsCombinedValue]?: Combined }

export type MultiObjectsMappedAndCombined<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        T = any,
        Combined = T
    > =
    MultiObjectsCombined<Combined> &
    MultiObjectsMapped<Objects, T>

export const objectValuePaths = <
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    >(objects: Objects): Generator<PropertyPath> =>
    pathsToValue(objects as any, MultiObjectsTemplate_Leaf)

export const objectValues = <
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    >(objects: Objects) => 
    leavesByValue(objects as any, MultiObjectsTemplate_Leaf)

export const iterObjects = <
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        T = any
    > (
        values: MultiObjectsMapped<Objects, T>,
        template: Objects,
        action: (o: any, key: PropertyKey, fullpath: PropertyPath) => void
    ) =>
    iterTreeByLeavesValue(values, template, MultiObjectsTemplate_Leaf, action)