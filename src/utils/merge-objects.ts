// import { Vector } from "../fields/point.js"
import { Reflect_entries } from "./reflect-entries.js"

export function mergeObjects<T extends object = object>(objs: T[]): T {
    if (objs.length === 0) return undefined! as T
    else if (objs.length === 1) return objs[0]

    // Consider carefully if this is valid

    if (objs[0] instanceof Array) {
        const arrays = objs as any[][]
        const length = arrays[0].length

        if (!arrays.every(array => array.length === length))
            throw new Error("cannot merge arrays of different lengths")
        
        // normal merge logic finishes merge
    }

    // if (objs[0] instanceof Array)
    //     return objs.flat() as T
    // else if (
    //     objs[0] instanceof Int8Array ||
    //     objs[0] instanceof Uint8Array ||
    //     objs[0] instanceof Uint8ClampedArray ||
    //     objs[0] instanceof Int16Array ||
    //     objs[0] instanceof Uint16Array ||
    //     objs[0] instanceof Int32Array ||
    //     objs[0] instanceof Uint32Array ||
    //     objs[0] instanceof Float32Array ||
    //     objs[0] instanceof Float64Array) {
    //     const concatenated = new Float64Array(objs.reduce((acc, array) => acc + (<Vector>array).length, 0))
    //     let offset = 0
    //     for (let i = 0; i < objs.length; i++) {
    //         const vector = <Vector>objs[i]
    //         for (let j = 0; j < vector.length; j++)
    //             concatenated[offset++] = vector[j]
    //     }
    //     return concatenated as T
    // }

    const key_values: Record<PropertyKey, any[]> = {}

    for (let i = 0; i < objs.length; i++) {
        const obj = objs[i]

        for (const [key, obj_value] of Reflect_entries(obj)) {
            key_values[key] ??= []
            key_values[key].push(obj_value)
        }
    }

    const result: any = {}
    for (const [key, values] of Reflect_entries(key_values))
        result[key] = mergeObjects(values)

    return result
}