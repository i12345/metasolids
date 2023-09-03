import { Vec3, Mat4, Vec2, Vec4, Quat, Mat3, Color } from "playcanvas-extended"
import { mat4_from_mat3, trs } from "../utils/matrix.js"
import { FieldPoint, FieldPointPrimitive, FieldsPoint, field_point_clone, field_point_isPrimitive, field_point_map, Vector } from "./point.js"

export const RANGE_MIN = 0
export const RANGE_MAX = 1

export type FieldPointRange<Point extends FieldPoint> =
    Point extends FieldPointPrimitive ? [min: Point, max: Point] :
        Point extends FieldsPoint ?
            FieldsPointRange<Point> :
            never

export type FieldsPointRange<Point extends FieldsPoint> = {
    [K in keyof Point]: FieldPointRange<Point[K]>
}

export function field_point_range_compute<Point extends FieldPoint = FieldPoint>(values: Point[]) {
    const result = {
        range: field_point_map(
            values[0],
            field_point_isPrimitive,
            value => [field_point_clone(value), field_point_clone(value)] as FieldPointRange<FieldPointPrimitive>
        )
    }

    function expand_range(
            range_obj: { obj: any, property: PropertyKey },
            point: FieldPoint
        ) {
        const range = range_obj.obj[range_obj.property]

        if (point instanceof Vec3) {
            type Type = Vec3
            const [min, max] = range as [Type, Type]

            if (point.x < min.x) min.x = point.x
            else if (point.x > max.x) max.x = point.x

            if (point.y < min.y) min.y = point.y
            else if (point.y > max.y) max.y = point.y

            if (point.z < min.z) min.z = point.z
            else if(point.z > max.z) max.z = point.z
        }
        else if (point instanceof Mat4) {
            type Type = Mat4
            const [min, max] = range as [Type, Type]

            const [trs_min, trs_max] = [trs(min), trs(max)]

            const obj = {
                point: trs(point),
                range: {
                    t: [trs_min.t, trs_max.t],
                    r: [trs_min.r, trs_max.r],
                    s: [trs_min.s, trs_max.s],
                }
            }

            expand_range({ obj, property: 'range' }, obj.point)

            min.setTRS(obj.range.t[0], obj.range.r[0], obj.range.s[0])
            max.setTRS(obj.range.t[1], obj.range.r[1], obj.range.s[1])
        }
        else if (typeof point === 'number') {
            if(point < range[0]) range[0] = point
            else if(point > range[1]) range[1] = point
        }
        else if (point instanceof Vec2) {
            type Type = Vec2
            const [min, max] = range as [Type, Type]

            if (point.x < min.x) min.x = point.x
            else if (point.x > max.x) max.x = point.x

            if (point.y < min.y) min.y = point.y
            else if (point.y > max.y) max.y = point.y
        }
        else if (point instanceof Vec4) {
            type Type = Vec4
            const [min, max] = range as [Type, Type]

            if (point.x < min.x) min.x = point.x
            else if (point.x > max.x) max.x = point.x

            if (point.y < min.y) min.y = point.y
            else if (point.y > max.y) max.y = point.y

            if (point.z < min.z) min.z = point.z
            else if (point.z > max.z) max.z = point.z

            if (point.w < min.w) min.w = point.w
            else if(point.w > max.w) max.w = point.w
        }
        else if (point instanceof Quat) {
            type Type = Quat
            const [min, max] = range as [Type, Type]

            const [angles_min, angles_max] = [min.getEulerAngles().round(), max.getEulerAngles().round()]
            const point_angles = point.getEulerAngles().round()

            let [changed_min, changed_max] = [false, false]

            if (point_angles.x < angles_min.x) {
                angles_min.x = point_angles.x
                changed_min = true
            } else if (point_angles.x > angles_max.x) {
                angles_max.x = point_angles.x
                changed_max = true
            }

            if (point_angles.y < angles_min.y) {
                angles_min.y = point_angles.y
                changed_min = true
            } else if (point_angles.y > angles_max.y) {
                angles_max.y = point_angles.y
                changed_max = true
            }

            if (point_angles.z < angles_min.z) {
                angles_min.z = point_angles.z
                changed_min = true
            } else if (point_angles.z > angles_max.z) {
                angles_max.z = point_angles.z
                changed_max = true
            }

            if(changed_min) min.setFromEulerAngles(angles_min)
            if(changed_max) max.setFromEulerAngles(angles_max)
        }
        else if (point instanceof Mat3) {
            type Type = Mat3
            const [min, max] = range as [Type, Type]
            const [mat4_min, mat4_max] = [mat4_from_mat3(min), mat4_from_mat3(max)]

            const [trs_min, trs_max] = [trs(mat4_min), trs(mat4_max)]

            const obj = {
                point: trs(mat4_from_mat3(point)),
                range: {
                    r: [trs_min.r, trs_max.r],
                    s: [trs_min.s, trs_max.s],
                }
            }

            expand_range({ obj, property: 'range' }, obj.point)

            mat4_min.setTRS(Vec3.ZERO, obj.range.r[0], obj.range.s[0])
            mat4_max.setTRS(Vec3.ZERO, obj.range.r[1], obj.range.s[1])

            min.setFromMat4(mat4_min)
            max.setFromMat4(mat4_max)
        }
        else if (point instanceof Color) {
            type Type = Color
            const [min, max] = range as [Type, Type]

            if (point.r < min.r) min.r = point.r
            else if (point.r > max.r) max.r = point.r

            if (point.g < min.g) min.g = point.g
            else if (point.g > max.g) max.g = point.g

            if (point.b < min.b) min.b = point.b
            else if (point.b > max.b) max.b = point.b

            if (point.a < min.a) min.a = point.a
            else if(point.a > max.a) max.a = point.a
        }
        else if (point instanceof Int8Array ||
            point instanceof Uint8Array ||
            point instanceof Uint8ClampedArray ||
            point instanceof Int16Array ||
            point instanceof Uint16Array ||
            point instanceof Int32Array ||
            point instanceof Uint32Array ||
            point instanceof Float32Array ||
            point instanceof Float64Array ||
            point instanceof Array) {
            type Type = Vector
            let [min, max] = range as [Type, Type]

            if (min.length < point.length) {
                if (min instanceof Array)
                    min.length = point.length
                else {
                    const prev_min = min

                    if (min instanceof Int8Array)
                        min = new Int8Array(point.length)
                    else if (min instanceof Uint8Array)
                        min = new Uint8Array(point.length)
                    else if (min instanceof Uint8ClampedArray)
                        min = new Uint8ClampedArray(point.length)
                    else if (min instanceof Int16Array)
                        min = new Int16Array(point.length)
                    else if (min instanceof Uint16Array)
                        min = new Uint16Array(point.length)
                    else if (min instanceof Int32Array)
                        min = new Int32Array(point.length)
                    else if (min instanceof Uint32Array)
                        min = new Uint32Array(point.length)
                    else if (min instanceof Float32Array)
                        min = new Float32Array(point.length)
                    else if (min instanceof Float64Array)
                        min = new Float64Array(point.length)
                    else throw new Error('invalid array type')

                    for (let i = prev_min.length - 1; i >= 0; i--)
                        min[i] = prev_min[i]
                }
            }

            if (max.length < point.length) {
                if (max instanceof Array)
                    max.length = point.length
                else {
                    const prev_max = max

                    if (max instanceof Int8Array)
                        max = new Int8Array(point.length)
                    else if (max instanceof Uint8Array)
                        max = new Uint8Array(point.length)
                    else if (max instanceof Uint8ClampedArray)
                        max = new Uint8ClampedArray(point.length)
                    else if (max instanceof Int16Array)
                        max = new Int16Array(point.length)
                    else if (max instanceof Uint16Array)
                        max = new Uint16Array(point.length)
                    else if (max instanceof Int32Array)
                        max = new Int32Array(point.length)
                    else if (max instanceof Uint32Array)
                        max = new Uint32Array(point.length)
                    else if (max instanceof Float32Array)
                        max = new Float32Array(point.length)
                    else if (max instanceof Float64Array)
                        max = new Float64Array(point.length)
                    else throw new Error('invalid array type')

                    for (let i = prev_max.length - 1; i >= 0; i--)
                        max[i] = prev_max[i]
                }
            }

            for (let i = point.length - 1; i >= 0; i--) {
                if (point[i] < min[i])
                    min[i] = point[i]
                else if (point[i] > max[i])
                    max[i] = point[i]
            }
        }
        else {
            for (const property of Reflect.ownKeys(point))
                expand_range({ obj: range, property }, point[property])
        }
    }

    for (let i = 1; i < values.length; i++)
        expand_range({ obj: result, property: 'range' }, values[i] )

    return result.range as FieldPointRange<Point>
}

