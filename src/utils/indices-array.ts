export type IndiciesArray = Uint8Array | Uint16Array | Uint32Array | number[]

export const indicesArrayType = (rangeSize: number) =>
    rangeSize < (2 ** 8) ? Uint8Array :
        rangeSize < (2 ** 16) ? Uint16Array :
            Uint32Array