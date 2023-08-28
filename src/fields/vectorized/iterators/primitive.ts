import { Color, Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from "playcanvas-extended";
import { IndicesTypedArray } from "../../../utils/indices-array.js";
import { TypedArrayList } from "../../../utils/typed-array-list.js";
import { FieldPointMapped, FieldPointPrimitive } from "../../point.js";
import { FieldPointType, field_point_type_size } from "../../type.js"
import { FuseMode, FusingFieldPointVectorWithMultiObjects, PrimitiveFuseMode } from "../fusing.js";
import { FieldPointVectorIterator } from "../iterator.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic, FieldPointVectorContainerType, FieldPointVectorWithMultiObjRoot } from "../point.js";
import { NumberTypedArray, TypedArray, typedArrayClone, typedArrayConstructor } from "../../../utils/typed-array.js";

export abstract class PrimitiveFieldPointVectorIterator<
        Point extends FieldPointPrimitive = FieldPointPrimitive,
        Container extends FieldPointVectorContainer<TypedArray> = FieldPointVectorContainer,
        VectorizedRoot = any
    > implements
    FieldPointVectorIterator<Point, Container, VectorizedRoot, Point> {
    abstract get canGetByReference(): boolean

    abstract get elementType(): FieldPointType<Point>

    get elementSize() {
        return field_point_type_size(this.elementType)
    }

    length(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): number {
        return vectorized.length / this.elementSize
    }

    abstract get_returnValue(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot, index: number): Point

    abstract get_returnParam(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot, result: Point, index: number): void

    abstract set(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot, value: Point, index: number): void
    
    abstract makeContainer(
        length: number,
        value?: Point
    ): Container

    abstract copyStatic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>>

    abstract copyDynamic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>>

    fuse(
            results: FieldPointVectorWithMultiObjRoot<
                Point,
                Container,
                IndicesTypedArray,
                FieldPointVectorContainerStatic<IndicesTypedArray>,
                FusingFieldPointVectorWithMultiObjects
            >,
            points: FieldPointVectorWithMultiObjRoot<Point, Container>[],
            mode: FuseMode<Point>,
            isMultiObjMapped?: {
                points: boolean
                result: boolean
            }
    ): void {
        (<PrimitiveFuseMode<Point>>mode).fuseVector(this.elementType, results, points, isMultiObjMapped)
    }
}

export abstract class PrimitiveFieldPointVectorIteratorStatic<
        Point extends FieldPointPrimitive = FieldPointPrimitive,
        Container extends FieldPointVectorContainerStatic<TypedArray> = FieldPointVectorContainerStatic,
        VectorizedRoot = any
    >
    extends PrimitiveFieldPointVectorIterator<Point, Container, VectorizedRoot> {
    makeContainer(length: number, value?: Point): Container {
        const container = <Container>new Float64Array(this.elementSize * length)

        if (value !== undefined) {
            let insertIndex = 0

            if (typeof value === 'number')
                (<NumberTypedArray>container).fill(value)
            else if (value instanceof Vec2) {
                for (let i = 0; i < length; i++) {
                    container[insertIndex++] = value.x
                    container[insertIndex++] = value.y
                }
            }
            else if (value instanceof Vec3) {
                for (let i = 0; i < length; i++) {
                    container[insertIndex++] = value.x
                    container[insertIndex++] = value.y
                    container[insertIndex++] = value.z
                }
            }
            else if (value instanceof Vec4) {
                for (let i = 0; i < length; i++) {
                    container[insertIndex++] = value.x
                    container[insertIndex++] = value.y
                    container[insertIndex++] = value.z
                    container[insertIndex++] = value.w
                }
            }
            else if (value instanceof Quat) {
                for (let i = 0; i < length; i++) {
                    container[insertIndex++] = value.x
                    container[insertIndex++] = value.y
                    container[insertIndex++] = value.z
                    container[insertIndex++] = value.w
                }
            }
            else if (value instanceof Color) {
                for (let i = 0; i < length; i++) {
                    container[insertIndex++] = value.r
                    container[insertIndex++] = value.g
                    container[insertIndex++] = value.b
                    container[insertIndex++] = value.a
                }
            }
            else if (value instanceof Mat3)
                for (let i = 0; i < length; i++)
                    for (let j = 0; j < 9; j++)
                        container[insertIndex++] = value.data[j]
            else if (value instanceof Mat4)
                for (let i = 0; i < length; i++)
                    for (let j = 0; j < 16; j++)
                        container[insertIndex++] = value.data[j]
            else
                throw new Error()
        }

        return container
    }

    copyStatic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>> {
        const container = typedArrayClone(<FieldPointVectorContainerType<Container>><unknown>vectorized)
        return <FieldPointMapped<Point, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>>>container
    }

    copyDynamic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>> {
        const container = new TypedArrayList(typedArrayConstructor(<TypedArray><unknown>vectorized))
        container.appendBlock(this.copyStatic(vectorized, vectorizedRoot))
        return <FieldPointMapped<Point, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>>>container
    }
}

export abstract class PrimitiveFieldPointVectorIteratorDynamic<
        Point extends FieldPointPrimitive = FieldPointPrimitive,
        Container extends FieldPointVectorContainerDynamic<TypedArray> = FieldPointVectorContainerDynamic,
        VectorizedRoot = any
    >
    extends PrimitiveFieldPointVectorIterator<Point, Container, VectorizedRoot> {
    makeContainer(length: number, value?: Point): Container {
        const container = <Container>new TypedArrayList(Float64Array, (this.elementSize * length))

        if (value !== undefined) {
            let insertIndex = 0

            if (typeof value === 'number') {
                for (let i = 0; i < length; i++) {
                    container.set(i, value)
                }
            }
            else if (value instanceof Vec2) {
                for (let i = 0; i < length; i++) {
                    container.set(insertIndex++, value.x)
                    container.set(insertIndex++, value.y)
                }
            }
            else if (value instanceof Vec3) {
                for (let i = 0; i < length; i++) {
                    container.set(insertIndex++, value.x)
                    container.set(insertIndex++, value.y)
                    container.set(insertIndex++, value.z)
                }
            }
            else if (value instanceof Vec4) {
                for (let i = 0; i < length; i++) {
                    container.set(insertIndex++, value.x)
                    container.set(insertIndex++, value.y)
                    container.set(insertIndex++, value.z)
                    container.set(insertIndex++, value.w)
                }
            }
            else if (value instanceof Quat) {
                for (let i = 0; i < length; i++) {
                    container.set(insertIndex++, value.x)
                    container.set(insertIndex++, value.y)
                    container.set(insertIndex++, value.z)
                    container.set(insertIndex++, value.w)
                }
            }
            else if (value instanceof Color) {
                for (let i = 0; i < length; i++) {
                    container.set(insertIndex++, value.r)
                    container.set(insertIndex++, value.g)
                    container.set(insertIndex++, value.b)
                    container.set(insertIndex++, value.a)
                }
            }
            else if (value instanceof Mat3)
                for (let i = 0; i < length; i++)
                    for (let j = 0; j < 9; j++)
                        container.set(insertIndex++, value.data[j])
            else if (value instanceof Mat4)
                for (let i = 0; i < length; i++)
                    for (let j = 0; j < 16; j++)
                        container.set(insertIndex++, value.data[j])
            else
                throw new Error()
        }

        return container
    }

    copyStatic(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: any): FieldPointVector<Point, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>> {
        return <FieldPointVector<Point, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>>>vectorized.arrayView(false)
    }

    copyDynamic(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: any): FieldPointVector<Point, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>> {
        return <FieldPointVector<Point, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>>>vectorized.clone()
    }
}