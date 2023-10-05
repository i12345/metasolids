import { FieldPoint, FieldPointMapped, FieldPointNumbers, FieldPointPrimitive, FieldsPoint, field_point_map } from "../point.js"
import { FieldPointType, field_point_type_primitive_number_type } from "../type.js"
import * as tf from '@tensorflow/tfjs'
import { PropertyPath } from "../../paradigm/trees/path.js"
import { extract } from "../../paradigm/trees/index.js"
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorStatic } from "../vectorized/point.js"
import { Color, Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from "playcanvas-extended"
import { Reflect_entries, Reflect_fromEntries } from "../../utils/reflect-entries.js"

export type FieldPointTensor<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
        Tensor extends tf.Tensor<R> = tf.Tensor<R>,
    > = FieldPointMapped<FieldPointNumbers<T>, Tensor>

export type FieldPointTensorScalar<T extends FieldPoint = FieldPoint> = FieldPointTensor<T, tf.Rank.R0>
export type FieldPointTensor1D<T extends FieldPoint = FieldPoint> = FieldPointTensor<T, tf.Rank.R1>
export type FieldPointTensor2D<T extends FieldPoint = FieldPoint> = FieldPointTensor<T, tf.Rank.R2>
export type FieldPointTensor3D<T extends FieldPoint = FieldPoint> = FieldPointTensor<T, tf.Rank.R3>
export type FieldPointTensor4D<T extends FieldPoint = FieldPoint> = FieldPointTensor<T, tf.Rank.R4>
export type FieldPointTensor5D<T extends FieldPoint = FieldPoint> = FieldPointTensor<T, tf.Rank.R5>
export type FieldPointTensor6D<T extends FieldPoint = FieldPoint> = FieldPointTensor<T, tf.Rank.R6>

export function field_point_tensor_map<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
        U = any
    >(
        type: FieldPointType<T>,
        tensor: FieldPointTensor<T, R>,
        processor: (raw: tf.Tensor<R>, path: PropertyPath) => U
    ): FieldPointMapped<FieldPointNumbers<T>, U> {
    return <FieldPointMapped<FieldPointNumbers<T>, U>><unknown>field_point_map<T, FieldPointType<FieldPointPrimitive>, FieldPointMapped<FieldPointNumbers<FieldPointPrimitive>, U>>(
        <FieldPointMapped<T, FieldPointType<FieldPointPrimitive>>>type,
        leaf => leaf instanceof Function,
        (leaf_type, path_primitive) => {
            const leaf_primitives = field_point_type_primitive_number_type(<FieldPointType<FieldPointPrimitive>>leaf_type)!

            return field_point_map<FieldPointNumbers<FieldPointPrimitive>, FieldPointType<number>, U>(
                <any>leaf_primitives,
                leaf => leaf === Number,
                (_, path_number) => {
                    const path = [...path_primitive, ...path_number]
                    return processor(extract<tf.Tensor<R>>(tensor, path), path)
                }
            )
        }
    )
}

export function field_point_tensor_encode<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
    >(
        type: FieldPointType<T>,
        shape: tf.ShapeMap[R],
        dtype?: tf.NumericDataType,
        inititialData?: FieldPointVector<T>
    ) {
    function recurse<Point extends FieldPoint = FieldPoint>(
            type: FieldPointType<Point>,
            dtype?: tf.NumericDataType,
            vector?: FieldPointVector<Point>,
        ): FieldPointTensor<Point, R> {
        type Result = FieldPointTensor<Point, R>

        if (type instanceof Function) {
            if (type === Boolean)
                dtype ??= 'bool'
            else
                dtype ??= 'float32'
            
            if (vector === undefined) {
                switch (<FieldPointType<FieldPointPrimitive>>type) {
                    case Number:
                        return <Result>tf.zeros(shape, dtype)

                    case Vec2:
                        return <Result>{
                            x: tf.zeros(shape, dtype),
                            y: tf.zeros(shape, dtype),
                        }

                    case Vec3:
                        return <Result>{
                            x: tf.zeros(shape, dtype),
                            y: tf.zeros(shape, dtype),
                            z: tf.zeros(shape, dtype),
                        }

                    case Vec4:
                        return <Result>{
                            x: tf.zeros(shape, dtype),
                            y: tf.zeros(shape, dtype),
                            z: tf.zeros(shape, dtype),
                            w: tf.zeros(shape, dtype),
                        }

                    case Quat:
                        return <Result>{
                            x: tf.zeros(shape, dtype),
                            y: tf.zeros(shape, dtype),
                            z: tf.zeros(shape, dtype),
                            w: tf.zeros(shape, dtype),
                        }

                    case Mat3:
                        return <Result>{
                            r: recurse(Quat),
                            s: recurse(Vec3),
                        }

                    case Mat4:
                        return <Result>{
                            t: recurse(Vec3),
                            r: recurse(Quat),
                            s: recurse(Vec3),
                        }

                    case Color:
                        return <Result>{
                            r: tf.zeros(shape, dtype),
                            g: tf.zeros(shape, dtype),
                            b: tf.zeros(shape, dtype),
                            a: tf.zeros(shape, dtype),
                        }

                    default:
                        throw new Error()
                }
            }
            else {
                let tmp: any
                
                const vector_array = <FieldPointVectorContainerStatic<tf.TypedArray>>(
                    (
                        ((dtype === 'int32') && vector instanceof Int32Array) ||
                        ((dtype === 'float32' || dtype === 'complex64') && vector instanceof Float32Array) ||
                        ((dtype === 'bool') && vector instanceof Uint8Array)
                    ) ? vector : (
                            dtype === 'int32' ? ((tmp = new Int32Array((<FieldPointVectorContainerStatic>vector).length)).set(<FieldPointVectorContainerStatic>vector), <Int32Array>tmp) :
                            (dtype === 'float32' || dtype === 'complex64') ? ((tmp = new Float32Array()).set(<FieldPointVectorContainerStatic>vector), <Float32Array>tmp) :
                            dtype === 'bool' ? ((tmp = new Uint8Array()).set(<FieldPointVectorContainerStatic>vector), <Uint8Array>tmp) :
                            undefined
                    )
                )

                function slice(stride: number): tf.Tensor[] {
                    return tf.unstack(tf.tensor2d(vector_array, [stride, vector_array.length / stride], dtype)).map(tensor => tensor.reshape(shape))
                }

                let slices: ReturnType<typeof slice>

                switch (<FieldPointType<FieldPointPrimitive>>type) {
                    case Number:
                        return <Result>tf.tensor(vector_array, shape, dtype)

                    case Vec2:
                        slices = slice(2)
                        return <Result>{
                            x: slices[0],
                            y: slices[1],
                        }

                    case Vec3:
                        slices = slice(3)
                        return <Result>{
                            x: slices[0],
                            y: slices[1],
                            z: slices[2],
                        }

                    case Vec4:
                        slices = slice(4)
                        return <Result>{
                            x: slices[0],
                            y: slices[1],
                            z: slices[2],
                            w: slices[3],
                        }

                    case Quat:
                        slices = slice(4)
                        return <Result>{
                            x: slices[0],
                            y: slices[1],
                            z: slices[2],
                            w: slices[3],
                        }

                    case Mat3: {
                        const n = vector_array.length / 9

                        const r = new Float32Array(4 * n)
                        const s = new Float32Array(3 * n)

                        const r_i = new Quat()
                        const s_i = new Vec3()

                        const m = new Mat4()
                        const m_data = m.data

                        for (let i = 0, offset_m = 0, offset_r = 0, offset_s = 0; i < n; i++) {
                            m.setIdentity()

                            m_data[0] = vector_array[offset_m++]
                            m_data[1] = vector_array[offset_m++]
                            m_data[2] = vector_array[offset_m++]
                            offset_m++
                            m_data[3] = vector_array[offset_m++]
                            m_data[4] = vector_array[offset_m++]
                            m_data[5] = vector_array[offset_m++]
                            offset_m++
                            m_data[6] = vector_array[offset_m++]
                            m_data[7] = vector_array[offset_m++]
                            m_data[8] = vector_array[offset_m++]
                            offset_m += 5

                            r_i.setFromMat4(m)
                            m.getScale(s_i)

                            r[offset_r++] = r_i.x
                            r[offset_r++] = r_i.y
                            r[offset_r++] = r_i.z
                            r[offset_r++] = r_i.w

                            s[offset_s++] = s_i.x
                            s[offset_s++] = s_i.y
                            s[offset_s++] = s_i.z
                        }

                        return <Result>{
                            r: recurse(Quat, dtype, r),
                            s: recurse(Vec3, dtype, s),
                        }
                    }

                    case Mat4: {
                        const n = vector_array.length / 16

                        const t = new (dtype === 'int32' ? Int32Array : Float32Array)(3 * n)
                        const r = new Float32Array(4 * n)
                        const s = new Float32Array(3 * n)

                        const t_i = new Vec3()
                        const r_i = new Quat()
                        const s_i = new Vec3()

                        const m = new Mat4()
                        const m_data = m.data

                        for (let i = 0, offset_m = 0, offset_t = 0, offset_r = 0, offset_s = 0; i < n; i++) {
                            m.setIdentity()

                            m_data[0] = vector_array[offset_m++]
                            m_data[1] = vector_array[offset_m++]
                            m_data[2] = vector_array[offset_m++]
                            m_data[3] = vector_array[offset_m++]

                            m_data[4] = vector_array[offset_m++]
                            m_data[5] = vector_array[offset_m++]
                            m_data[6] = vector_array[offset_m++]
                            m_data[7] = vector_array[offset_m++]

                            m_data[8] = vector_array[offset_m++]
                            m_data[9] = vector_array[offset_m++]
                            m_data[10] = vector_array[offset_m++]
                            m_data[11] = vector_array[offset_m++]

                            m_data[12] = vector_array[offset_m++]
                            m_data[13] = vector_array[offset_m++]
                            m_data[14] = vector_array[offset_m++]
                            m_data[15] = vector_array[offset_m++]

                            m.getTranslation(t_i)
                            r_i.setFromMat4(m)
                            m.getScale(s_i)

                            t[offset_t++] = t_i.x
                            t[offset_t++] = t_i.y
                            t[offset_t++] = t_i.z

                            r[offset_r++] = r_i.x
                            r[offset_r++] = r_i.y
                            r[offset_r++] = r_i.z
                            r[offset_r++] = r_i.w

                            s[offset_s++] = s_i.x
                            s[offset_s++] = s_i.y
                            s[offset_s++] = s_i.z
                        }

                        return <Result>{
                            t: recurse(Vec3, dtype, t),
                            r: recurse(Quat, dtype, r),
                            s: recurse(Vec3, dtype, s),
                        }
                    }

                    case Color:
                        slices = slice(4)
                        return <Result>{
                            r: slices[0],
                            g: slices[1],
                            b: slices[2],
                            a: slices[3],
                        }

                    default:
                        throw new Error()
                }
            }
        }
        else return <Result>Reflect_fromEntries<any>(
            Reflect_entries(vector).map(([key, subvector]) => <[typeof key, ReturnType<typeof recurse>]>[
                    key,
                    recurse<FieldPoint>(
                        (<FieldPointType<FieldsPoint>>type)[key],
                        dtype,
                        <FieldPointVectorStatic<FieldPoint, FieldPointVectorContainerStatic<tf.TypedArray>>>subvector
                    )
                ]
            )
        )
    }

    return recurse(type, dtype, inititialData)
}

export function field_point_tensor_decode<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank
    >(
        type: FieldPointType<T>,
        tensor: FieldPointTensor<T, R>
    ): {
        vector: FieldPointVector<T, FieldPointVectorContainerStatic<tf.TypedArray>>,
        shape: tf.ShapeMap[R]
    } {
    
}

export function field_point_tensor_dispose<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank
    >(
        type: FieldPointType<T>,
        tensor: FieldPointTensor<T, R>
    ) {
    field_point_tensor_map(
        type,
        tensor,
        raw => raw.dispose()
    )
}