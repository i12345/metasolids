import { IndicesTypedArray } from "../../utils/indices-array.js"
import { TypedArrayConstructor } from "../../utils/typed-array.js"
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../trees/multi-objects-groups.js"
import { Subdividable } from "./subdividable.js"
import { TypedArrayOctTree } from "./typed-array.js"

export type OctTreeReferencesOctTreeGroups = {
    layers: MultiObjectsGroupsTemplateLeaf
    localIndices: MultiObjectsGroupsTemplateLeaf
}

export const OctTreeReferencesOctTreeGroupsTemplate: OctTreeReferencesOctTreeGroups = {
    layers: MultiObjectsGroupsTemplate_Leaf,
    localIndices: MultiObjectsGroupsTemplate_Leaf
}

export type OctTreeReferencesOctTreeValue = number
export type OctTreeReferencesOctTreeValuesGrouped = {
    layers: number
    localIndices: number
}
export type OctTreeReferencesOctTreeLayer<IndicesT extends IndicesTypedArray = IndicesTypedArray> = Uint8Array | IndicesT
export type OctTreeReferencesOctTreeLayersGrouped<IndicesT extends IndicesTypedArray = IndicesTypedArray> = {
    layers: Uint8Array
    localIndices: IndicesT
}
export type OctTreeReferencesOctTreesGrouped<IndicesT extends IndicesTypedArray = IndicesTypedArray> = {
    layers: TypedArrayOctTree<number, Uint8Array>
    localIndices: TypedArrayOctTree<number, IndicesT>
}

export class OctTreeReferences<IndicesT extends IndicesTypedArray = IndicesTypedArray>
    implements
    OctTreeReferencesOctTreesGrouped<IndicesT>,
    Subdividable<
            OctTreeReferencesOctTreeGroups,
            OctTreeReferencesOctTreeValue,
            OctTreeReferencesOctTreeValuesGrouped,
            OctTreeReferencesOctTreeLayer,
            OctTreeReferencesOctTreeLayersGrouped
        > {
    readonly layers = new TypedArrayOctTree<number, Uint8Array>(Uint8Array, [], 255)
    readonly localIndices = new TypedArrayOctTree<number, IndicesT>(this.typedArray, [], new this.typedArray([-1])[0])
    
    constructor(public readonly typedArray: TypedArrayConstructor<number, IndicesT>) { }
    
    subdivide(newVoxels: number) {
        return {
            layers: this.layers.subdivide(newVoxels),
            localIndices: this.localIndices.subdivide(newVoxels)
        }
    }
}