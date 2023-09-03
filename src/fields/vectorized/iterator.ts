import { IndicesTypedArray } from "../../utils/indices-array.js"
import { NumberTypedArray } from "../../utils/typed-array.js"
import { FieldPoint } from "../point.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic, FieldPointVectorContainerType } from "./point.js"

export interface FieldPointVectorIterator<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        VectorizedRoot = any,
        VectorizedPoint extends FieldPoint = Point
    > {
    readonly canGetByReference: boolean

    length(vectorized: FieldPointVector<VectorizedPoint, Container>, vectorizedRoot: VectorizedRoot): number
    get_returnValue(vectorized: FieldPointVector<VectorizedPoint, Container>, vectorizedRoot: VectorizedRoot, index: number): Point
    get_returnParam(vectorized: FieldPointVector<VectorizedPoint, Container>, vectorizedRoot: VectorizedRoot, result: Point, index: number): void
    set(vectorized: FieldPointVector<VectorizedPoint, Container>, vectorizedRoot: VectorizedRoot, value: Point, index: number): void

    copyStatic(vectorized: FieldPointVector<VectorizedPoint, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<VectorizedPoint, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>>
    copyDynamic(vectorized: FieldPointVector<VectorizedPoint, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<VectorizedPoint, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>>

    scatter(
        dst_vectorized: FieldPointVector<VectorizedPoint, Container>, dst_vectorizedRoot: VectorizedRoot,
        src_vectorized: FieldPointVector<VectorizedPoint, Container>, src_vectorizedRoot: VectorizedRoot,
        /** indices[dst_index] = src_index */
        indices: IndicesTypedArray,
        isMultiObjMapped?: boolean
    ): void
}