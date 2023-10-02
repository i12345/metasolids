import { Vec2, Vec3, Vec4, Quat, Mat3, Mat4, Color } from "playcanvas-extended";
import { mat4_from_mat3, trs } from "../utils/matrix.js";
import { MultiObjectsGroup, MultiObjectsGrouped, MultiObjectsGroupedObjectsKey, MultiObjectsMapped, MultiObjectsTemplate, MultiObjectsTemplate_Leaf, PropertyPath, iterObjects } from "../paradigm/trees/index.js";
import { Reflect_entries, Reflect_fromEntries, RemoveEmptyStructs } from "../utils/index.js";

export type Vector = Array<number>
    | Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array
    | Int8Array | Int16Array | Int32Array
    | Float32Array | Float64Array

export type FieldPointPrimitive = number
    | Vec2 | Vec3 | Vec4 | Quat | Mat3 | Mat4
    | Color
    | Vector

export interface FieldsPoint {
    [field: PropertyKey]: FieldPoint
}

export type FieldPointNumbers<Point extends FieldPoint> =
    Point extends number ? number :
    Point extends Vec2 ? { x: number, y: number } :
    Point extends Vec3 ? { x: number, y: number, z: number } :
    Point extends Vec4 ? { x: number, y: number, z: number, w: number } :
    Point extends Quat ? { x: number, y: number, z: number, w: number } :
    Point extends Mat3 ? { r: FieldPointNumbers<Quat>, s: FieldPointNumbers<Vec3> } :
    Point extends Mat4 ? { t: FieldPointNumbers<Vec3>, r: FieldPointNumbers<Quat>, s: FieldPointNumbers<Vec3> } :
    Point extends Color ? { r: number, g: number, b: number, a: number } :
    Point extends Vector ? Vector :
    Point extends FieldsPoint ? { [K in keyof Point]: FieldPointNumbers<Point[K]> } :
    never

export type FieldPointMapped<Point extends FieldPoint, T> =
    Point extends FieldPointPrimitive ? T :
        Point extends FieldsPoint ?
            FieldsPointMapped<Point, T> :
            never

export type FieldsPointMapped<Point extends FieldsPoint, T> = {
    [K in keyof Point]: FieldPointMapped<Point[K], T>
}

export type FieldPointMappedObjectsGroupedRemoved<Point extends FieldPoint, T> =
    Point extends FieldPointPrimitive ? T :
        Point extends FieldsPoint ?
            FieldsPointMapped<Point, T> :
            never

export type FieldsPointMappedObjectsGroupedRemoved<Point extends FieldsPoint, T> =
    Point extends MultiObjectsGroup<infer G extends FieldPoint> ?
        FieldPointMappedObjectsGroupedRemoved<G, T> : {
            [K in keyof Point]: FieldPointMappedObjectsGroupedRemoved<Point[K], T>
        }

export const FieldsPoint_Omit_Leaf = Symbol('omit')
export type FieldsPointOmitted<
        Point extends FieldsPoint,
        Subtract extends FieldsPointMapped<FieldsPoint, typeof FieldsPoint_Omit_Leaf>
    > = FieldsPoint & {
    [K in keyof Point]:
        Subtract[K] extends typeof FieldsPoint_Omit_Leaf ? never :
        Subtract[K] extends FieldsPointMapped<FieldsPoint, typeof FieldsPoint_Omit_Leaf> ?
            (Point[K] extends FieldsPoint ?
            FieldsPointOmitted<Point[K], Subtract[K]> : never) :
        Point[K]
}

export type FieldsPointOptional<Point extends FieldsPoint> = FieldsPoint & {
    [K in keyof Point]?:
        Point[K] extends FieldPointPrimitive ? Point[K] :
        (Point[K] extends FieldsPoint ?
            FieldsPointOptional<Point[K]> : never)
}

// let point: {
//     a: number,
//     b: Vec2,
//     c: {
//         u: number
//         v: Vec3,
//         z: {
//             zz: Quat
//         }
//     }
// }
// let point_opt: FieldsPointOptional<typeof point> = {
//     a: 2,
//     c: {
//         z: {
//         }
//     }
// }
// point_opt.c.z.zz // Quat?

// // Types are preferred to interfaces because
// // types will cast to a FieldsPoint

// interface MyInterface {
//     u: number
//     v: number
//     location: Vec3
// }

// type MyType = {
//     u: number
//     v: number
//     location: Vec3
// }

// let x: FieldsPoint
// let a: MyInterface
// let b: MyType
// let c: { u: number, v: number, location: Vec3 }
// x = a // doesn't work
// x = b // works
// x = c // works

export type FieldPoint = FieldPointPrimitive | FieldsPoint

// export type ExtraFields<
//         Type extends FieldsPoint,
//         Base extends FieldsPoint
//     > =
//     Omit<Type, keyof Base>

type ExtraFields_Recursive<
        Type extends FieldsPoint,
        Base extends FieldsPoint
    > = {
    [K in keyof Type]:
        Type[K] extends FieldsPoint ?
            Base[K] extends FieldsPoint ?
                ExtraFields_Recursive<Type[K], Base[K]> :
                never :
            Base[K] extends FieldPoint ?
                never :
                Type[K]
}

export type ExtraFields<
        Type extends FieldsPoint,
        Base extends FieldsPoint
    > =
    ExtraFields_Recursive<Type, Base>
    // RemoveEmptyStructs<ExtraFields_Recursive<Type, Base>>

// let extraFields_example1!: ExtraFields<
//     {
//         a: number,
//         b: Vec2,
//         c: {
//             u: number,
//             v: number,
//             w: Vec3
//         }
//     },
//     {
//         a: number
//         c: {
//             u: number
//             v: number
//         }
//     }
// >

// extraFields_example1.a // never
// extraFields_example1.b // Vec2
// extraFields_example1.c.u // never
// extraFields_example1.c.v // never
// extraFields_example1.c.w // Vec3

// extraFields_example1 = {
//     b: new Vec2(),
//     c: {
//         w: new Vec3()
//     }
// } as unknown as typeof extraFields_example1

