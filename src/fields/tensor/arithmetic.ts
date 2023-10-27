import * as tf from "@tensorflow/tfjs"
import { FieldPoint, FieldPointPrimitive, FieldsPoint } from "../point.js"
import { FieldPointType, field_point_type_isPrimitive } from "../type.js"
import { FieldPointTensor } from "./tensor.js"
import { Mat3, Mat4, Quat, Vec3, Vec4 } from "playcanvas-extended"
import { Reflect_fromEntries } from "../../utils/reflect-entries.js"
import { field_point_numbers_type } from "../numbers.js"
import { GreaterRank } from "../../utils/tf-rank.js"
import { ArithmeticPrimitiveFuseModeOp } from "../vectorized/fuse-modes/arithmetic.js"

export enum FieldPointTensorArithmeticOp {
    add = "add",
    neg = "negate",
    sub = "subtract",
    mul = "multiply",
    cross = "cross product",
    dot = "dot product",
    div = "divide",
    rcp = "reciprocal",
    mod = "modulo",
    pow = "power",
    log = "logarithm",
    exp = "natural exponential",
    ln = "natural logarithm",

    min = "min",
    max = "max",

    eq = "equal",
    neq = "not equal",
    lt = "less than",
    lte = "less than or equal",
    gt = "greater than",
    gte = "greater than or equal",

    not = "not",
    and = "and",
    or = "or",
    xor = "xor",

    sin = "sin",
    cos = "cos",
    tan = "tan",
    asin = "asin",
    acos = "acos",
    atan = "atan",
    atan2 = "atan2",
    sinh = "sinh",
    cosh = "cosh",
    tanh = "tanh",
    asinh = "asinh",
    acosh = "acosh",
    atanh = "atanh",
}

export const FieldPointTensorArithmetic_unaryFuncList = [
    FieldPointTensorArithmeticOp.neg,
    FieldPointTensorArithmeticOp.rcp,
    FieldPointTensorArithmeticOp.exp,
    FieldPointTensorArithmeticOp.ln,
    FieldPointTensorArithmeticOp.not,
    FieldPointTensorArithmeticOp.sin,
    FieldPointTensorArithmeticOp.cos,
    FieldPointTensorArithmeticOp.tan,
    FieldPointTensorArithmeticOp.asin,
    FieldPointTensorArithmeticOp.acos,
    FieldPointTensorArithmeticOp.atan,
    FieldPointTensorArithmeticOp.atan2,
    FieldPointTensorArithmeticOp.sinh,
    FieldPointTensorArithmeticOp.cosh,
    FieldPointTensorArithmeticOp.tanh,
    FieldPointTensorArithmeticOp.asinh,
    FieldPointTensorArithmeticOp.acosh,
    FieldPointTensorArithmeticOp.atanh,
]

