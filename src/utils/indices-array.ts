import { TypedArray, TypedArrayConstructor, isNumberTypedArray, typedArrayConstructor } from "./typed-array.js"

export type IndicesTypedArray = Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array
export type IndicesArray = IndicesTypedArray | number[]

export const indicesArrayType = (rangeSize: number): TypedArrayConstructor<number, IndicesTypedArray> =>
    rangeSize < (2 ** 8) ? Uint8Array :
        rangeSize < (2 ** 16) ? Uint16Array :
            Uint32Array

export function invalidIndex<IndicesT extends IndicesTypedArray>(indices: IndicesT | TypedArrayConstructor<number, IndicesT>): number {
    return new (typedArrayConstructor<number>(indices))([-1])[0]
}

export function sumIndexed<T extends number | bigint, TArray extends TypedArray<T> = TypedArray<T>>(array: TArray, indices: IndicesTypedArray): T {
    let index: number
    const index_invalid = invalidIndex(indices)

    if (isNumberTypedArray(array)) {
        let sum: number = 0
        for (let i = 0; i < indices.length; i++) {
            index = indices[i]
            if (index === index_invalid) continue

            sum += <number>array[index]
        }
        return <T>sum
    }
    else {
        let sum: bigint = 0n
        for (let i = 0; i < indices.length; i++) {
            index = indices[i]
            if (index === index_invalid) continue

            sum += <bigint>array[index]
        }
        return <T>sum
    }
}

export function sumIndexedDeltas<T extends number | bigint, OffsetsT extends TypedArray<T>>(offsets: OffsetsT, indices: IndicesTypedArray): T {
    let index: number
    const index_invalid = invalidIndex(indices)
    
    if (isNumberTypedArray(offsets)) {
        let sum: number = 0
        for (let i = 0; i < indices.length; i++) {
            index = indices[i]
            if (index === index_invalid) continue

            sum += (<number>offsets[index] - ((index > 0) ? <number>offsets[index - 1] : 0))
        }
        return <T>sum
    }
    else {
        let sum: bigint = 0n
        for (let i = 0; i < indices.length; i++) {
            index = indices[i]
            if (index === index_invalid) continue
            
            sum += (<bigint>offsets[index] - ((index > 0) ? <bigint>offsets[index - 1] : 0n))
        }
        return <T>sum
    }
}