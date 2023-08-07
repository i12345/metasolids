import { TypedArrayConstructor } from "./typed-array.js"

export type IndicesTypedArray = Uint8Array | Uint16Array | Uint32Array
export type IndicesArray = IndicesTypedArray | number[]

export const indicesArrayType = (rangeSize: number): TypedArrayConstructor<number, IndicesTypedArray> =>
    rangeSize < (2 ** 8) ? Uint8Array :
        rangeSize < (2 ** 16) ? Uint16Array :
            Uint32Array