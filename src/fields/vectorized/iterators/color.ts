import { Color } from "playcanvas-extended"
import { FieldPointVector, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic } from "../point.js"
import { vectorIteratorFactory } from "./factory.js"
import { PrimitiveFieldPointVectorIteratorDynamic, PrimitiveFieldPointVectorIteratorStatic } from "./primitive.js"

const type = Color
type Type = Color
const elementSize = 4

@vectorIteratorFactory(type, false)
class FieldPointVectorizedIteratorStatic<VectorizedRoot = any>
    extends PrimitiveFieldPointVectorIteratorStatic<Type> {
    get canGetByReference() { return true }
    // protected get elementSize(): number { return elementSize }
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
        result.r = vectorized[(elementSize * index) + 0]
        result.g = vectorized[(elementSize * index) + 1]
        result.b = vectorized[(elementSize * index) + 2]
        result.a = vectorized[(elementSize * index) + 4]
    }

    set(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, value: Type, index: number): void {
        vectorized[(elementSize * index) + 0] = value.r
        vectorized[(elementSize * index) + 1] = value.g
        vectorized[(elementSize * index) + 2] = value.b
        vectorized[(elementSize * index) + 3] = value.a
    }
}

@vectorIteratorFactory(type, true)
class FieldPointVectorizedIteratorDynamic<VectorizedRoot = any>
    extends PrimitiveFieldPointVectorIteratorDynamic<Type> {
    get canGetByReference() { return true }
    // protected get elementSize(): number { return elementSize }
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
        result.r = vectorized.get((elementSize * index) + 0)
        result.g = vectorized.get((elementSize * index) + 1)
        result.b = vectorized.get((elementSize * index) + 2)
        result.a = vectorized.get((elementSize * index) + 3)
    }

    set(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, value: Type, index: number): void {
        vectorized.set((elementSize * index) + 0, value.r)
        vectorized.set((elementSize * index) + 1, value.g)
        vectorized.set((elementSize * index) + 2, value.b)
        vectorized.set((elementSize * index) + 3, value.a)
    }
}