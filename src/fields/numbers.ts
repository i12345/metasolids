import { Vec2, Vec3, Vec4, Quat, Mat3, Mat4, Color } from "playcanvas-extended";
import { mat4_from_mat3 } from "../utils/matrix.js";
import { FieldPoint, FieldPointPrimitive, FieldsPoint, Vector } from "./point.js";
import { FieldPointType } from "./type.js";

export type FieldPointNumbers<Point extends FieldPoint = FieldPoint> =
    Point extends number ? number :
    Point extends boolean ? (1 | 0) :
    Point extends Vec2 ? { x: number; y: number } :
    Point extends Vec3 ? { x: number; y: number; z: number } :
    Point extends Vec4 ? { x: number; y: number; z: number; w: number } :
    Point extends Quat ? { x: number; y: number; z: number; w: number } :
    Point extends Mat3 ? { r: FieldPointNumbers<Quat>; s: FieldPointNumbers<Vec3> } :
    Point extends Mat4 ? { t: FieldPointNumbers<Vec3>; r: FieldPointNumbers<Quat>; s: FieldPointNumbers<Vec3> } :
    Point extends Color ? { r: number; g: number; b: number; a: number } :
    Point extends Vector ? Vector :
    Point extends FieldsPoint ? { [K in keyof Point]: FieldPointNumbers<Point[K]> } :
    never

export function field_point_numbers_encode<T extends FieldPoint>(p: T): FieldPointNumbers<T> {
    if (typeof p === 'number')
        return <FieldPointNumbers<T>><FieldPointNumbers<number>>p;
    else if (typeof p === 'boolean')
        return <FieldPointNumbers<T>><FieldPointNumbers<boolean>>(p ? 1 : 0);
    else if (p instanceof Vec2)
        return <FieldPointNumbers<T>><FieldPointNumbers<Vec2>>({ x: p.x, y: p.y });
    else if (p instanceof Vec3)
        return <FieldPointNumbers<T>><FieldPointNumbers<Vec3>>({ x: p.x, y: p.y, z: p.z });
    else if (p instanceof Vec4)
        return <FieldPointNumbers<T>><FieldPointNumbers<Vec4>>({ x: p.x, y: p.y, z: p.z, w: p.w });
    else if (p instanceof Quat)
        return <FieldPointNumbers<T>><FieldPointNumbers<Quat>>({ x: p.x, y: p.y, z: p.z, w: p.w });
    else if (p instanceof Color)
        return <FieldPointNumbers<T>><FieldPointNumbers<Color>>({ r: p.r, g: p.g, b: p.b, a: p.a });
    else if (p instanceof Mat3) {
        const m4 = mat4_from_mat3(p);
        const r = new Quat().setFromMat4(m4);
        const s = m4.getScale();

        return <FieldPointNumbers<T>><FieldPointNumbers<Mat3>>{ r: field_point_numbers_encode(r), s: field_point_numbers_encode(s) };
    }
    else if (p instanceof Mat4) {
        const t = p.getTranslation();
        const r = new Quat().setFromMat4(p);
        const s = p.getScale();

        return <FieldPointNumbers<T>><FieldPointNumbers<Mat3>>{ t: field_point_numbers_encode(t), r: field_point_numbers_encode(r), s: field_point_numbers_encode(s) };
    }
    else {
        const result: FieldPointNumbers<FieldsPoint> = {};

        for (const key of Reflect.ownKeys(p))
            result[key] = field_point_numbers_encode((<FieldsPoint>p)[key]);

        return <FieldPointNumbers<T>>result;
    }
}

