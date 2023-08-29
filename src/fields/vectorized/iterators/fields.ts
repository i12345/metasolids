import { MultiObjectsIDs, MultiObjectsTemplate } from "../../../paradigm/trees/multi-objects.js"
import { extract, hasPath, intract } from "../../../paradigm/trees/tree.js"
import { IndicesTypedArray } from "../../../utils/indices-array.js"
import { Reflect_entries } from "../../../utils/reflect-entries.js"
import { TypedArray } from "../../../utils/typed-array.js"
import { FieldsPoint, FieldPoint, field_point_map, FieldPointMapped, FieldPointPrimitive } from "../../point.js"
import { FieldPointType } from "../../type.js"
import { FieldPointVectorIterator } from "../iterator.js"
import { FieldPointVectorContainer, FieldPointVector, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic, IsDynamicVectorContainer, isDynamicVectorContainer, FieldPointVectorContainerType, isDynamicVector } from "../point.js"
import { vectorIterator } from "./factory.js"
import { PrimitiveFieldPointVectorIterator } from "./primitive.js"

export class FieldsFieldPointVectorIterator<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        Point extends FieldsPoint = FieldsPoint,
        Container extends FieldPointVectorContainer<TypedArray> = Float64Array,
        VectorizedRoot = any
    > implements FieldPointVectorIterator<Point, Container, VectorizedRoot> {
    readonly canGetByReference = true
    
    private readonly typeIterators: [PropertyKey, FieldPointVectorIterator<FieldPoint, Container>][]

    constructor(
        public readonly types: FieldPointType<Point>,
        public readonly isDynamicContainer?: IsDynamicVectorContainer<Container>,
        public readonly multiObjectsIDs?: MultiObjectsIDs<Objects, ObjIDsT>,
    ) {
        this.typeIterators = Reflect_entries(types).map(([key, type]) => [key, vectorIterator(type, isDynamicContainer, multiObjectsIDs)])
    }

    copyStatic(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointVector<Point, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>> {
        const result = <FieldPointVector<Point, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>>>{}

        field_point_map<Point, Function, void>(
            <FieldPointMapped<Point, Function>>this.types,
            type => type instanceof Function,
            (type, path) => {
                if (hasPath(vectorized, path)) {
                    const typeIterator = <PrimitiveFieldPointVectorIterator<FieldPointPrimitive, Container>><unknown>type
                    const subvector = extract<Container>(vectorized, path)
                    const subresult = typeIterator.copyStatic(subvector, vectorizedRoot)
                    intract(result, path, subresult)
                }
            }
        )

        return result
    }

    copyDynamic(vectorized: FieldPointMapped<Point, Container>, vectorizedRoot: VectorizedRoot): FieldPointMapped<Point, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>> {
        const result = <FieldPointVector<Point, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>>>{}

        field_point_map<Point, Function, void>(
            <FieldPointMapped<Point, Function>>this.types,
            type => type instanceof Function,
            (type, path) => {
                if (hasPath(vectorized, path)) {
                    const typeIterator = <PrimitiveFieldPointVectorIterator<FieldPointPrimitive, Container>><unknown>type
                    const subvector = extract<Container>(vectorized, path)
                    const subresult = typeIterator.copyDynamic(subvector, vectorizedRoot)
                    intract(result, path, subresult)
                }
            }
        )

        return result
    }

    scatter(
            dst_vectorized: FieldPointVector<Point, Container>, dst_vectorizedRoot: VectorizedRoot,
            src_vectorized: FieldPointVector<Point, Container>, src_vectorizedRoot: VectorizedRoot,
            /** indices[dst_index] = src_index */
            indices: IndicesTypedArray,
            isMultiObjMapped?: boolean
        ): void {
        for (const [key, sub_typeIterator] of this.typeIterators) {
            if(!(key in src_vectorized)) continue
            if (!(key in dst_vectorized)) throw new Error()
            
            sub_typeIterator.scatter(
                src_vectorized[key], src_vectorizedRoot,
                dst_vectorized[key], dst_vectorizedRoot,
                indices,
                isMultiObjMapped
            )
        }
    }
    
    length(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot): number {
        for (const [key, typeIterator] of this.typeIterators) {
            const subvectorized = vectorized[key]
            if (subvectorized) {
                const sublength = typeIterator.length(subvectorized, vectorizedRoot)
                if (sublength !== undefined)
                    return sublength
            }
        }

        return undefined!
    }

    get_returnValue(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot, index: number): Point {
        let result: any = {}

        for (let [key, typeIterator] of this.typeIterators)
            if (key in vectorized)
                result[key] = typeIterator.get_returnValue(vectorized[key], vectorizedRoot, index)

        return <Point>result
    }

    get_returnParam(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot, result: Point, index: number): void {
        for (let [key, typeIterator] of this.typeIterators) {
            if (key in vectorized) {
                if (typeIterator.canGetByReference)
                    typeIterator.get_returnParam(vectorized[key], vectorizedRoot, (result as any)[key], index)
                else
                    (result as any)[key] = typeIterator.get_returnValue(vectorized[key], vectorizedRoot, index)
            }
        }
    }

    set(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot, value: Point, index: number): void {
        for (let [key, typeIterator] of this.typeIterators)
            if (key in vectorized)
                typeIterator.set(vectorized[key], vectorizedRoot, (value as any)[key], index)
    }

    curryGet(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot, result: Point): (index: number) => void {
        const functions: ((index: number) => void)[] = []
        
        field_point_map<Point, Function, void>(
            <FieldPointMapped<Point, Function>>this.types,
            type => type instanceof Function,
            (type, path) => {
                const subvectorized = extract<FieldPointVector<FieldPoint, Container>>(vectorized, path)
                const iterator = vectorIterator(<FieldPointType>type, isDynamicVector<FieldPoint, Container>(subvectorized), this.multiObjectsIDs)

                if (iterator.canGetByReference) {
                    const subresult = extract<FieldPoint>(result, path)
                    functions.push(iterator.get_returnParam.bind(iterator, <FieldPointVector<FieldPoint, FieldPointVectorContainer>>subvectorized, vectorizedRoot, subresult))
                }
                else {
                    const subresult_parent = extract<FieldsPoint>(result, path.slice(0, -1))
                    const lastKey = path.at(-1)!
                    const getByValue = iterator.get_returnValue.bind(iterator, <FieldPointVector<FieldPoint, FieldPointVectorContainer>>subvectorized, vectorizedRoot)
                    functions.push((index: number) => subresult_parent[lastKey] = getByValue(index))
                }
            }
        )

        return index => functions.forEach(curried => curried(index))
    }

    currySet(vectorized: FieldPointVector<Point, Container>, vectorizedRoot: VectorizedRoot, value: Point): (index: number) => void {
        const functions: ((index: number) => void)[] = []

        field_point_map<Point, Function, void>(
            <FieldPointMapped<Point, Function>>this.types,
            type => type instanceof Function,
            (type, path) => {
                const subvectorized = extract<FieldPointVector<FieldPoint, Container>>(vectorized, path)
                const iterator = vectorIterator(<FieldPointType>type, isDynamicVector<FieldPoint, Container>(subvectorized), this.multiObjectsIDs)

                if (iterator.canGetByReference) {
                    const subvalue = extract<FieldPoint>(value, path)
                    functions.push(iterator.set.bind(iterator, <FieldPointVector<FieldPoint, FieldPointVectorContainer>>subvectorized, vectorizedRoot, subvalue))
                }
                else {
                    const subvalue_parent = extract<FieldsPoint>(value, path.slice(0, -1))
                    const lastKey = path.at(-1)!
                    const set = iterator.set.bind(iterator, <FieldPointVector<FieldPoint, FieldPointVectorContainer>>subvectorized, vectorizedRoot)
                    functions.push((index: number) => set(subvalue_parent[lastKey], index))
                }
            }
        )

        return index => functions.forEach(curried => curried(index))
    }
}