export function field_point_is<Point = any>(p: Point): Point extends FieldPoint ? true : false {
    if (field_point_isPrimitive(p as FieldPoint))
        return true as (Point extends FieldPoint ? true : false)
    else if (typeof p === 'object' && p !== null) {
        for (const key of Reflect.ownKeys(p))
            if (!field_point_is((p as any)[key]))
                return false as (Point extends FieldPoint ? true : false)

        return true as (Point extends FieldPoint ? true : false);
    }

    return false as (Point extends FieldPoint ? true : false)
}

export function field_point_isPrimitive<Point extends FieldPoint = FieldPoint>(p: Point): Point extends FieldPointPrimitive ? true : false {
    if (p instanceof Vec3)
        return true as (Point extends FieldPointPrimitive ? true : false)
    else if (p instanceof Mat4)
        return true as (Point extends FieldPointPrimitive ? true : false)
    else if (typeof p === 'number')
        return true as (Point extends FieldPointPrimitive ? true : false)
    else if (p instanceof Vec2)
        return true as (Point extends FieldPointPrimitive ? true : false)
    else if (p instanceof Vec4)
        return true as (Point extends FieldPointPrimitive ? true : false)
    else if (p instanceof Quat)
        return true as (Point extends FieldPointPrimitive ? true : false)
    else if (p instanceof Mat3)
        return true as (Point extends FieldPointPrimitive ? true : false)
    else if (p instanceof Color)
        return true as (Point extends FieldPointPrimitive ? true : false)
    else if (p instanceof Int8Array ||
        p instanceof Uint8Array ||
        p instanceof Uint8ClampedArray ||
        p instanceof Int16Array ||
        p instanceof Uint16Array ||
        p instanceof Int32Array ||
        p instanceof Uint32Array ||
        p instanceof Float32Array ||
        p instanceof Float64Array ||
        p instanceof Array)
        return true as (Point extends FieldPointPrimitive ? true : false)

    return false as (Point extends FieldPointPrimitive ? true : false)
}

export function field_point_path(
        point: FieldPoint,
        predicate: (point: FieldPoint) => boolean
    ): PropertyPath | undefined {
    if (predicate(point))
        return []
    else if (typeof point === 'object') {
        for (const key of Reflect.ownKeys(point)) {
            const path_key = field_point_path((point as any)[key], predicate)
            if (path_key !== undefined)
                return [key, ...path_key]
        }
    }

    return undefined
}

export const field_point_map =
    <Point extends FieldPoint, T, R>(
        point: FieldPointMapped<Point, T>,
        leafDeterminer: (value: T) => boolean,
        action: (value: T, path: PropertyPath) => R,
        path: PropertyPath = []
    ): FieldPointMapped<Point, R> =>
        leafDeterminer(point as T) ?
            action(point as T, []) as FieldPointMapped<Point, R> :
            Reflect_fromEntries(
                Reflect.ownKeys(point as FieldsPointMapped<FieldsPoint, T>)
                    .map(key => {
                        const value = (point as any)[key]
                        const newpath = [...path, key]
                        if (leafDeterminer(value as T))
                            return [key, action(value as T, newpath)]
                        else return [key, fields_point_map(
                            value as FieldsPointMapped<FieldsPoint, T>,
                            leafDeterminer,
                            action,
                            newpath
                        )]
                    }) as any[]
            )

export const fields_point_map =
    <Point extends FieldsPoint, T, R>(
        point: FieldsPointMapped<Point, T>,
        leafDeterminer: (value: T) => boolean,
        action: (value: T, path: PropertyPath) => R,
        path: PropertyPath = []
    ): FieldsPointMapped<Point, R> =>
        Reflect_fromEntries(
            Reflect.ownKeys(point)
                .map(key => {
                    const value = point[key]
                    const newpath = [...path, key]
                    if (leafDeterminer(value as T))
                        return [key, action(value as T, newpath)]
                    else return [key, fields_point_map(
                        value as FieldsPointMapped<Point, T>,
                        leafDeterminer,
                        action,
                        newpath
                    )]
                }) as any[]
        )

export function field_point_identity<Point extends FieldPoint>(p: Point): Point {
    if (p instanceof Vec3)
        return new Vec3() as Point
    else if (p instanceof Mat4)
        return new Mat4().setIdentity() as Point
    else if (typeof p === 'number')
        return 0 as Point
    else if (p instanceof Vec2)
        return new Vec2() as Point
    else if (p instanceof Vec4)
        return new Vec4() as Point
    else if (p instanceof Quat)
        return new Quat() as Point
    else if (p instanceof Mat3)
        return new Mat3().setIdentity() as Point
    else if (p instanceof Color)
        return new Color() as Point
    else if (p instanceof Uint8Array)
        return new Uint8Array(p.length) as Point
    else if (p instanceof Uint8ClampedArray)
        return new Uint8ClampedArray(p.length) as Point
    else if (p instanceof Int8Array)
        return new Int8Array(p.length) as Point
    else if (p instanceof Uint16Array)
        return new Uint16Array(p.length) as Point
    else if (p instanceof Int16Array)
        return new Int16Array(p.length) as Point
    else if (p instanceof Uint32Array)
        return new Uint32Array(p.length) as Point
    else if (p instanceof Int32Array)
        return new Int32Array(p.length) as Point
    else if (p instanceof Float32Array)
        return new Float32Array(p.length) as Point
    else if (p instanceof Float64Array || p instanceof Array)
        return new Float64Array(p.length) as Point
    else return fields_point_identity(p as FieldsPoint) as Point
}

