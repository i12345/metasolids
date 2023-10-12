import { FieldPoint, FieldPointMapped, FieldPointPrimitive, FieldsPoint, field_point_map } from "../point.js"
import { FieldPointNumbers } from "../numbers.js"
import { FieldPointType } from "../type.js"
import { field_point_numbers_type } from "../numbers.js"
import * as tf from '@tensorflow/tfjs'
import { PropertyPath } from "../../paradigm/trees/path.js"
import { extract } from "../../paradigm/trees/index.js"
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorStatic } from "../vectorized/point.js"
import { Color, Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from "playcanvas-extended"
import { Reflect_entries, Reflect_fromEntries } from "../../utils/reflect-entries.js"
import { TensorShape } from "../../utils/tf-rank.js"

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
            const leaf_primitives = field_point_numbers_type(<FieldPointType<FieldPointPrimitive>>leaf_type)!

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
        shape: TensorShape<R>,
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
        shape: TensorShape<R>
    } {
    let shape: tf.ShapeMap[R] | undefined = undefined

    const vector = field_point_map<T, FieldPointType, FieldPointVectorStatic<FieldPointPrimitive, tf.TypedArray>>(
        <FieldPointMapped<T, FieldPointType>>type,
        leaf => leaf instanceof Function,
        (leaf, path) => {
            const subtensor = extract<FieldPointTensor<FieldPointPrimitive>>(tensor, path)

            switch (<FieldPointType<FieldPointPrimitive>>leaf) {
                case Number: {
                    const element_tensor = <FieldPointTensor<number, R>>subtensor
                    shape ??= element_tensor.shape
                    return <FieldPointVectorStatic<number, tf.TypedArray>>element_tensor.dataSync()
                }

                case Boolean: {
                    const element_tensor = <FieldPointTensor<boolean, R>>subtensor
                    shape ??= element_tensor.shape
                    return <FieldPointVectorStatic<boolean, tf.TypedArray>>element_tensor.dataSync()
                }

                case Vec2: {
                    const element_tensor = <FieldPointTensor<Vec2, R>>subtensor
                    shape ??= element_tensor.x.shape
                    const merged = tf.stack([element_tensor.x, element_tensor.y], -1)
                    return <FieldPointVectorStatic<Vec2, tf.TypedArray>>merged.dataSync()
                }

                case Vec3: {
                    const element_tensor = <FieldPointTensor<Vec3, R>>subtensor
                    shape ??= element_tensor.x.shape
                    const merged = tf.stack([element_tensor.x, element_tensor.y, element_tensor.z], -1)
                    return <FieldPointVectorStatic<Vec3, tf.TypedArray>>merged.dataSync()
                }

                case Vec4: {
                    const element_tensor = <FieldPointTensor<Vec4, R>>subtensor
                    shape ??= element_tensor.x.shape
                    const merged = tf.stack([element_tensor.x, element_tensor.y, element_tensor.z, element_tensor.w], -1)
                    return <FieldPointVectorStatic<Vec4, tf.TypedArray>>merged.dataSync()
                }

                case Quat: {
                    const element_tensor = <FieldPointTensor<Quat, R>>subtensor
                    shape ??= element_tensor.x.shape
                    const merged = tf.stack([element_tensor.x, element_tensor.y, element_tensor.z, element_tensor.w], -1)
                    return <FieldPointVectorStatic<Quat, tf.TypedArray>>merged.dataSync()
                }

                case Color: {
                    const element_tensor = <FieldPointTensor<Color, R>>subtensor
                    shape ??= element_tensor.r.shape
                    const merged = tf.stack([element_tensor.r, element_tensor.g, element_tensor.b, element_tensor.a], -1)
                    return <FieldPointVectorStatic<Color, tf.TypedArray>>merged.dataSync()
                }

                case Mat3: {
                    const element_tensor = <FieldPointTensor<Mat3, R>>subtensor
                    shape ??= element_tensor.r.x.shape
                    
                    //TODO: use TF to calculate

                    const r_x = element_tensor.r.x.dataSync()
                    const r_y = element_tensor.r.y.dataSync()
                    const r_z = element_tensor.r.z.dataSync()
                    const r_w = element_tensor.r.w.dataSync()

                    const s_x = element_tensor.s.x.dataSync()
                    const s_y = element_tensor.s.y.dataSync()
                    const s_z = element_tensor.s.z.dataSync()

                    const t = Vec3.ZERO
                    const r = new Quat()
                    const s = new Vec3()

                    const m = new Mat4()
                    const m_data = m.data

                    const n = r_x.length

                    let result_i = 0
                    const result = new Float32Array(9 * n)

                    for (let i = 0; i < n; i++) {
                        r.x = r_x[i]
                        r.y = r_y[i]
                        r.z = r_z[i]
                        r.w = r_w[i]

                        s.x = s_x[i]
                        s.y = s_y[i]
                        s.z = s_z[i]

                        m.setTRS(t, r, s)

                        result[result_i++] = m_data[0x0]
                        result[result_i++] = m_data[0x1]
                        result[result_i++] = m_data[0x2]
                        result[result_i++] = m_data[0x4]
                        result[result_i++] = m_data[0x5]
                        result[result_i++] = m_data[0x6]
                        result[result_i++] = m_data[0x8]
                        result[result_i++] = m_data[0x9]
                        result[result_i++] = m_data[0xA]
                    }

                    return <FieldPointVectorStatic<Mat3, tf.TypedArray>>result
                }

                case Mat4: {
                    const element_tensor = <FieldPointTensor<Mat4, R>>subtensor
                    shape ??= element_tensor.r.x.shape
                    
                    //TODO: use TF to calculate

                    const t_x = element_tensor.t.x.dataSync()
                    const t_y = element_tensor.t.y.dataSync()
                    const t_z = element_tensor.t.z.dataSync()

                    const r_x = element_tensor.r.x.dataSync()
                    const r_y = element_tensor.r.y.dataSync()
                    const r_z = element_tensor.r.z.dataSync()
                    const r_w = element_tensor.r.w.dataSync()

                    const s_x = element_tensor.s.x.dataSync()
                    const s_y = element_tensor.s.y.dataSync()
                    const s_z = element_tensor.s.z.dataSync()

                    const t = new Vec3()
                    const r = new Quat()
                    const s = new Vec3()

                    const m = new Mat4()
                    const m_data = m.data

                    const n = r_x.length

                    let result_i = 0
                    const result = new Float32Array(9 * n)

                    for (let i = 0; i < n; i++) {
                        t.x = t_x[i]
                        t.y = t_y[i]
                        t.z = t_z[i]

                        r.x = r_x[i]
                        r.y = r_y[i]
                        r.z = r_z[i]
                        r.w = r_w[i]

                        s.x = s_x[i]
                        s.y = s_y[i]
                        s.z = s_z[i]

                        m.setTRS(t, r, s)

                        result[result_i++] = m_data[0x0]
                        result[result_i++] = m_data[0x1]
                        result[result_i++] = m_data[0x2]
                        result[result_i++] = m_data[0x3]
                        result[result_i++] = m_data[0x4]
                        result[result_i++] = m_data[0x5]
                        result[result_i++] = m_data[0x6]
                        result[result_i++] = m_data[0x7]
                        result[result_i++] = m_data[0x8]
                        result[result_i++] = m_data[0x9]
                        result[result_i++] = m_data[0xA]
                        result[result_i++] = m_data[0xB]
                        result[result_i++] = m_data[0xC]
                        result[result_i++] = m_data[0xD]
                        result[result_i++] = m_data[0xE]
                        result[result_i++] = m_data[0xF]
                    }

                    return <FieldPointVectorStatic<Mat4, tf.TypedArray>>result
                }
                
                case Array:
                case Uint8Array:
                case Uint8ClampedArray:
                case Uint16Array:
                case Uint32Array:
                case Int8Array:
                case Int16Array:
                case Int32Array: {
                    const element_tensor = <FieldPointTensor<Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array, R>>subtensor
                    shape ??= <TensorShape<R>>element_tensor.shape.slice(0, -1)
                    const raw = element_tensor.dataSync()
                    if (raw.constructor === type) return raw
                    else if (type === Float64Array || type === Float32Array || type === Array)
                        return new Float32Array(raw)
                    else if (type === Uint16Array || type === Uint32Array || type === Int16Array || type === Int32Array)
                        return new Int32Array(raw)
                    else if (type === Uint8Array || type === Uint8ClampedArray || type === Int8Array)
                        return new Uint8Array(raw)
                }
                    
                default:
                    throw new Error('invalid type')
            }
        }
    )

    return { vector, shape: <TensorShape<R>>shape! }
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