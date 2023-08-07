import { TypedArray } from "./typed-array.js";

export class TypedArrayList<
        TypedArrayT extends TypedArray = TypedArray,
        T extends number | bigint = number
    > {
    private readonly blocks: TypedArrayT[] = []
    private _size: number = 0

    get size() {
        return this._size
    }

    set size(size: number) {
        this._size = size
        const blocksNeeded = Math.ceil(size / this.blockSize)
        if (blocksNeeded > this.blocks.length) {
            while (blocksNeeded > this.blocks.length)
                this.blocks.push(new this.internal())
        }
        else if (blocksNeeded < this.blocks.length)
            this.blocks.splice(blocksNeeded, this.blocks.length - blocksNeeded)
    }

    constructor(
        public readonly internal: { new(): TypedArrayT, BYTES_PER_ELEMENT: number },
        size: number = 0,
        // I'm not sure how to best page align this array
        public readonly blockSize = (4096 - 8 - 8) / internal.BYTES_PER_ELEMENT
    ) { 
        this.size = size
    }

    private block(i: number): {
        block: TypedArrayT
        offset: number
    } {
        const offset = i % this.blockSize
        const block_i = Math.floor(i / this.blockSize)
        // while (block_i >= this.blocks.length)
        //     this.blocks.push(new this.internal(this.blockSize))
        const block = this.blocks[block_i]
        return { block, offset }
    }

    get(i: number): T {
        const { block, offset } = this.block(i)
        return block[offset] as T
    }

    set(i: number, value: T) {
        const { block, offset } = this.block(i)
        block[offset] = value
    }
}