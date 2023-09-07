import { Color, Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from "playcanvas-extended"
import { MultiObjectsTemplate, MultiObjectsIDs } from "../../../paradigm/trees/multi-objects.js"
import { IndicesTypedArray } from "../../../utils/indices-array.js"
import { FieldPoint, FieldPointPrimitive } from "../../point.js"
import { FieldPointType, field_point_type_size } from "../../type.js"
import { FieldPointWithMultiObjectPath, FusingFieldPointVectorWithMultiObjects, PrimitiveFuseMode } from "../fusing.js"
import { FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjRoot, FieldPointVectorDynamic, FieldPointVectorStatic, ItemObjValuesOffsetsKey, FieldPointVectorContainer, isDynamicVector, ItemObjIDsKey, FieldPointVector } from "../point.js"
import { mat4_from_mat3 } from "../../../utils/matrix.js"
import { NumberTypedArray, isNumberTypedArray } from "../../../utils/typed-array.js"
import { equals } from "../../../utils/equals.js"

export enum ArithmeticPrimitiveFuseModeOp {
    none,
    add,
    subtract,
    multiply,
    divide,
    max,
    min,
}

export class ArithmeticPrimitiveFuseMode<Point extends FieldPointPrimitive = FieldPointPrimitive> implements PrimitiveFuseMode<Point> {
    constructor(
        public readonly op: ArithmeticPrimitiveFuseModeOp,
        // public readonly weights?: PropertyPath
    ) { }

    fuseSingle<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array
        >(
            type: FieldPointType<Point>,
            points: FieldPointWithMultiObjectPath<Point>[],
            multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>,
            isMultiObjMappedResult?: boolean
        ): {
            reducedValue: Point
            objectValues?: FieldPointWithMultiObjectPath<Point>[]
        } | {
            reducedValue?: Point
            objectValues: FieldPointWithMultiObjectPath<Point>[]
        } {
        if (isMultiObjMappedResult)
            // no object appears in multiple points
            return { objectValues: points }

        if (points.length === 0)
            return undefined!
        else if (points.length === 1)
            return { reducedValue: points[0].value }
        else {
            if (type === Number) {
                let result: number

                switch (this.op) {
                    case ArithmeticPrimitiveFuseModeOp.none:
                        return { reducedValue: <Point>0 }
                    case ArithmeticPrimitiveFuseModeOp.add:
                        result = 0
                        for (let i = 0; i < points.length; i++)
                            result += <number>points[i].value
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.subtract:
                        result = 0
                        for (let i = 0; i < points.length; i++)
                            result -= <number>points[i].value
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.multiply:
                        result = 1
                        for (let i = 0; i < points.length; i++)
                            result -= <number>points[i].value
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.divide:
                        result = 1
                        for (let i = 0; i < points.length; i++)
                            result -= <number>points[i].value
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.min:
                        result = <number>points[0].value
                        for (let i = 1; i < points.length; i++)
                            if (result > <number>points[i].value)
                                result = <number>points[i].value
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.max:
                        result = <number>points[0].value
                        for (let i = 1; i < points.length; i++)
                        if (result < <number>points[i].value)
                            result = <number>points[i].value
                        return { reducedValue: <Point>result }
                }
            }
            else if (type === Vec2) {
                const result = new Vec2()

                switch (this.op) {
                    case ArithmeticPrimitiveFuseModeOp.none:
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.add:
                        for (let i = 0; i < points.length; i++)
                            result.add(<Vec2>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.subtract:
                        for (let i = 0; i < points.length; i++)
                            result.sub(<Vec2>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.multiply:
                        result.set(1, 1)
                        for (let i = 0; i < points.length; i++)
                            result.mul(<Vec2>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.divide:
                        result.set(1, 1)
                        for (let i = 0; i < points.length; i++)
                            result.div(<Vec2>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.min:
                        result.copy(<Vec2>points[0].value)
                        for (let i = 1; i < points.length; i++) {
                            if (result.x > (<Vec2>points[i].value).x)
                                result.x = (<Vec2>points[i].value).x
                            if (result.y > (<Vec2>points[i].value).y)
                                result.y = (<Vec2>points[i].value).y
                        }
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.max:
                        result.copy(<Vec2>points[0].value)
                        for (let i = 1; i < points.length; i++) {
                            if (result.x < (<Vec2>points[i].value).x)
                                result.x = (<Vec2>points[i].value).x
                            if (result.y < (<Vec2>points[i].value).y)
                                result.y = (<Vec2>points[i].value).y
                        }
                        return { reducedValue: <Point>result }
                }
            }
            else if (type === Vec3) {
                const result = new Vec3()

                switch (this.op) {
                    case ArithmeticPrimitiveFuseModeOp.none:
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.add:
                        for (let i = 0; i < points.length; i++)
                            result.add(<Vec3>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.subtract:
                        for (let i = 0; i < points.length; i++)
                            result.sub(<Vec3>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.multiply:
                        result.set(1, 1, 1)
                        for (let i = 0; i < points.length; i++)
                            result.mul(<Vec3>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.divide:
                        result.set(1, 1, 1)
                        for (let i = 0; i < points.length; i++)
                            result.div(<Vec3>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.min:
                        result.copy(<Vec3>points[0].value)
                        for (let i = 1; i < points.length; i++) {
                            if (result.x > (<Vec3>points[i].value).x)
                                result.x = (<Vec3>points[i].value).x
                            if (result.y > (<Vec3>points[i].value).y)
                                result.y = (<Vec3>points[i].value).y
                            if (result.z > (<Vec3>points[i].value).z)
                                result.z = (<Vec3>points[i].value).z
                        }
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.max:
                        result.copy(<Vec3>points[0].value)
                        for (let i = 1; i < points.length; i++) {
                            if (result.x < (<Vec3>points[i].value).x)
                                result.x = (<Vec3>points[i].value).x
                            if (result.y < (<Vec3>points[i].value).y)
                                result.y = (<Vec3>points[i].value).y
                            if (result.z < (<Vec3>points[i].value).z)
                                result.z = (<Vec3>points[i].value).z
                        }
                        return { reducedValue: <Point>result }
                }
            }
            else if (type === Vec4) {
                const result = new Vec4()

                switch (this.op) {
                    case ArithmeticPrimitiveFuseModeOp.none:
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.add:
                        for (let i = 0; i < points.length; i++)
                            result.add(<Vec4>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.subtract:
                        for (let i = 0; i < points.length; i++)
                            result.sub(<Vec4>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.multiply:
                        result.set(1, 1, 1, 1)
                        for (let i = 0; i < points.length; i++)
                            result.mul(<Vec4>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.divide:
                        result.set(1, 1, 1, 1)
                        for (let i = 0; i < points.length; i++)
                            result.div(<Vec4>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.min:
                        result.copy(<Vec4>points[0].value)
                        for (let i = 1; i < points.length; i++) {
                            if (result.x > (<Vec4>points[i].value).x)
                                result.x = (<Vec4>points[i].value).x
                            if (result.y > (<Vec4>points[i].value).y)
                                result.y = (<Vec4>points[i].value).y
                            if (result.z > (<Vec4>points[i].value).z)
                                result.z = (<Vec4>points[i].value).z
                            if (result.w > (<Vec4>points[i].value).w)
                                result.w = (<Vec4>points[i].value).w
                        }
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.max:
                        result.copy(<Vec4>points[0].value)
                        for (let i = 1; i < points.length; i++) {
                            if (result.x < (<Vec4>points[i].value).x)
                                result.x = (<Vec4>points[i].value).x
                            if (result.y < (<Vec4>points[i].value).y)
                                result.y = (<Vec4>points[i].value).y
                            if (result.z < (<Vec4>points[i].value).z)
                                result.z = (<Vec4>points[i].value).z
                            if (result.w < (<Vec4>points[i].value).w)
                                result.w = (<Vec4>points[i].value).w
                        }
                        return { reducedValue: <Point>result }
                }
            }
            else if (type === Color) {
                const result = new Color()

                switch (this.op) {
                    case ArithmeticPrimitiveFuseModeOp.none:
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.add:
                        for (let i = 0; i < points.length; i++) {
                            result.r += (<Color>points[i].value).r
                            result.g += (<Color>points[i].value).g
                            result.b += (<Color>points[i].value).b
                            result.a += (<Color>points[i].value).a
                        }
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.subtract:
                        for (let i = 0; i < points.length; i++) {
                            result.r -= (<Color>points[i].value).r
                            result.g -= (<Color>points[i].value).g
                            result.b -= (<Color>points[i].value).b
                            result.a -= (<Color>points[i].value).a
                        }
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.multiply:
                        result.set(1, 1, 1, 1)
                        for (let i = 0; i < points.length; i++) {
                            result.r *= (<Color>points[i].value).r
                            result.g *= (<Color>points[i].value).g
                            result.b *= (<Color>points[i].value).b
                            result.a *= (<Color>points[i].value).a
                        }
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.divide:
                        result.set(1, 1, 1, 1)
                        for (let i = 0; i < points.length; i++) {
                            result.r /= (<Color>points[i].value).r
                            result.g /= (<Color>points[i].value).g
                            result.b /= (<Color>points[i].value).b
                            result.a /= (<Color>points[i].value).a
                        }
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.min:
                        result.copy(<Color>points[0].value)
                        for (let i = 1; i < points.length; i++) {
                            if (result.r > (<Color>points[i].value).r)
                                result.r = (<Color>points[i].value).r
                            if (result.g > (<Color>points[i].value).g)
                                result.g = (<Color>points[i].value).g
                            if (result.b > (<Color>points[i].value).b)
                                result.b = (<Color>points[i].value).b
                            if (result.a > (<Color>points[i].value).a)
                                result.a = (<Color>points[i].value).a
                        }
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.max:
                        result.copy(<Color>points[0].value)
                        for (let i = 1; i < points.length; i++) {
                            if (result.r < (<Color>points[i].value).r)
                                result.r = (<Color>points[i].value).r
                            if (result.g < (<Color>points[i].value).g)
                                result.g = (<Color>points[i].value).g
                            if (result.b < (<Color>points[i].value).b)
                                result.b = (<Color>points[i].value).b
                            if (result.a < (<Color>points[i].value).a)
                                result.a = (<Color>points[i].value).a
                        }
                        return { reducedValue: <Point>result }
                }
            }
            else if (type === Quat) {
                const result = new Quat()

                switch (this.op) {
                    case ArithmeticPrimitiveFuseModeOp.none:
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.add:
                        for (let i = 0; i < points.length; i++)
                            result.mul(<Quat>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.subtract: {
                        const tmp = new Quat()
                        for (let i = 0; i < points.length; i++)
                            result.mul(tmp.copy(<Quat>points[i].value).invert())
                        return { reducedValue: <Point>result }
                    }
                    case ArithmeticPrimitiveFuseModeOp.multiply:
                        for (let i = 0; i < points.length; i++)
                            result.mul(<Quat>points[i].value)
                        return { reducedValue: <Point>result }
                    case ArithmeticPrimitiveFuseModeOp.divide: {
                        const tmp = new Quat()
                        for (let i = 0; i < points.length; i++)
                            result.mul(tmp.copy(<Quat>points[i].value).invert())
                        return { reducedValue: <Point>result }
                    }
                    case ArithmeticPrimitiveFuseModeOp.min: {
                        const tmp_euler = new Vec3()
                        const result_euler = new Vec3()
                        result_euler.copy((<Quat>points[0].value).getEulerAngles(tmp_euler))
                        for (let i = 1; i < points.length; i++) {
                            (<Quat>points[i].value).getEulerAngles(tmp_euler)

                            if (result_euler.x > tmp_euler.x)
                                result_euler.x = tmp_euler.x
                            if (result_euler.y > tmp_euler.y)
                                result_euler.y = tmp_euler.y
                            if (result_euler.z > tmp_euler.z)
                                result_euler.z = tmp_euler.z
                        }

                        result.setFromEulerAngles(result_euler)
                        return { reducedValue: <Point>result }
                    }
                    case ArithmeticPrimitiveFuseModeOp.max: {
                        const tmp_euler = new Vec3()
                        const result_euler = new Vec3()
                        result_euler.copy((<Quat>points[0].value).getEulerAngles(tmp_euler))
                        for (let i = 1; i < points.length; i++) {
                            (<Quat>points[i].value).getEulerAngles(tmp_euler)

                            if (result_euler.x < tmp_euler.x)
                                result_euler.x = tmp_euler.x
                            if (result_euler.y < tmp_euler.y)
                                result_euler.y = tmp_euler.y
                            if (result_euler.z < tmp_euler.z)
                                result_euler.z = tmp_euler.z
                        }

                        result.setFromEulerAngles(result_euler)
                        return { reducedValue: <Point>result }
                    }
                }
            }
            else if (type === Mat3) {
                switch (this.op) {
                    case ArithmeticPrimitiveFuseModeOp.none:
                        return { reducedValue: <Point>new Mat3() }
                        case ArithmeticPrimitiveFuseModeOp.add: {
                            const result = new Mat4()

                            for (let i = 0; i < points.length; i++)
                                for (let j = 0; j < 9; j++)
                                    result.data[j] += (<Mat3>points[i].value).data[j]

                            return { reducedValue: <Point>result }
                        }
                        case ArithmeticPrimitiveFuseModeOp.subtract: {
                            const result = new Mat4()

                            for (let i = 0; i < points.length; i++)
                                for (let j = 0; j < 9; j++)
                                    result.data[j] -= (<Mat3>points[i].value).data[j]

                            return { reducedValue: <Point>result }
                        }
                    case ArithmeticPrimitiveFuseModeOp.multiply: {
                        const result = new Mat4()
                        const tmp = new Mat4()

                        for (let i = 0; i < points.length; i++)
                            result.mul(mat4_from_mat3(<Mat3>points[i].value, tmp))

                        return { reducedValue: <Point>new Mat3().setFromMat4(result) }
                    }
                    case ArithmeticPrimitiveFuseModeOp.divide: {
                        const result = new Mat4()
                        const tmp = new Mat4()

                        for (let i = 0; i < points.length; i++)
                            result.mul(mat4_from_mat3(<Mat3>points[i].value, tmp).invert())

                        return { reducedValue: <Point>new Mat3().setFromMat4(result) }
                    }
                    case ArithmeticPrimitiveFuseModeOp.min:
                    case ArithmeticPrimitiveFuseModeOp.max:
                        throw new Error()
                }
            }
            else if (type === Mat4) {
                switch (this.op) {
                    case ArithmeticPrimitiveFuseModeOp.none:
                        return { reducedValue: <Point>new Mat3() }
                    case ArithmeticPrimitiveFuseModeOp.add: {
                        const result = new Mat4()

                        for (let i = 0; i < points.length; i++)
                            for (let j = 0; j < 16; j++)
                                result.data[j] += (<Mat4>points[i].value).data[j]

                        return { reducedValue: <Point>result }
                    }
                    case ArithmeticPrimitiveFuseModeOp.subtract: {
                        const result = new Mat4()

                        for (let i = 0; i < points.length; i++)
                            for (let j = 0; j < 16; j++)
                                result.data[j] -= (<Mat4>points[i].value).data[j]

                        return { reducedValue: <Point>result }
                    }
                    case ArithmeticPrimitiveFuseModeOp.multiply: {
                        const result = new Mat4()

                        for (let i = 0; i < points.length; i++)
                            result.mul(<Mat4>points[i].value)

                        return { reducedValue: <Point>result }
                    }
                    case ArithmeticPrimitiveFuseModeOp.divide: {
                        const result = new Mat4()
                        const tmp = new Mat4()

                        for (let i = 0; i < points.length; i++)
                            result.mul(tmp.copy(<Mat4>points[i].value).invert())

                        return { reducedValue: <Point>result }
                    }
                    case ArithmeticPrimitiveFuseModeOp.min:
                    case ArithmeticPrimitiveFuseModeOp.max:
                        throw new Error()
                }
            }
            else
                throw new Error("invalid type")
        }
    }

    fuseVector<
            Container extends FieldPointVectorContainer<NumberTypedArray>,
            ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>
        >(
            elementType: FieldPointType<Point>,
            results: FieldPointVectorWithMultiObjRoot<
                    Point,
                    Container,
                    FieldPointVector<Point, Container>,
                    ObjIDsT,
                    ObjIDsContainer,
                    FusingFieldPointVectorWithMultiObjects<FieldPoint, ObjIDsT, FieldPointVectorContainerStatic, ObjIDsContainer>
                >,
            points: FieldPointVectorWithMultiObjRoot<Point, Container>[],
            isMultiObjMapped?: {
                result: boolean
                points: boolean
            }
        ): void {
        //TODO: not sure if elementType should be used here
        const isDynamicVectorPoint = isDynamicVector<Point, Container>(elementType, points[0].vector)
        const elementSize = field_point_type_size(elementType)

        const isMultiObjMappedResult = isMultiObjMapped?.result ?? false
        const isMultiObjMappedPoints = isMultiObjMapped?.points ?? false

        if (isMultiObjMappedResult && !isMultiObjMappedPoints)
            throw new Error()

        //TODO: special quat & matrix multiplication/division (multiply by inverse)
        if ([Quat, Mat3, Mat4].includes(<any>elementType) &&
            [ArithmeticPrimitiveFuseModeOp.multiply, ArithmeticPrimitiveFuseModeOp.divide].includes(this.op)) {
            if (isMultiObjMappedPoints) {
                if (isDynamicVectorPoint) { // Quat/Matrix multiObj dynamic
                    const resultVector = <FieldPointVectorDynamic<Point>><any>results.vector
                    let resultVector_i: number

                    for (const { vector: vectorized, vectorizedRoot } of points) {
                        const pointVector = <FieldPointVectorDynamic<Point>><any>vectorized
                        const pointVectorLength = vectorizedRoot[ItemObjValuesOffsetsKey].length / elementSize

                        const pointVectorObjOffsets = vectorizedRoot[ItemObjValuesOffsetsKey]
                        let pointVectorObjOffset_prev = 0
                        let pointVectorObjOffset_next: number

                        let pointVectorOffset = 0
                        let resultVectorOffset = 0

                        if (isMultiObjMappedResult) { // Quat/Matrix multiObj dynamic non-reducing
                            const resultObjOffsets = results.vectorizedRoot[ItemObjValuesOffsetsKey]
                            let resultObjOffsets_prev = 0,
                                resultObjOffsets_next: number,
                                resultVectorIndex: number

                            const pointObjIDs = vectorizedRoot[ItemObjIDsKey]
                            let objID: number

                            if (isNumberTypedArray(results.vectorizedRoot[ItemObjIDsKey])) {
                                const resultObjIDs = <FieldPointVectorContainerStatic<ObjIDsT>>results.vectorizedRoot[ItemObjIDsKey]

                                switch (this.op) {
                                    case ArithmeticPrimitiveFuseModeOp.multiply:
                                        switch (elementType) {
                                            case Quat: {
                                                const result = new Quat()
                                                const point = new Quat()
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            result.set(
                                                                resultVector.get(resultVectorOffset + 0),
                                                                resultVector.get(resultVectorOffset + 1),
                                                                resultVector.get(resultVectorOffset + 2),
                                                                resultVector.get(resultVectorOffset + 3)
                                                            )

                                                            point.set(
                                                                pointVector.get(pointVectorOffset + 0),
                                                                pointVector.get(pointVectorOffset + 1),
                                                                pointVector.get(pointVectorOffset + 2),
                                                                pointVector.get(pointVectorOffset + 3)
                                                            )

                                                            result.mul(point)

                                                            resultVector.set(resultVectorOffset + 0, result.x)
                                                            resultVector.set(resultVectorOffset + 1, result.y)
                                                            resultVector.set(resultVectorOffset + 2, result.z)
                                                            resultVector.set(resultVectorOffset + 3, result.w)
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }

                                            case Mat3: {
                                                const result = new Mat4()
                                                const point = new Mat4()
                                                const result_data = result.data
                                                const point_data = point.data
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            result_data[0] = resultVector.get(resultVectorOffset + 0)
                                                            result_data[1] = resultVector.get(resultVectorOffset + 1)
                                                            result_data[2] = resultVector.get(resultVectorOffset + 2)
                                                            result_data[3] = 0
                                                            result_data[4] = resultVector.get(resultVectorOffset + 3)
                                                            result_data[5] = resultVector.get(resultVectorOffset + 4)
                                                            result_data[6] = resultVector.get(resultVectorOffset + 5)
                                                            result_data[7] = 0
                                                            result_data[8] = resultVector.get(resultVectorOffset + 6)
                                                            result_data[9] = resultVector.get(resultVectorOffset + 7)
                                                            result_data[10] = resultVector.get(resultVectorOffset + 8)
                                                            result_data[11] = 0
                                                            result_data[12] = result_data[13] = result_data[14] = result_data[15] = 0

                                                            point_data[0] = pointVector.get(pointVectorOffset + 0)
                                                            point_data[1] = pointVector.get(pointVectorOffset + 1)
                                                            point_data[2] = pointVector.get(pointVectorOffset + 2)
                                                            point_data[3] = 0
                                                            point_data[4] = pointVector.get(pointVectorOffset + 3)
                                                            point_data[5] = pointVector.get(pointVectorOffset + 4)
                                                            point_data[6] = pointVector.get(pointVectorOffset + 5)
                                                            point_data[7] = 0
                                                            point_data[8] = pointVector.get(pointVectorOffset + 6)
                                                            point_data[9] = pointVector.get(pointVectorOffset + 7)
                                                            point_data[10] = pointVector.get(pointVectorOffset + 8)
                                                            point_data[11] = 0
                                                            point_data[12] = point_data[13] = point_data[14] = point_data[15] = 0

                                                            result.mul(point)

                                                            resultVector.set(resultVectorOffset + 0, result_data[0])
                                                            resultVector.set(resultVectorOffset + 1, result_data[1])
                                                            resultVector.set(resultVectorOffset + 2, result_data[2])

                                                            resultVector.set(resultVectorOffset + 3, result_data[4])
                                                            resultVector.set(resultVectorOffset + 4, result_data[5])
                                                            resultVector.set(resultVectorOffset + 5, result_data[6])

                                                            resultVector.set(resultVectorOffset + 6, result_data[8])
                                                            resultVector.set(resultVectorOffset + 7, result_data[9])
                                                            resultVector.set(resultVectorOffset + 8, result_data[10])
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }

                                            case Mat4: {
                                                const result = new Mat4()
                                                const point = new Mat4()
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            for (let j = 0; j < 16; j++)
                                                                result.data[j] = resultVector.get(resultVectorOffset + j)
                                                            for (let j = 0; j < 16; j++)
                                                                point.data[j] = pointVector.get(pointVectorOffset + j)

                                                            result.mul(point)

                                                            for (let j = 0; j < 16; j++)
                                                                resultVector.set(resultVectorOffset + j, result.data[j])
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }
                                        }
                                        break

                                    case ArithmeticPrimitiveFuseModeOp.divide:
                                        switch (elementType) {
                                            case Quat: {
                                                const result = new Quat()
                                                const point = new Quat()
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            result.set(
                                                                resultVector.get(resultVectorOffset + 0),
                                                                resultVector.get(resultVectorOffset + 1),
                                                                resultVector.get(resultVectorOffset + 2),
                                                                resultVector.get(resultVectorOffset + 3)
                                                            )

                                                            point.set(
                                                                pointVector.get(pointVectorOffset + 0),
                                                                pointVector.get(pointVectorOffset + 1),
                                                                pointVector.get(pointVectorOffset + 2),
                                                                pointVector.get(pointVectorOffset + 3)
                                                            )

                                                            point.invert()

                                                            result.mul(point)

                                                            resultVector.set(resultVectorOffset + 0, result.x)
                                                            resultVector.set(resultVectorOffset + 1, result.y)
                                                            resultVector.set(resultVectorOffset + 2, result.z)
                                                            resultVector.set(resultVectorOffset + 3, result.w)
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }

                                            case Mat3: {
                                                const result = new Mat4()
                                                const point = new Mat4()
                                                const result_data = result.data
                                                const point_data = point.data
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            result_data[0] = resultVector.get(resultVectorOffset + 0)
                                                            result_data[1] = resultVector.get(resultVectorOffset + 1)
                                                            result_data[2] = resultVector.get(resultVectorOffset + 2)
                                                            result_data[3] = 0
                                                            result_data[4] = resultVector.get(resultVectorOffset + 3)
                                                            result_data[5] = resultVector.get(resultVectorOffset + 4)
                                                            result_data[6] = resultVector.get(resultVectorOffset + 5)
                                                            result_data[7] = 0
                                                            result_data[8] = resultVector.get(resultVectorOffset + 6)
                                                            result_data[9] = resultVector.get(resultVectorOffset + 7)
                                                            result_data[10] = resultVector.get(resultVectorOffset + 8)
                                                            result_data[11] = 0
                                                            result_data[12] = result_data[13] = result_data[14] = result_data[15] = 0

                                                            point_data[0] = pointVector.get(pointVectorOffset + 0)
                                                            point_data[1] = pointVector.get(pointVectorOffset + 1)
                                                            point_data[2] = pointVector.get(pointVectorOffset + 2)
                                                            point_data[3] = 0
                                                            point_data[4] = pointVector.get(pointVectorOffset + 3)
                                                            point_data[5] = pointVector.get(pointVectorOffset + 4)
                                                            point_data[6] = pointVector.get(pointVectorOffset + 5)
                                                            point_data[7] = 0
                                                            point_data[8] = pointVector.get(pointVectorOffset + 6)
                                                            point_data[9] = pointVector.get(pointVectorOffset + 7)
                                                            point_data[10] = pointVector.get(pointVectorOffset + 8)
                                                            point_data[11] = 0
                                                            point_data[12] = point_data[13] = point_data[14] = point_data[15] = 0

                                                            point.invert()
                                                            result.mul(point)

                                                            resultVector.set(resultVectorOffset + 0, result_data[0])
                                                            resultVector.set(resultVectorOffset + 1, result_data[1])
                                                            resultVector.set(resultVectorOffset + 2, result_data[2])

                                                            resultVector.set(resultVectorOffset + 3, result_data[4])
                                                            resultVector.set(resultVectorOffset + 4, result_data[5])
                                                            resultVector.set(resultVectorOffset + 5, result_data[6])

                                                            resultVector.set(resultVectorOffset + 6, result_data[8])
                                                            resultVector.set(resultVectorOffset + 7, result_data[9])
                                                            resultVector.set(resultVectorOffset + 8, result_data[10])
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }

                                            case Mat4: {
                                                const result = new Mat4()
                                                const point = new Mat4()
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            for (let j = 0; j < 16; j++)
                                                                result.data[j] = resultVector.get(resultVectorOffset + j)
                                                            for (let j = 0; j < 16; j++)
                                                                point.data[j] = pointVector.get(pointVectorOffset + j)
                                                            point.invert()

                                                            result.mul(point)

                                                            for (let j = 0; j < 16; j++)
                                                                resultVector.set(resultVectorOffset + j, result.data[j])
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }
                                        }
                                        break
                                }
                            }
                            else {
                                throw new Error()
                            }
                        }
                        else { // Quat/Matrix multiObj dynamic reducing
                            switch (this.op) {
                                case ArithmeticPrimitiveFuseModeOp.multiply:
                                    switch (elementType) {
                                        case Quat: {
                                            const point = new Quat()
                                            const result = new Quat()
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result.set(
                                                        resultVector.get(resultVectorOffset + 0),
                                                        resultVector.get(resultVectorOffset + 1),
                                                        resultVector.get(resultVectorOffset + 2),
                                                        resultVector.get(resultVectorOffset + 3)
                                                    )

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        point.set(
                                                            pointVector.get(pointVectorOffset + 0),
                                                            pointVector.get(pointVectorOffset + 1),
                                                            pointVector.get(pointVectorOffset + 2),
                                                            pointVector.get(pointVectorOffset + 3)
                                                        )

                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    resultVector.set(resultVectorOffset + 0, result.x)
                                                    resultVector.set(resultVectorOffset + 1, result.y)
                                                    resultVector.set(resultVectorOffset + 2, result.z)
                                                    resultVector.set(resultVectorOffset + 3, result.w)

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }

                                        case Mat3: {
                                            const point = new Mat4()
                                            const result = new Mat4()
                                            const point_data = point.data
                                            const result_data = result.data
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result_data[0] = resultVector.get(resultVectorOffset + 0)
                                                    result_data[1] = resultVector.get(resultVectorOffset + 1)
                                                    result_data[2] = resultVector.get(resultVectorOffset + 2)
                                                    result_data[3] = 0
                                                    result_data[4] = resultVector.get(resultVectorOffset + 3)
                                                    result_data[5] = resultVector.get(resultVectorOffset + 4)
                                                    result_data[6] = resultVector.get(resultVectorOffset + 5)
                                                    result_data[7] = 0
                                                    result_data[8] = resultVector.get(resultVectorOffset + 6)
                                                    result_data[9] = resultVector.get(resultVectorOffset + 7)
                                                    result_data[10] = resultVector.get(resultVectorOffset + 8)
                                                    result_data[11] = 0
                                                    result_data[12] = result_data[13] = result_data[14] = result_data[15] = 0

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        point_data[0] = pointVector.get(pointVectorOffset + 0)
                                                        point_data[1] = pointVector.get(pointVectorOffset + 1)
                                                        point_data[2] = pointVector.get(pointVectorOffset + 2)
                                                        point_data[3] = 0
                                                        point_data[4] = pointVector.get(pointVectorOffset + 3)
                                                        point_data[5] = pointVector.get(pointVectorOffset + 4)
                                                        point_data[6] = pointVector.get(pointVectorOffset + 5)
                                                        point_data[7] = 0
                                                        point_data[8] = pointVector.get(pointVectorOffset + 6)
                                                        point_data[9] = pointVector.get(pointVectorOffset + 7)
                                                        point_data[10] = pointVector.get(pointVectorOffset + 8)
                                                        point_data[11] = 0
                                                        point_data[12] = point_data[13] = point_data[14] = point_data[15] = 0

                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    resultVector.set(resultVectorOffset + 0, result_data[0])
                                                    resultVector.set(resultVectorOffset + 1, result_data[1])
                                                    resultVector.set(resultVectorOffset + 2, result_data[2])

                                                    resultVector.set(resultVectorOffset + 3, result_data[4])
                                                    resultVector.set(resultVectorOffset + 4, result_data[5])
                                                    resultVector.set(resultVectorOffset + 5, result_data[6])

                                                    resultVector.set(resultVectorOffset + 6, result_data[8])
                                                    resultVector.set(resultVectorOffset + 7, result_data[9])
                                                    resultVector.set(resultVectorOffset + 8, result_data[10])

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }

                                        case Mat4: {
                                            const point = new Mat4()
                                            const result = new Mat4()
                                            const point_data = point.data
                                            const result_data = result.data
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result.setIdentity()

                                                    for (let j = 0; j < 16; j++)
                                                        result_data[j] = resultVector.get(resultVectorOffset + j)

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        for (let j = 0; j < 16; j++)
                                                            point_data[j] = pointVector.get(pointVectorOffset + j)

                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    for (let j = 0; j < 16; j++)
                                                        resultVector.set(resultVectorOffset + j, result_data[j])

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.divide:
                                    switch (elementType) {
                                        case Quat: {
                                            const point = new Quat()
                                            const result = new Quat()
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result.set(
                                                        resultVector.get(resultVectorOffset + 0),
                                                        resultVector.get(resultVectorOffset + 1),
                                                        resultVector.get(resultVectorOffset + 2),
                                                        resultVector.get(resultVectorOffset + 3)
                                                    )

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        point.set(
                                                            pointVector.get(pointVectorOffset + 0),
                                                            pointVector.get(pointVectorOffset + 1),
                                                            pointVector.get(pointVectorOffset + 2),
                                                            pointVector.get(pointVectorOffset + 3)
                                                        )

                                                        point.invert()
                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    resultVector.set(resultVectorOffset + 0, result.x)
                                                    resultVector.set(resultVectorOffset + 1, result.y)
                                                    resultVector.set(resultVectorOffset + 2, result.z)
                                                    resultVector.set(resultVectorOffset + 3, result.w)

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }

                                        case Mat3: {
                                            const point = new Mat4()
                                            const result = new Mat4()
                                            const point_data = point.data
                                            const result_data = result.data
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result_data[0] = resultVector.get(resultVectorOffset + 0)
                                                    result_data[1] = resultVector.get(resultVectorOffset + 1)
                                                    result_data[2] = resultVector.get(resultVectorOffset + 2)
                                                    result_data[3] = 0
                                                    result_data[4] = resultVector.get(resultVectorOffset + 3)
                                                    result_data[5] = resultVector.get(resultVectorOffset + 4)
                                                    result_data[6] = resultVector.get(resultVectorOffset + 5)
                                                    result_data[7] = 0
                                                    result_data[8] = resultVector.get(resultVectorOffset + 6)
                                                    result_data[9] = resultVector.get(resultVectorOffset + 7)
                                                    result_data[10] = resultVector.get(resultVectorOffset + 8)
                                                    result_data[11] = 0
                                                    result_data[12] = result_data[13] = result_data[14] = result_data[15] = 0

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        point_data[0] = pointVector.get(pointVectorOffset + 0)
                                                        point_data[1] = pointVector.get(pointVectorOffset + 1)
                                                        point_data[2] = pointVector.get(pointVectorOffset + 2)
                                                        point_data[3] = 0
                                                        point_data[4] = pointVector.get(pointVectorOffset + 3)
                                                        point_data[5] = pointVector.get(pointVectorOffset + 4)
                                                        point_data[6] = pointVector.get(pointVectorOffset + 5)
                                                        point_data[7] = 0
                                                        point_data[8] = pointVector.get(pointVectorOffset + 6)
                                                        point_data[9] = pointVector.get(pointVectorOffset + 7)
                                                        point_data[10] = pointVector.get(pointVectorOffset + 8)
                                                        point_data[11] = 0
                                                        point_data[12] = point_data[13] = point_data[14] = point_data[15] = 0

                                                        point.invert()
                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    resultVector.set(resultVectorOffset + 0, result_data[0])
                                                    resultVector.set(resultVectorOffset + 1, result_data[1])
                                                    resultVector.set(resultVectorOffset + 2, result_data[2])

                                                    resultVector.set(resultVectorOffset + 3, result_data[4])
                                                    resultVector.set(resultVectorOffset + 4, result_data[5])
                                                    resultVector.set(resultVectorOffset + 5, result_data[6])

                                                    resultVector.set(resultVectorOffset + 6, result_data[8])
                                                    resultVector.set(resultVectorOffset + 7, result_data[9])
                                                    resultVector.set(resultVectorOffset + 8, result_data[10])

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }

                                        case Mat4: {
                                            const point = new Mat4()
                                            const result = new Mat4()
                                            const point_data = point.data
                                            const result_data = result.data
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result.setIdentity()

                                                    for (let j = 0; j < 16; j++)
                                                        result_data[j] = resultVector.get(resultVectorOffset + j)

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        for (let j = 0; j < 16; j++)
                                                            point_data[j] = pointVector.get(pointVectorOffset + j)

                                                        point.invert()
                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    for (let j = 0; j < 16; j++)
                                                        resultVector.set(resultVectorOffset + j, result_data[j])

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }
                                    }
                                    break
                            }
                        }
                    }
                }
                else { // Quat/Matrix multiObj static
                    const resultVector = <FieldPointVectorStatic<Point, FieldPointVectorContainerStatic>><any>results.vector
                    let resultVector_i: number

                    for (const { vector: vectorized, vectorizedRoot } of points) {
                        const pointVector = <FieldPointVectorStatic<Point, FieldPointVectorContainerStatic>><any>vectorized
                        const pointVectorLength = vectorizedRoot[ItemObjValuesOffsetsKey].length / elementSize

                        const pointVectorObjOffsets = vectorizedRoot[ItemObjValuesOffsetsKey]
                        let pointVectorObjOffset_prev = 0
                        let pointVectorObjOffset_next: number

                        let pointVectorOffset = 0
                        let resultVectorOffset = 0

                        if (isMultiObjMappedResult) { // Quat/Matrix multiObj static non-reducing
                            const resultObjOffsets = results.vectorizedRoot[ItemObjValuesOffsetsKey]
                            let resultObjOffsets_prev = 0,
                                resultObjOffsets_next: number,
                                resultVectorIndex: number

                            const pointObjIDs = vectorizedRoot[ItemObjIDsKey]
                            let objID: number

                            if (isNumberTypedArray(results.vectorizedRoot[ItemObjIDsKey])) {
                                const resultObjIDs = <FieldPointVectorContainerStatic<ObjIDsT>>results.vectorizedRoot[ItemObjIDsKey]

                                switch (this.op) {
                                    case ArithmeticPrimitiveFuseModeOp.multiply:
                                        switch (elementType) {
                                            case Quat: {
                                                const result = new Quat()
                                                const point = new Quat()
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            result.set(
                                                                resultVector[resultVectorOffset + 0],
                                                                resultVector[resultVectorOffset + 1],
                                                                resultVector[resultVectorOffset + 2],
                                                                resultVector[resultVectorOffset + 3]
                                                            )

                                                            point.set(
                                                                pointVector[pointVectorOffset + 0],
                                                                pointVector[pointVectorOffset + 1],
                                                                pointVector[pointVectorOffset + 2],
                                                                pointVector[pointVectorOffset + 3]
                                                            )

                                                            result.mul(point)

                                                            resultVector[resultVectorOffset + 0] = result.x
                                                            resultVector[resultVectorOffset + 1] = result.y
                                                            resultVector[resultVectorOffset + 2] = result.z
                                                            resultVector[resultVectorOffset + 3] = result.w
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }

                                            case Mat3: {
                                                const result = new Mat4()
                                                const point = new Mat4()
                                                const result_data = result.data
                                                const point_data = point.data
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            result_data[0] = resultVector[resultVectorOffset + 0]
                                                            result_data[1] = resultVector[resultVectorOffset + 1]
                                                            result_data[2] = resultVector[resultVectorOffset + 2]
                                                            result_data[3] = 0
                                                            result_data[4] = resultVector[resultVectorOffset + 3]
                                                            result_data[5] = resultVector[resultVectorOffset + 4]
                                                            result_data[6] = resultVector[resultVectorOffset + 5]
                                                            result_data[7] = 0
                                                            result_data[8] = resultVector[resultVectorOffset + 6]
                                                            result_data[9] = resultVector[resultVectorOffset + 7]
                                                            result_data[10] = resultVector[resultVectorOffset + 8]
                                                            result_data[11] = 0
                                                            result_data[12] = result_data[13] = result_data[14] = result_data[15] = 0

                                                            point_data[0] = pointVector[pointVectorOffset + 0]
                                                            point_data[1] = pointVector[pointVectorOffset + 1]
                                                            point_data[2] = pointVector[pointVectorOffset + 2]
                                                            point_data[3] = 0
                                                            point_data[4] = pointVector[pointVectorOffset + 3]
                                                            point_data[5] = pointVector[pointVectorOffset + 4]
                                                            point_data[6] = pointVector[pointVectorOffset + 5]
                                                            point_data[7] = 0
                                                            point_data[8] = pointVector[pointVectorOffset + 6]
                                                            point_data[9] = pointVector[pointVectorOffset + 7]
                                                            point_data[10] = pointVector[pointVectorOffset + 8]
                                                            point_data[11] = 0
                                                            point_data[12] = point_data[13] = point_data[14] = point_data[15] = 0

                                                            result.mul(point)

                                                            resultVector[resultVectorOffset + 0] = result_data[0]
                                                            resultVector[resultVectorOffset + 1] = result_data[1]
                                                            resultVector[resultVectorOffset + 2] = result_data[2]

                                                            resultVector[resultVectorOffset + 3] = result_data[4]
                                                            resultVector[resultVectorOffset + 4] = result_data[5]
                                                            resultVector[resultVectorOffset + 5] = result_data[6]

                                                            resultVector[resultVectorOffset + 6] = result_data[8]
                                                            resultVector[resultVectorOffset + 7] = result_data[9]
                                                            resultVector[resultVectorOffset + 8] = result_data[10]
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }

                                            case Mat4: {
                                                const result = new Mat4()
                                                const point = new Mat4()
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            result.data = <Float32Array><unknown>resultVector.subarray(resultVectorOffset, resultVectorOffset + 16)
                                                            point.data = <Float32Array><unknown>pointVector.subarray(pointVectorOffset, pointVectorOffset + 16)

                                                            result.mul(point)
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }
                                        }
                                        break

                                    case ArithmeticPrimitiveFuseModeOp.divide:
                                        switch (elementType) {
                                            case Quat: {
                                                const result = new Quat()
                                                const point = new Quat()
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            result.set(
                                                                resultVector[resultVectorOffset + 0],
                                                                resultVector[resultVectorOffset + 1],
                                                                resultVector[resultVectorOffset + 2],
                                                                resultVector[resultVectorOffset + 3]
                                                            )

                                                            point.set(
                                                                pointVector[pointVectorOffset + 0],
                                                                pointVector[pointVectorOffset + 1],
                                                                pointVector[pointVectorOffset + 2],
                                                                pointVector[pointVectorOffset + 3]
                                                            )

                                                            point.invert()

                                                            result.mul(point)

                                                            resultVector[resultVectorOffset + 0] = result.x
                                                            resultVector[resultVectorOffset + 1] = result.y
                                                            resultVector[resultVectorOffset + 2] = result.z
                                                            resultVector[resultVectorOffset + 3] = result.w
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }

                                            case Mat3: {
                                                const result = new Mat4()
                                                const point = new Mat4()
                                                const result_data = result.data
                                                const point_data = point.data
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            result_data[0] = resultVector[resultVectorOffset + 0]
                                                            result_data[1] = resultVector[resultVectorOffset + 1]
                                                            result_data[2] = resultVector[resultVectorOffset + 2]
                                                            result_data[3] = 0
                                                            result_data[4] = resultVector[resultVectorOffset + 3]
                                                            result_data[5] = resultVector[resultVectorOffset + 4]
                                                            result_data[6] = resultVector[resultVectorOffset + 5]
                                                            result_data[7] = 0
                                                            result_data[8] = resultVector[resultVectorOffset + 6]
                                                            result_data[9] = resultVector[resultVectorOffset + 7]
                                                            result_data[10] = resultVector[resultVectorOffset + 8]
                                                            result_data[11] = 0
                                                            result_data[12] = result_data[13] = result_data[14] = result_data[15] = 0

                                                            point_data[0] = pointVector[pointVectorOffset + 0]
                                                            point_data[1] = pointVector[pointVectorOffset + 1]
                                                            point_data[2] = pointVector[pointVectorOffset + 2]
                                                            point_data[3] = 0
                                                            point_data[4] = pointVector[pointVectorOffset + 3]
                                                            point_data[5] = pointVector[pointVectorOffset + 4]
                                                            point_data[6] = pointVector[pointVectorOffset + 5]
                                                            point_data[7] = 0
                                                            point_data[8] = pointVector[pointVectorOffset + 6]
                                                            point_data[9] = pointVector[pointVectorOffset + 7]
                                                            point_data[10] = pointVector[pointVectorOffset + 8]
                                                            point_data[11] = 0
                                                            point_data[12] = point_data[13] = point_data[14] = point_data[15] = 0

                                                            point.invert()
                                                            result.mul(point)

                                                            resultVector[resultVectorOffset + 0] = result_data[0]
                                                            resultVector[resultVectorOffset + 1] = result_data[1]
                                                            resultVector[resultVectorOffset + 2] = result_data[2]

                                                            resultVector[resultVectorOffset + 3] = result_data[4]
                                                            resultVector[resultVectorOffset + 4] = result_data[5]
                                                            resultVector[resultVectorOffset + 5] = result_data[6]

                                                            resultVector[resultVectorOffset + 6] = result_data[8]
                                                            resultVector[resultVectorOffset + 7] = result_data[9]
                                                            resultVector[resultVectorOffset + 8] = result_data[10]
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }

                                            case Mat4: {
                                                const result = new Mat4()
                                                const point = new Mat4()
                                                for (let i = 0; i < pointVectorLength; i++) {
                                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                                    resultObjOffsets_next = resultObjOffsets[i]

                                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                        do {
                                                            objID = pointObjIDs[pointVectorObjOffset_prev]

                                                            for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                                if (resultObjIDs[resultVectorIndex] === objID)
                                                                    break

                                                            if (resultVectorIndex === resultObjOffsets_next)
                                                                throw new Error("object present in source but not result")

                                                            pointVectorOffset = elementSize * pointVectorObjOffset_prev
                                                            resultVectorOffset = elementSize * resultVectorIndex

                                                            result.data = <Float32Array><unknown>resultVector.subarray(resultVectorOffset, resultVectorOffset + 16)
                                                            point.data.set(pointVector.subarray(pointVectorOffset, pointVectorOffset + 16))
                                                            point.invert()

                                                            result.mul(point)
                                                        }
                                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                    }

                                                    resultObjOffsets_prev = resultObjOffsets_next
                                                }
                                                break
                                            }
                                        }
                                        break
                                }
                            }
                            else {
                                throw new Error()
                            }
                        }
                        else { // Quat/Matrix multiObj dynamic reducing
                            switch (this.op) {
                                case ArithmeticPrimitiveFuseModeOp.multiply:
                                    switch (elementType) {
                                        case Quat: {
                                            const point = new Quat()
                                            const result = new Quat()
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result.set(
                                                        resultVector[resultVectorOffset + 0],
                                                        resultVector[resultVectorOffset + 1],
                                                        resultVector[resultVectorOffset + 2],
                                                        resultVector[resultVectorOffset + 3]
                                                    )

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        point.set(
                                                            pointVector[pointVectorOffset + 0],
                                                            pointVector[pointVectorOffset + 1],
                                                            pointVector[pointVectorOffset + 2],
                                                            pointVector[pointVectorOffset + 3]
                                                        )

                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    resultVector[resultVectorOffset + 0] = result.x
                                                    resultVector[resultVectorOffset + 1] = result.y
                                                    resultVector[resultVectorOffset + 2] = result.z
                                                    resultVector[resultVectorOffset + 3] = result.w

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }

                                        case Mat3: {
                                            const point = new Mat4()
                                            const result = new Mat4()
                                            const point_data = point.data
                                            const result_data = result.data
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result_data[0] = resultVector[resultVectorOffset + 0]
                                                    result_data[1] = resultVector[resultVectorOffset + 1]
                                                    result_data[2] = resultVector[resultVectorOffset + 2]
                                                    result_data[3] = 0
                                                    result_data[4] = resultVector[resultVectorOffset + 3]
                                                    result_data[5] = resultVector[resultVectorOffset + 4]
                                                    result_data[6] = resultVector[resultVectorOffset + 5]
                                                    result_data[7] = 0
                                                    result_data[8] = resultVector[resultVectorOffset + 6]
                                                    result_data[9] = resultVector[resultVectorOffset + 7]
                                                    result_data[10] = resultVector[resultVectorOffset + 8]
                                                    result_data[11] = 0
                                                    result_data[12] = result_data[13] = result_data[14] = result_data[15] = 0

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        point_data[0] = pointVector[pointVectorOffset + 0]
                                                        point_data[1] = pointVector[pointVectorOffset + 1]
                                                        point_data[2] = pointVector[pointVectorOffset + 2]
                                                        point_data[3] = 0
                                                        point_data[4] = pointVector[pointVectorOffset + 3]
                                                        point_data[5] = pointVector[pointVectorOffset + 4]
                                                        point_data[6] = pointVector[pointVectorOffset + 5]
                                                        point_data[7] = 0
                                                        point_data[8] = pointVector[pointVectorOffset + 6]
                                                        point_data[9] = pointVector[pointVectorOffset + 7]
                                                        point_data[10] = pointVector[pointVectorOffset + 8]
                                                        point_data[11] = 0
                                                        point_data[12] = point_data[13] = point_data[14] = point_data[15] = 0

                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    resultVector[resultVectorOffset + 0] = result_data[0]
                                                    resultVector[resultVectorOffset + 1] = result_data[1]
                                                    resultVector[resultVectorOffset + 2] = result_data[2]

                                                    resultVector[resultVectorOffset + 3] = result_data[4]
                                                    resultVector[resultVectorOffset + 4] = result_data[5]
                                                    resultVector[resultVectorOffset + 5] = result_data[6]

                                                    resultVector[resultVectorOffset + 6] = result_data[8]
                                                    resultVector[resultVectorOffset + 7] = result_data[9]
                                                    resultVector[resultVectorOffset + 8] = result_data[10]

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }

                                        case Mat4: {
                                            const point = new Mat4()
                                            const result = new Mat4()
                                            const point_data = point.data
                                            const result_data = result.data
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result.setIdentity()

                                                    result.data = <Float32Array><unknown>resultVector.subarray(resultVectorOffset, resultVectorOffset + 16)

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        point.data = <Float32Array><unknown>pointVector.subarray(pointVectorOffset, pointVectorOffset + 16)

                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.divide:
                                    switch (elementType) {
                                        case Quat: {
                                            const point = new Quat()
                                            const result = new Quat()
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result.set(
                                                        resultVector[resultVectorOffset + 0],
                                                        resultVector[resultVectorOffset + 1],
                                                        resultVector[resultVectorOffset + 2],
                                                        resultVector[resultVectorOffset + 3]
                                                    )

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        point.set(
                                                            pointVector[pointVectorOffset + 0],
                                                            pointVector[pointVectorOffset + 1],
                                                            pointVector[pointVectorOffset + 2],
                                                            pointVector[pointVectorOffset + 3]
                                                        )

                                                        point.invert()
                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    resultVector[resultVectorOffset + 0] = result.x
                                                    resultVector[resultVectorOffset + 1] = result.y
                                                    resultVector[resultVectorOffset + 2] = result.z
                                                    resultVector[resultVectorOffset + 3] = result.w

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }

                                        case Mat3: {
                                            const point = new Mat4()
                                            const result = new Mat4()
                                            const point_data = point.data
                                            const result_data = result.data
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result_data[0] = resultVector[resultVectorOffset + 0]
                                                    result_data[1] = resultVector[resultVectorOffset + 1]
                                                    result_data[2] = resultVector[resultVectorOffset + 2]
                                                    result_data[3] = 0
                                                    result_data[4] = resultVector[resultVectorOffset + 3]
                                                    result_data[5] = resultVector[resultVectorOffset + 4]
                                                    result_data[6] = resultVector[resultVectorOffset + 5]
                                                    result_data[7] = 0
                                                    result_data[8] = resultVector[resultVectorOffset + 6]
                                                    result_data[9] = resultVector[resultVectorOffset + 7]
                                                    result_data[10] = resultVector[resultVectorOffset + 8]
                                                    result_data[11] = 0
                                                    result_data[12] = result_data[13] = result_data[14] = result_data[15] = 0

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        point_data[0] = pointVector[pointVectorOffset + 0]
                                                        point_data[1] = pointVector[pointVectorOffset + 1]
                                                        point_data[2] = pointVector[pointVectorOffset + 2]
                                                        point_data[3] = 0
                                                        point_data[4] = pointVector[pointVectorOffset + 3]
                                                        point_data[5] = pointVector[pointVectorOffset + 4]
                                                        point_data[6] = pointVector[pointVectorOffset + 5]
                                                        point_data[7] = 0
                                                        point_data[8] = pointVector[pointVectorOffset + 6]
                                                        point_data[9] = pointVector[pointVectorOffset + 7]
                                                        point_data[10] = pointVector[pointVectorOffset + 8]
                                                        point_data[11] = 0
                                                        point_data[12] = point_data[13] = point_data[14] = point_data[15] = 0

                                                        point.invert()
                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    resultVector[resultVectorOffset + 0] = result_data[0]
                                                    resultVector[resultVectorOffset + 1] = result_data[1]
                                                    resultVector[resultVectorOffset + 2] = result_data[2]

                                                    resultVector[resultVectorOffset + 3] = result_data[4]
                                                    resultVector[resultVectorOffset + 4] = result_data[5]
                                                    resultVector[resultVectorOffset + 5] = result_data[6]

                                                    resultVector[resultVectorOffset + 6] = result_data[8]
                                                    resultVector[resultVectorOffset + 7] = result_data[9]
                                                    resultVector[resultVectorOffset + 8] = result_data[10]

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }

                                        case Mat4: {
                                            const point = new Mat4()
                                            const result = new Mat4()
                                            const point_data = point.data
                                            const result_data = result.data
                                            for (let i = 0; i < pointVectorLength; i++) {
                                                pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                                if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                                    result.setIdentity()

                                                    result.data = <Float32Array><unknown>resultVector.subarray(resultVectorOffset, resultVectorOffset + 16)

                                                    do {
                                                        pointVectorOffset = elementSize * pointVectorObjOffset_prev

                                                        point.data.set(pointVector.subarray(pointVectorOffset, pointVectorOffset + 16))

                                                        point.invert()
                                                        result.mul(point)
                                                    }
                                                    while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                                    pointVectorObjOffset_prev = pointVectorObjOffset_next
                                                }

                                                resultVectorOffset += elementSize
                                            }
                                            break
                                        }
                                    }
                                    break
                            }
                        }
                    }
                }
            }
            else {
                if (isDynamicVectorPoint) { // Quat/Matrix non-multi-obj dynamic
                    const resultVector = <FieldPointVectorDynamic<Point>><any>results.vector
                    let resultVector_i: number

                    for (const { vector: vectorized } of points) {
                        const pointVector = <FieldPointVectorDynamic<Point>><any>vectorized
                        let pointVector_i = 0

                        switch (this.op) {
                            case ArithmeticPrimitiveFuseModeOp.multiply:
                                switch (elementType) {
                                    case Quat: {
                                        const result = new Quat()
                                        const point = new Quat()
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 4) {
                                            result.set(
                                                resultVector.get(resultVector_i + 0),
                                                resultVector.get(resultVector_i + 1),
                                                resultVector.get(resultVector_i + 2),
                                                resultVector.get(resultVector_i + 3)
                                            )

                                            point.set(
                                                pointVector.get(pointVector_i + 0),
                                                pointVector.get(pointVector_i + 1),
                                                pointVector.get(pointVector_i + 2),
                                                pointVector.get(pointVector_i + 3)
                                            )

                                            result.mul(point)

                                            resultVector.set(resultVector_i + 0, result.x)
                                            resultVector.set(resultVector_i + 1, result.y)
                                            resultVector.set(resultVector_i + 2, result.z)
                                            resultVector.set(resultVector_i + 3, result.w)
                                        }
                                        break
                                    }

                                    case Mat3: {
                                        const result = new Mat4()
                                        const point = new Mat4()
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 9) {
                                            result.setIdentity()
                                            point.setIdentity()
                                            for (let j = 0; j < 9; j++)
                                                result.data[j] = resultVector.get(resultVector_i + j)
                                            for (let j = 0; j < 9; j++)
                                                point.data[j] = pointVector.get(pointVector_i + j)

                                            result.mul(point)

                                            for (let j = 0; j < 9; j++)
                                                resultVector.set(resultVector_i + j, result.data[j])
                                        }
                                        break
                                    }

                                    case Mat4: {
                                        const result = new Mat4()
                                        const point = new Mat4()
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 16) {
                                            for (let j = 0; j < 16; j++)
                                                result.data[j] = resultVector.get(resultVector_i + j)
                                            for (let j = 0; j < 16; j++)
                                                point.data[j] = pointVector.get(pointVector_i + j)

                                            result.mul(point)

                                            for (let j = 0; j < 16; j++)
                                                resultVector.set(resultVector_i + j, result.data[j])
                                        }
                                        break
                                    }
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.divide:
                                switch (elementType) {
                                    case Quat: {
                                        const result = new Quat()
                                        const point = new Quat()
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 4) {
                                            result.set(
                                                resultVector.get(resultVector_i + 0),
                                                resultVector.get(resultVector_i + 1),
                                                resultVector.get(resultVector_i + 2),
                                                resultVector.get(resultVector_i + 3)
                                            )

                                            point.set(
                                                pointVector.get(pointVector_i + 0),
                                                pointVector.get(pointVector_i + 1),
                                                pointVector.get(pointVector_i + 2),
                                                pointVector.get(pointVector_i + 3)
                                            )
                                            point.invert()

                                            result.mul(point)

                                            resultVector.set(resultVector_i + 0, result.x)
                                            resultVector.set(resultVector_i + 1, result.y)
                                            resultVector.set(resultVector_i + 2, result.z)
                                            resultVector.set(resultVector_i + 3, result.w)
                                        }
                                        break
                                    }

                                    case Mat3: {
                                        const result = new Mat4()
                                        const point = new Mat4()
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 9) {
                                            result.setIdentity()
                                            point.setIdentity()
                                            for (let j = 0; j < 9; j++)
                                                result.data[j] = resultVector.get(resultVector_i + j)
                                            for (let j = 0; j < 9; j++)
                                                point.data[j] = pointVector.get(pointVector_i + j)
                                            point.invert()

                                            result.mul(point)

                                            for (let j = 0; j < 9; j++)
                                                resultVector.set(resultVector_i + j, result.data[j])
                                        }
                                        break
                                    }

                                    case Mat4: {
                                        const result = new Mat4()
                                        const point = new Mat4()
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 16) {
                                            for (let j = 0; j < 16; j++)
                                                result.data[j] = resultVector.get(resultVector_i + j)
                                            for (let j = 0; j < 16; j++)
                                                point.data[j] = pointVector.get(pointVector_i + j)
                                            point.invert()

                                            result.mul(point)

                                            for (let j = 0; j < 16; j++)
                                                resultVector.set(resultVector_i + j, result.data[j])
                                        }
                                        break
                                    }
                                }
                                break
                        }
                    }
                }
                else { // Quat/Matrix non-multi-obj static
                    const resultVector = <FieldPointVectorStatic<Point, FieldPointVectorContainerStatic>><any>results.vector
                    let resultVector_i: number

                    for (const { vector: vectorized } of points) {
                        const pointVector = <FieldPointVectorStatic<Point, FieldPointVectorContainerStatic>><any>vectorized
                        let pointVector_i = 0

                        switch (this.op) {
                            case ArithmeticPrimitiveFuseModeOp.multiply:
                                switch (elementType) {
                                    case Quat: {
                                        const result = new Quat()
                                        const point = new Quat()
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 4) {
                                            result.set(
                                                resultVector[resultVector_i + 0],
                                                resultVector[resultVector_i + 1],
                                                resultVector[resultVector_i + 2],
                                                resultVector[resultVector_i + 3]
                                            )

                                            point.set(
                                                pointVector[pointVector_i + 0],
                                                pointVector[pointVector_i + 1],
                                                pointVector[pointVector_i + 2],
                                                pointVector[pointVector_i + 3]
                                            )

                                            result.mul(point)

                                            resultVector[resultVector_i + 0] = result.x
                                            resultVector[resultVector_i + 1] = result.y
                                            resultVector[resultVector_i + 2] = result.z
                                            resultVector[resultVector_i + 3] = result.w
                                        }
                                        break
                                    }

                                    case Mat3: {
                                        const result = new Mat4()
                                        const point = new Mat4()
                                        const result_data = result.data
                                        const point_data = point.data
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 9) {
                                            result.setIdentity()
                                            point.setIdentity()

                                            result_data[0] = resultVector[resultVector_i + 0]
                                            result_data[1] = resultVector[resultVector_i + 1]
                                            result_data[2] = resultVector[resultVector_i + 2]
                                            result_data[3] = 0
                                            result_data[4] = resultVector[resultVector_i + 3]
                                            result_data[5] = resultVector[resultVector_i + 4]
                                            result_data[6] = resultVector[resultVector_i + 5]
                                            result_data[7] = 0
                                            result_data[8] = resultVector[resultVector_i + 6]
                                            result_data[9] = resultVector[resultVector_i + 7]
                                            result_data[10] = resultVector[resultVector_i + 8]
                                            result_data[11] = 0
                                            result_data[12] = result_data[13] = result_data[14] = result_data[15] = 0

                                            point_data[0] = pointVector[pointVector_i + 0]
                                            point_data[1] = pointVector[pointVector_i + 1]
                                            point_data[2] = pointVector[pointVector_i + 2]
                                            point_data[3] = 0
                                            point_data[4] = pointVector[pointVector_i + 3]
                                            point_data[5] = pointVector[pointVector_i + 4]
                                            point_data[6] = pointVector[pointVector_i + 5]
                                            point_data[7] = 0
                                            point_data[8] = pointVector[pointVector_i + 6]
                                            point_data[9] = pointVector[pointVector_i + 7]
                                            point_data[10] = pointVector[pointVector_i + 8]
                                            point_data[11] = 0
                                            point_data[12] = point_data[13] = point_data[14] = point_data[15] = 0

                                            result.mul(point)

                                            resultVector[resultVector_i + 0] = result_data[0]
                                            resultVector[resultVector_i + 1] = result_data[1]
                                            resultVector[resultVector_i + 2] = result_data[2]

                                            resultVector[resultVector_i + 3] = result_data[4]
                                            resultVector[resultVector_i + 4] = result_data[5]
                                            resultVector[resultVector_i + 5] = result_data[6]

                                            resultVector[resultVector_i + 6] = result_data[8]
                                            resultVector[resultVector_i + 7] = result_data[9]
                                            resultVector[resultVector_i + 8] = result_data[10]
                                        }
                                        break
                                    }

                                    case Mat4: {
                                        const result = new Mat4()
                                        const point = new Mat4()
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 16) {
                                            result.data = <Float32Array><unknown>resultVector.subarray((16 * resultVector_i),  (16 * resultVector_i) + 16)
                                            point.data = <Float32Array><unknown>resultVector.subarray((16 * pointVector_i),  (16 * pointVector_i) + 16)

                                            result.mul(point)
                                        }
                                        break
                                    }
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.divide:
                                switch (elementType) {
                                    case Quat: {
                                        const result = new Quat()
                                        const point = new Quat()
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 4) {
                                            result.set(
                                                resultVector[resultVector_i + 0],
                                                resultVector[resultVector_i + 1],
                                                resultVector[resultVector_i + 2],
                                                resultVector[resultVector_i + 3]
                                            )

                                            point.set(
                                                pointVector[pointVector_i + 0],
                                                pointVector[pointVector_i + 1],
                                                pointVector[pointVector_i + 2],
                                                pointVector[pointVector_i + 3]
                                            )

                                            point.invert()

                                            result.mul(point)

                                            resultVector[resultVector_i + 0] = result.x
                                            resultVector[resultVector_i + 1] = result.y
                                            resultVector[resultVector_i + 2] = result.z
                                            resultVector[resultVector_i + 3] = result.w
                                        }
                                        break
                                    }

                                    case Mat3: {
                                        const result = new Mat4()
                                        const point = new Mat4()
                                        const result_data = result.data
                                        const point_data = point.data
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 9) {
                                            result.setIdentity()
                                            point.setIdentity()

                                            result_data[0] = resultVector[resultVector_i + 0]
                                            result_data[1] = resultVector[resultVector_i + 1]
                                            result_data[2] = resultVector[resultVector_i + 2]
                                            result_data[3] = 0
                                            result_data[4] = resultVector[resultVector_i + 3]
                                            result_data[5] = resultVector[resultVector_i + 4]
                                            result_data[6] = resultVector[resultVector_i + 5]
                                            result_data[7] = 0
                                            result_data[8] = resultVector[resultVector_i + 6]
                                            result_data[9] = resultVector[resultVector_i + 7]
                                            result_data[10] = resultVector[resultVector_i + 8]
                                            result_data[11] = 0
                                            result_data[12] = result_data[13] = result_data[14] = result_data[15] = 0

                                            point_data[0] = pointVector[pointVector_i + 0]
                                            point_data[1] = pointVector[pointVector_i + 1]
                                            point_data[2] = pointVector[pointVector_i + 2]
                                            point_data[3] = 0
                                            point_data[4] = pointVector[pointVector_i + 3]
                                            point_data[5] = pointVector[pointVector_i + 4]
                                            point_data[6] = pointVector[pointVector_i + 5]
                                            point_data[7] = 0
                                            point_data[8] = pointVector[pointVector_i + 6]
                                            point_data[9] = pointVector[pointVector_i + 7]
                                            point_data[10] = pointVector[pointVector_i + 8]
                                            point_data[11] = 0
                                            point_data[12] = point_data[13] = point_data[14] = point_data[15] = 0

                                            point.invert()

                                            result.mul(point)

                                            resultVector[resultVector_i + 0] = result_data[0]
                                            resultVector[resultVector_i + 1] = result_data[1]
                                            resultVector[resultVector_i + 2] = result_data[2]

                                            resultVector[resultVector_i + 3] = result_data[4]
                                            resultVector[resultVector_i + 4] = result_data[5]
                                            resultVector[resultVector_i + 5] = result_data[6]

                                            resultVector[resultVector_i + 6] = result_data[8]
                                            resultVector[resultVector_i + 7] = result_data[9]
                                            resultVector[resultVector_i + 8] = result_data[10]
                                        }
                                        break
                                    }

                                    case Mat4: {
                                        const result = new Mat4()
                                        const point = new Mat4()
                                        for (resultVector_i = 0; resultVector_i < resultVector.length; resultVector_i += 16) {
                                            result.data = <Float32Array><unknown>resultVector.subarray((16 * resultVector_i),  (16 * resultVector_i) + 16)
                                            point.data.set(resultVector.subarray((16 * pointVector_i),  (16 * pointVector_i) + 16))
                                            point.invert()

                                            result.mul(point)
                                        }
                                        break
                                    }
                                }
                                break
                        }
                    }
                }
            }
        }
        else if (isMultiObjMappedPoints) {
            if (isDynamicVectorPoint) {
                const resultVector = <FieldPointVectorDynamic<Point>>results.vector

                for (const { vector: vectorized, vectorizedRoot } of points) {
                    const pointVector = <FieldPointVectorDynamic<Point>>vectorized
                    const pointVectorLength = vectorizedRoot[ItemObjValuesOffsetsKey].length / elementSize

                    const pointVectorObjOffsets = vectorizedRoot[ItemObjValuesOffsetsKey]
                    let pointVectorObjOffset_prev = 0
                    let pointVectorObjOffset_next: number

                    let pointVectorOffset = 0
                    let resultVectorOffset = 0
                    let componentIndex = 0

                    if (isMultiObjMappedResult) {
                        const resultObjOffsets = results.vectorizedRoot[ItemObjValuesOffsetsKey]
                        let resultObjOffsets_prev = 0,
                            resultObjOffsets_next: number,
                            resultVectorIndex: number

                        const pointObjIDs = vectorizedRoot[ItemObjIDsKey]
                        let objID: number

                        if (isNumberTypedArray(results.vectorizedRoot[ItemObjIDsKey])) {
                            const resultObjIDs = <FieldPointVectorContainerStatic<ObjIDsT>>results.vectorizedRoot[ItemObjIDsKey]

                            switch (this.op) {
                                case ArithmeticPrimitiveFuseModeOp.none:
                                    break

                                case ArithmeticPrimitiveFuseModeOp.add:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                    resultVector.set(resultVectorOffset + componentIndex, resultVector.get(resultVectorOffset + componentIndex) + pointVector.get(pointVectorOffset++))
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.subtract:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                    resultVector.set(resultVectorOffset + componentIndex, resultVector.get(resultVectorOffset + componentIndex) - pointVector.get(pointVectorOffset++))
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.multiply:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                    resultVector.set(resultVectorOffset + componentIndex, resultVector.get(resultVectorOffset + componentIndex) * pointVector.get(pointVectorOffset++))
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.divide:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                    resultVector.set(resultVectorOffset + componentIndex, resultVector.get(resultVectorOffset + componentIndex) / pointVector.get(pointVectorOffset++))
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.min:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++) {
                                                    if (resultVector.get(resultVectorOffset + componentIndex) > pointVector.get(pointVectorOffset))
                                                        resultVector.set(resultVectorOffset + componentIndex, pointVector.get(pointVectorOffset))

                                                    pointVectorOffset++
                                                }
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.max:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++) {
                                                    if (resultVector.get(resultVectorOffset + componentIndex) < pointVector.get(pointVectorOffset))
                                                        resultVector.set(resultVectorOffset + componentIndex, pointVector.get(pointVectorOffset))

                                                    pointVectorOffset++
                                                }
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break
                            }
                        }
                        else {
                            throw new Error()
                        }
                    }
                    else {
                        switch (this.op) {
                            case ArithmeticPrimitiveFuseModeOp.none:
                                break

                            case ArithmeticPrimitiveFuseModeOp.add:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                resultVector.set(resultVectorOffset + componentIndex, resultVector.get(resultVectorOffset + componentIndex) + pointVector.get(pointVectorOffset++))
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.subtract:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                resultVector.set(resultVectorOffset + componentIndex, resultVector.get(resultVectorOffset + componentIndex) - pointVector.get(pointVectorOffset++))
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.multiply:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                resultVector.set(resultVectorOffset + componentIndex, resultVector.get(resultVectorOffset + componentIndex) * pointVector.get(pointVectorOffset++))
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.divide:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                resultVector.set(resultVectorOffset + componentIndex, resultVector.get(resultVectorOffset + componentIndex) / pointVector.get(pointVectorOffset++))
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.min:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++) {
                                                if (resultVector.get(resultVectorOffset + componentIndex) > pointVector.get(pointVectorOffset))
                                                    resultVector.set(resultVectorOffset + componentIndex, pointVector.get(pointVectorOffset))

                                                pointVectorOffset++
                                            }
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.max:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++) {
                                                if (resultVector.get(resultVectorOffset + componentIndex) < pointVector.get(pointVectorOffset))
                                                    resultVector.set(resultVectorOffset + componentIndex, pointVector.get(pointVectorOffset))

                                                pointVectorOffset++
                                            }
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break
                        }
                    }
                }
            }
            else {
                const resultVector = <FieldPointVectorStatic<Point>>results.vector

                for (const { vector: vectorized, vectorizedRoot } of points) {
                    const pointVector = <FieldPointVectorStatic<Point>>vectorized
                    const pointVectorLength = vectorizedRoot[ItemObjValuesOffsetsKey].length / elementSize

                    const pointVectorObjOffsets = vectorizedRoot[ItemObjValuesOffsetsKey]
                    let pointVectorObjOffset_prev = 0
                    let pointVectorObjOffset_next: number

                    let pointVectorOffset = 0
                    let resultVectorOffset = 0
                    let componentIndex = 0

                    if (isMultiObjMappedResult) {
                        const resultObjOffsets = results.vectorizedRoot[ItemObjValuesOffsetsKey]
                        let resultObjOffsets_prev = 0,
                            resultObjOffsets_next: number,
                            resultVectorIndex: number

                        const pointObjIDs = vectorizedRoot[ItemObjIDsKey]
                        let objID: number

                        if (isNumberTypedArray(results.vectorizedRoot[ItemObjIDsKey])) {
                            const resultObjIDs = <FieldPointVectorContainerStatic<ObjIDsT>>results.vectorizedRoot[ItemObjIDsKey]

                            switch (this.op) {
                                case ArithmeticPrimitiveFuseModeOp.none:
                                    break

                                case ArithmeticPrimitiveFuseModeOp.add:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                    ///@ts-ignore
                                                    resultVector[resultVectorOffset + componentIndex] = resultVector[resultVectorOffset + componentIndex] + pointVector[pointVectorOffset++]
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.subtract:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                    ///@ts-ignore
                                                    resultVector[resultVectorOffset + componentIndex] = resultVector[resultVectorOffset + componentIndex] - pointVector[pointVectorOffset++]
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.multiply:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                    ///@ts-ignore
                                                    resultVector[resultVectorOffset + componentIndex] = resultVector[resultVectorOffset + componentIndex] * pointVector[pointVectorOffset++]
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.divide:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                    ///@ts-ignore
                                                    resultVector[resultVectorOffset + componentIndex] = resultVector[resultVectorOffset + componentIndex] / pointVector[pointVectorOffset++]
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.min:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++) {
                                                    if (resultVector[resultVectorOffset + componentIndex] > pointVector[pointVectorOffset])
                                                        resultVector[resultVectorOffset + componentIndex] = pointVector[pointVectorOffset]

                                                    pointVectorOffset++
                                                }
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break

                                case ArithmeticPrimitiveFuseModeOp.max:
                                    for (let i = 0; i < pointVectorLength; i++) {
                                        pointVectorObjOffset_next = pointVectorObjOffsets[i]
                                        resultObjOffsets_next = resultObjOffsets[i]

                                        if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                            do {
                                                objID = pointObjIDs[pointVectorObjOffset_prev]

                                                for (resultVectorIndex = resultObjOffsets_prev; resultVectorIndex < resultObjOffsets_next; resultVectorIndex++)
                                                    if (resultObjIDs[resultVectorIndex] === objID)
                                                        break

                                                if (resultVectorIndex === resultObjOffsets_next)
                                                    throw new Error("object present in source but not result")

                                                resultVectorOffset = elementSize * resultVectorIndex

                                                for (componentIndex = 0; componentIndex < elementSize; componentIndex++) {
                                                    if (resultVector[resultVectorOffset + componentIndex] < pointVector[pointVectorOffset])
                                                        resultVector[resultVectorOffset + componentIndex] = pointVector[pointVectorOffset]

                                                    pointVectorOffset++
                                                }
                                            }
                                            while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                            pointVectorObjOffset_prev = pointVectorObjOffset_next
                                        }

                                        resultObjOffsets_prev = resultObjOffsets_next
                                    }
                                    break
                            }
                        }
                        else {
                            throw new Error()
                        }
                    }
                    else {
                        switch (this.op) {
                            case ArithmeticPrimitiveFuseModeOp.none:
                                break

                            case ArithmeticPrimitiveFuseModeOp.add:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                ///@ts-ignore
                                                resultVector[resultVectorOffset + componentIndex] += pointVector[pointVectorOffset++]
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.subtract:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                ///@ts-ignore
                                                resultVector[resultVectorOffset + componentIndex] -= pointVector[pointVectorOffset++]
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.multiply:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                ///@ts-ignore
                                                resultVector[resultVectorOffset + componentIndex] *= pointVector[pointVectorOffset++]
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.divide:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++)
                                                ///@ts-ignore
                                                resultVector[resultVectorOffset + componentIndex] /= pointVector[pointVectorOffset++]
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.min:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++) {
                                                if (resultVector[resultVectorOffset + componentIndex] > pointVector[pointVectorOffset])
                                                    resultVector[resultVectorOffset + componentIndex] = pointVector[pointVectorOffset]

                                                pointVectorOffset++
                                            }
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break

                            case ArithmeticPrimitiveFuseModeOp.max:
                                for (let i = 0; i < pointVectorLength; i++) {
                                    pointVectorObjOffset_next = pointVectorObjOffsets[i]

                                    if (pointVectorObjOffset_next !== pointVectorObjOffset_prev) {
                                        do {
                                            for (componentIndex = 0; componentIndex < elementSize; componentIndex++) {
                                                if (resultVector[resultVectorOffset + componentIndex] < pointVector[pointVectorOffset])
                                                    resultVector[resultVectorOffset + componentIndex] = pointVector[pointVectorOffset]

                                                pointVectorOffset++
                                            }
                                        }
                                        while (++pointVectorObjOffset_prev < pointVectorObjOffset_next)

                                        pointVectorObjOffset_prev = pointVectorObjOffset_next
                                    }

                                    resultVectorOffset += elementSize
                                }
                                break
                        }
                    }
                }
            }
        }
        else {
            if (isDynamicVectorPoint) {
                const resultVector = <FieldPointVectorDynamic<Point>><any>results.vector

                for (const { vector: vectorized } of points) {
                    const pointVector = <FieldPointVectorDynamic<Point>><any>vectorized

                    switch (this.op) {
                        case ArithmeticPrimitiveFuseModeOp.none:
                            break

                        //TODO: these cases could be very optimized by iterating within each block
                        // though dynamic containers hopefully won't be used here
                        case ArithmeticPrimitiveFuseModeOp.add:
                            for (let i = 0; i < resultVector.length; i++)
                                resultVector.set(i, resultVector.get(i) + pointVector.get(i))

                            break

                        case ArithmeticPrimitiveFuseModeOp.subtract:
                            for (let i = 0; i < resultVector.length; i++)
                                resultVector.set(i, resultVector.get(i) - pointVector.get(i))
                            break

                        case ArithmeticPrimitiveFuseModeOp.multiply:
                            for (let i = 0; i < resultVector.length; i++)
                                resultVector.set(i, resultVector.get(i) * pointVector.get(i))
                            break

                        case ArithmeticPrimitiveFuseModeOp.divide:
                            for (let i = 0; i < resultVector.length; i++)
                                resultVector.set(i, resultVector.get(i) / pointVector.get(i))
                            break

                        case ArithmeticPrimitiveFuseModeOp.min:
                            for (let i = 0; i < resultVector.length; i++)
                                if (resultVector.get(i) > pointVector.get(i))
                                    resultVector.set(i, pointVector.get(i))
                            break

                        case ArithmeticPrimitiveFuseModeOp.max:
                            for (let i = 0; i < resultVector.length; i++)
                                if (resultVector.get(i) < pointVector.get(i))
                                    resultVector.set(i, pointVector.get(i))
                            break
                    }
                }
            }
            else {
                const resultVector = <FieldPointVectorStatic<Point>>results.vector

                for (const { vector: vectorized } of points) {
                    const pointVector = <FieldPointVectorStatic<Point>>vectorized

                    switch (this.op) {
                        case ArithmeticPrimitiveFuseModeOp.none:
                            break

                        case ArithmeticPrimitiveFuseModeOp.add:
                            for (let i = 0; i < resultVector.length; i++)
                                ///@ts-ignore
                                resultVector[i] += pointVector[i]
                            break

                        case ArithmeticPrimitiveFuseModeOp.subtract:
                            for (let i = 0; i < resultVector.length; i++)
                                ///@ts-ignore
                                resultVector[i] -= pointVector[i]
                            break

                        case ArithmeticPrimitiveFuseModeOp.multiply:
                            for (let i = 0; i < resultVector.length; i++)
                                ///@ts-ignore
                                resultVector[i] *= pointVector[i]

                        case ArithmeticPrimitiveFuseModeOp.divide:
                            for (let i = 0; i < resultVector.length; i++)
                                ///@ts-ignore
                                resultVector[i] /= pointVector[i]
                            break

                        case ArithmeticPrimitiveFuseModeOp.min:
                            for (let i = 0; i < resultVector.length; i++)
                                if (resultVector[i] > pointVector[i])
                                    resultVector[i] = pointVector[i]
                            break

                        case ArithmeticPrimitiveFuseModeOp.max:
                            for (let i = 0; i < resultVector.length; i++)
                                if (resultVector[i] < pointVector[i])
                                    resultVector[i] = pointVector[i]
                            break
                    }
                }
            }
        }
    }

    [equals](that: PrimitiveFuseMode<Point>): boolean {
        return that instanceof ArithmeticPrimitiveFuseMode &&
            this.op === that.op
    }

    static readonly none = new this(ArithmeticPrimitiveFuseModeOp.none)
    static readonly add = new this(ArithmeticPrimitiveFuseModeOp.add)
    static readonly subtract = new this(ArithmeticPrimitiveFuseModeOp.subtract)
    static readonly multiply = new this(ArithmeticPrimitiveFuseModeOp.multiply)
    static readonly divide = new this(ArithmeticPrimitiveFuseModeOp.divide)
    static readonly min = new this(ArithmeticPrimitiveFuseModeOp.min)
    static readonly max = new this(ArithmeticPrimitiveFuseModeOp.max)
}