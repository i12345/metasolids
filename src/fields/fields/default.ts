import { Color, Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from "playcanvas-extended";
import { FieldPoint, FieldsPoint, FieldsPointMapped, fields_point_map, field_point_isPrimitive } from "../point.js";
import { ColorField } from "./color.js";
import { FieldsField } from "./fields.js";
import { Mat3Field } from "./mat3.js";
import { Mat4Field } from "./mat4.js";
import { QuatField } from "./quat.js";
import { ScalarField } from "./scalar.js";
import { Vec2Field } from "./vec2.js";
import { Vec3Field } from "./vec3.js";
import { Vec4Field } from "./vec4.js";
import { VectorField } from "./vector.js";
import { Field } from "../field.js";

export function defaultField<Point extends FieldPoint = FieldPoint>(p: Point): Field<Point> {
    if (typeof p === 'number')
        return ScalarField.instance as unknown as Field<Point>
    else if (p instanceof Vec2)
        return Vec2Field.instance as unknown as Field<Point>
    else if (p instanceof Vec3)
        return Vec3Field.instance as unknown as Field<Point>
    else if (p instanceof Vec4)
        return Vec4Field.instance as unknown as Field<Point>
    else if (p instanceof Quat)
        return QuatField.instance as unknown as Field<Point>
    else if (p instanceof Mat3)
        return Mat3Field.instance as unknown as Field<Point>
    else if (p instanceof Mat4)
        return Mat4Field.instance as unknown as Field<Point>
    else if (p instanceof Color)
        return ColorField.instance as unknown as Field<Point>
    else if (p instanceof Array ||
        p instanceof Uint8Array ||
        p instanceof Uint8ClampedArray ||
        p instanceof Int8Array ||
        p instanceof Uint16Array ||
        p instanceof Int16Array ||
        p instanceof Uint32Array ||
        p instanceof Int32Array ||
        p instanceof Float32Array ||
        p instanceof Float64Array)
        // return VectorField.instance as unknown as Field<Point>
        throw new Error()
    else if (p === undefined)
        return new FieldsField({}) as unknown as Field<Point>
    else return new FieldsField(fields_point_map(
        p as FieldsPointMapped<FieldsPoint, FieldPoint>,
        field_point_isPrimitive,
        value => defaultField(value)
    )) as unknown as Field<Point>
}