export function field_point_invalid<Point extends FieldPoint>(p: Point): Point {
    if (p instanceof Vec3)
        return new Vec3(NaN, NaN, NaN) as Point
    else if (p instanceof Mat4)
        return new Mat4().set([NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN]) as Point
    else if (typeof p === 'number')
        return NaN as Point
    else if (p instanceof Vec2)
        return new Vec2(NaN, NaN) as Point
    else if (p instanceof Vec4)
        return new Vec4(NaN, NaN, NaN, NaN) as Point
    else if (p instanceof Quat)
        return new Quat(NaN, NaN, NaN, NaN) as Point
    else if (p instanceof Mat3)
        return new Mat3().set([NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN]) as Point
    else if (p instanceof Color)
        return new Color(NaN, NaN, NaN, NaN) as Point
    else if (p instanceof Uint8Array)
        return new Uint8Array(p.length).fill(0xFF) as Point
    else if (p instanceof Uint8ClampedArray)
        return new Uint8ClampedArray(p.length).fill(0xFF) as Point
    else if (p instanceof Int8Array)
        return new Int8Array(p.length).fill(-1) as Point
    else if (p instanceof Uint16Array)
        return new Uint16Array(p.length).fill(0xFFFF) as Point
    else if (p instanceof Int16Array)
        return new Int16Array(p.length).fill(-1) as Point
    else if (p instanceof Uint32Array)
        return new Uint32Array(p.length).fill(0xFFFFFFFF) as Point
    else if (p instanceof Int32Array)
        return new Int32Array(p.length).fill(-1) as Point
    else if (p instanceof Float32Array)
        return new Float32Array(p.length).fill(NaN) as Point
    else if (p instanceof Float64Array || p instanceof Array)
        return new Float64Array(p.length).fill(NaN) as Point
    else return fields_point_invalid(p as FieldsPoint) as Point
}

export function field_point_clone<Point extends FieldPoint>(p: Point): Point {
    if (p instanceof Vec3)
        return p.clone() as Point
    else if (p instanceof Mat4)
        return p.clone() as Point
    else if (typeof p === 'number')
        return p as Point
    else if (p instanceof Vec2)
        return p.clone() as Point
    else if (p instanceof Vec4)
        return p.clone() as Point
    else if (p instanceof Quat)
        return p.clone() as Point
    else if (p instanceof Mat3)
        return p.clone() as Point
    else if (p instanceof Color)
        return p.clone() as Point
    else if (p instanceof Uint8Array) {
        let newArray = new Uint8Array(p.length)
        newArray.set(p)
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Uint8ClampedArray) {
        let newArray = new Uint8ClampedArray(p.length)
        newArray.set(p)
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Int8Array) {
        let newArray = new Int8Array(p.length)
        newArray.set(p)
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Uint16Array) {
        let newArray = new Uint16Array(p.length)
        newArray.set(p)
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Int16Array) {
        let newArray = new Int16Array(p.length)
        newArray.set(p)
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Uint32Array) {
        let newArray = new Uint32Array(p.length)
        newArray.set(p)
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Int32Array) {
        let newArray = new Int32Array(p.length)
        newArray.set(p)
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Float32Array) {
        let newArray = new Float32Array(p.length)
        newArray.set(p)
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Float64Array || p instanceof Array) {
        let newArray = new Float64Array(p.length)
        newArray.set(p)
        return newArray as FieldPoint as Point
    }
    else {
        return fields_point_clone(p as FieldsPoint) as Point
    }
}

export function field_point_random<Point extends FieldPoint>(p: Point): Point {
    const rnd = Math.random
    const rnd_vec3 = () => new Vec3(rnd(), rnd(), rnd())
    const rnd_quat = () => new Quat().setFromEulerAngles(rnd() * 360, rnd() * 360, rnd() * 360)

    if (p instanceof Vec3)
        return rnd_vec3() as Point
    else if (p instanceof Mat4)
        return new Mat4().setTRS(
            rnd_vec3(),
            rnd_quat(),
            rnd_vec3()
        ) as Point
    else if (typeof p === 'number')
        return rnd() as Point
    else if (p instanceof Vec2)
        return new Vec2(rnd(), rnd()) as Point
    else if (p instanceof Vec4)
        return new Vec4(rnd(), rnd(), rnd(), rnd()) as Point
    else if (p instanceof Quat)
        return rnd_quat() as Point
    else if (p instanceof Mat3)
        return new Mat3().setFromMat4(new Mat4().setTRS(
            Vec3.ZERO,
            rnd_quat(),
            rnd_vec3()
        )) as Point
    else if (p instanceof Color)
        return new Color(rnd(), rnd(), rnd()) as Point
    else if (p instanceof Uint8Array) {
        let newArray = new Uint8Array(p.length)
        for (let i = 0; i < p.length; i++)
            newArray[i] = rnd()
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Uint8ClampedArray) {
        let newArray = new Uint8ClampedArray(p.length)
        for (let i = 0; i < p.length; i++)
            newArray[i] = rnd()
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Int8Array) {
        let newArray = new Int8Array(p.length)
        for (let i = 0; i < p.length; i++)
            newArray[i] = rnd()
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Uint16Array) {
        let newArray = new Uint16Array(p.length)
        for (let i = 0; i < p.length; i++)
            newArray[i] = rnd()
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Int16Array) {
        let newArray = new Int16Array(p.length)
        for (let i = 0; i < p.length; i++)
            newArray[i] = rnd()
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Uint32Array) {
        let newArray = new Uint32Array(p.length)
        for (let i = 0; i < p.length; i++)
            newArray[i] = rnd()
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Int32Array) {
        let newArray = new Int32Array(p.length)
        for (let i = 0; i < p.length; i++)
            newArray[i] = rnd()
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Float32Array) {
        let newArray = new Float32Array(p.length)
        for (let i = 0; i < p.length; i++)
            newArray[i] = rnd()
        return newArray as FieldPoint as Point
    }
    else if (p instanceof Float64Array || p instanceof Array) {
        let newArray = new Float64Array(p.length)
        for (let i = 0; i < p.length; i++)
            newArray[i] = rnd()
        return newArray as FieldPoint as Point
    }
    else {
        return fields_point_random(p as FieldsPoint) as Point
    }
}

