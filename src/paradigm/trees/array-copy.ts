import { TypedArray } from "../../utils/typed-array.js"
import { MultiObjectsGroupsTemplateOrLeaf, MultiObjectsGroupsOrLeafMapped } from "./multi-objects-groups.js"

export function arrayCopy<
        T extends TypedArray<number>,
        Groups extends MultiObjectsGroupsTemplateOrLeaf,
        Dst extends MultiObjectsGroupsOrLeafMapped<Groups, T> = MultiObjectsGroupsOrLeafMapped<Groups, T>
    >(
        src: MultiObjectsGroupsOrLeafMapped<Groups, T | number[]>,
        dst: Dst
    ): Dst {
    if (dst instanceof Array ||
        dst instanceof Uint8Array ||
        dst instanceof Uint8ClampedArray ||
        dst instanceof Int8Array ||
        dst instanceof Uint16Array ||
        dst instanceof Int16Array ||
        dst instanceof Uint32Array ||
        dst instanceof Int32Array ||
        dst instanceof Float32Array ||
        dst instanceof Float64Array) {
        if (src instanceof Array || dst instanceof Array)
            for (let i = 0; i < dst.length; i++)
                dst[i] = src[i]
        else
            dst.set((src as TypedArray<number>).subarray(0, dst.length))
    }
    else {
        for (const key of Reflect.ownKeys(src))
            arrayCopy((src as any)[key], dst[key])
    }

    return dst
}