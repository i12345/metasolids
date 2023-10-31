import { typedArrayClone } from "./typed-array.js"

export interface SkipConfig {
    /** 0 = valid, 1 = skip */
    skip: Uint8Array

    /** number non-skipped elements */
    n_elements: number

    /** start (inclusive) */
    start: number
    
    /** end (exclusive) */
    end: number
}

export function cloneSkip(skip?: SkipConfig): SkipConfig | undefined {
    if (!skip) return undefined
    
    return {
        start: skip.start,
        end: skip.end,
        n_elements: skip.n_elements,
        skip: typedArrayClone(skip.skip)
    }
}