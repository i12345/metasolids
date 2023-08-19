import { MultiObjectsGroupedObjectsKey } from "../../paradigm/trees/multi-objects-groups.js"
import { MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js"
import { IndicesTypedArray, Reflect_entries, TypedArrayConstructor, TypedArrayList } from "../../utils/index.js"
import { FieldPoint, FieldPointMapped, FieldPointPrimitive, FieldPointType, field_point_map } from "../point.js"
import { FieldPointVectorIterator } from "./iterator.js"
import { vectorIterator } from "./iterators/factory.js"
import { PrimitiveFieldPointVectorIterator } from "./iterators/primitive.js"

export const ObjIDsKey = Symbol("objIDs")
export const ObjOffsetsKey = Symbol("objOffsets")

export type FieldPointVectorContainerStatic = Float64Array
export type FieldPointVectorContainerDynamic = TypedArrayList<FieldPointVectorContainerStatic>
export type FieldPointVectorContainer = FieldPointVectorContainerStatic | FieldPointVectorContainerDynamic

export type FieldPointVector<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer = FieldPointVectorContainerStatic
    > = FieldPointMapped<Point, Container>

export type WithMultiObjects = {
    [ObjIDsKey]: number
}

export type FieldPointVectorWithMultiObjects<
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
    > = FieldPointVector<Point, Container> & {
    [ObjIDsKey]: TypedArrayList<ObjIDsT>
    [ObjOffsetsKey]: Uint32Array
}

export function field_point_vectorized_new<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer
    >(
        type: FieldPointType<Point>,
        length: number,
        isDynamic: Container extends FieldPointVectorContainerDynamic ? true : false
    ): FieldPointVector<Point, Container> {
    if (type instanceof Function) {
        const iterator = <PrimitiveFieldPointVectorIterator<FieldPointPrimitive, Container>><FieldPointVectorIterator<FieldPoint, Container>>vectorIterator<Objects, ObjIDsT, Point, Container>(undefined!, type, isDynamic)
        return <FieldPointMapped<Point, Container>>iterator.makeContainer(length)
    }
    else if (MultiObjectsGroupedObjectsKey in type) 
        return <FieldPointVector<Point, Container>>field_point_vectorized_new<Objects, ObjIDsT, Point, FieldPointVectorContainerDynamic>((<any>type)[MultiObjectsGroupedObjectsKey], length, true)
    else {
        const result: any = {}

        for (const [key, subtype] of Reflect_entries(type))
            result[key] = field_point_vectorized_new(<FieldPointType>subtype, length, isDynamic)
        
        return <FieldPointVector<Point, Container>>result
    }
}

export function field_point_vectorized_multi_objects_new<
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
    >(
        objIDsType: TypedArrayConstructor<number, ObjIDsT> | undefined,
        type: FieldPointType<Point>,
        length: number
    ): FieldPointVectorWithMultiObjects<ObjIDsT, Point, Container> {
    const result = <FieldPointVectorWithMultiObjects<ObjIDsT, Point, Container>>field_point_vectorized_new(type, length, false)
    
    let typeHasObjects = false

    field_point_map<Point, FieldPointType, void>(
        <FieldPointMapped<Point, FieldPointType>>type,
        value => value instanceof Function,
        (leafType, path) => {
            if (path.includes(MultiObjectsGroupedObjectsKey))
                typeHasObjects = true
        }
    )

    if (typeHasObjects) {
        result[ObjIDsKey] = new TypedArrayList<ObjIDsT>(<any>objIDsType!)
        result[ObjOffsetsKey] = new Uint32Array(length + 1).fill(0)
    }

    return result
}