export function field_point_add<Point extends FieldPoint>(a: Point, b: Point): Point {
    if (a instanceof Vec3)
        return new Vec3().add2(a, b as Vec3) as Point
    else if (a instanceof Mat4)
        return new Mat4().mul2(a, b as Mat4) as Point
    else if (typeof a === 'number')
        return a + (b as number) as Point
    else if (a instanceof Vec2)
        return new Vec2().add2(a, b as Vec2) as Point
    else if (a instanceof Vec4)
        return new Vec4().add2(a, b as Vec4) as Point
    else if (a instanceof Quat)
        return new Quat().mul2(a, b as Quat) as Point
    else if (a instanceof Mat3)
        return new Mat3().setFromMat4(field_point_add(mat4_from_mat3(a), mat4_from_mat3(b as Mat3))) as Point
    else if (a instanceof Color) {
        const b_color = b as Color

        const c = a.clone()
        c.r += b_color.r
        c.g += b_color.g
        c.b += b_color.b
        c.a += b_color.a

        return c as Point
    }
    else if (a instanceof Int8Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int16Array ||
        a instanceof Uint16Array ||
        a instanceof Int32Array ||
        a instanceof Uint32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        const b_array = b as ArrayLike<number>
        console.assert(a.length === b_array.length)
        let newArray = new Float64Array(a.length as number)
        for (let i = 0; i < newArray.length; i++)
            newArray[i] = (a[i] as number) + b_array[i]
        return newArray as FieldPoint as Point
    }
    else {
        return fields_point_add(a as FieldsPoint, b as FieldsPoint) as Point
    }
}

export function field_point_add_inplace<Point extends FieldPoint>(a: Point, b: Point): Point {
    if (a instanceof Vec3)
        return a.add(b as Vec3) as Point
    else if (a instanceof Mat4)
        return a.mul(b as Mat4) as Point
    else if (typeof a === 'number')
        return a + (b as number) as Point
    else if (a instanceof Vec2)
        return a.add(b as Vec2) as Point
    else if (a instanceof Vec4)
        return a.add(b as Vec4) as Point
    else if (a instanceof Quat)
        return a.mul(b as Quat) as Point
    else if (a instanceof Mat3) {
        const a_mat4 = mat4_from_mat3(a)
        const b_mat4 = mat4_from_mat3(b as Mat3)
        field_point_add_inplace(a_mat4, b_mat4)

        return a.setFromMat4(a_mat4) as Point
    }
    else if (a instanceof Color) {
        const b_color = b as Color

        a.r += b_color.r
        a.g += b_color.g
        a.b += b_color.b
        a.a += b_color.a

        return a as Point
    }
    else if (a instanceof Int8Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int16Array ||
        a instanceof Uint16Array ||
        a instanceof Int32Array ||
        a instanceof Uint32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        const b_array = b as ArrayLike<number>
        console.assert(a.length === b_array.length)
        for (let i = 0; i < a.length; i++)
            a[i] += b_array[i]
        return a as Point
    }
    else {
        let result = { a }

        fields_point_add_inplace(
            result,
            'a',
            b
        )

        return result.a
    }
}

export function field_point_add_inplace_weighted<Point extends FieldPoint>(a: Point, b: Point, weight: number): Point {
    if (a instanceof Vec3)
        return a.add((b as Vec3).clone().mulScalar(weight)) as Point
    else if (a instanceof Mat4) {
        const trs_a = trs(a)
        const trs_b = trs(b as Mat4)

        field_point_add_inplace_weighted(trs_a, trs_b, weight)

        a.setTRS(trs_a.t, trs_a.r, trs_a.s)

        return a as Point
    }
    else if (typeof a === 'number')
        return a + ((b as number) * weight) as Point
    else if (a instanceof Vec2)
        return a.add((b as Vec2).clone().mulScalar(weight)) as Point
    else if (a instanceof Vec4)
        return a.add((b as Vec4).clone().mulScalar(weight)) as Point
    else if (a instanceof Quat)
        return a.slerp(a, b as Quat, weight) as Point
    else if (a instanceof Mat3) {
        const a_mat4 = mat4_from_mat3(a)
        const b_mat4 = mat4_from_mat3(b as Mat3)
        field_point_add_inplace_weighted(a_mat4, b_mat4, weight)

        return a.setFromMat4(a_mat4) as Point
    }
    else if (a instanceof Color) {
        const b_color = b as Color

        a.r += b_color.r * weight
        a.g += b_color.g * weight
        a.b += b_color.b * weight
        a.a += b_color.a * weight

        return a as Point
    }
    else if (a instanceof Int8Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int16Array ||
        a instanceof Uint16Array ||
        a instanceof Int32Array ||
        a instanceof Uint32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        const b_array = b as ArrayLike<number>
        console.assert(a.length === b_array.length)
        for (let i = 0; i < a.length; i++)
            a[i] += b_array[i] * weight
        return a as Point
    }
    else {
        let result = { a }

        fields_point_add_inplace_weighted(
            result,
            'a',
            b,
            weight
        )

        return result.a
    }
}

export function field_point_sum<Point extends FieldPoint = FieldPoint>(points: Point[]): Point {
    if (points[0] instanceof Vec3) {
        const sum = new Vec3()
        for (let i = 0; i < points.length; i++)
            sum.add(points[i] as Vec3)
        return sum as Point
    }
    else if (points[0] instanceof Mat4)
        throw new Error("not supported")
    else if (typeof points[0] === 'number') {
        let sum = 0

        for (let i = 0; i < points.length; i++)
            sum += points[i] as number

        return sum as Point
    }
    else if (points[0] instanceof Vec2) {
        const sum = new Vec2()
        for (let i = 0; i < points.length; i++)
            sum.add(points[i] as Vec2)
        return sum as Point
    }
    else if (points[0] instanceof Vec4) {
        const sum = new Vec4()
        for (let i = 0; i < points.length; i++)
            sum.add(points[i] as Vec4)
        return sum as Point
    }
    else if (points[0] instanceof Quat) {
        const sum = new Vec3()
        for (let i = 0; i < points.length; i++)
            sum.add((points[i] as Quat).getEulerAngles())
        return new Quat().setFromEulerAngles(sum.x, sum.y, sum.z) as Point
    }
    else if (points[0] instanceof Mat3)
        throw new Error("not supported")
    else if (points[0] instanceof Color) {
        const sum = new Color()
        for (let i = 0; i < points.length; i++){
            const point = points[i] as Color

            sum.r += point.r
            sum.g += point.g
            sum.b += point.b
            sum.a += point.a
        }
        return sum as Point
    }
    else if (
        points[0] instanceof Uint8Array ||
        points[0] instanceof Uint8ClampedArray ||
        points[0] instanceof Int8Array ||
        points[0] instanceof Uint16Array ||
        points[0] instanceof Int16Array ||
        points[0] instanceof Uint32Array ||
        points[0] instanceof Int32Array ||
        points[0] instanceof Float32Array ||
        points[0] instanceof Float64Array ||
        points[0] instanceof Array) {
        const sum = new Float64Array(points[0].length)
        for (let j = 0; j < points.length; j++)
            for (let i = 0; i < (points[j] as Vector).length; i++)
                sum[i] += (points as ArrayLike<number>[])[j][i]
        return sum as Point
    }
    else return fields_point_sum(points as FieldsPoint[]) as Point
}

