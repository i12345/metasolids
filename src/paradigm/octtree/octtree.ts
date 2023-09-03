export type LayerLocalIndex = {
    layer: number
    local_index: number
}

export class OctTree<
        T = any,
        Layer extends ArrayLike<T> = ArrayLike<T>
    > {
    get depth() {
        return this.layers.length - 1
    }

    constructor(
        public readonly layers: Layer[] = []
    ) { }
}