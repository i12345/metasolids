import { MultiObjectsGroupedObjectsKey } from "../../../paradigm/trees/multi-objects-groups.js";
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../../paradigm/trees/multi-objects.js";
import { IndicesTypedArray } from "../../../utils/indices-array.js";
import { TypedArrayList } from "../../../utils/typed-array-list.js";
import { NumberTypedArray } from "../../../utils/typed-array.js";
import { FieldPoint, FieldPointPrimitive, FieldsPoint } from "../../point.js";
import { FieldPointType } from "../../type.js"
import { FieldPointVectorIterator } from "../iterator.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerDynamic, FieldPointVectorWithMultiObjects, IsDynamicVector, ItemObjIDsKey, isDynamicVector, isDynamicVectorContainer } from "../point.js";
import { FieldsFieldPointVectorIterator } from "./fields.js";
import { MultiObjectsFieldPointVectorIterator } from "./multi-objects.js";


const vectorIteratorFactories = new Map<Function, [FieldPointVectorIterator<FieldPoint, Float64Array>, FieldPointVectorIterator<FieldPoint, TypedArrayList<number, Float64Array>>]>()

export function vectorIteratorFactory<Point extends FieldPointPrimitive, IsDynamic extends boolean>(type: FieldPointType<Point>, isDynamic: IsDynamic): ClassDecorator {
    return target => {
        const factories = vectorIteratorFactories.get(type) ?? [undefined, undefined]
        factories[isDynamic ? 1 : 0] = <any>new (<{ new(): FieldPointVectorIterator }><Function>target)()
        vectorIteratorFactories.set(type, <any>factories)
    }
}

export function vectorIterator<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        PointElementType extends FieldPoint = Point,
        VectorizedRoot = any
    >(
        type: FieldPointType<PointElementType>,
        isDynamicVector?: IsDynamicVector<PointElementType, Container>,
        multiObjectsIDs?: MultiObjectsIDs<Objects, ObjIDsT>,
        vectorizedRoot?: VectorizedRoot
    ): FieldPointVectorIterator<Point, Container, VectorizedRoot, PointElementType> {
    if (type instanceof Function) {
        if (typeof isDynamicVector !== 'boolean')
            throw new Error("must specify whether or not to use dynamic container")

        return vectorIteratorFactories.get(type)![isDynamicVector! ? 1 : 0] as FieldPointVectorIterator<Point, Container, VectorizedRoot, PointElementType>
    }
    else if (MultiObjectsGroupedObjectsKey in type) {
        // if (isDynamicVector === false)
        //     throw new Error("must use dynamic container for multi objects")
        if (multiObjectsIDs === undefined)
            throw new Error("must specify multiObjectsIDs for a multi objects type")

        return new MultiObjectsFieldPointVectorIterator<Objects, ObjIDsT, FieldPoint>(
            <FieldPointType><any>type[MultiObjectsGroupedObjectsKey],
            multiObjectsIDs,
            (vectorizedRoot && (ItemObjIDsKey in (<FieldPointVector<FieldPoint, Container>>vectorizedRoot))) ? isDynamicVectorContainer((<FieldPointVectorWithMultiObjects><unknown>vectorizedRoot)[ItemObjIDsKey]) : false
        ) as unknown as FieldPointVectorIterator<Point, Container, VectorizedRoot, PointElementType>
    }
    else return new FieldsFieldPointVectorIterator<Objects, ObjIDsT, FieldsPoint, Container>(type, isDynamicVector, multiObjectsIDs) as FieldPointVectorIterator<FieldsPoint, Container> as FieldPointVectorIterator<Point, Container, VectorizedRoot, PointElementType>
}

export function vectorizedIteratorGetSetLengthCurried<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>
    >(
        type: FieldPointType<Point>,
        vectorized: FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer>,
        item: {
            obj: object,
            property: PropertyKey
        },
        multiObjectsIDs?: MultiObjectsIDs<Objects, ObjIDsT>,
    ): {
        get(index: number): void
        set(index: number): void
        length: number
    } {
    const iterator = vectorIterator(type, <IsDynamicVector<Point, Container>>isDynamicVector(type, vectorized, vectorized), multiObjectsIDs)
    const length = iterator.length(vectorized, vectorized)

    if (type instanceof Function) {
        const set_bound = iterator.set.bind(iterator, vectorized, vectorized)
        const set = (index: number) => set_bound((item.obj as any)[item.property], index)

        if (iterator.canGetSetByReference) {
            const get = iterator.get_returnParam.bind(iterator, vectorized, vectorized, (item.obj as any)[item.property] as Point)
            return { get, set, length }
        }
        else {
            const get_bound = iterator.get_returnValue.bind(iterator, vectorized, vectorized)
            const get = (index: number) => (item.obj as any)[item.property] = get_bound(index)
            return { get, set, length }
        }
    }
    else {
        const fieldsPoint_iterator = iterator as FieldPointVectorIterator<FieldsPoint, Container> as FieldsFieldPointVectorIterator<Objects, ObjIDsT, FieldsPoint, Container>
        const fieldsPoint_result = (item.obj as any)[item.property] as FieldsPoint
        const fieldsPoint_vectorized = vectorized as FieldPointVector<FieldsPoint, Container>
        const get = fieldsPoint_iterator.curryGet(fieldsPoint_vectorized, vectorized, fieldsPoint_result)
        const set = fieldsPoint_iterator.currySet(fieldsPoint_vectorized, vectorized, fieldsPoint_result)

        return { get, set, length }
    }
}