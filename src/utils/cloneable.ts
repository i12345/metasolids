export const clone = Symbol('clone')

export interface Cloneable {
    [clone](): object
}

export function makeClone(o: any): any {
    if (typeof o !== 'object')
        return o
    const cloneable = o as Cloneable
    return (clone in cloneable) ?
        cloneable[clone]() :
        Object.fromEntries(
            Object.entries(o)
                .map(([k, v]) => [k, makeClone(v)])
        )
}