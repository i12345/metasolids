import { OctTreeCellsMask } from "./address.js";
import { TypedArrayOctTree } from "./typed-array.js";

export class OctTreeCellsMaskOctTree
    extends TypedArrayOctTree<OctTreeCellsMask, Uint8Array> {
    constructor() {
        super(Uint8Array, [], OctTreeCellsMask.C0)
    }

    get(layer: number, local_index: number): boolean {
        return OctTreeCellsMaskOctTree.get(this.layers[layer], local_index)
    }

    set(layer: number, local_index: number, value: boolean): void {
        OctTreeCellsMaskOctTree.set(this.layers[layer], local_index, value)
    }

    subdivide(newVoxels: number) {
        return super.subdivide(Math.ceil(newVoxels / 8))
    }

    static get(layer: Uint8Array | Uint8ClampedArray, local_index: number): boolean {
        const local_index_byte = local_index >> 3
        const local_index_bit = local_index & 0x7
        const local_index_mask = 1 << local_index_bit
        return (layer[local_index_byte] & local_index_mask) === local_index_mask
    }

    static set(layer: Uint8Array | Uint8ClampedArray, local_index: number, value: boolean): void {
        const local_index_byte = local_index >> 3
        const local_index_bit = local_index & 0x7
        const local_index_mask = 1 << local_index_bit
        const local_index_mask_inverse = 0xFF ^ local_index_mask
        layer[local_index_byte] = (layer[local_index_byte] & local_index_mask_inverse) | (value ? local_index_mask : 0)
    }
}