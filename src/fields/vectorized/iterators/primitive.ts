import { TypedArrayList } from "../../../utils/typed-array-list.js";
import { FieldPointMapped, FieldPointPrimitive } from "../../point.js";
import { FieldPointVectorIterator } from "../iterator.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic } from "../point.js";

export abstract class PrimitiveFieldPointVectorIterator<
        Point extends FieldPointPrimitive = FieldPointPrimitive,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
        VectorizedRoot = any
    > implements
    FieldPointVectorIterator<Point, Container, VectorizedRoot, Point> {
    abstract get canGetByReference(): boolean

    protected abstract get elementSize(): number

    length(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): number {
        return vectorized.length / this.elementSize
    }

    abstract get_returnValue(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot, index: number): Point

    abstract get_returnParam(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot, result: Point, index: number): void

    abstract set(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot, value: Point, index: number): void

    abstract makeContainer(length: number): Container

    abstract copyStatic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerStatic>

    abstract copyDynamic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerDynamic>
}

export abstract class PrimitiveFieldPointVectorIteratorStatic<
        Point extends FieldPointPrimitive = FieldPointPrimitive,
        Container extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        VectorizedRoot = any
    >
    extends PrimitiveFieldPointVectorIterator<Point, Container, VectorizedRoot> {
    makeContainer(length: number): Container {
        return <Container>new Float64Array(this.elementSize * length)
    }

    copyStatic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerStatic> {
        const container = new Float64Array(vectorized.length)
        container.set(vectorized)
        return <FieldPointMapped<Point, FieldPointVectorContainerStatic>>container
    }

    copyDynamic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerDynamic> {
        const container = new TypedArrayList<Float64Array>(Float64Array)
        container.appendBlock(this.copyStatic(vectorized, vectorizedRoot))
        return <FieldPointMapped<Point, FieldPointVectorContainerDynamic>>container
    }
}

export abstract class PrimitiveFieldPointVectorIteratorDynamic<
        Point extends FieldPointPrimitive = FieldPointPrimitive,
        Container extends FieldPointVectorContainerDynamic = FieldPointVectorContainerDynamic,
        VectorizedRoot = any
    >
    extends PrimitiveFieldPointVectorIterator<Point, Container, VectorizedRoot> {
    makeContainer(length: number): Container {
        return <Container>new TypedArrayList(Float64Array, (2 * length))
    }

    copyStatic(vectorized: TypedArrayList<Float64Array>, vectorizedRoot: any): FieldPointVector<Point, FieldPointVectorContainerStatic> {
        return <FieldPointVector<Point, FieldPointVectorContainerStatic>>vectorized.arrayView(false)
    }

    copyDynamic(vectorized: TypedArrayList<Float64Array>, vectorizedRoot: any): FieldPointVector<Point, FieldPointVectorContainerDynamic> {
        return <FieldPointVector<Point, FieldPointVectorContainerDynamic>>vectorized.clone()
    }
}