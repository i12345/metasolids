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

export function defaultField(p: FieldPoint) {
    if (typeof p === 'number')
        return new ScalarField()
    else if (p instanceof Vec2)
        return new Vec2Field()
    else if (p instanceof Vec3)
        return new Vec3Field()
    else if (p instanceof Vec4)
        return new Vec4Field()
    else if (p instanceof Quat)
        return new QuatField()
    else if (p instanceof Mat3)
        return new Mat3Field()
    else if (p instanceof Mat4)
        return new Mat4Field()
    else if (p instanceof Color)
        return new ColorField()
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
        return new VectorField()
    else return new FieldsField(fields_point_map(
        p as FieldsPointMapped<FieldsPoint, FieldPoint>,
        field_point_isPrimitive,
        value => defaultField(value)
    ))
}