export function field_point_range_equal<Point extends FieldPoint = FieldPoint>(
        a: FieldPointRange<Point>,
        b: FieldPointRange<Point>
    ): boolean {
    function ensure_valid([min, max]: [Vec3, Vec3]) {
        if (min.x > max.x) min.x = max.x
        if (min.y > max.y) min.y = max.y
        if (min.z > max.z) min.z = max.z
    }

    function round_scale(v: Vec3) {
        const diff = (
            Math.abs(v.x - 1) +
            Math.abs(v.y - 1) +
            Math.abs(v.z - 1)
        )

        if (diff > 0 && diff < 0.001)
            v.x = v.y = v.z = 1
    }

    if (a instanceof Array) {
        const a_max = a[1]

        if (a_max instanceof Vec3) {
            type Type = Vec3

            const [a_min, a_max] = a as [Type, Type]
            const [b_min, b_max] = b as [Type, Type]

            return a_min.equals(b_min) && a_max.equals(b_max)
        }
        else if (a_max instanceof Mat4) {
            type Type = Mat4

            const [a_min, a_max] = a as [Type, Type]
            const [b_min, b_max] = b as [Type, Type]

            type fields = { t: Vec3, r: Quat, s: Vec3 }

            const a_fields: FieldsPointRange<fields> = {
                t: [a_min.getTranslation(), a_max.getTranslation()],
                r: [new Quat().setFromMat4(a_min), new Quat().setFromMat4(a_max)],
                s: [a_min.getScale(), a_max.getScale()]
            }

            const b_fields: FieldsPointRange<fields> = {
                t: [b_min.getTranslation(), b_max.getTranslation()],
                r: [new Quat().setFromMat4(b_min), new Quat().setFromMat4(b_max)],
                s: [b_min.getScale(), b_max.getScale()]
            }

            ensure_valid(a_fields.s)
            ensure_valid(b_fields.s)

            round_scale(a_fields.s[0])
            round_scale(a_fields.s[1])
            round_scale(b_fields.s[0])
            round_scale(b_fields.s[1])

            return field_point_range_equal(a_fields, b_fields)
        }
        else if (typeof a_max === 'number') {
            type Type = number

            const [a_min, a_max] = a as [Type, Type]
            const [b_min, b_max] = b as [Type, Type]

            return (b_min === a_min && b_max === a_max)
        }
        else if (a_max instanceof Vec2) {
            type Type = Vec2

            const [a_min, a_max] = a as [Type, Type]
            const [b_min, b_max] = b as [Type, Type]

            return a_min.equals(b_min) && a_max.equals(b_max)
        }
        else if (a_max instanceof Vec4) {
            type Type = Vec4

            const [a_min, a_max] = a as [Type, Type]
            const [b_min, b_max] = b as [Type, Type]

            return a_min.equals(b_min) && a_max.equals(b_max)
        }
        else if (a_max instanceof Quat) {
            type Type = Quat

            const [a_min, a_max] = a as [Type, Type]
            const [b_min, b_max] = b as [Type, Type]

            return field_point_range_equal(
                [a_min.getEulerAngles().round(), a_max.getEulerAngles().round()],
                [b_min.getEulerAngles().round(), b_max.getEulerAngles().round()]
            )
        }
        else if (a_max instanceof Mat3) {
            type Type = Mat3

            const [a_min, a_max] = a as [Type, Type]
            const [b_min, b_max] = b as [Type, Type]

            const [a_min_mat4, a_max_mat4] = [new Mat4(), new Mat4()]
            const [b_min_mat4, b_max_mat4] = [new Mat4(), new Mat4()]

            mat4_from_mat3(a_min, a_min_mat4)
            mat4_from_mat3(a_max, a_max_mat4)

            mat4_from_mat3(b_min, b_min_mat4)
            mat4_from_mat3(b_max, b_max_mat4)

            return field_point_range_equal(
                [a_min_mat4, a_max_mat4],
                [b_min_mat4, b_max_mat4]
            )
        }
        else if (a_max instanceof Color) {
            type Type = Color

            const [a_min, a_max] = a as [Type, Type]
            const [b_min, b_max] = b as [Type, Type]

            return a_min.equals(b_min) && a_max.equals(b_max)
        }
        else if (a_max instanceof Int8Array ||
            a_max instanceof Uint8Array ||
            a_max instanceof Uint8ClampedArray ||
            a_max instanceof Int16Array ||
            a_max instanceof Uint16Array ||
            a_max instanceof Int32Array ||
            a_max instanceof Uint32Array ||
            a_max instanceof Float32Array ||
            a_max instanceof Float64Array ||
            a_max instanceof Array) {
            type Type = ArrayLike<number>

            const [a_min, a_max] = a as [Type, Type]
            const [b_min, b_max] = b as [Type, Type]

            const n = a_min.length
            if (n !== a_max.length ||
                n !== b_min.length ||
                n !== b_max.length)
                return false

            for (let i = n - 1; i >= 0; i--) {
                const [a_value_min, a_value_max] = [a_min[i], a_max[i]]
                const [b_value_min, b_value_max] = [b_min[i], b_max[i]]

                if (a_value_min !== b_value_min ||
                    a_value_max !== b_value_max)
                    return false
            }

            return true
        }
        else throw new Error("invalid type")
    }
    else {
        for (const key of Reflect.ownKeys(b))
            if (!field_point_range_equal((a as any)[key], (b as any)[key]))
                return false

        return true
    }
}

