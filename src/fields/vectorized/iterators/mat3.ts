import { Mat3 } from "playcanvas-extended"
import { FieldPointVector, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic } from "../point.js"
import { vectorIteratorFactory } from "./factory.js"
import { PrimitiveFieldPointVectorIteratorDynamic, PrimitiveFieldPointVectorIteratorStatic } from "./primitive.js"

const type = Mat3
type Type = Mat3
const elementSize = 9

@vectorIteratorFactory(type, false)
class FieldPointVectorizedIteratorStatic<VectorizedRoot = any>
    extends PrimitiveFieldPointVectorIteratorStatic<Type> {
    get canGetByReference() { return true }
    protected get elementSize(): number { return elementSize }

    get_returnValue(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, index: number): Type {
        const result = new type()
        this.get_returnParam(vectorized, vectorizedRoot, result, index)
        return result
    }

    get_returnParam(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, result: Type, index: number): void {
        const subvectorized = vectorized.subarray((elementSize * index) + 0, (elementSize * index) + elementSize)
        result.data.set(subvectorized)
    }

    set(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, value: Type, index: number): void {
        const subvectorized = vectorized.subarray((elementSize * index) + 0, (elementSize * index) + elementSize)
        subvectorized.set(value.data)
    }
}

@vectorIteratorFactory(type, true)
class FieldPointVectorizedIteratorDynamic<VectorizedRoot = any>
    extends PrimitiveFieldPointVectorIteratorDynamic<Type> {
    get canGetByReference() { return true }
    protected get elementSize(): number { return elementSize }

    get_returnValue(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, index: number): Type {
        const result = new type()
        this.get_returnParam(vectorized, vectorizedRoot, result, index)
        return result
    }

    get_returnParam(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, result: Type, index: number): void {
        const offset = elementSize * index
        for (let i = 0; i < elementSize; i++)
            result.data[i] = vectorized.get(offset + i)
    }

    set(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, value: Type, index: number): void {
        const offset = elementSize * index
        for (let i = 0; i < elementSize; i++)
            vectorized.set(offset + i, value.data[i])
    }
}