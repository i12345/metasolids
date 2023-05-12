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
        Object.fromEntries(
            Object.entries(o)
                .map(([k, v]) => [k, makeClone(v)])
        )) as T
}