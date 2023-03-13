import { Vec2, Vec3, Vec4, Quat, Mat3, Mat4, Color } from "playcanvas-extended";

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
    Point extends Mat3 ? { data: number[] } :
    Point extends Mat4 ? { data: number[] } :
    Point extends Color ? { r: number, g: number, b: number, a: number } :
    Point extends Vector ? number[] :
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

export const FieldsPoint_Omit_Leaf = Symbol('omit')
export type FieldsPointOmitted<
        Point extends FieldsPoint,
        Subtract extends FieldsPointMapped<FieldsPoint, typeof FieldsPoint_Omit_Leaf>
    > = {
    [K in keyof Point]:
        Subtract[K] extends typeof FieldsPoint_Omit_Leaf ? never :
        Subtract[K] extends FieldsPointMapped<FieldsPoint, typeof FieldsPoint_Omit_Leaf> ?
            (Point[K] extends FieldsPoint ?
            FieldsPointOmitted<Point[K], Subtract[K]> : never) :
        Point[K]
}

export type FieldsPointOptional<Point extends FieldsPoint> = {
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
// let point_opt: FieldsPointOptional<typeof point>
// point_opt.c.z.zz // Quat?

export type FieldPoint = FieldPointPrimitive | FieldsPoint

export type ExtraFields<
        Type extends FieldsPoint,
        Base extends FieldsPoint
    > =
    Omit<Type, keyof Base>

export function field_point_isPrimitive(p: FieldPoint): boolean {
    if (p instanceof Vec3)
        return true
    else if (p instanceof Mat4)
        return true
    else if (typeof p === 'number')
        return true
    else if (p instanceof Vec2)
        return true
    else if (p instanceof Vec4)
        return true
    else if (p instanceof Quat)
        return true
    else if (p instanceof Mat3)
        return true
    else if (p instanceof Color)
        return true
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
        return true

    return false
}

export const field_point_map =
    <Point extends FieldPoint, T, R>(
        point: FieldPointMapped<Point, T>,
        leafDeterminer: (value: T) => boolean,
        action: (value: T, path: PropertyKey[]) => R,
        path: PropertyKey[] = []
    ): FieldPointMapped<Point, R> =>
        leafDeterminer(point as T) ?
            action(point as T, []) :
            Object.fromEntries(
                Reflect.ownKeys(point as FieldsPointMapped<FieldsPoint, T>)
                    .map(key => {
                        const value = point[key]
                        const newpath = [...path, key]
                        if (leafDeterminer(value as T))
                            return [key, action(value as T, newpath)]
                        else return [key, fields_point_map(
                            value as FieldsPointMapped<FieldsPoint, T>,
                            leafDeterminer,
                            action,
                            newpath
                        )]
                    })
            )

export const fields_point_map =
    <Point extends FieldsPoint, T, R>(
        point: FieldsPointMapped<Point, T>,
        leafDeterminer: (value: T) => boolean,
        action: (value: T, path: PropertyKey[]) => R,
        path: PropertyKey[] = []
    ): FieldsPointMapped<Point, R> =>
        Object.fromEntries(
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
                })
        )

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

