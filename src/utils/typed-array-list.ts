import { TypedArray, TypedArrayConstructor, typedArrayConstructor } from "./typed-array.js";

export class TypedArrayList<
        T extends number | bigint = number,
        TypedArrayT extends TypedArray<T> = TypedArray<T>,
    > {
    private readonly blocks: TypedArrayT[] = []
    private _length: number = 0
    private _capacity: number = 0
    private _defaultValue: T | undefined

    get length() {
        return this._length
    }

    set length(length: number) {
        this._length = length
        if (length > this.capacity)
            this.capacity = length
    }

    get capacity() {
        return this._capacity
    }

    set capacity(capacity) {
        if (capacity > this._capacity) {
            const deficit = capacity - this.capacity
            const newBlockSize = Math.max(deficit, this.defaultBlockSize)
            const newBlock = <TypedArrayT>new this.type(newBlockSize)
            this.blocks.push(newBlock)
            if (this.defaultValue !== undefined)
                newBlock.fill(<never>this.defaultValue)
            this._capacity += newBlockSize
        }
        else if (capacity < this._capacity) {
            while (capacity < this._capacity) {
                const excess = capacity - this._capacity
                const currentBlock = this.blocks[this.blocks.length - 1]
                const remove = Math.min(excess, currentBlock.length)

                if (remove === currentBlock.length)
                    this.blocks.splice(this.blocks.length - 1, 1)
                else {
                    const newBlock = <TypedArrayT>new this.type(currentBlock.length - remove)
                    newBlock.set(<any>currentBlock.subarray(0, newBlock.length), 0)
                    this.blocks[this.blocks.length - 1] = newBlock
                }

                this._capacity -= remove
            }
        }
    }

    get defaultValue() {
        return this._defaultValue
    }

    set defaultValue(defaultValue) {
        this._defaultValue = defaultValue
        if (defaultValue !== undefined)
            for (const block of this.blocks)
                block.fill(<never>defaultValue)
    }

    constructor(
        public readonly type: TypedArrayT extends TypedArray<T> ? TypedArrayConstructor<T, TypedArrayT> : never,
        size: number = 0,
        // I'm not sure how to best page align this array
        public readonly defaultBlockSize = (4096 - 8 - 8) / type.BYTES_PER_ELEMENT,
        defaultValue?: T
    ) {
        this._defaultValue = defaultValue
        this.length = size
    }

    appendBlock(block: TypedArrayT, lengthUsed = block.length) {
        if (lengthUsed > block.length)
            throw new RangeError("length used must be <= length added")

        this.capacity = this.length
        
        this._capacity += block.length
        this._length += lengthUsed
        this.blocks.push(block)

        return this
    }

    private block(i: number): {
        block: TypedArrayT
        offset: number
    } {
        const blocks = this.blocks
        let block_i = 0

        while (block_i < blocks.length && blocks[block_i].length <= i) {
            i -= blocks[block_i].length
            block_i++
        }

        return {
            block: blocks[block_i],
            offset: i
        }
    }

    get(i: number): T {
        if (i >= this._length)
            throw new Error("out of bounds")

        const { block, offset } = this.block(i)
        return block[offset] as T
    }

    set(i: number, value: T) {
        if (i >= this._length)
            this.length = i + 1

        const { block, offset } = this.block(i)
        block[offset] = value
    }

    trim() {
        this.capacity = this.length
    }

    clone() {
        const result = new TypedArrayList<T, TypedArrayT>(this.type, 0, this.defaultBlockSize, this.defaultValue)
        const array = this.arrayView(false)
        return result.appendBlock(array)
    }

    arrayView(canReferenceForSingleBlock: boolean = true): TypedArrayT {
        if (canReferenceForSingleBlock && this.blocks.length === 1)
            return this.blocks[0]

        const result = <TypedArrayT>new this.type(this.length)
        let offset = 0

        for (const block of this.blocks) {
            const write = Math.min(result.length - offset, block.length)
            if (write < 0)
                throw new Error()

            const block_src = (write === block.length) ? block : block.subarray(0, write)
            const block_dst = result.subarray(offset, offset + write)
            block_dst.set(<any>block_src)

            offset += write
        }

        return result
    }

    static from<T extends number | bigint, TypedArrayT extends TypedArray<T>>(array: TypedArrayT): TypedArrayList<T, TypedArrayT> {
        const list = new TypedArrayList<T, TypedArrayT>(<any>typedArrayConstructor(array))
        list._capacity = list._length = array.length
        list.blocks.push(array)

        return list
    }
}