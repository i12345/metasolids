import { Color, Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from "playcanvas-extended";
import { mat4_from_mat3, trs } from "../utils/matrix.js";
import { FieldPoint, FieldsPoint, field_point_divide, field_point_sum } from "./point.js";

export function field_point_mean<Point extends FieldPoint = FieldPoint>(points: Point[]): Point {
    return field_point_divide(field_point_sum(points), points.length)
}

export function field_point_variance<Point extends FieldPoint = FieldPoint>(points: Point[]): number {
    if (points[0] instanceof Vec3)
        return fields_point_variance(points as FieldsPoint[])
    else if (points[0] instanceof Mat4)
        return fields_point_variance(points.map(point => trs(point as Mat4)))
    else if (typeof points[0] === 'number') {
        let mean = 0

        for (let i = 0; i < points.length; i++)
            mean += points[i] as number
        mean /= points.length

        let diffSquares = 0

        for (let i = 0; i < points.length; i++)
            diffSquares += ((points[i] as number) - mean) ** 2

        return (diffSquares / (points.length - 1))
    }
    else if (points[0] instanceof Vec2)
        return fields_point_variance(points as FieldsPoint[])
    else if (points[0] instanceof Vec4)
        return fields_point_variance(points as FieldsPoint[])
    else if (points[0] instanceof Quat)
        return fields_point_variance(points.map(point => (point as Quat).getEulerAngles() as unknown as FieldsPoint))
    else if (points[0] instanceof Mat3)
        return fields_point_variance(points.map(point => trs(mat4_from_mat3(point as Mat3))))
    else if (points[0] instanceof Color)
        return fields_point_variance(points as FieldsPoint[])
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
        let variance_sum = 0
        for (let i = 0; i < points[0].length; i++) {
            let sum = 0
            for (let j = 0; j < points.length; j++)
                sum += (points as Array<number>[])[j][i]

            const mean = sum / points.length
            let squaredDiff_sum = 0

            for (let j = 0; j < points.length; j++)
                squaredDiff_sum += ((points as Array<number>[])[j][i] - mean) ** 2

            variance_sum += squaredDiff_sum / (points.length - 1)
        }
        return variance_sum / points[0].length
    }
    else return fields_point_variance(points as FieldsPoint[])
}

export function fields_point_variance<Point extends FieldsPoint = FieldsPoint>(points: Point[]): number {
    let squares = 0

    for (const key of Reflect.ownKeys(points[0])) {
        const extracted = points.map(point => point[key])
        const variance = field_point_variance(extracted)
        squares += variance
    }

    return squares
}