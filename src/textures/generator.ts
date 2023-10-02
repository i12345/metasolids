import { Color, Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from "playcanvas-extended";
import { FieldPoint, FieldPointMapped, FieldPointNumbers, FieldPointPrimitive, FieldsPoint, field_point_map } from "../fields/point.js";
import { FieldPointType, field_point_type_primitive_number_type } from "../fields/type.js";
import { FieldPointVectorContainerStatic, FieldPointVectorStatic } from "../fields/vectorized/point.js";
import * as tf from '@tensorflow/tfjs'
import { typedArrayConstructor } from "../utils/typed-array.js";
import { Reflect_entries, Reflect_fromEntries } from "../utils/reflect-entries.js";
import { PerRank } from "../utils/tf-rank.js";
import { PropertyPath } from "../paradigm/trees/path.js";
import { extract, intract } from "../paradigm/trees/index.js";

export type FieldPointVectorTensor<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
    > = FieldPointMapped<FieldPointNumbers<T>, tf.Tensor<R>>

export function field_point_vector_tensor_map<
        T0 extends FieldPoint = FieldPoint,
        R0 extends tf.Rank = tf.Rank,
        T1 extends FieldPoint | void = FieldPoint | void,
        R1 extends tf.Rank | undefined = R0,
    >(
        type: FieldPointType<T0>,
        tensor: FieldPointVectorTensor<T0, R0>,
        processor: (raw: tf.Tensor<R0>, path: PropertyPath) => T1 extends FieldPoint ? R1 extends tf.Rank ? tf.Tensor<R1> : void : void
    ): T1 extends FieldPoint ? R1 extends tf.Rank ? FieldPointVectorTensor<T1, R1> : void : void {
    return <any>field_point_map<T0, FieldPointType<FieldPointPrimitive>, T1 extends FieldPoint ? R1 extends tf.Rank ? FieldPointVectorTensor<T1, R1> : void : void>(
        <FieldPointMapped<T0, FieldPointType<FieldPointPrimitive>>>type,
        leaf => leaf instanceof Function,
        (leaf_type, path_primitive) => {
            const leaf_primitives = field_point_type_primitive_number_type(<FieldPointType<FieldPointPrimitive>>leaf_type)!

            return <any>field_point_map<FieldPointNumbers<FieldPointPrimitive>, FieldPointType<number>, T1 extends FieldPoint ? R1 extends tf.Rank ? tf.Tensor<R1> : void : void>(
                <any>leaf_primitives,
                leaf => leaf === Number,
                (_, path_number) => {
                    const path = [...path_primitive, ...path_number]
                    return processor(extract<tf.Tensor<R0>>(tensor, path), path)
                }
            )
        }
    )
}

export class GeneratorBuffer<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
    > {
    constructor(
        public readonly type: FieldPointType<T>,
        public readonly shape: PerRank<number | PropertyPath, R>,
        public readonly initialData?: (shape: PerRank<number, R>) => {
            data: FieldPointVectorStatic<T, tf.TypedArray>,
            dtype?: tf.DataType,
        }
    ) { }

    encode(parameters: FieldPoint): FieldPointVectorTensor<T, R> {
        const shape = <PerRank<number, R>>this.shape.map(semantic => typeof semantic === 'number' ? semantic : extract<number>(parameters, semantic))

        const initialData = this.initialData ? this.initialData(shape) : undefined
        const dtype = initialData?.dtype

        function recurse<Point extends FieldPoint = FieldPoint>(
                type: FieldPointType<Point>,
                vector?: FieldPointVectorStatic<Point, FieldPointVectorContainerStatic<tf.TypedArray>>
            ): FieldPointVectorTensor<Point, R> {
            type Result = FieldPointVectorTensor<Point, R>

            if (type instanceof Function) {
                const vector_array = <FieldPointVectorContainerStatic<tf.TypedArray>>vector

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
                    function slice(stride: number): (typeof vector_array)[] {
                        const results = new Array<typeof vector_array>(stride)
                        const n = vector_array.length / stride

                        for (let offset = 0; offset < stride; offset++) {
                            const slice = results[offset] = new (typedArrayConstructor(vector_array))(n)
                            for (let i_sliced = 0, i_original = offset; i_sliced < n; i_sliced++, i_original += stride)
                                slice[i_sliced] = vector_array[i_original]
                        }

                        return results
                    }

                    let slices: ReturnType<typeof slice>

                    switch (<FieldPointType<FieldPointPrimitive>>type) {
                        case Number:
                            return <Result>tf.tensor(vector_array, shape, dtype)
                    
                        case Vec2:
                            slices = slice(2)
                            return <Result>{
                                x: tf.tensor(slices[0], shape, dtype),
                                y: tf.tensor(slices[1], shape, dtype),
                            }
                    
                        case Vec3:
                            slices = slice(3)
                            return <Result>{
                                x: tf.tensor(slices[0], shape, dtype),
                                y: tf.tensor(slices[1], shape, dtype),
                                z: tf.tensor(slices[2], shape, dtype),
                            }
                    
                        case Vec4:
                            slices = slice(4)
                            return <Result>{
                                x: tf.tensor(slices[0], shape, dtype),
                                y: tf.tensor(slices[1], shape, dtype),
                                z: tf.tensor(slices[2], shape, dtype),
                                w: tf.tensor(slices[3], shape, dtype),
                            }
                    
                        case Quat:
                            slices = slice(4)
                            return <Result>{
                                x: tf.tensor(slices[0], shape, dtype),
                                y: tf.tensor(slices[1], shape, dtype),
                                z: tf.tensor(slices[2], shape, dtype),
                                w: tf.tensor(slices[3], shape, dtype),
                            }
                    
                        case Mat3: {
                            const n = vector_array.length / 9

                            const r = new (typedArrayConstructor(vector_array))(4 * n)
                            const s = new (typedArrayConstructor(vector_array))(3 * n)

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
                                r: recurse(Quat, r),
                                s: recurse(Vec3, s),
                            }
                        }
                        
                        case Mat4: {
                            const n = vector_array.length / 16
                        
                            const t = new (typedArrayConstructor(vector_array))(3 * n)
                            const r = new (typedArrayConstructor(vector_array))(4 * n)
                            const s = new (typedArrayConstructor(vector_array))(3 * n)

                            const t_i = new Vec3()
                            const r_i = new Quat()
                            const s_i = new Vec3()

                            const m = new Mat4()
                            const m_data = m.data

                            for (let i = 0, offset_m = 0, offset_t = 0, offset_r = 0, offset_s = 0; i < n; i++) {
                                m.setIdentity()
                            
                                m_data[0x0] = vector_array[offset_m++]
                                m_data[0x1] = vector_array[offset_m++]
                                m_data[0x2] = vector_array[offset_m++]
                                m_data[0x3] = vector_array[offset_m++]

                                m_data[0x4] = vector_array[offset_m++]
                                m_data[0x5] = vector_array[offset_m++]
                                m_data[0x6] = vector_array[offset_m++]
                                m_data[0x7] = vector_array[offset_m++]

                                m_data[0x8] = vector_array[offset_m++]
                                m_data[0x9] = vector_array[offset_m++]
                                m_data[0xA] = vector_array[offset_m++]
                                m_data[0xB] = vector_array[offset_m++]

                                m_data[0xC] = vector_array[offset_m++]
                                m_data[0xD] = vector_array[offset_m++]
                                m_data[0xE] = vector_array[offset_m++]
                                m_data[0xF] = vector_array[offset_m++]

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
                                t: recurse(Vec3, t),
                                r: recurse(Quat, r),
                                s: recurse(Vec3, s),
                            }
                        }
                    
                        case Color:
                            slices = slice(4)
                            return <Result>{
                                r: tf.tensor(slices[0], shape, dtype),
                                g: tf.tensor(slices[1], shape, dtype),
                                b: tf.tensor(slices[2], shape, dtype),
                                a: tf.tensor(slices[3], shape, dtype),
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
                            <FieldPointVectorStatic<FieldPoint, FieldPointVectorContainerStatic<tf.TypedArray>>>subvector
                        )
                    ]
                )
            )
        }

        return recurse(this.type, initialData?.data)
    }

    decode(tensor: FieldPointVectorTensor<T, R>): FieldPointVectorStatic<T> {
        
    }
}

