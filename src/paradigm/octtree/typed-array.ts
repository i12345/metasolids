import { isIndicesTypedArray } from "../arrays/indices-array.js"
import { TypedArray, TypedArrayConstructor } from "../arrays/typed-array.js"
import { SubdividableOctTree } from "./subdividable.js"

export class TypedArrayOctTree<
        T extends number | bigint = number | bigint,
        TypedArrayT extends TypedArray<T> = TypedArray<T>
    > extends SubdividableOctTree<
        T,
        TypedArrayT & ArrayLike<T> //extends ArrayLike<T> ? TypedArrayT : ArrayLike<T>
    > {
    constructor(
        public readonly typedArray: TypedArrayConstructor<T, TypedArrayT>,
        layers: TypedArrayT[] = [],
        public readonly fillValue?: T
    ) {
        super(layers as any)
    }

    subdivide(newVoxels: number) {
        let layer: TypedArrayT
        if (this.fillValue && isIndicesTypedArray(this.typedArray)) {
            const buffer = Buffer.alloc(this.typedArray.BYTES_PER_ELEMENT * newVoxels, <number>this.fillValue)
            layer = <TypedArrayT>new this.typedArray(buffer.buffer, 0, newVoxels)
        }
        else {
            layer = new this.typedArray(newVoxels) as TypedArrayT
            if (this.fillValue !== undefined)
                layer.fill(this.fillValue as never)
        }
        this.layers.push(layer as any)
        return layer as TypedArrayT & ArrayLike<T>
    }
}