export type FieldPointTensorArithmetic_opFunc_unary = (a: tf.Tensor) => tf.Tensor
export type FieldPointTensorArithmetic_opFunc_binary = (a: tf.Tensor, b: tf.Tensor) => tf.Tensor
export type FieldPointTensorArithmetic_opFuncType = FieldPointTensorArithmetic_opFunc_unary | FieldPointTensorArithmetic_opFunc_binary
export const FieldPointTensorArithmetic_opFuncMap = new Map<FieldPointTensorArithmeticOp, FieldPointTensorArithmetic_opFuncType>([
    [FieldPointTensorArithmeticOp.add, tf.add],
    [FieldPointTensorArithmeticOp.sub, tf.sub],
    [FieldPointTensorArithmeticOp.neg, tf.neg],
    [FieldPointTensorArithmeticOp.mul, tf.mul],
    [FieldPointTensorArithmeticOp.cross, undefined!],
    [FieldPointTensorArithmeticOp.dot, tf.dot],
    [FieldPointTensorArithmeticOp.div, tf.div],
    [FieldPointTensorArithmeticOp.rcp, tf.reciprocal],
    [FieldPointTensorArithmeticOp.mod, tf.mod],
    [FieldPointTensorArithmeticOp.pow, tf.pow],
    [FieldPointTensorArithmeticOp.log, undefined!],
    [FieldPointTensorArithmeticOp.exp, tf.exp],
    [FieldPointTensorArithmeticOp.ln, tf.log],
    [FieldPointTensorArithmeticOp.min, tf.min],
    [FieldPointTensorArithmeticOp.max, tf.max],
    [FieldPointTensorArithmeticOp.eq, tf.equal],
    [FieldPointTensorArithmeticOp.neq, tf.notEqual],
    [FieldPointTensorArithmeticOp.gt, tf.greater],
    [FieldPointTensorArithmeticOp.gte, tf.greaterEqual],
    [FieldPointTensorArithmeticOp.lt, tf.less],
    [FieldPointTensorArithmeticOp.lte, tf.lessEqual],
    [FieldPointTensorArithmeticOp.not, tf.logicalNot],
    [FieldPointTensorArithmeticOp.and, tf.logicalAnd],
    [FieldPointTensorArithmeticOp.or, tf.logicalOr],
    [FieldPointTensorArithmeticOp.xor, tf.logicalXor],
    [FieldPointTensorArithmeticOp.sin, tf.sin],
    [FieldPointTensorArithmeticOp.cos, tf.cos],
    [FieldPointTensorArithmeticOp.tan, tf.tan],
    [FieldPointTensorArithmeticOp.asin, tf.asin],
    [FieldPointTensorArithmeticOp.acos, tf.acos],
    [FieldPointTensorArithmeticOp.atan, tf.atan],
    [FieldPointTensorArithmeticOp.atan2, tf.atan2],
    [FieldPointTensorArithmeticOp.sinh, tf.sinh],
    [FieldPointTensorArithmeticOp.cosh, tf.cosh],
    [FieldPointTensorArithmeticOp.tanh, tf.tanh],
    [FieldPointTensorArithmeticOp.asinh, tf.asinh],
    [FieldPointTensorArithmeticOp.acosh, tf.acosh],
    [FieldPointTensorArithmeticOp.atanh, tf.atanh],
])

const fieldPointTensorArithmeticOp_primitiveFuseMode = new Map<ArithmeticPrimitiveFuseModeOp, FieldPointTensorArithmeticOp>([
    [ArithmeticPrimitiveFuseModeOp.add, FieldPointTensorArithmeticOp.add],
    [ArithmeticPrimitiveFuseModeOp.subtract, FieldPointTensorArithmeticOp.sub],
    [ArithmeticPrimitiveFuseModeOp.multiply, FieldPointTensorArithmeticOp.mul],
    [ArithmeticPrimitiveFuseModeOp.divide, FieldPointTensorArithmeticOp.div],
    [ArithmeticPrimitiveFuseModeOp.min, FieldPointTensorArithmeticOp.min],
    [ArithmeticPrimitiveFuseModeOp.max, FieldPointTensorArithmeticOp.max],
])

export function field_point_tensor_arithmetic_op_from_primitiveFuseMode(op: ArithmeticPrimitiveFuseModeOp): FieldPointTensorArithmeticOp {
    return fieldPointTensorArithmeticOp_primitiveFuseMode.get(op)!
}

