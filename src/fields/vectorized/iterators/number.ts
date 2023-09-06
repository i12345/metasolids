import { FieldPointVector, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic } from "../point.js"
import { vectorIteratorFactory } from "./factory.js"
import { PrimitiveFieldPointVectorIteratorDynamic, PrimitiveFieldPointVectorIteratorStatic } from "./primitive.js"

const type = Number
type Type = number
const elementSize = 1

@vectorIteratorFactory(type, false)
class FieldPointVectorizedIteratorStatic<VectorizedRoot = any>
    extends PrimitiveFieldPointVectorIteratorStatic<Type> {
    get canGetSetByReference() { return false }
    readonly elementType = type

    get_returnValue(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, index: number): Type {
        return vectorized[index]
    }

    get_returnParam(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, result: Type, index: number): void {
        throw new Error("cannot get by reference")
    }

    set(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, value: Type, index: number): void {
        vectorized[index] = value
    }
}

@vectorIteratorFactory(type, true)
class FieldPointVectorizedIteratorDynamic<VectorizedRoot = any>
    extends PrimitiveFieldPointVectorIteratorDynamic<Type> {
    get canGetSetByReference() { return false }
    readonly elementType = type

    get_returnValue(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, index: number): Type {
        return vectorized.get(index)
    }

    get_returnParam(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, result: Type, index: number): void {
        throw new Error("cannot get by reference")
    }

    set(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, value: Type, index: number): void {
        vectorized.set(index, value)
    }
}