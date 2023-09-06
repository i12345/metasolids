import { Vec4 } from "playcanvas-extended"
import { FieldPointVector, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic } from "../point.js"
import { vectorIteratorFactory } from "./factory.js"
import { PrimitiveFieldPointVectorIteratorDynamic, PrimitiveFieldPointVectorIteratorStatic } from "./primitive.js"

const type = Vec4
type Type = Vec4
const elementSize = 4

@vectorIteratorFactory(type, false)
class FieldPointVectorizedIteratorStatic<VectorizedRoot = any>
    extends PrimitiveFieldPointVectorIteratorStatic<Type> {
    get canGetSetByReference() { return true }
    readonly elementType = type

    get_returnValue(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, index: number): Type {
        return new type(
            vectorized[(elementSize * index) + 0],
            vectorized[(elementSize * index) + 1],
            vectorized[(elementSize * index) + 2],
            vectorized[(elementSize * index) + 3],
        )
    }

    get_returnParam(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, result: Type, index: number): void {
        result.x = vectorized[(elementSize * index) + 0]
        result.y = vectorized[(elementSize * index) + 1]
        result.z = vectorized[(elementSize * index) + 2]
        result.z = vectorized[(elementSize * index) + 4]
    }

    set(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, value: Type, index: number): void {
        vectorized[(elementSize * index) + 0] = value.x
        vectorized[(elementSize * index) + 1] = value.y
        vectorized[(elementSize * index) + 2] = value.z
        vectorized[(elementSize * index) + 3] = value.w
    }
}

@vectorIteratorFactory(type, true)
class FieldPointVectorizedIteratorDynamic<VectorizedRoot = any>
    extends PrimitiveFieldPointVectorIteratorDynamic<Type> {
    get canGetSetByReference() { return true }
    readonly elementType = type

    get_returnValue(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, index: number): Type {
        return new type(
            vectorized.get((elementSize * index) + 0),
            vectorized.get((elementSize * index) + 1),
            vectorized.get((elementSize * index) + 2),
            vectorized.get((elementSize * index) + 3),
        )
    }

    get_returnParam(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, result: Type, index: number): void {
        result.x = vectorized.get((elementSize * index) + 0)
        result.y = vectorized.get((elementSize * index) + 1)
        result.z = vectorized.get((elementSize * index) + 2)
        result.z = vectorized.get((elementSize * index) + 3)
    }

    set(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, value: Type, index: number): void {
        vectorized.set((elementSize * index) + 0, value.x)
        vectorized.set((elementSize * index) + 1, value.y)
        vectorized.set((elementSize * index) + 2, value.z)
        vectorized.set((elementSize * index) + 3, value.w)
    }
}