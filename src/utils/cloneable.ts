export const clone = Symbol('clone')

export interface Cloneable {
    [clone](): object
}