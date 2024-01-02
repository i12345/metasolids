import { Mat4, Vec2, Vec3 } from "playcanvas-physics-advanced";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "./point.js";

export function field_point_vector_vec2_normalize<
        Container extends FieldPointVectorContainerStatic<NumberTypedArray>
    >(
        p_in: FieldPointVector<Vec2, Container>,
        p_out: FieldPointVector<Vec2, Container> = p_in
    ): FieldPointVector<Vec2, Container> {
    let x: number,
        y: number
    
    let length: number
    
    let p_offset = 0
    while (p_offset < p_in.length) {
        x = p_in[p_offset + 0]
        y = p_in[p_offset + 1]

        length = Math.sqrt(
            (x * x) +
            (y * y)
        )

        p_out[p_offset++] = x / length
        p_out[p_offset++] = y / length
    }

    return p_out
}

export function field_point_vector_vec3_normalize<
        Container extends FieldPointVectorContainerStatic<NumberTypedArray>
    >(
        p_in: FieldPointVector<Vec3, Container>,
        p_out: FieldPointVector<Vec3, Container> = p_in
    ): FieldPointVector<Vec3, Container> {
    let x: number,
        y: number,
        z: number
    
    let length: number
    
    let p_offset = 0
    while (p_offset < p_in.length) {
        x = p_in[p_offset + 0]
        y = p_in[p_offset + 1]
        z = p_in[p_offset + 2]

        length = Math.sqrt(
            (x * x) +
            (y * y) +
            (z * z)
        )

        p_out[p_offset++] = x / length
        p_out[p_offset++] = y / length
        p_out[p_offset++] = z / length
    }

    return p_out
}

export function field_point_vector_mat4_transformPoint_single_multiple<
        Container extends FieldPointVectorContainerStatic<NumberTypedArray>
    >(
        mat: Mat4,
        p_in: FieldPointVector<Vec3, Container>,
        p_out: FieldPointVector<Vec3, Container> = p_in
    ): FieldPointVector<Vec3, Container> {
    let x0: number, y0: number, z0: number
    let x1: number, y1: number, z1: number

    const m00 = mat.data[0]
    const m01 = mat.data[1]
    const m02 = mat.data[2]
    const m03 = mat.data[3]

    const m10 = mat.data[4]
    const m11 = mat.data[5]
    const m12 = mat.data[6]
    const m13 = mat.data[7]

    const m20 = mat.data[8]
    const m21 = mat.data[9]
    const m22 = mat.data[10]
    const m23 = mat.data[11]

    const m30 = mat.data[12]
    const m31 = mat.data[13]
    const m32 = mat.data[14]
    const m33 = mat.data[15]

    let p_offset = 0
    
    while (p_offset < p_in.length) {
        x0 = p_in[p_offset + 0]
        y0 = p_in[p_offset + 1]
        z0 = p_in[p_offset + 2]
        x1 = (x0 * m00) + (y0 * m10) + (z0 * m20) + m30
        y1 = (x0 * m01) + (y0 * m11) + (z0 * m21) + m31
        z1 = (x0 * m02) + (y0 * m12) + (z0 * m22) + m32
        p_out[p_offset++] = x1
        p_out[p_offset++] = y1
        p_out[p_offset++] = z1
    }

    return p_out
}

export function field_point_vector_mat4_transformPoint<
    Container extends FieldPointVectorContainerStatic<NumberTypedArray>
>(
    mat: FieldPointVector<Mat4, Container>,
    p_in: FieldPointVector<Vec3, Container>,
    p_out: FieldPointVector<Vec3, Container> = p_in
): FieldPointVector<Vec3, Container> {
    let x0: number, y0: number, z0: number
    let x1: number, y1: number, z1: number

    let p_offset = 0

    for (let mat_offset = 0;
        mat_offset < mat.length;
        mat_offset += 16) {
        x0 = p_in[p_offset + 0]
        y0 = p_in[p_offset + 1]
        z0 = p_in[p_offset + 2]
        x1 = (x0 * mat[mat_offset + 0]) + (y0 * mat[mat_offset + 4]) + (z0 * mat[mat_offset + 8]) + mat[mat_offset + 12]
        y1 = (x0 * mat[mat_offset + 1]) + (y0 * mat[mat_offset + 5]) + (z0 * mat[mat_offset + 9]) + mat[mat_offset + 13]
        z1 = (x0 * mat[mat_offset + 2]) + (y0 * mat[mat_offset + 6]) + (z0 * mat[mat_offset + 10]) + mat[mat_offset + 14]
        p_out[p_offset++] = x1
        p_out[p_offset++] = y1
        p_out[p_offset++] = z1
    }

    return p_out
}