export function field_point_sum_weighted<Point extends FieldPoint>(X: Point[], weights: number[]): Point {
    let value = field_point_identity(X[0])
    for (let i = 0; i < X.length; i++)
        value = field_point_add_inplace_weighted(value, X[i], weights[i])
    return value
}

export function field_point_primitives_sum<Point extends FieldPoint = FieldPoint>(a: Point): number {
    if (a instanceof Vec3)
        return a.x + a.y + a.z
    else if (a instanceof Mat4)
        return field_point_primitives_sum(a.data)
    else if (typeof a === 'number')
        return a
    else if (a instanceof Vec2)
        return a.x + a.y
    else if (a instanceof Vec4)
        return a.x + a.y + a.z + a.w
    else if (a instanceof Quat)
        return a.x + a.y + a.z + a.w
    else if (a instanceof Mat3)
        return field_point_primitives_sum(a.data)
    else if (a instanceof Color)
        return a.r + a.g + a.b + a.a
    else if (
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int8Array ||
        a instanceof Uint16Array ||
        a instanceof Int16Array ||
        a instanceof Uint32Array ||
        a instanceof Int32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        let sum = 0
        for (let i = 0; i < a.length; i++)
            sum += a[i]
        return sum
    }
    else return fields_point_primitives_sum(a as FieldsPoint)
}

export function field_point_subtract<Point extends FieldPoint>(a: Point, b: Point): Point {
    if (a instanceof Vec3)
        return new Vec3().sub2(a, b as Vec3) as Point
    else if (a instanceof Mat4)
        return new Mat4().mul2(a, (b as Mat4).clone().invert()) as Point
    else if (typeof a === 'number')
        return a - (b as number) as Point
    else if (a instanceof Vec2)
        return new Vec2().sub2(a, b as Vec2) as Point
    else if (a instanceof Vec4)
        return new Vec4().sub2(a, b as Vec4) as Point
    else if (a instanceof Quat) {
        const b_quat = b as Quat
        return new Quat(a.x - b_quat.x, a.y - b_quat.y, a.z - b_quat.z, a.w - b_quat.w) as Point
    }
    else if (a instanceof Mat3)
        return new Mat3().setFromMat4(field_point_subtract(mat4_from_mat3(a), mat4_from_mat3(b as Mat3))) as Point
    else if (a instanceof Color) {
        const b_color = b as Color

        const c = a.clone()
        c.r -= b_color.r
        c.g -= b_color.g
        c.b -= b_color.b
        c.a -= b_color.a

        return c as Point
    }
    else if (a instanceof Int8Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int16Array ||
        a instanceof Uint16Array ||
        a instanceof Int32Array ||
        a instanceof Uint32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        const b_array = b as ArrayLike<number>
        console.assert(a.length === b_array.length)
        let newArray = new Float64Array(a.length as number)
        for (let i = 0; i < newArray.length; i++)
            newArray[i] = (a[i] as number) - b_array[i] as number
        return newArray as FieldPoint as Point
    }
    else {
        return fields_point_subtract(a as FieldsPoint, b as FieldsPoint) as Point
    }
}

export function field_point_multiply<Point extends FieldPoint>(a: Point, b: number): Point {
    if (a instanceof Vec3)
        return a.clone().mulScalar(b) as Point
    else if (a instanceof Mat4) {
        const { t, r, s } = field_point_multiply(trs(a), b)
        return new Mat4().setTRS(t, r, s) as Point
    }
    else if (typeof a === 'number')
        return a * (b as number) as Point
    else if (a instanceof Vec2)
        return a.clone().mulScalar(b) as Point
    else if (a instanceof Vec4)
        return a.clone().mulScalar(b) as Point
    else if (a instanceof Quat)
        return new Quat().setFromEulerAngles(a.getEulerAngles().mulScalar(b)) as Point
    else if (a instanceof Mat3)
        return new Mat3().setFromMat4(field_point_divide(mat4_from_mat3(a), b)) as Point
    else if (a instanceof Color) {
        const c = a.clone()
        c.r *= b
        c.g *= b
        c.b *= b
        c.a *= b

        return c as Point
    }
    else if (a instanceof Int8Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int16Array ||
        a instanceof Uint16Array ||
        a instanceof Int32Array ||
        a instanceof Uint32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        let newArray = new Float64Array(a.length as number)
        for (let i = 0; i < newArray.length; i++)
            newArray[i] = (a[i] as number) * b
        return newArray as FieldPoint as Point
    }
    else {
        return fields_point_multiply(a as FieldsPoint, b) as Point
    }
}

export function field_point_multiply_hadamard<Point extends FieldPoint>(a: Point, b: Point): Point {
    if (a instanceof Vec3)
        return new Vec3().mul2(a, b as Vec3) as Point
    else if (a instanceof Mat4)
        //TODO: consider what really belongs here
        return new Mat4().mul2(a, b as Mat4) as Point
    else if (typeof a === 'number')
        return a * (b as number) as Point
    else if (a instanceof Vec2)
        return new Vec2().mul2(a, b as Vec2) as Point
    else if (a instanceof Vec4)
        return new Vec4().mul2(a, b as Vec4) as Point
    else if (a instanceof Quat)
        //TODO: consider what really belongs here
        return new Quat().mul2(a, b as Quat) as Point
    else if (a instanceof Mat3)
        return new Mat3().setFromMat4(field_point_multiply_hadamard(mat4_from_mat3(a), mat4_from_mat3(b as Mat3))) as Point
    else if (a instanceof Color) {
        const b_color = b as Color

        // this is like a color filter

        const c = a.clone()
        c.r *= (b_color.r * b_color.a) + (1 - b_color.a)
        c.g *= (b_color.g * b_color.a) + (1 - b_color.a)
        c.b *= (b_color.b * b_color.a) + (1 - b_color.a)

        return c as Point
    }
    else if (a instanceof Int8Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int16Array ||
        a instanceof Uint16Array ||
        a instanceof Int32Array ||
        a instanceof Uint32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        const b_array = b as ArrayLike<number>
        console.assert(a.length === b_array.length)
        let newArray = new Float64Array(a.length as number)
        for (let i = 0; i < newArray.length; i++)
            newArray[i] = (a[i] as number) * b_array[i]
        return newArray as FieldPoint as Point
    }
    else {
        return fields_point_multiply_hadamard(a as FieldsPoint, b as FieldsPoint) as Point
    }
}

