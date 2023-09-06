import { Color, Mat3, Mat4, Quat, Vec2, Vec3, Vec4 } from "playcanvas-extended";
import { IndicesTypedArray } from "../../../utils/indices-array.js";
import { TypedArrayList } from "../../../utils/typed-array-list.js";
import { FieldPoint, FieldPointMapped, FieldPointPrimitive } from "../../point.js";
import { FieldPointType, field_point_type_size } from "../../type.js"
import { FuseMode, FusingFieldPointVectorWithMultiObjects, PrimitiveFuseMode } from "../fusing.js";
import { FieldPointVectorIterator } from "../iterator.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic, FieldPointVectorContainerType, FieldPointVectorWithMultiObjRoot, FieldPointVectorWithMultiObjects, ItemObjIDsKey, ItemObjValuesOffsetsKey } from "../point.js";
import { NumberTypedArray, isNumberTypedArray, typedArrayClone, TypedArrayConstructor, typedArrayInvalid, typedArrayConstructor } from "../../../utils/typed-array.js";

export abstract class PrimitiveFieldPointVectorIterator<
        Point extends FieldPointPrimitive = FieldPointPrimitive,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        VectorizedRoot = any
    > implements
    FieldPointVectorIterator<Point, Container, VectorizedRoot, Point> {
    abstract get canGetSetByReference(): boolean

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

    abstract scatter(
        dst_vectorized: FieldPointVector<Point, Container>, dst_vectorizedRoot: VectorizedRoot,
        src_vectorized: FieldPointVector<Point, Container>, src_vectorizedRoot: VectorizedRoot,
        indices: IndicesTypedArray
    ): void
}

