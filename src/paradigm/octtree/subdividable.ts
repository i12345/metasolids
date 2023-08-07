import { MultiObjectsGroupsTemplateOrLeaf, MultiObjectsGroupsOrLeafMapped, MultiObjectsGroupsTemplateLeaf } from "../trees/multi-objects-groups.js"
import { OctTree } from "./octtree.js"

export interface Subdividable<
        Groups extends MultiObjectsGroupsTemplateOrLeaf,
        T = any,
        TGrouped extends MultiObjectsGroupsOrLeafMapped<Groups, T> = MultiObjectsGroupsOrLeafMapped<Groups, T>,
        Layer extends ArrayLike<T> = ArrayLike<T>,
        LayersGrouped extends MultiObjectsGroupsOrLeafMapped<Groups, Layer> = MultiObjectsGroupsOrLeafMapped<Groups, Layer>
    > {
    subdivide(newVoxels: number): LayersGrouped
}

export class SubdividableOctTree<
        T = any,
        Layer extends ArrayLike<T> = T[]
    >
    extends OctTree<T, Layer>
    implements Subdividable<MultiObjectsGroupsTemplateLeaf, T, T, Layer, Layer> {
    subdivide(newVoxels: number): Layer {
        const newLayer = new Array<T>(newVoxels) as unknown as Layer
        this.layers.push(newLayer)
        return newLayer
    }
}