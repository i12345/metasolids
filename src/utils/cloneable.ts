import { Reflect_entries, Reflect_fromEntries } from "./reflect-entries.js"

export const clone = Symbol('clone')

export interface Cloneable {
    [clone](): object
}

export function makeClone<T>(o: T): T {
    if (typeof o !== 'object' || o === null)
        return o
    const cloneable = o as any as Cloneable
    return ((clone in cloneable) ?
        cloneable[clone]() :
        Reflect_fromEntries(
            Reflect_entries(o)
                .map(([k, v]) => [k, makeClone(v)])
        )) as T
}