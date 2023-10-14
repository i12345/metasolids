import { FieldPoint, FieldPointPrimitive, FieldsPoint } from "../../point.js"
import * as tf from "@tensorflow/tfjs"
import { FieldPointTensor } from "../tensor.js"
import { FieldPointTensorExpression, FieldPointTensorExpressionContext } from "../expression.js"
import { FieldPointType, field_point_type_equals, field_point_type_isPrimitive } from "../../type.js"
import { field_point_numbers_type } from "../../numbers.js"
import { Mat3, Mat4, Quat, Vec3, Vec4 } from "playcanvas-extended"
import { Reflect_fromEntries } from "../../../utils/reflect-entries.js"
import { TensorShape } from "../../../utils/tf-rank.js"
import { FieldPointTensorTopology } from "../topology.js"

export enum FieldPointTensorExpressionArithmeticOp {
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

const unaryFuncList = [
    FieldPointTensorExpressionArithmeticOp.neg,
    FieldPointTensorExpressionArithmeticOp.rcp,
    FieldPointTensorExpressionArithmeticOp.exp,
    FieldPointTensorExpressionArithmeticOp.ln,
    FieldPointTensorExpressionArithmeticOp.not,
    FieldPointTensorExpressionArithmeticOp.sin,
    FieldPointTensorExpressionArithmeticOp.cos,
    FieldPointTensorExpressionArithmeticOp.tan,
    FieldPointTensorExpressionArithmeticOp.asin,
    FieldPointTensorExpressionArithmeticOp.acos,
    FieldPointTensorExpressionArithmeticOp.atan,
    FieldPointTensorExpressionArithmeticOp.atan2,
    FieldPointTensorExpressionArithmeticOp.sinh,
    FieldPointTensorExpressionArithmeticOp.cosh,
    FieldPointTensorExpressionArithmeticOp.tanh,
    FieldPointTensorExpressionArithmeticOp.asinh,
    FieldPointTensorExpressionArithmeticOp.acosh,
    FieldPointTensorExpressionArithmeticOp.atanh,
]

type opFunc_unary = (a: tf.Tensor) => tf.Tensor
type opFunc_binary = (a: tf.Tensor, b: tf.Tensor) => tf.Tensor
type opFuncType = opFunc_unary | opFunc_binary
const opFuncMap = new Map<FieldPointTensorExpressionArithmeticOp, opFuncType>([
    [FieldPointTensorExpressionArithmeticOp.add, tf.add],
    [FieldPointTensorExpressionArithmeticOp.sub, tf.sub],
    [FieldPointTensorExpressionArithmeticOp.neg, tf.neg],
    [FieldPointTensorExpressionArithmeticOp.mul, tf.mul],
    [FieldPointTensorExpressionArithmeticOp.cross, undefined!],
    [FieldPointTensorExpressionArithmeticOp.dot, tf.dot],
    [FieldPointTensorExpressionArithmeticOp.div, tf.div],
    [FieldPointTensorExpressionArithmeticOp.rcp, tf.reciprocal],
    [FieldPointTensorExpressionArithmeticOp.mod, tf.mod],
    [FieldPointTensorExpressionArithmeticOp.pow, tf.pow],
    [FieldPointTensorExpressionArithmeticOp.log, undefined!],
    [FieldPointTensorExpressionArithmeticOp.exp, tf.exp],
    [FieldPointTensorExpressionArithmeticOp.ln, tf.log],
    [FieldPointTensorExpressionArithmeticOp.eq, tf.equal],
    [FieldPointTensorExpressionArithmeticOp.neq, tf.notEqual],
    [FieldPointTensorExpressionArithmeticOp.gt, tf.greater],
    [FieldPointTensorExpressionArithmeticOp.gte, tf.greaterEqual],
    [FieldPointTensorExpressionArithmeticOp.lt, tf.less],
    [FieldPointTensorExpressionArithmeticOp.lte, tf.lessEqual],
    [FieldPointTensorExpressionArithmeticOp.not, tf.logicalNot],
    [FieldPointTensorExpressionArithmeticOp.and, tf.logicalAnd],
    [FieldPointTensorExpressionArithmeticOp.or, tf.logicalOr],
    [FieldPointTensorExpressionArithmeticOp.xor, tf.logicalXor],
    [FieldPointTensorExpressionArithmeticOp.sin, tf.sin],
    [FieldPointTensorExpressionArithmeticOp.cos, tf.cos],
    [FieldPointTensorExpressionArithmeticOp.tan, tf.tan],
    [FieldPointTensorExpressionArithmeticOp.asin, tf.asin],
    [FieldPointTensorExpressionArithmeticOp.acos, tf.acos],
    [FieldPointTensorExpressionArithmeticOp.atan, tf.atan],
    [FieldPointTensorExpressionArithmeticOp.atan2, tf.atan2],
    [FieldPointTensorExpressionArithmeticOp.sinh, tf.sinh],
    [FieldPointTensorExpressionArithmeticOp.cosh, tf.cosh],
    [FieldPointTensorExpressionArithmeticOp.tanh, tf.tanh],
    [FieldPointTensorExpressionArithmeticOp.asinh, tf.asinh],
    [FieldPointTensorExpressionArithmeticOp.acosh, tf.acosh],
    [FieldPointTensorExpressionArithmeticOp.atanh, tf.atanh],
])

export class FieldPointTensorExpressionArithmetic<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
    > implements FieldPointTensorExpression<T, R> {
    type!: FieldPointType<T>
    topology!: FieldPointTensorTopology<R>
    
    constructor(
        public readonly op: FieldPointTensorExpressionArithmeticOp,
        public readonly a: FieldPointTensorExpression<FieldPoint, R>,
        public readonly b?: FieldPointTensorExpression<FieldPoint, R>,
    ) { }

    init(context: FieldPointTensorExpressionContext): void {
        this.a.init(context)
        this.b?.init(context)

        const op = this.op

        // type ShapeType = [TensorShape, FieldPointType]

        // function broadcastShape(a: TensorShape, b: TensorShape): TensorShape {
        //     const min = a.length > b.length ? b : a
        //     const max = a.length > b.length ? a : b

        //     const final = [...min]
        //     while (final.length < max.length)
        //         final.unshift(1)

        //     for (let i = 0; i < final.length; i++) {
        //         if (final[i] === 1)
        //             final[i] = max[i]
        //         else if (final[i] !== max[i])
        //             throw new Error(`Dimension ${i + 1} mismatch shape`)
        //     }
            
        //     return <TensorShape>final
        // }

        function broadcastTopology(
                a: FieldPointTensorTopology,
                b: FieldPointTensorTopology,
            ): FieldPointTensorTopology {
            if (a.space === b.space)
                return a
            else if (a.shape.length === 0)
                return b
            else if (b.shape.length === 0)
                return a
            else throw new Error("incompatible")
        }

        function broadcast(
                a_type: FieldPointType,
                b_type: FieldPointType | undefined,
                a_topology: FieldPointTensorTopology,
                b_topology: FieldPointTensorTopology | undefined,
            ): [FieldPointType, FieldPointTensorTopology] {
            if ((!a_type || a_type === Number) && (!b_type || b_type === Number)) {
                switch (op) {
                    case FieldPointTensorExpressionArithmeticOp.log:
                        return [Number, a_topology]
                    
                    default:
                        break
                }

                const func = opFuncMap.get(op)!

                if (unaryFuncList.includes(op))
                    return [Number, a_topology]
                else {
                    return [Number, broadcastTopology(a_topology, b_topology!)]
                }
            }

            const a_isPrimitive = field_point_type_isPrimitive(a_type)
            const b_isPrimitive = b_type ? field_point_type_isPrimitive(b_type) : undefined
        
            if (a_isPrimitive && (b_isPrimitive ?? true)) {
                switch (op) {
                    case FieldPointTensorExpressionArithmeticOp.cross: {
                        if (a_type !== Vec3 || b_type !== Vec3)
                            throw new Error()
                
                        return [Vec3, broadcastTopology(a_topology, b_topology!)]
                    }
                
                    case FieldPointTensorExpressionArithmeticOp.mul:
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
                
                    case FieldPointTensorExpressionArithmeticOp.div:
                        if (b_type === Mat3 || b_type === Mat4) {
                            throw new Error("not implemented")
                        }
                        break
                
                    default:
                        break
                }

                if (b_type !== undefined && a_type !== b_type) {
                    if (a_type === Boolean)
                        a_type = Number
                    if (b_type === Boolean)
                        b_type = Number

                    if (a_type !== b_type)
                        throw new Error("type")
                }

                //TODO: expand so it can multiply Vec2 * Vec3

                return [a_type, b_topology ? broadcastTopology(a_topology, b_topology) : a_topology]
            }

            const a_keys = Reflect.ownKeys(a_type)
            const b_keys = b_type ? Reflect.ownKeys(b_type) : undefined
            const keys = !a_isPrimitive ?
                !b_isPrimitive ?
                    [...a_keys, ...b_keys!] :
                    a_keys :
                !b_isPrimitive ?
                    b_keys! :
                    undefined!
        
            const result_type: FieldPointType<FieldsPoint> = {}
            let result_topology = a_topology

            for (const key of keys) {
                const [subtype, subtopology] = broadcast(
                    a_isPrimitive ? a_type : (<FieldPointType<FieldsPoint>>a_type)[key],
                    b_type ? (b_isPrimitive ? b_type : (<FieldPointType<FieldsPoint>>b_type)[key]) : undefined,
                    a_topology,
                    b_topology
                )

                result_type[key] = subtype
                result_topology = broadcastTopology(result_topology, subtopology)
            }

            return [result_type, result_topology]
        }

        [this.type, this.topology] = <[FieldPointType<T>, FieldPointTensorTopology<R>]>broadcast(this.a.type, this.b?.type, this.a.topology, this.b?.topology)
    }

    dispose(): void {
        this.a.dispose()
        this.b?.dispose()
    }
    
    eval(context: FieldPointTensorExpressionContext): FieldPointTensor<T, R> {
        const a = this.a.eval(context)
        const b = this.b?.eval(context)
        const op = this.op

        function broadcast(
                a: FieldPointTensor,
                b: FieldPointTensor | undefined,
                a_type: FieldPointType,
                b_type: FieldPointType | undefined,
            ): FieldPointTensor {
            if ((!a_type || a_type === Number) && (!b_type || b_type === Number)) {
                switch (op) {
                    case FieldPointTensorExpressionArithmeticOp.log:
                        return tf.div(
                            tf.log(<tf.Tensor>a),
                            tf.log(<tf.Tensor>b)
                        )
                        
                    default:
                        break
                }

                const func = opFuncMap.get(op)!

                if (unaryFuncList.includes(op))
                    return (<opFunc_unary>func)(<tf.Tensor>a)
                else return (<opFunc_binary>func)(<tf.Tensor>a ?? tf.zerosLike(<tf.Tensor>b), <tf.Tensor>b  ?? tf.zerosLike(<tf.Tensor>a))
            }

            const a_isPrimitive = field_point_type_isPrimitive(a_type)
            const b_isPrimitive = b_type ? field_point_type_isPrimitive(b_type) : undefined
            
            if (a_isPrimitive && (b_isPrimitive ?? true)) {
                switch (op) {
                    case FieldPointTensorExpressionArithmeticOp.cross: {
                        if (a_type !== Vec3 || b_type !== Vec3)
                            throw new Error()
                    
                        const a_typed = <FieldPointTensor<Vec3>>a
                        const b_typed = <FieldPointTensor<Vec3>>b

                        return <FieldPointTensor<Vec3>>{
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
                    
                    case FieldPointTensorExpressionArithmeticOp.mul:
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
                    
                    case FieldPointTensorExpressionArithmeticOp.div:
                        if (b_type === Mat3 || b_type === Mat4) {
                            throw new Error("not implemented")
                        }
                        break
                    
                    default:
                        break
                }

                return broadcast(
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
            
            return <FieldPointTensor<FieldsPoint>>Reflect_fromEntries(
                keys.map(key => <[typeof key, ReturnType<typeof broadcast>]>[key, broadcast(
                    a_isPrimitive ? a : (<FieldPointTensor<FieldsPoint>>a)[key],
                    b_isPrimitive ? b : (<FieldPointTensor<FieldsPoint>>b)[key],
                    a_isPrimitive ? a_type : (<FieldPointType<FieldsPoint>>a_type)[key],
                    b_isPrimitive ? b_type : (<FieldPointType<FieldsPoint>>b_type)[key],
                )])
            )
        }

        return <FieldPointTensor<T, R>>broadcast(a, b, this.a.type, this.b?.type)
    }
}