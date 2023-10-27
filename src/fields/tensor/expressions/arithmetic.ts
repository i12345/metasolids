import { FieldPoint, FieldsPoint } from "../../point.js"
import * as tf from "@tensorflow/tfjs"
import { FieldPointTensor } from "../tensor.js"
import { FieldPointTensorExpression, FieldPointTensorExpressionContext } from "../expression.js"
import { FieldPointType, field_point_type_isPrimitive } from "../../type.js"
import { Mat3, Mat4, Quat, Vec3, Vec4 } from "playcanvas-extended"
import { FieldPointTensorTopology } from "../topology.js"
import { FieldPointTensorArithmeticOp, FieldPointTensorArithmetic_opFuncMap, FieldPointTensorArithmetic_unaryFuncList, field_point_tensor_arithmetic_op } from "../arithmetic.js"

export class FieldPointTensorExpressionArithmetic<
        T extends FieldPoint = FieldPoint,
        R extends tf.Rank = tf.Rank,
    > implements FieldPointTensorExpression<T, R> {
    type!: FieldPointType<T>
    topology!: FieldPointTensorTopology<R>
    
    constructor(
        public readonly op: FieldPointTensorArithmeticOp,
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
                    case FieldPointTensorArithmeticOp.log:
                        return [Number, a_topology]
                    
                    default:
                        break
                }

                const func = FieldPointTensorArithmetic_opFuncMap.get(op)!

                if (FieldPointTensorArithmetic_unaryFuncList.includes(op))
                    return [Number, a_topology]
                else {
                    return [Number, broadcastTopology(a_topology, b_topology!)]
                }
            }

            const a_isPrimitive = field_point_type_isPrimitive(a_type)
            const b_isPrimitive = b_type ? field_point_type_isPrimitive(b_type) : undefined
        
            if (a_isPrimitive && (b_isPrimitive ?? true)) {
                switch (op) {
                    case FieldPointTensorArithmeticOp.cross: {
                        if (a_type !== Vec3 || b_type !== Vec3)
                            throw new Error()
                
                        return [Vec3, broadcastTopology(a_topology, b_topology!)]
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

        return <FieldPointTensor<T, R>>field_point_tensor_arithmetic_op(op, a, b, this.a.type, this.b?.type)
    }
}