export interface GeneratorValue<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
    > {
    type: FieldPointType<T>
    rank: R
    
    init(context: GeneratorContext): void
    
    eval(context: GeneratorContext): FieldPointVectorTensor<T, R>
}

export interface GeneratorResult {
    differentials?: Map<GeneratorBuffer, FieldPointVectorTensor[]>
    values?: Map<GeneratorBuffer, FieldPointVectorTensor>
}

export interface GeneratorContextBufferMap extends Map<GeneratorBuffer, FieldPointVectorTensor> {
    get<T extends FieldPoint, R extends tf.Rank>(buffer: GeneratorBuffer<T, R>): FieldPointVectorTensor<T, R> | undefined
}

export interface GeneratorContext {
    system: GeneratorSystem
    buffers: GeneratorContextBufferMap
}

export interface Generator {
    init(context: GeneratorContext): void

    update(context: GeneratorContext): GeneratorResult
}

export class GeneratorSystem {
    constructor(
        public buffers: GeneratorBuffer[],
        public generator: Generator,
        public end: GeneratorValue<number, tf.Rank.R0>
    ) { }
}

export class GeneratorRunner {
    readonly context: GeneratorContext = {
        buffers: new Map(),
        system: this.system
    }

    constructor(
        public readonly system: GeneratorSystem,
        public readonly parameters: FieldPoint,
        public readonly dt: number = 0.1
    ) { }

    init() {
        for (const buffer of this.system.buffers)
            this.context.buffers.set(buffer, buffer.encode(this.parameters))

        this.system.generator.init(this.context)
        this.system.end.init(this.context)
    }

    run() {
        this.update()
    }

    private update() {
        return tf.tidy(() => {
            const result = this.system.generator.update(this.context)
        
            const dt = this.dt

            if (result.differentials) {
                for (const [buffer, differential] of result.differentials) {
                    const currentValue = this.context.buffers.get(buffer)!
                    const newValue = <FieldPointVectorTensor>field_point_vector_tensor_map(
                        buffer.type,
                        currentValue,
                        (raw, path) => <any>tf.add(raw, extract<tf.Tensor>(differential, path).mul(dt))
                    )
                    this.context.buffers.set(buffer, newValue)
                }
            }

            if (result.values)
                for (const [buffer, value] of result.values)
                    this.context.buffers.set(buffer, value)
        
            return this.system.end.eval(this.context)
        })
    }
}