export function field_point_tensor_arithmetic_op<
        TypeA extends FieldPoint = FieldPoint,
        TypeB extends FieldPoint = FieldPoint,
        RankA extends tf.Rank = tf.Rank,
        RankB extends tf.Rank = tf.Rank,
    >(
        op: FieldPointTensorArithmeticOp,
        a: FieldPointTensor<TypeA, RankA>,
        b: FieldPointTensor<TypeB, RankB> | undefined,
        a_type: FieldPointType<TypeA>,
        b_type: FieldPointType<TypeB> | undefined,
    ): FieldPointTensor<FieldPoint, GreaterRank<RankA, RankB>> {
    type TypeC = FieldPoint
    type RankC = GreaterRank<RankA, RankB>
    type ResultT = FieldPointTensor<TypeC, RankC>

    if ((!a_type || a_type === Number) && (!b_type || b_type === Number)) {
        switch (op) {
            case FieldPointTensorArithmeticOp.log:
                return <ResultT>tf.div(
                    tf.log(<tf.Tensor>a),
                    tf.log(<tf.Tensor>b)
                )
            
            default:
                break
        }

        const func = FieldPointTensorArithmetic_opFuncMap.get(op)!

        if (FieldPointTensorArithmetic_unaryFuncList.includes(op))
            return <ResultT>(<FieldPointTensorArithmetic_opFunc_unary>func)(<tf.Tensor>a)
        else return <ResultT>(<FieldPointTensorArithmetic_opFunc_binary>func)(<tf.Tensor>a ?? tf.zerosLike(<tf.Tensor>b), <tf.Tensor>b ?? tf.zerosLike(<tf.Tensor>a))
    }

    const a_isPrimitive = field_point_type_isPrimitive(a_type)
    const b_isPrimitive = b_type ? field_point_type_isPrimitive(b_type) : undefined

    if (a_isPrimitive && (b_isPrimitive ?? true)) {
        switch (op) {
            case FieldPointTensorArithmeticOp.cross: {
                if (a_type !== Vec3 || b_type !== Vec3)
                    throw new Error()
        
                const a_typed = <FieldPointTensor<Vec3>>a
                const b_typed = <FieldPointTensor<Vec3>>b

                return <FieldPointTensor<Vec3, RankC>>{
                    x: tf.sub(
                        tf.mul(a_typed.y, b_typed.z),
                        tf.mul(a_typed.z, b_typed.y)
                    ),
                    y: tf.sub(
                        tf.mul(a_typed.z, b_typed.x),
                        tf.mul(a_typed.x, b_typed.z)
                    ),
                    z: tf.sub(
                        tf.mul(a_typed.x, b_typed.y),
                        tf.mul(a_typed.y, b_typed.x)
                    ),
                }
            }
        
            case FieldPointTensorArithmeticOp.mul:
                if (((a_type === Vec3 || a_type === Vec4) && (b_type === Mat3 || b_type === Mat4))) {
                    throw new Error("not implemented")
                }
                else if (((b_type === Vec3 || b_type === Vec4) && (a_type === Mat3 || a_type === Mat4))) {
                    throw new Error("not implemented")
                }
                else if ((a_type === Mat3 || a_type === Mat4) && (b_type === Mat3 || b_type === Mat4)) {
                    throw new Error("not implemented")
                }
                else if ((a_type === Quat) && (b_type === Mat3 || b_type === Mat4)) {
                    throw new Error("not implemented")
                }
                else if ((b_type === Quat) && (a_type === Mat3 || a_type === Mat4)) {
                    throw new Error("not implemented")
                }
                else if (a_type === Vec3 && b_type === Quat) {
                    throw new Error("not implemented")
                }
                else if (b_type === Vec3 && a_type === Quat) {
                    throw new Error("not implemented")
                }
                break
        
            case FieldPointTensorArithmeticOp.div:
                if (b_type === Mat3 || b_type === Mat4) {
                    throw new Error("not implemented")
                }
                break
        
            default:
                break
        }

        return field_point_tensor_arithmetic_op<FieldPoint, FieldPoint, RankA, RankB>(
            op,
            a,
            b,
            field_point_numbers_type(<FieldPointType<FieldPointPrimitive>>a_type),
            field_point_numbers_type(<FieldPointType<FieldPointPrimitive>>b_type)
        )
    }

    const a_keys = Reflect.ownKeys(a_type)
    const b_keys = b_type ? Reflect.ownKeys(b_type) : undefined
    const keys = !a_isPrimitive ?
        !(b_isPrimitive ?? false) ?
            [...a_keys, ...b_keys!] :
            a_keys :
        !(b_isPrimitive ?? false) ?
            b_keys! :
            undefined!

    return <FieldPointTensor<FieldsPoint, RankC>><FieldPointTensor<FieldsPoint>>Reflect_fromEntries(
        keys.map(key => <[typeof key, ReturnType<typeof field_point_tensor_arithmetic_op>]>[key, field_point_tensor_arithmetic_op<FieldPoint, FieldPoint, RankA, RankB>(
            op,
            a_isPrimitive ? a : (<FieldPointTensor<FieldsPoint, RankA>>a)[key],
            b_isPrimitive ? b : (<FieldPointTensor<FieldsPoint, RankB>>b)[key],
            a_isPrimitive ? a_type : (<FieldPointType<FieldsPoint>>a_type)[key],
            b_isPrimitive ? b_type : (<FieldPointType<FieldsPoint>>b_type)[key],
        )])
    )
}