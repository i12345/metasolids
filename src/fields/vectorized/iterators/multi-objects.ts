import { MultiObjectsTemplate, MultiObjectsMapped, MultiObjectsIDs } from "../../../paradigm/trees/multi-objects.js"
import { intract, hasPath, extract } from "../../../paradigm/trees/tree.js"
import { FieldPointMapped, FieldPoint } from "../../point.js"
import { FieldPointType } from "../../type.js"
import { vectorIterator } from "./factory.js"
import { FieldPointVectorIterator } from "../iterator.js"
import { FieldPointVector, ItemObjValuesOffsetsKey, ItemObjIDsKey, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, IsDynamicVector, FieldPointVectorContainerType, FieldPointVectorContainerDynamic } from "../point.js"
import { IndicesTypedArray, invalidIndex } from "../../../utils/indices-array.js"

export class MultiObjectsFieldPointVectorIterator<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
        VectorizedRoot extends FieldPointVectorWithMultiObjects = FieldPointVectorWithMultiObjects
    > implements
    FieldPointVectorIterator<
        MultiObjectsMapped<Objects, Point>,
        Container,
        VectorizedRoot,
        Point
    > {
    get canGetSetByReference() {
        return this.typeIterator.canGetSetByReference
    }

    private readonly typeIterator: FieldPointVectorIterator<Point, Container, VectorizedRoot>

    constructor(
        public readonly type: FieldPointType<Point>,
        public readonly multiObjectsIDs: MultiObjectsIDs<Objects, ObjIDsT>,
        public readonly isDynamicChildren: boolean
    ) {
        this.typeIterator = vectorIterator<Point, Container, Objects, ObjIDsT>(type, <IsDynamicVector<Point, Container>>isDynamicChildren, multiObjectsIDs)
    }

    length(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot): number {
        return vectorizedRoot[ItemObjValuesOffsetsKey].length
    }

    get_returnValue(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot, index: number): MultiObjectsMapped<Objects, Point> {
        const result = <MultiObjectsMapped<Objects, Point>>{}
        this.get_returnParam(vectorized, vectorizedRoot, result, index)
        return result
    }

    get_returnParam(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot, result: MultiObjectsMapped<Objects, Point>, index: number): void {
        const offset_start = index > 0 ? vectorizedRoot[ItemObjValuesOffsetsKey][index - 1] : 0
        const offset_end = vectorizedRoot[ItemObjValuesOffsetsKey][index]

        for (const key of Reflect.ownKeys(result))
            delete result[key]

        for (let offset = offset_start; offset < offset_end; offset++) {
            const objValue = this.typeIterator.get_returnValue(vectorized, vectorizedRoot, offset)
            const objID = <number>vectorizedRoot[ItemObjIDsKey].get(offset)
            const objPath = this.multiObjectsIDs.paths[objID]
            intract(result, objPath, objValue)
        }
    }

    set(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot, value: MultiObjectsMapped<Objects, Point>, index: number): void {
        let offset = index > 0 ? vectorizedRoot[ItemObjValuesOffsetsKey][index - 1] : 0

        //TODO: support inserting in TypedArrayList
        if (vectorizedRoot[ItemObjValuesOffsetsKey][index] !== invalidIndex(vectorizedRoot[ItemObjValuesOffsetsKey]))
            throw new Error("cannot set obj value again; item is in array")

        //TODO: this could be optimized with recursively traversing the objects template

        const set = this.typeIterator.set.bind(this.typeIterator, vectorized, vectorizedRoot)
        const objIDs = vectorizedRoot[ItemObjIDsKey]
        const objPaths = this.multiObjectsIDs.paths

        for (let objID = 0; objID < objPaths.length; objID++) {
            const objPath = objPaths[objID]
            if (hasPath(value, objPath)) {
                const objValue = extract<Point>(value, objPath)
                set(objValue, offset)
                objIDs.set(offset, objID)
                offset++
            }
        }

        vectorizedRoot[ItemObjValuesOffsetsKey][index] = offset
    }

    copyStatic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>> {
        return this.typeIterator.copyStatic(vectorized, vectorizedRoot)
    }

    copyDynamic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>> {
        return this.typeIterator.copyDynamic(vectorized, vectorizedRoot)
    }

    scatter(
            dst_vectorized: FieldPointVector<Point, Container>, dst_vectorizedRoot: VectorizedRoot,
            src_vectorized: FieldPointVector<Point, Container>, src_vectorizedRoot: VectorizedRoot,
            /** indices[dst_index] = src_index */
            indices: IndicesTypedArray,
            isMultiObjMapped?: boolean
        ): void {
        if (isMultiObjMapped)
            throw new Error()

        this.typeIterator.scatter(
            dst_vectorized, dst_vectorizedRoot,
            src_vectorized, src_vectorizedRoot,
            indices,
            true
        )
    }
}