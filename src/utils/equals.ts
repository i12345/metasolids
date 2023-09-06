export const equals = Symbol("equals")

export interface Equalable<T> {
    [equals](that: T): boolean
}