export abstract class PrimitiveFieldPointVectorIteratorStatic<
        Point extends FieldPointPrimitive = FieldPointPrimitive,
        Container extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        VectorizedRoot = any
    >
    extends PrimitiveFieldPointVectorIterator<Point, Container, VectorizedRoot> {
    makeContainer(length: number, value?: Point): Container {
        const container = <Container>new Float64Array(this.elementSize * length)

        if (value !== undefined) {
            let insertIndex = 0

            if (typeof value === 'number')
                container.fill(value)
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
        const container = new TypedArrayList(typedArrayConstructor<number, NumberTypedArray>(vectorized))
        container.appendBlock(this.copyStatic(vectorized, vectorizedRoot))
        return <FieldPointMapped<Point, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>>>container
    }

    scatter(
            dst_vectorized: FieldPointVector<Point, Container>, dst_vectorizedRoot: VectorizedRoot,
            src_vectorized: FieldPointVector<Point, Container>, src_vectorizedRoot: VectorizedRoot,
            /** indices[dst_index] = src_index */
            indices: IndicesTypedArray,
            isMultiObjMapped?: boolean
        ): void {
        const indices_invalid = indices ? typedArrayInvalid(indices) : undefined
        const elementSize = this.elementSize
        const n_items = dst_vectorized.length / elementSize
        let dst_item: number
        let src_item: number
        let element: number
        let dst_offset: number
        let src_offset: number

        if (isMultiObjMapped) {
            let dst_objOffset: number
            let dst_objOffset_prev = 0
            let dst_objOffset_next: number

            let src_objOffset: number
            let src_objOffset_prev = 0
            let src_objOffset_next: number

            let objID: number

            type ObjIDsT = IndicesTypedArray

            const src_objIDs_container = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>src_vectorizedRoot)[ItemObjIDsKey]
            const dst_objIDs_container = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>dst_vectorizedRoot)[ItemObjIDsKey]

            if (isNumberTypedArray(src_objIDs_container)) {
                const src_objIDs = <FieldPointVectorContainerStatic<ObjIDsT>>src_objIDs_container
                const src_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>src_vectorizedRoot)[ItemObjValuesOffsetsKey]

                if (isNumberTypedArray(dst_objIDs_container)) {
                    const dst_objIDs = <FieldPointVectorContainerStatic<ObjIDsT>>dst_objIDs_container
                    const dst_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>dst_vectorizedRoot)[ItemObjValuesOffsetsKey]

                    for (dst_item = 0; dst_item < n_items; dst_item++) {
                        src_item = indices[dst_item]
                        if(src_item === indices_invalid) continue
                        src_objOffset_next = src_objOffsets[src_item]
                        dst_objOffset_next = dst_objOffsets[dst_item]

                        for (src_objOffset = src_objOffset_prev; src_objOffset < src_objOffset_next; src_objOffset++) {
                            objID = src_objIDs[src_objOffset]

                            for (dst_objOffset = dst_objOffset_prev; dst_objOffset < dst_objOffset_next; dst_objOffset++)
                                if (objID === dst_objIDs[dst_objOffset])
                                    break

                            if (dst_objOffset === dst_objOffset_next)
                                throw new Error("objID in src not in dst")

                            src_offset = elementSize * src_objOffset
                            dst_offset = elementSize * dst_objOffset

                            for (element = elementSize; element > 0; element--)
                                dst_vectorized[dst_offset++] = src_vectorized[src_offset++]
                        }
                    }
                }
                else {
                    const dst_objIDs = <FieldPointVectorContainerDynamic<ObjIDsT>>dst_objIDs_container
                    const dst_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>dst_vectorizedRoot)[ItemObjValuesOffsetsKey]

                    for (dst_item = 0; dst_item < n_items; dst_item++) {
                        src_item = indices[dst_item]
                        if(src_item === indices_invalid) continue
                        src_objOffset_next = src_objOffsets[src_item]
                        dst_objOffset_next = dst_objOffsets[dst_item]

                        for (src_objOffset = src_objOffset_prev; src_objOffset < src_objOffset_next; src_objOffset++) {
                            objID = src_objIDs[src_objOffset]

                            for (dst_objOffset = dst_objOffset_prev; dst_objOffset < dst_objOffset_next; dst_objOffset++)
                                if (objID === dst_objIDs.get(dst_objOffset))
                                    break

                            if (dst_objOffset === dst_objOffset_next)
                                throw new Error("objID in src not in dst")

                            src_offset = elementSize * src_objOffset
                            dst_offset = elementSize * dst_objOffset

                            for (element = elementSize; element > 0; element--)
                                dst_vectorized[dst_offset++] = src_vectorized[src_offset++]
                        }
                    }
                }
            }
            else {
                const src_objIDs = <FieldPointVectorContainerDynamic<ObjIDsT>>src_objIDs_container
                const src_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>src_vectorizedRoot)[ItemObjValuesOffsetsKey]

                if (isNumberTypedArray(dst_objIDs_container)) {
                    const dst_objIDs = <FieldPointVectorContainerStatic<ObjIDsT>>dst_objIDs_container
                    const dst_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>dst_vectorizedRoot)[ItemObjValuesOffsetsKey]

                    for (dst_item = 0; dst_item < n_items; dst_item++) {
                        src_item = indices[dst_item]
                        if(src_item === indices_invalid) continue
                        src_objOffset_next = src_objOffsets[src_item]
                        dst_objOffset_next = dst_objOffsets[dst_item]

                        for (src_objOffset = src_objOffset_prev; src_objOffset < src_objOffset_next; src_objOffset++) {
                            objID = src_objIDs.get(src_objOffset)

                            for (dst_objOffset = dst_objOffset_prev; dst_objOffset < dst_objOffset_next; dst_objOffset++)
                                if (objID === dst_objIDs[dst_objOffset])
                                    break

                            if (dst_objOffset === dst_objOffset_next)
                                throw new Error("objID in src not in dst")

                            src_offset = elementSize * src_objOffset
                            dst_offset = elementSize * dst_objOffset

                            for (element = elementSize; element > 0; element--)
                                dst_vectorized[dst_offset++] = src_vectorized[src_offset++]
                        }
                    }
                }
                else {
                    const dst_objIDs = <FieldPointVectorContainerDynamic<ObjIDsT>>dst_objIDs_container
                    const dst_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>dst_vectorizedRoot)[ItemObjValuesOffsetsKey]

                    for (dst_item = 0; dst_item < n_items; dst_item++) {
                        src_item = indices[dst_item]
                        if(src_item === indices_invalid) continue
                        src_objOffset_next = src_objOffsets[src_item]
                        dst_objOffset_next = dst_objOffsets[dst_item]

                        for (src_objOffset = src_objOffset_prev; src_objOffset < src_objOffset_next; src_objOffset++) {
                            objID = src_objIDs.get(src_objOffset)

                            for (dst_objOffset = dst_objOffset_prev; dst_objOffset < dst_objOffset_next; dst_objOffset++)
                                if (objID === dst_objIDs.get(dst_objOffset))
                                    break

                            if (dst_objOffset === dst_objOffset_next)
                                throw new Error("objID in src not in dst")

                            src_offset = elementSize * src_objOffset
                            dst_offset = elementSize * dst_objOffset

                            for (element = elementSize; element > 0; element--)
                                dst_vectorized[dst_offset++] = src_vectorized[src_offset++]
                        }
                    }
                }
            }
        }
        else {
            dst_offset = 0

            for (dst_item = 0; dst_item < indices.length; dst_item++) {
                src_item = indices[dst_item]
                if (src_item === indices_invalid) {
                    dst_offset += elementSize
                    continue
                }

                src_offset = elementSize * src_item

                for (element = elementSize; element > 0; element--)
                    dst_vectorized[dst_offset++] = src_vectorized[src_offset++]
            }
        }
    }
}

