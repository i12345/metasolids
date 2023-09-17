import { TypedArray, TypedArrayConstructor } from "./typed-array.js";

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
        if (length > this.capacity) {
            const deficit = length - this.capacity
            const newBlockSize = Math.max(deficit, this.defaultBlockSize)
            this.blocks.push(<TypedArrayT>new this.type(newBlockSize))
        }
    }

    get capacity() {
        return this._capacity
    }

    set capacity(capacity) {
        if (capacity > this._capacity) {
            const newBlock = <TypedArrayT>new this.type(capacity - this._capacity)
            this.blocks.push(newBlock)
            if (this.defaultValue !== undefined)
                newBlock.fill(<never>this.defaultValue)
        }
        else if (capacity < this._capacity) {
            while (capacity < this._capacity) {
                const excess = capacity - this._capacity
                const currentBlock = this.blocks[this.blocks.length - 1]
                const remove = Math.min(excess, currentBlock.length)

                if (remove === currentBlock.length)
                    this.blocks.splice(this.blocks.length - 1, 1)
                else
                    this.blocks[this.blocks.length - 1] = <TypedArrayT>currentBlock.slice(0, currentBlock.length - remove)

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

        // if (block_i === blocks.length)
        //     this.capacity += this.defaultBlockSize

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
        result.blocks.push(array)
        result._capacity = result._length = array.length
        return result
    }

    arrayView(canReferenceForSingleBlock: boolean = true): TypedArrayT {
        if (canReferenceForSingleBlock && this.blocks.length === 1)
            return this.blocks[0]

        const result = <TypedArrayT>new this.type(this.length)
        let offset = 0
        for (const block of this.blocks) {
            const write = Math.min(result.length - offset, block.length)
            const blockSource = (write === block.length) ? block : block.subarray(0, write)

            result.subarray(offset, write).set(<any>blockSource)
        }

        return result
    }
}