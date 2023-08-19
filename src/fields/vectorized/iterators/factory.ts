import { MultiObjectsGroupedObjectsKey } from "../../../paradigm/trees/multi-objects-groups.js";
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../../paradigm/trees/multi-objects.js";
import { IndicesTypedArray } from "../../../utils/indices-array.js";
import { TypedArrayList } from "../../../utils/typed-array-list.js";
import { FieldPoint, FieldPointPrimitive, FieldPointType, FieldsPoint } from "../../point.js";
import { FieldPointVectorIterator } from "../iterator.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerDynamic, FieldPointVectorWithMultiObjects } from "../point.js";
import { FieldsFieldPointVectorIterator } from "./fields.js";
import { MultiObjectsFieldPointVectorIterator } from "./multi-objects.js";


const vectorIteratorFactories = new Map<Function, [FieldPointVectorIterator<FieldPoint, Float64Array>, FieldPointVectorIterator<FieldPoint, TypedArrayList<Float64Array>>]>()

export function vectorIteratorFactory<Point extends FieldPointPrimitive, IsDynamic extends boolean>(type: FieldPointType<Point>, isDynamic: IsDynamic): ClassDecorator {
    return target => {
        const factories = vectorIteratorFactories.get(type) ?? [undefined, undefined]
        factories[isDynamic ? 1 : 0] = <any>new (<{ new(): FieldPointVectorIterator }><Function>target)()
        vectorIteratorFactories.set(target, <any>factories)
    }
}

export function vectorIterator<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer
    >(
        multiObjectsIDs: MultiObjectsIDs<Objects, ObjIDsT>,
        type: FieldPointType<Point>,
        useDynamicContainer?: Container extends FieldPointVectorContainerDynamic ? true : false
    ): FieldPointVectorIterator<Point, Container> {
    if(type instanceof Function)
        return vectorIteratorFactories.get(type)![useDynamicContainer ? 1 : 0] as FieldPointVectorIterator<Point, Container>
    else if (MultiObjectsGroupedObjectsKey in type) {
        if (useDynamicContainer === false)
            throw new Error("must use dynamic container for multi objects")

        return new MultiObjectsFieldPointVectorIterator<Objects, ObjIDsT, Point>(<FieldPointType<Point>><any>type[MultiObjectsGroupedObjectsKey], multiObjectsIDs) as unknown as FieldPointVectorIterator<Point, Container>
    }
    else return new FieldsFieldPointVectorIterator<Objects, ObjIDsT, FieldsPoint, Container>(type, multiObjectsIDs, useDynamicContainer!) as FieldPointVectorIterator<FieldsPoint, Container> as FieldPointVectorIterator<Point, Container>
}

export function vectorizedIteratorGetSetLengthCurried<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        Point extends FieldPoint = FieldPoint,
    >(
        multiObjectsIDs: MultiObjectsIDs<Objects>,
        type: FieldPointType<Point>,
        vectorized: FieldPointVectorWithMultiObjects<ObjIDsT, Point>,
        item: {
            obj: object,
            property: PropertyKey
        }
    ): {
        get(index: number): void
        set(index: number): void
        length: number
    } {
    const iterator = vectorIterator(multiObjectsIDs, type)
    const length = iterator.length(vectorized, vectorized)

    if (type instanceof Function) {
        const set_bound = iterator.set.bind(iterator, vectorized, vectorized)
        const set = (index: number) => set_bound((item.obj as any)[item.property], index)

        if (iterator.canGetByReference) {
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
        const fieldsPoint_iterator = iterator as FieldPointVectorIterator<FieldsPoint> as FieldsFieldPointVectorIterator<FieldsPoint>
        const fieldsPoint_result = (item.obj as any)[item.property] as FieldsPoint
        const fieldsPoint_vectorized = vectorized as FieldPointVector<FieldsPoint>
        const get = fieldsPoint_iterator.curryGet(fieldsPoint_vectorized, vectorized, fieldsPoint_result)
        const set = fieldsPoint_iterator.currySet(fieldsPoint_vectorized, vectorized, fieldsPoint_result)

        return { get, set, length }
    }
}