export abstract class PrimitiveFieldPointVectorIteratorDynamic<
        Point extends FieldPointPrimitive = FieldPointPrimitive,
        Container extends FieldPointVectorContainerDynamic<NumberTypedArray> = FieldPointVectorContainerDynamic,
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

    scatter(
            dst_vectorized: FieldPointVector<Point, Container>, dst_vectorizedRoot: VectorizedRoot,
            src_vectorized: FieldPointVector<Point, Container>, src_vectorizedRoot: VectorizedRoot,
            /** indices[dst_index] = src_index */
            indices: IndicesTypedArray,
            isMultiObjMapped?: boolean
        ): void {
        const indices_invalid = indices ? typedArrayInvalid(indices) : undefined
        const elementSize = this.elementSize
        const n_items = dst_vectorized.length / elementSize
        let dst_item: number
        let src_item: number
        let element: number
        let dst_offset: number
        let src_offset: number

        if (isMultiObjMapped) {
            let dst_objOffset: number
            let dst_objOffset_prev = 0
            let dst_objOffset_next: number

            let src_objOffset: number
            let src_objOffset_prev = 0
            let src_objOffset_next: number

            let objID: number

            type ObjIDsT = IndicesTypedArray

            const src_objIDs_container = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>src_vectorizedRoot)[ItemObjIDsKey]
            const dst_objIDs_container = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>dst_vectorizedRoot)[ItemObjIDsKey]

            if (isNumberTypedArray(src_objIDs_container)) {
                const src_objIDs = <FieldPointVectorContainerStatic<ObjIDsT>>src_objIDs_container
                const src_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>src_vectorizedRoot)[ItemObjValuesOffsetsKey]

                if (isNumberTypedArray(dst_objIDs_container)) {
                    const dst_objIDs = <FieldPointVectorContainerStatic<ObjIDsT>>dst_objIDs_container
                    const dst_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>dst_vectorizedRoot)[ItemObjValuesOffsetsKey]

                    for (dst_item = 0; dst_item < n_items; dst_item++) {
                        src_item = indices[dst_item]
                        if(src_item === indices_invalid) continue
                        src_objOffset_next = src_objOffsets[src_item]
                        dst_objOffset_next = dst_objOffsets[dst_item]

                        for (src_objOffset = src_objOffset_prev; src_objOffset < src_objOffset_next; src_objOffset++) {
                            objID = src_objIDs[src_objOffset]

                            for (dst_objOffset = dst_objOffset_prev; dst_objOffset < dst_objOffset_next; dst_objOffset++)
                                if (objID === dst_objIDs[dst_objOffset])
                                    break

                            if (dst_objOffset === dst_objOffset_next)
                                throw new Error("objID in src not in dst")

                            src_offset = elementSize * src_objOffset
                            dst_offset = elementSize * dst_objOffset

                            for (element = elementSize; element > 0; element--)
                                dst_vectorized.set(dst_offset++, src_vectorized.get(src_offset++))
                        }
                    }
                }
                else {
                    const dst_objIDs = <FieldPointVectorContainerDynamic<ObjIDsT>>dst_objIDs_container
                    const dst_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>dst_vectorizedRoot)[ItemObjValuesOffsetsKey]

                    for (dst_item = 0; dst_item < n_items; dst_item++) {
                        src_item = indices[dst_item]
                        if(src_item === indices_invalid) continue
                        src_objOffset_next = src_objOffsets[src_item]
                        dst_objOffset_next = dst_objOffsets[dst_item]

                        for (src_objOffset = src_objOffset_prev; src_objOffset < src_objOffset_next; src_objOffset++) {
                            objID = src_objIDs[src_objOffset]

                            for (dst_objOffset = dst_objOffset_prev; dst_objOffset < dst_objOffset_next; dst_objOffset++)
                                if (objID === dst_objIDs.get(dst_objOffset))
                                    break

                            if (dst_objOffset === dst_objOffset_next)
                                throw new Error("objID in src not in dst")

                            src_offset = elementSize * src_objOffset
                            dst_offset = elementSize * dst_objOffset

                            for (element = elementSize; element > 0; element--)
                                dst_vectorized.set(dst_offset++, src_vectorized.get(src_offset++))
                        }
                    }
                }
            }
            else {
                const src_objIDs = <FieldPointVectorContainerDynamic<ObjIDsT>>src_objIDs_container
                const src_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>src_vectorizedRoot)[ItemObjValuesOffsetsKey]

                if (isNumberTypedArray(dst_objIDs_container)) {
                    const dst_objIDs = <FieldPointVectorContainerStatic<ObjIDsT>>dst_objIDs_container
                    const dst_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>dst_vectorizedRoot)[ItemObjValuesOffsetsKey]

                    for (dst_item = 0; dst_item < n_items; dst_item++) {
                        src_item = indices[dst_item]
                        if(src_item === indices_invalid) continue
                        src_objOffset_next = src_objOffsets[src_item]
                        dst_objOffset_next = dst_objOffsets[dst_item]

                        for (src_objOffset = src_objOffset_prev; src_objOffset < src_objOffset_next; src_objOffset++) {
                            objID = src_objIDs.get(src_objOffset)

                            for (dst_objOffset = dst_objOffset_prev; dst_objOffset < dst_objOffset_next; dst_objOffset++)
                                if (objID === dst_objIDs[dst_objOffset])
                                    break

                            if (dst_objOffset === dst_objOffset_next)
                                throw new Error("objID in src not in dst")

                            src_offset = elementSize * src_objOffset
                            dst_offset = elementSize * dst_objOffset

                            for (element = elementSize; element > 0; element--)
                                dst_vectorized.set(dst_offset++, src_vectorized.get(src_offset++))
                        }
                    }
                }
                else {
                    const dst_objIDs = <FieldPointVectorContainerDynamic<ObjIDsT>>dst_objIDs_container
                    const dst_objOffsets = (<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, FieldPointVectorContainer<ObjIDsT>>>dst_vectorizedRoot)[ItemObjValuesOffsetsKey]

                    for (dst_item = 0; dst_item < n_items; dst_item++) {
                        src_item = indices[dst_item]
                        if(src_item === indices_invalid) continue
                        src_objOffset_next = src_objOffsets[src_item]
                        dst_objOffset_next = dst_objOffsets[dst_item]

                        for (src_objOffset = src_objOffset_prev; src_objOffset < src_objOffset_next; src_objOffset++) {
                            objID = src_objIDs.get(src_objOffset)

                            for (dst_objOffset = dst_objOffset_prev; dst_objOffset < dst_objOffset_next; dst_objOffset++)
                                if (objID === dst_objIDs.get(dst_objOffset))
                                    break

                            if (dst_objOffset === dst_objOffset_next)
                                throw new Error("objID in src not in dst")

                            src_offset = elementSize * src_objOffset
                            dst_offset = elementSize * dst_objOffset

                            for (element = elementSize; element > 0; element--)
                                dst_vectorized.set(dst_offset++, src_vectorized.get(src_offset++))
                        }
                    }
                }
            }
        }
        else {
            dst_offset = 0

            for (dst_item = 0; dst_item < indices.length; dst_item++) {
                src_item = indices[dst_item]
                if (src_item === indices_invalid) {
                    dst_offset += elementSize
                    continue
                }

                src_offset = elementSize * src_item

                for (element = elementSize; element > 0; element--)
                    dst_vectorized.set(dst_offset++, src_vectorized.get(src_offset++))
            }
        }
    }
}