export function field_point_add<Point extends FieldPoint>(a: Point, b: Point): Point {
    if (a instanceof Vec3)
        return new Vec3().add2(a, b as Vec3) as Point
    else if (a instanceof Mat4)
        return new Mat4().add2(a, b as Mat4) as Point
    else if (typeof a === 'number')
        return a + (b as number) as Point
    else if (a instanceof Vec2)
        return new Vec2().add2(a, b as Vec2) as Point
    else if (a instanceof Vec4)
        return new Vec4().add2(a, b as Vec4) as Point
    else if (a instanceof Quat) {
        const b_quat = b as Quat
        return new Quat(a.x + b_quat.x, a.y + b_quat.y, a.z + b_quat.z, a.w + b_quat.w) as Point
    }
    else if (a instanceof Mat3) {
        const b_mat = b as Mat3
        const c = new Mat3()
        for (let i = 8; i >= 0; i--)
            c.data[i] = a.data[i] + b_mat.data[i]
        
        return c as Point
    }
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
        console.assert(a.length === b['length'])
        let newArray = new Float64Array(a.length as number)
        for (let i = 0; i < newArray.length; i++)
            newArray[i] = (a[i] as number) + (b[i] as number)
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
        return a.add(b as Mat4) as Point
    else if (typeof a === 'number')
        return a + (b as number) as Point
    else if (a instanceof Vec2)
        return a.add(b as Vec2) as Point
    else if (a instanceof Vec4)
        return a.add(b as Vec4) as Point
    else if (a instanceof Quat) {
        const b_quat = b as Quat
        a.x += b_quat.x
        a.y += b_quat.y
        a.z += b_quat.z
        a.w += b_quat.w
        return a as Point
    }
    else if (a instanceof Mat3) {
        const b_mat = b as Mat3
        for (let i = 8; i >= 0; i--)
            a.data[i] += b_mat.data[i]
        
        return a as Point
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
        console.assert(a.length === b['length'])
        for (let i = 0; i < a.length; i++)
            a[i] += (b[i] as number)
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
        const b_mat = b as Mat4
        for (let i = 15; i >= 0; i--)
            a.data[i] += b_mat.data[i] * weight
        
        return a as Point
    }
    else if (typeof a === 'number')
        return a + ((b as number) * weight) as Point
    else if (a instanceof Vec2)
        return a.add((b as Vec2).clone().mulScalar(weight)) as Point
    else if (a instanceof Vec4)
        return a.add((b as Vec4).clone().mulScalar(weight)) as Point
    else if (a instanceof Quat) {
        const b_quat = b as Quat
        a.x += b_quat.x * weight
        a.y += b_quat.y * weight
        a.z += b_quat.z * weight
        a.w += b_quat.w * weight
        return a as Point
    }
    else if (a instanceof Mat3) {
        const b_mat = b as Mat3
        for (let i = 8; i >= 0; i--)
            a.data[i] += b_mat.data[i] * weight
        
        return a as Point
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
        console.assert(a.length === b['length'])
        for (let i = 0; i < a.length; i++)
            a[i] += (b[i] as number) * weight
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

export function field_point_subtract<Point extends FieldPoint>(a: Point, b: Point): Point {
    if (a instanceof Vec3)
        return new Vec3().sub2(a, b as Vec3) as Point
    else if (a instanceof Mat4) {
        const b_mat = b as Mat4
        const c = new Mat4()
        for (let i = 15; i >= 0; i--)
            c.data[i] = a.data[i] - b_mat.data[i]
        
        return c as Point
    }
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
    else if (a instanceof Mat3) {
        const b_mat = b as Mat3
        const c = new Mat3()
        for (let i = 8; i >= 0; i--)
            c.data[i] = a.data[i] - b_mat.data[i]
        
        return c as Point
    }
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
        console.assert(a.length === b['length'])
        let newArray = new Float64Array(a.length as number)
        for (let i = 0; i < newArray.length; i++)
            newArray[i] = (a[i] as number) - (b[i] as number)
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
        const c = a.clone()
        for (let i = 15; i >= 0; i--)
            c.data[i] *= b
        
        return c as Point
    }
    else if (typeof a === 'number')
        return a * (b as number) as Point
    else if (a instanceof Vec2)
        return a.clone().mulScalar(b) as Point
    else if (a instanceof Vec4)
        return a.clone().mulScalar(b) as Point
    else if (a instanceof Quat)
        return new Quat().setFromEulerAngles(a.getEulerAngles().mulScalar(b)) as Point
    else if (a instanceof Mat3) {
        const c = a.clone()
        for (let i = 8; i >= 0; i--)
            c.data[i] *= b
        
        return c as Point
    }
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
        console.assert(a.length === b['length'])
        let newArray = new Float64Array(a.length as number)
        for (let i = 0; i < newArray.length; i++)
            newArray[i] = (a[i] as number) * b
        return newArray as FieldPoint as Point
    }
    else {
        return fields_point_multiply(a as FieldsPoint, b) as Point
    }
}

