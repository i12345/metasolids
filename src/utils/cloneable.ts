import { Color, Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from "playcanvas-extended"
import { Reflect_entries, Reflect_fromEntries } from "./reflect-entries.js"
import { TypedArray, isTypedArray, typedArrayClone } from "./typed-array.js"

export const clone = Symbol('clone')

export interface Cloneable<T = any> {
    [clone](): T
}

Object.defineProperty(
    Vec2.prototype,
    clone,
    {
        configurable: false,
        enumerable: false,
        writable: false,
        value(this: Vec2) { return this.clone() }
    }
)

Object.defineProperty(
    Vec3.prototype,
    clone,
    {
        configurable: false,
        enumerable: false,
        writable: false,
        value(this: Vec3) { return this.clone() }
    }
)

Object.defineProperty(
    Vec4.prototype,
    clone,
    {
        configurable: false,
        enumerable: false,
        writable: false,
        value(this: Vec4) { return this.clone() }
    }
)

Object.defineProperty(
    Quat.prototype,
    clone,
    {
        configurable: false,
        enumerable: false,
        writable: false,
        value(this: Quat) { return this.clone() }
    }
)

Object.defineProperty(
    Mat3.prototype,
    clone,
    {
        configurable: false,
        enumerable: false,
        writable: false,
        value(this: Mat3) { return this.clone() }
    }
)

Object.defineProperty(
    Mat4.prototype,
    clone,
    {
        configurable: false,
        enumerable: false,
        writable: false,
        value(this: Mat4) { return this.clone() }
    }
)

Object.defineProperty(
    Color.prototype,
    clone,
    {
        configurable: false,
        enumerable: false,
        writable: false,
        value(this: Color) { return this.clone() }
    }
)

export function makeClone<T>(o: T): T {
    if (typeof o !== 'object' || o === null)
        return o
    else if (isTypedArray(o))
        return <T>typedArrayClone(<TypedArray><unknown>o)
    else if (o instanceof Array) {
        const clone = new Array(o.length)
        for (let i = 0; i < o.length; i++)
            clone[i] = makeClone(o[i])
        return <T>clone
    }
    else if (clone in o)
        return (<Cloneable<T>>o)[clone]()
    else {
        return Reflect_fromEntries(
                Reflect_entries(o)
                    .map(([k, v]) => [k, makeClone(v)])
            ) as T
    }
}