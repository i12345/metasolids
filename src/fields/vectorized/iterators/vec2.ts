import { Vec2 } from "playcanvas-extended"
import { FieldPointVector, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic } from "../point.js"
import { vectorIteratorFactory } from "./factory.js"
import { PrimitiveFieldPointVectorIteratorDynamic, PrimitiveFieldPointVectorIteratorStatic } from "./primitive.js"

const type = Vec2
type Type = Vec2
const elementSize = 2

@vectorIteratorFactory(type, false)
class FieldPointVectorizedIteratorStatic<VectorizedRoot = any>
    extends PrimitiveFieldPointVectorIteratorStatic<Type> {
    get canGetByReference() { return true }
    protected get elementSize(): number { return elementSize }

    get_returnValue(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, index: number): Type {
        return new type(
            vectorized[(elementSize * index) + 0],
            vectorized[(elementSize * index) + 1],
        )
    }

    get_returnParam(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, result: Type, index: number): void {
        result.x = vectorized[(elementSize * index) + 0]
        result.y = vectorized[(elementSize * index) + 1]
    }

    set(vectorized: FieldPointVector<Type, FieldPointVectorContainerStatic>, vectorizedRoot: VectorizedRoot, value: Type, index: number): void {
        vectorized[(elementSize * index) + 0] = value.x
        vectorized[(elementSize * index) + 1] = value.y
    }
}

@vectorIteratorFactory(type, true)
class FieldPointVectorizedIteratorDynamic<VectorizedRoot = any>
    extends PrimitiveFieldPointVectorIteratorDynamic<Type> {
    get canGetByReference() { return true }
    protected get elementSize(): number { return elementSize }

    get_returnValue(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, index: number): Type {
        return new type(
            vectorized.get((elementSize * index) + 0),
            vectorized.get((elementSize * index) + 1),
        )
    }

    get_returnParam(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, result: Type, index: number): void {
        result.x = vectorized.get((elementSize * index) + 0)
        result.y = vectorized.get((elementSize * index) + 1)
    }

    set(vectorized: FieldPointVector<Type, FieldPointVectorContainerDynamic>, vectorizedRoot: VectorizedRoot, value: Type, index: number): void {
        vectorized.set((elementSize * index) + 0, value.x)
        vectorized.set((elementSize * index) + 1, value.y)
    }
}