export function field_point_divide<Point extends FieldPoint>(a: Point, b: number): Point {
    if (a instanceof Vec3)
        return a.clone().divScalar(b) as Point
    else if (a instanceof Mat4) {
        const { t, r, s } = field_point_divide(trs(a), b)
        return new Mat4().setTRS(t, r, s) as Point
    }
    else if (typeof a === 'number')
        return a / (b as number) as Point
    else if (a instanceof Vec2)
        return a.clone().divScalar(b) as Point
    else if (a instanceof Vec4)
        return a.clone().divScalar(b) as Point
    else if (a instanceof Quat)
        return new Quat().setFromEulerAngles(a.getEulerAngles().divScalar(b)) as Point
    else if (a instanceof Mat3)
        return new Mat3().setFromMat4(field_point_divide(mat4_from_mat3(a), b)) as Point
    else if (a instanceof Color) {
        const c = a.clone()
        c.r /= b
        c.g /= b
        c.b /= b
        c.a /= b

        return c as Point
    }
    else if (a instanceof Int8Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int16Array ||
        a instanceof Uint16Array ||
        a instanceof Int32Array ||
        a instanceof Uint32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        let newArray = new Float64Array(a.length as number)
        for (let i = 0; i < newArray.length; i++)
            newArray[i] = (a[i] as number) / b
        return newArray as FieldPoint as Point
    }
    else {
        return fields_point_divide(a as FieldsPoint, b) as Point
    }
}

export function field_point_modulo<Point extends FieldPoint>(a: Point, b: Point): Point {
    if (a instanceof Vec3) {
        const b_vec = b as Vec3

        const c = a.clone()
        c.x %= b_vec.x
        c.y %= b_vec.y
        c.z %= b_vec.z

        return c as Point
    }
    else if (a instanceof Mat4)
        throw new Error("modulo of matrix makes no sense")
    else if (typeof a === 'number')
        return a % (b as number) as Point
    else if (a instanceof Vec2) {
        const b_vec = b as Vec2

        const c = a.clone()
        c.x %= b_vec.x
        c.y %= b_vec.y

        return c as Point
    }
    else if (a instanceof Vec4) {
        const b_vec = b as Vec4

        const c = a.clone()
        c.x %= b_vec.x
        c.y %= b_vec.y
        c.z %= b_vec.z
        c.w %= b_vec.w

        return c as Point
    }
    else if (a instanceof Quat)
        throw new Error("modulo of quaternion makes no sense")
    else if (a instanceof Mat3)
        throw new Error("modulo of matrix makes no sense")
    else if (a instanceof Color) {
        const b_color = b as Color

        const c = a.clone()
        c.r %= b_color.r
        c.g %= b_color.g
        c.b %= b_color.b
        c.a %= b_color.a

        return c as Point
    }
    else if (a instanceof Int8Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int16Array ||
        a instanceof Uint16Array ||
        a instanceof Int32Array ||
        a instanceof Uint32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        const b_array = b as ArrayLike<number>
        console.assert(a.length === b_array.length)
        let newArray = new Float64Array(a.length as number)
        for (let i = 0; i < newArray.length; i++)
            newArray[i] = (a[i] as number) % b_array[i]
        return newArray as FieldPoint as Point
    }
    else {
        return fields_point_modulo(a as FieldsPoint, b as FieldsPoint) as Point
    }
}

export function field_point_fraction<Point extends FieldPoint>(a: Point, b: Point): FieldPointNumbers<Point> {
    if (a === undefined)
        return field_point_identity(b) as unknown as FieldPointNumbers<Point>
    else if (b === undefined)
        return field_point_invalid(a) as unknown as FieldPointNumbers<Point>

    if (a instanceof Vec3)
        return new Vec3().div2(a, b as Vec3) as FieldPointNumbers<Vec3> as FieldPointNumbers<Point>
    else if (a instanceof Mat4)
        throw new Error("fraction of matrix makes no sense")
    else if (typeof a === 'number')
        return a / (b as number) as FieldPointNumbers<Point>
    else if (a instanceof Vec2)
        return new Vec2().div2(a, b as Vec2) as FieldPointNumbers<Vec2> as FieldPointNumbers<Point>
    else if (a instanceof Vec4)
        return new Vec4().div2(a, b as Vec4) as FieldPointNumbers<Vec4> as FieldPointNumbers<Point>
    else if (a instanceof Quat)
        throw new Error("fraction of quaternion makes no sense")
    else if (a instanceof Mat3)
        throw new Error("fraction of matrix makes no sense")
    else if (a instanceof Color) {
        const b_color = b as Color

        const c = a.clone()
        c.r /= b_color.r
        c.g /= b_color.g
        c.b /= b_color.b
        c.a /= b_color.a

        return c as FieldPointNumbers<Color> as FieldPointNumbers<Point>
    }
    else if (a instanceof Int8Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int16Array ||
        a instanceof Uint16Array ||
        a instanceof Int32Array ||
        a instanceof Uint32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        const b_array = b as ArrayLike<number>
        let newArray = new Float64Array(a.length as number)
        for (let i = 0; i < newArray.length; i++)
            newArray[i] = (a[i] as number) / b_array[i]
        return newArray as FieldPointNumbers<Point>
    }
    else {
        return fields_point_fraction(a as Point & FieldsPoint, b as Point & FieldsPoint)
    }
}

export function field_point_square<Point extends FieldPoint>(a: Point): Point {
    return field_point_pow(a, 2)
}

export function field_point_sqrt<Point extends FieldPoint>(a: Point): Point {
    return field_point_pow(a, 0.5)
}

