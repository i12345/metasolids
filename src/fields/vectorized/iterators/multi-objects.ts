import { MultiObjectsTemplate, MultiObjectsMapped, MultiObjectsIDs } from "../../../paradigm/trees/multi-objects.js"
import { intract, hasPath, extract } from "../../../paradigm/trees/tree.js"
import { FieldPointType, FieldPointMapped, FieldPoint, FieldPointPrimitive } from "../../point.js"
import { vectorIterator } from "./factory.js"
import { FieldPointVectorIterator } from "../iterator.js"
import { FieldPointVector, ItemObjValuesOffsetsKey, ItemObjIDsKey, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "../point.js"
import { IndicesTypedArray } from "../../../utils/indices-array.js"
import { PrimitiveFieldPointVectorIterator } from "./primitive.js"

export class MultiObjectsFieldPointVectorIterator<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainerDynamic = FieldPointVectorContainerDynamic,
        VectorizedRoot extends FieldPointVectorWithMultiObjects = FieldPointVectorWithMultiObjects
    > implements
    FieldPointVectorIterator<
        MultiObjectsMapped<Objects, Point>,
        Container,
        VectorizedRoot,
        Point
    > {
    get canGetByReference() {
        return this.typeIterator.canGetByReference
    }

    private readonly typeIterator: FieldPointVectorIterator<Point, Container, VectorizedRoot>

    constructor(
        public readonly type: FieldPointType<Point>,
        public readonly multiObjectsIDs: MultiObjectsIDs<Objects>
    ) {
        this.typeIterator = vectorIterator<Objects, ObjIDsT, Point, Container>(multiObjectsIDs, type, <Container extends FieldPointVectorContainerDynamic ? true : false>true)
    }

    length(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot): number {
        return vectorizedRoot[ItemObjValuesOffsetsKey].length - 1
    }

    get_returnValue(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot, index: number): MultiObjectsMapped<Objects, Point> {
        const result = <MultiObjectsMapped<Objects, Point>>{}
        this.get_returnParam(vectorized, vectorizedRoot, result, index)
        return result
    }

    get_returnParam(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot, result: MultiObjectsMapped<Objects, Point>, index: number): void {
        const offset_start = vectorizedRoot[ItemObjValuesOffsetsKey][index + 0]
        const offset_end = vectorizedRoot[ItemObjValuesOffsetsKey][index + 1]

        for (const key of Reflect.ownKeys(result))
            delete result[key]

        for (let offset = offset_start; offset < offset_end; offset++) {
            const objValue = this.typeIterator.get_returnValue(vectorized, vectorizedRoot, offset)
            const objID = vectorizedRoot[ItemObjIDsKey].get(offset)
            const objPath = this.multiObjectsIDs.paths[objID]
            intract(result, objPath, objValue)
        }
    }

    set(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot, value: MultiObjectsMapped<Objects, Point>, index: number): void {
        let offset = vectorizedRoot[ItemObjValuesOffsetsKey][index + 0]

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

        vectorizedRoot[ItemObjValuesOffsetsKey][index + 1] = offset
    }

    makeContainer(length: number): Container {
        if (!(this.typeIterator instanceof PrimitiveFieldPointVectorIterator))
            throw new Error("can only make container for primitive field types")
        
        return (<PrimitiveFieldPointVectorIterator<FieldPointPrimitive, Container, VectorizedRoot>><FieldPointVectorIterator<FieldPointPrimitive>>this.typeIterator).makeContainer(length)
    }

    copyStatic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerStatic> {
        return this.typeIterator.copyStatic(vectorized, vectorizedRoot)
    }

    copyDynamic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerDynamic> {
        return this.typeIterator.copyDynamic(vectorized, vectorizedRoot)
    }
}