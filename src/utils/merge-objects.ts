import { Reflect_entries } from "./reflect-entries.js"

export function mergeObjects<T extends object = object>(objs: T[]): T {
    if(objs.length === 0) return undefined! as T
    const result = objs[0]

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