export function field_point_pow<Point extends FieldPoint>(base: Point, exponent: number): Point {
    if (base === undefined)
        return undefined!
    else if (typeof base === 'number')
        return <Point>(base ** exponent)
    else if (base instanceof Vec2)
        return <Point>new Vec2(base.x ** exponent, base.y ** exponent)
    else if (base instanceof Vec3)
        return <Point>new Vec3(base.x ** exponent, base.y ** exponent, base.z ** exponent)
    else if (base instanceof Vec4)
        return <Point>new Vec4(base.x ** exponent, base.y ** exponent, base.z ** exponent, base.w ** exponent)
    else if (base instanceof Quat)
        return <Point>new Quat(base.x ** exponent, base.y ** exponent, base.z ** exponent, base.w ** exponent)
    else if (base instanceof Color)
        return <Point>new Color(base.r ** exponent, base.g ** exponent, base.b ** exponent, base.a ** exponent)
    else if (base instanceof Mat3) {
        if (exponent === -1) {
            const res = new Mat3()
            mat4_from_mat3(base).invertTo3x3(res)
            return <Point>res
        }
        else if (exponent === 0)
            return <Point>new Mat3()
        else if ((exponent % 1) === 0) {
            const a = new Mat4()
            const b = mat4_from_mat3(base)
            for (let i = 0; i < exponent; i++)
                a.mul(b)
            return <Point>(new Mat3().setFromMat4(a))
        }
        else throw new Error("cannot have fractional exponent")
    }
    else if (base instanceof Mat4) {
        if (exponent === -1)
            return <Point>base.clone().invert()
        else if (exponent === 0)
            return <Point>new Mat4()
        else if ((exponent % 1) === 0) {
            const a = new Mat4()
            for (let i = 0; i < exponent; i++)
                a.mul(base)
            return <Point>a
        }
        else throw new Error("cannot have fractional exponent")
    }
    else {
        const res = <FieldsPoint>{}
        for (const key of Reflect.ownKeys(base))
            res[key] = field_point_pow((<FieldsPoint>base)[key], exponent)
        return <Point>res
    }
}

export function field_point_equal<Point extends FieldPoint>(a: Point, b: Point): boolean {
    if (a instanceof Vec3) {
        const b_vec = b as Vec3
        return a.equals(b_vec)
    }
    else if (a instanceof Mat4) {
        const b_mat = b as Mat4
        return a.equals(b_mat)
    }
    else if (typeof a === 'number')
        return a === (b as number)
    else if (a instanceof Vec2) {
        const b_vec = b as Vec2
        return a.equals(b_vec)
    }
    else if (a instanceof Vec4) {
        const b_vec = b as Vec4
        return a.equals(b_vec)
    }
    else if (a instanceof Quat) {
        const b_quat = b as Quat
        return a.equals(b_quat)
    }
    else if (a instanceof Mat3) {
        const b_mat = b as Mat3
        return a.equals(b_mat)
    }
    else if (a instanceof Color) {
        const b_color = b as Color
        return a.equals(b_color)
    }
    else if (a instanceof Int8Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int16Array ||
        a instanceof Uint16Array ||
        a instanceof Int32Array ||
        a instanceof Uint32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        const b_vec = b as ArrayLike<number>
        if (a.length !== b_vec.length)
            return false
        for (let i = 0; i < a.length; i++)
            if (a[i] !== b_vec[i])
                return false
        return true
    }
    else {
        return fields_point_equal(a as FieldsPoint, b as FieldsPoint)
    }
}

export function field_point_compare_gte<Point extends FieldPoint>(a: Point, b: Point): boolean {
    if (a === undefined)
        return b === undefined || field_point_equal(b, field_point_identity(b))
    else if (b === undefined)
        return true

    if (a instanceof Vec3) {
        const b_vec = b as Vec3
        return (
            a.x >= b_vec.x &&
            a.y >= b_vec.y &&
            a.z >= b_vec.z
        )
    }
    else if (a instanceof Mat4)
        return field_point_compare_gte(trs(a), trs(b as Mat4))
    else if (typeof a === 'number')
        return a >= (b as number)
    else if (a instanceof Vec2) {
        const b_vec = b as Vec2
        return (
            a.x >= b_vec.x &&
            a.y >= b_vec.y
        )
    }
    else if (a instanceof Vec4) {
        const b_vec = b as Vec4
        return (
            a.x >= b_vec.x &&
            a.y >= b_vec.y &&
            a.z >= b_vec.z &&
            a.w >= b_vec.w
        )
    }
    else if (a instanceof Quat)
        return field_point_compare_gte(a.getEulerAngles(), (b as Quat).getEulerAngles())
    else if (a instanceof Mat3)
        return field_point_compare_gte(mat4_from_mat3(a), mat4_from_mat3(b as Mat3))
    else if (a instanceof Color) {
        const b_color = b as Color
        return (
            a.r >= b_color.r &&
            a.g >= b_color.g &&
            a.b >= b_color.b &&
            a.a >= b_color.a
        )
    }
    else if (a instanceof Int8Array ||
        a instanceof Uint8Array ||
        a instanceof Uint8ClampedArray ||
        a instanceof Int16Array ||
        a instanceof Uint16Array ||
        a instanceof Int32Array ||
        a instanceof Uint32Array ||
        a instanceof Float32Array ||
        a instanceof Float64Array ||
        a instanceof Array) {
        const b_vec = b as ArrayLike<number>
        if (a.length !== b_vec.length)
            return false
        for (let i = 0; i < a.length; i++)
            if (a[i] < b_vec[i])
                return false
        return true
    }
    else {
        return fields_point_compare_gte(a as FieldsPoint, b as FieldsPoint)
    }
}

export function fields_point_identity<Point extends FieldsPoint>(a: Point): Point {
    let c: any = {}

    for (const key of Reflect.ownKeys(a))
        c[key] = field_point_identity(a[key])

    return c as Point
}

export function fields_point_invalid<Point extends FieldsPoint>(a: Point): Point {
    let c: any = {}

    for (const key of Reflect.ownKeys(a))
        c[key] = field_point_invalid(a[key])

    return c as Point
}

export function fields_point_clone<Point extends FieldsPoint>(a: Point): Point {
    let c: any = {}

    for (const key of Reflect.ownKeys(a))
        c[key] = field_point_clone(a[key])

    return c as Point
}

