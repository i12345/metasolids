import { TypedArray, TypedArrayConstructor } from "../../utils/typed-array.js"
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
        const layer = new this.typedArray(newVoxels) as TypedArrayT
        if (this.fillValue !== undefined)
            layer.fill(this.fillValue as never)
        this.layers.push(layer as any)
        return layer as TypedArrayT & ArrayLike<T>
    }
}