export function field_point_numbers_decode<Point extends FieldPoint = FieldPoint>(
        type: FieldPointType<Point>,
        numbers: FieldPointNumbers<Point>
    ): Point {
    if (type instanceof Function) {
        switch (<FieldPointType<FieldPointPrimitive>>type) {
            case Number:
                return <Point><FieldPointNumbers<number>>numbers
            case Boolean:
                return <Point>(<FieldPointNumbers<boolean>>numbers !== 0)
            case Vec2:
                return <Point>new Vec2(
                    (<FieldPointNumbers<Vec2>>numbers).x,
                    (<FieldPointNumbers<Vec2>>numbers).y
                )
            case Vec3:
                return <Point>new Vec3(
                    (<FieldPointNumbers<Vec3>>numbers).x,
                    (<FieldPointNumbers<Vec3>>numbers).y,
                    (<FieldPointNumbers<Vec3>>numbers).z
                )
            case Vec4:
                return <Point>new Vec4(
                    (<FieldPointNumbers<Vec4>>numbers).x,
                    (<FieldPointNumbers<Vec4>>numbers).y,
                    (<FieldPointNumbers<Vec4>>numbers).z,
                    (<FieldPointNumbers<Vec4>>numbers).w
                )
            case Quat:
                return <Point>new Vec4(
                    (<FieldPointNumbers<Quat>>numbers).x,
                    (<FieldPointNumbers<Quat>>numbers).y,
                    (<FieldPointNumbers<Quat>>numbers).z,
                    (<FieldPointNumbers<Quat>>numbers).w
                )
            case Mat3:
                return <Point>new Mat3().setFromMat4(new Mat4().setTRS(
                    Vec3.ZERO,
                    field_point_numbers_decode(Quat, (<FieldPointNumbers<Mat3>>numbers).r),
                    field_point_numbers_decode(Vec3, (<FieldPointNumbers<Mat3>>numbers).s)
                ))
            case Mat4:
                return <Point>new Mat4().setTRS(
                    field_point_numbers_decode(Vec3, (<FieldPointNumbers<Mat4>>numbers).t),
                    field_point_numbers_decode(Quat, (<FieldPointNumbers<Mat4>>numbers).r),
                    field_point_numbers_decode(Vec3, (<FieldPointNumbers<Mat4>>numbers).s)
                )
            case Color:
                return <Point>new Color(
                    (<FieldPointNumbers<Color>>numbers).r,
                    (<FieldPointNumbers<Color>>numbers).g,
                    (<FieldPointNumbers<Color>>numbers).b,
                    (<FieldPointNumbers<Color>>numbers).a
                )
            default:
                throw new Error()
        }
    }
    else {
        const point: FieldsPoint = {}

        for (const key of Reflect.ownKeys(type)) {
            point[key] = field_point_numbers_decode<FieldPoint>(
                (<FieldPointType<FieldsPoint>>type)[key],
                <FieldPointNumbers>(<FieldsPoint>numbers)[key]
            )
        }

        return <Point>point
    }
}

const numbers_types: Map<FieldPointType<FieldPointPrimitive>, FieldPointType<FieldPointNumbers<FieldPointPrimitive>>> = new Map()
numbers_types.set(Number, Number)
numbers_types.set(Boolean, Number)
numbers_types.set(Vec2, { x: Number, y: Number })
numbers_types.set(Vec3, { x: Number, y: Number, z: Number })
numbers_types.set(Vec4, { x: Number, y: Number, z: Number, w: Number })
numbers_types.set(Quat, { x: Number, y: Number, z: Number, w: Number })
numbers_types.set(Mat3, { r: { x: Number, y: Number, z: Number, w: Number }, s: { x: Number, y: Number, z: Number } })
numbers_types.set(Mat4, { t: { x: Number, y: Number, z: Number }, r: { x: Number, y: Number, z: Number, w: Number }, s: { x: Number, y: Number, z: Number } })
numbers_types.set(Color, { r: Number, g: Number, b: Number, a: Number })

export function field_point_numbers_type<Point extends FieldPointPrimitive = FieldPointPrimitive>(type: FieldPointType<Point>): FieldPointType<FieldPointNumbers<Point>> {
    return <FieldPointType<FieldPointNumbers<Point>>>numbers_types.get(type)!
}