export function field_point_range_subsets<Point extends FieldPoint = FieldPoint>(
        superset: FieldPointRange<Point>,
        subset: FieldPointRange<Point>
    ): boolean {
    function ensure_valid([min, max]: [Vec3, Vec3]) {
        if (min.x > max.x) min.x = max.x
        if (min.y > max.y) min.y = max.y
        if (min.z > max.z) min.z = max.z
    }

    function round_scale(v: Vec3) {
        const diff = (
            Math.abs(v.x - 1) +
            Math.abs(v.y - 1) +
            Math.abs(v.z - 1)
        )

        if (diff > 0 && diff < 0.001)
            v.x = v.y = v.z = 1
    }

    if (subset instanceof Array) {
        const subset_max = subset[1]

        if (subset_max instanceof Vec3) {
            type Type = Vec3

            const [superset_min, superset_max] = superset as [Type, Type]
            const [subset_min, subset_max] = subset as [Type, Type]

            return (
                (subset_min.x >= superset_min.x && subset_max.x <= superset_max.x) &&
                (subset_min.y >= superset_min.y && subset_max.y <= superset_max.y) &&
                (subset_min.z >= superset_min.z && subset_max.z <= superset_max.z)
            )
        }
        else if (subset_max instanceof Mat4) {
            type Type = Mat4

            const [superset_min, superset_max] = superset as [Type, Type]
            const [subset_min, subset_max] = subset as [Type, Type]

            type fields = { t: Vec3, r: Quat, s: Vec3 }

            const superset_fields: FieldsPointRange<fields> = {
                t: [superset_min.getTranslation(), superset_max.getTranslation()],
                r: [new Quat().setFromMat4(superset_min), new Quat().setFromMat4(superset_max)],
                s: [superset_min.getScale(), superset_max.getScale()]
            }

            const subset_fields: FieldsPointRange<fields> = {
                t: [subset_min.getTranslation(), subset_max.getTranslation()],
                r: [new Quat().setFromMat4(subset_min), new Quat().setFromMat4(subset_max)],
                s: [subset_min.getScale(), subset_max.getScale()]
            }

            ensure_valid(superset_fields.s)
            ensure_valid(subset_fields.s)

            round_scale(superset_fields.s[0])
            round_scale(superset_fields.s[1])
            round_scale(subset_fields.s[0])
            round_scale(subset_fields.s[1])

            return field_point_range_subsets(superset_fields, subset_fields)
        }
        else if (typeof subset_max === 'number') {
            type Type = number

            const [superset_min, superset_max] = superset as [Type, Type]
            const [subset_min, subset_max] = subset as [Type, Type]

            return (subset_min >= superset_min && subset_max <= superset_max)
        }
        else if (subset_max instanceof Vec2) {
            type Type = Vec2

            const [superset_min, superset_max] = superset as [Type, Type]
            const [subset_min, subset_max] = subset as [Type, Type]

            return (
                (subset_min.x >= superset_min.x && subset_max.x <= superset_max.x) &&
                (subset_min.y >= superset_min.y && subset_max.y <= superset_max.y)
            )
        }
        else if (subset_max instanceof Vec4) {
            type Type = Vec4

            const [superset_min, superset_max] = superset as [Type, Type]
            const [subset_min, subset_max] = subset as [Type, Type]

            return (
                (subset_min.x >= superset_min.x && subset_max.x <= superset_max.x) &&
                (subset_min.y >= superset_min.y && subset_max.y <= superset_max.y) &&
                (subset_min.z >= superset_min.z && subset_max.z <= superset_max.z) &&
                (subset_min.w >= superset_min.w && subset_max.w <= superset_max.w)
            )
        }
        else if (subset_max instanceof Quat) {
            type Type = Quat

            const [superset_min, superset_max] = superset as [Type, Type]
            const [subset_min, subset_max] = subset as [Type, Type]

            return field_point_range_subsets(
                [superset_min.getEulerAngles().round(), superset_max.getEulerAngles().round()],
                [subset_min.getEulerAngles().round(), subset_max.getEulerAngles().round()]
            )
        }
        else if (subset_max instanceof Mat3) {
            type Type = Mat3

            const [superset_min, superset_max] = superset as [Type, Type]
            const [subset_min, subset_max] = subset as [Type, Type]

            const [superset_min_mat4, superset_max_mat4] = [new Mat4(), new Mat4()]
            const [subset_min_mat4, subset_max_mat4] = [new Mat4(), new Mat4()]

            mat4_from_mat3(superset_min, superset_min_mat4)
            mat4_from_mat3(superset_max, superset_max_mat4)

            mat4_from_mat3(subset_min, subset_min_mat4)
            mat4_from_mat3(subset_max, subset_max_mat4)

            return field_point_range_subsets(
                [superset_min_mat4, superset_max_mat4],
                [subset_min_mat4, subset_max_mat4]
            )
        }
        else if (subset_max instanceof Color) {
            type Type = Color

            const [superset_min, superset_max] = superset as [Type, Type]
            const [subset_min, subset_max] = subset as [Type, Type]

            return (
                (subset_min.r >= superset_min.r && subset_max.r <= superset_max.r) &&
                (subset_min.g >= superset_min.g && subset_max.g <= superset_max.g) &&
                (subset_min.b >= superset_min.b && subset_max.b <= superset_max.b) &&
                (subset_min.a >= superset_min.a && subset_max.a <= superset_max.a)
            )
        }
        else if (subset_max instanceof Int8Array ||
            subset_max instanceof Uint8Array ||
            subset_max instanceof Uint8ClampedArray ||
            subset_max instanceof Int16Array ||
            subset_max instanceof Uint16Array ||
            subset_max instanceof Int32Array ||
            subset_max instanceof Uint32Array ||
            subset_max instanceof Float32Array ||
            subset_max instanceof Float64Array ||
            subset_max instanceof Array) {
            type Type = ArrayLike<number>

            const [superset_min, superset_max] = superset as [Type, Type]
            const [subset_min, subset_max] = subset as [Type, Type]

            for (let i = Math.max(subset_min.length, subset_max.length); i >= 0; i--) {
                const [superset_value_min, superset_value_max] = [superset_min[i], superset_max[i]]
                const [subset_value_min, subset_value_max] = [subset_min[i], subset_max[i]]

                if ((subset_value_min ?? subset_value_max) < (superset_value_min ?? superset_value_max))
                    return false

                if ((subset_value_max ?? subset_value_min) > (superset_value_max ?? superset_value_min))
                    return false
            }

            return true
        }
        else throw new Error('invalid type')
    }
    else {
        for (const key of Reflect.ownKeys(subset))
            if (!field_point_range_subsets((superset as any)[key], (subset as any)[key]))
                return false

        return true
    }
}