export function fields_point_random<Point extends FieldsPoint>(a: Point): Point {
    let c: any = {}

    for (const key of Reflect.ownKeys(a))
        c[key] = field_point_random(a[key])

    return c as Point
}

export function fields_point_add<Point extends FieldsPoint>(a: Point, b: Point): Point {
    let c: any = {}

    for (const key of Reflect.ownKeys(a)) {
        if (b[key] !== undefined)
            c[key] = field_point_add(a[key], b[key])
        else c[key] = field_point_clone(a[key])
    }

    for (const key of Reflect.ownKeys(b))
        if (c[key] === undefined)
            c[key] = field_point_clone(b[key])

    return c as Point
}

export function fields_point_subtract<Point extends FieldsPoint>(a: Point, b: Point): Point {
    let c: any = {}

    for (const key of Reflect.ownKeys(a)) {
        if (b[key] !== undefined)
            c[key] = field_point_subtract(a[key], b[key])
        else c[key] = field_point_clone(a[key])
    }

    for (const key of Reflect.ownKeys(b))
        if (c[key] === undefined)
            c[key] = field_point_multiply(b[key], -1)

    return c as Point
}

export function fields_point_add_inplace<
        KeyTemplate extends any = any,
        Point extends FieldPoint = FieldPoint
    >(
        accumulator: { [K in keyof KeyTemplate]: Point } & any,
        key: keyof KeyTemplate,
        addend: Point
    ): Point {
    if (!(key in accumulator))
        return accumulator[key] = field_point_clone(addend)
    else if (field_point_isPrimitive(addend))
        return accumulator[key] = field_point_add_inplace(accumulator[key], addend)
    else {
        const accumulator_fields = accumulator[key] as FieldsPoint
        const addend_fields = addend as FieldsPoint
        for (const field_key of Reflect.ownKeys(addend_fields))
            accumulator_fields[field_key] = fields_point_add_inplace<any>(
                accumulator_fields,
                field_key,
                addend_fields[field_key]
            )

        return accumulator_fields as Point
    }
}

export function fields_point_add_inplace_weighted<
        KeyTemplate extends object = object,
        Point extends FieldPoint = FieldPoint
    >(
        accumulator: { [K in keyof KeyTemplate]: Point } & any,
        key: keyof KeyTemplate,
        addend: Point,
        weight: number
    ): Point {
    if (!(key in accumulator)) {
        return accumulator[key] = field_point_add_inplace_weighted(
            accumulator[key] = field_point_identity(addend),
            addend,
            weight
        )
    }
    else if(field_point_isPrimitive(addend))
        return accumulator[key] = field_point_add_inplace_weighted(accumulator[key], addend, weight)
    else {
        const accumulator_fields = accumulator[key] as FieldsPoint
        const addend_fields = addend as FieldsPoint
        for (const field_key of Reflect.ownKeys(addend_fields))
            accumulator_fields[field_key] = fields_point_add_inplace_weighted<any>(
                accumulator_fields,
                field_key,
                addend_fields[field_key],
                weight
            )

        return accumulator_fields as Point
    }
}

export function fields_point_sum<Point extends FieldsPoint = FieldsPoint>(points: Point[]): Point {
    let sum = {} as Point

    for (const key of new Set(points.flatMap(point => Reflect.ownKeys(point)))) {
        const extracted = points.filter(point => key in point).map(point => point[key])
        sum[key as keyof Point] = field_point_sum(extracted) as Point[typeof key]
    }

    return sum
}

export function fields_point_primitives_sum<Point extends FieldsPoint = FieldsPoint>(point: Point): number {
    let sum = 0

    for (const key of Reflect.ownKeys(point))
        sum += field_point_primitives_sum(point[key])

    return sum
}

export function fields_point_multiply<Point extends FieldsPoint>(a: Point, b: number): Point {
    let c: any = {}

    for (const key of Reflect.ownKeys(a))
        c[key] = field_point_multiply(a[key], b)

    return c as Point
}

export function fields_point_multiply_hadamard<Point extends FieldsPoint>(a: Point, b: Point): Point {
    let c: any = {}

    for (const key of Reflect.ownKeys(a))
        c[key] = field_point_multiply_hadamard(a[key], b)

    return c as Point
}

export function fields_point_divide<Point extends FieldsPoint>(a: Point, b: number): Point {
    let c: any = {}

    for (const key of Reflect.ownKeys(a))
        c[key] = field_point_divide(a[key], b)

    return c as Point
}

export function fields_point_modulo<Point extends FieldsPoint>(a: Point, b: Point): Point {
    let c: any = {}

    for (const key of Reflect.ownKeys(a))
        c[key] = field_point_modulo(a[key], b[key])

    return c as Point
}

export function fields_point_fraction<Point extends FieldsPoint>(a: Point, b: Point): FieldPointNumbers<Point> {
    let c: any = {}

    for (const key of new Set([...Reflect.ownKeys(a), ...Reflect.ownKeys(b)]))
        c[key] = field_point_fraction(a[key], b[key])

    return c as FieldPointNumbers<Point>
}

export function fields_point_equal<Point extends FieldsPoint>(a: Point, b: Point): boolean {
    const keys_a = Reflect.ownKeys(a)
    const keys_b = Reflect.ownKeys(b)

    if (keys_a.length !== keys_b.length ||
        keys_a.some(key => !keys_b.includes(key)))
        return false

    for (const key of new Set([...keys_a, ...keys_b]))
        if (!field_point_equal(a[key], b[key]))
            return false

    return true
}

export function fields_point_compare_gte<Point extends FieldsPoint>(a: Point, b: Point): boolean {
    const keys_a = Reflect.ownKeys(a)
    const keys_b = Reflect.ownKeys(b)

    for (const key of new Set([...keys_a, ...keys_b]))
        if (!field_point_compare_gte(a[key], b[key]))
            return false

    return true
}

// /**
//  * Merges multiple partial field points into one field point
//  * @param points the points to merge; later values take precedence over earlier values
//  */
// export function fields_point_merge<Point extends FieldsPoint>(...points: FieldsPointOptional<Point>[]): Point {

// }