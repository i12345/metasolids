// import { Vector } from "../fields/point.js"
import { Reflect_entries } from "./reflect-entries.js"

export function mergeObjects<T extends object = object>(objs: T[]): T {
    if(objs.length === 0) return undefined! as T
    const result = {} as T

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

    for (let i = 1; i < objs.length; i++) {
        const obj = objs[i]

        for (const [key, obj_value] of Reflect_entries(obj)) {
            if (!(key in result))
                result[key] = obj_value
            else {
                const result_value = result[key]
                if (result_value !== obj_value) {
                    if (typeof result_value !== 'object' ||
                        typeof obj_value !== 'object')
                        throw new Error("cannot merge object with literal")
                    if (result_value === null ||
                        obj_value === null)
                        throw new Error("Cannot merge object with null")
                    
                    result[key] = mergeObjects([obj_value, result_value])
                }
            }
        }
    }

    return result
}