export function field_point_divide<Point extends FieldPoint>(a: Point, b: number): Point {
    if (a instanceof Vec3)
        return a.clone().divScalar(b) as Point
    else if (a instanceof Mat4) {
        const c = a.clone()
        for (let i = 15; i >= 0; i--)
            c.data[i] /= b
        
        return c as Point
    }
    else if (typeof a === 'number')
        return a / (b as number) as Point
    else if (a instanceof Vec2)
        return a.clone().divScalar(b) as Point
    else if (a instanceof Vec4)
        return a.clone().divScalar(b) as Point
    else if (a instanceof Quat)
        return new Quat().setFromEulerAngles(a.getEulerAngles().divScalar(b)) as Point
    else if (a instanceof Mat3) {
        const c = a.clone()
        for (let i = 8; i >= 0; i--)
            c.data[i] /= b
        
        return c as Point
    }
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
        console.assert(a.length === b['length'])
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
    else if (a instanceof Mat4) {
        throw new Error("modulo of matrix makes no sense")
        // const b_mat = b as Mat4

        // const c = a.clone()
        // for (let i = 15; i >= 0; i--)
        //     c.data[i] %= b_mat.data[i]
        
        // return c as Point
    }
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
    else if (a instanceof Mat3) {
        throw new Error("modulo of matrix makes no sense")
        // const b_mat = b as Mat3

        // const c = a.clone()
        // for (let i = 8; i >= 0; i--)
        //     c.data[i] %= b_mat.data[i]
        
        // return c as Point
    }
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
        console.assert(a.length === b['length'])
        let newArray = new Float64Array(a.length as number)
        for (let i = 0; i < newArray.length; i++)
            newArray[i] = (a[i] as number) % (b[i] as number)
        return newArray as FieldPoint as Point
    }
    else {
        return fields_point_modulo(a as FieldsPoint, b as FieldsPoint) as Point
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

export function fields_point_clone<Point extends FieldsPoint>(a: Point): Point {
    let c = {}

    for (const key of Reflect.ownKeys(a)) 
        c[key] = field_point_clone(a[key])
    
    return c as Point
}

export function fields_point_add<Point extends FieldsPoint>(a: Point, b: Point): Point {
    let c = {}

    for (const key of Reflect.ownKeys(a)) {
        if (a[key] !== undefined)
            c[key] = field_point_add(a[key], b[key])
        else c[key] = field_point_clone(a[key])
    }

    for (const key of Reflect.ownKeys(b))
        if (c[key] === undefined)
            c[key] = field_point_clone(b[key])
    
    return c as Point
}

export function fields_point_subtract<Point extends FieldsPoint>(a: Point, b: Point): Point {
    let c = {}

    for (const key of Reflect.ownKeys(a)) {
        if (a[key] !== undefined)
            c[key] = field_point_subtract(a[key], b[key])
        else c[key] = field_point_clone(a[key])
    }

    for (const key of Reflect.ownKeys(b))
        if (c[key] === undefined)
            c[key] = field_point_multiply(b[key], -1)
    
    return c as Point
}

export function fields_point_add_inplace<
        KeyTemplate extends object = object,
        Point extends FieldPoint = FieldPoint
    >(
        accumulator: { [K in keyof KeyTemplate]: Point } & any,
        key: keyof KeyTemplate,
        addend: Point
    ): Point {
    if(field_point_isPrimitive(addend))
        return accumulator[key] = field_point_add_inplace(accumulator[key], addend)
    else {
        const accumulator_fields = accumulator[key] as FieldsPoint
        const addend_fields = addend as FieldsPoint
        for (const field_key of Reflect.ownKeys(addend_fields))
            accumulator_fields[field_key] = fields_point_add_inplace<any>(
                accumulator_fields,
                field_key,
                addend_fields[key]
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
    if(field_point_isPrimitive(addend))
        return accumulator[key] = field_point_add_inplace_weighted(accumulator[key], addend, weight)
    else {
        const accumulator_fields = accumulator[key] as FieldsPoint
        const addend_fields = addend as FieldsPoint
        for (const field_key of Reflect.ownKeys(addend_fields))
            accumulator_fields[field_key] = fields_point_add_inplace_weighted<any>(
                accumulator_fields,
                field_key,
                addend_fields[key],
                weight
            )
        
        return accumulator_fields as Point
    }
}

export function fields_point_multiply<Point extends FieldsPoint>(a: Point, b: number): Point {
    let c = {}

    for (const key of Reflect.ownKeys(a))
        c[key] = field_point_multiply(a[key], b)
    
    return c as Point
}

export function fields_point_divide<Point extends FieldsPoint>(a: Point, b: number): Point {
    let c = {}

    for (const key of Reflect.ownKeys(a))
        c[key] = field_point_divide(a[key], b)
    
    return c as Point
}

export function fields_point_modulo<Point extends FieldsPoint>(a: Point, b: Point): Point {
    let c = {}

    for (const key of Reflect.ownKeys(a))
        c[key] = field_point_modulo(a[key], b[key])
    
    return c as Point
}


export function fields_point_equal<Point extends FieldsPoint>(a: Point, b: Point): boolean {
    const keys_a = Reflect.ownKeys(a)
    const keys_b = Reflect.ownKeys(b)
    
    if (keys_a.length !== keys_b.length ||
        keys_a.some(key => !keys_b.includes(key)))
        return false

    for (const key of keys_a)
        if (!field_point_equal(a[key], b[key]))
            return false
    
    return true
}

// /**
//  * Merges multiple partial field points into one field point
//  * @param points the points to merge; later values take precedence over earlier values
//  */
// export function fields_point_merge<Point extends FieldsPoint>(...points: FieldsPointOptional<Point>[]): Point {
    
// }