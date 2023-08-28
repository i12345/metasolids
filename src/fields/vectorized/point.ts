import { MultiObjectsGroupedObjectsKey } from "../../paradigm/trees/multi-objects-groups.js"
import { MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js"
import { IndicesTypedArray, Reflect_entries, TypedArray, TypedArrayConstructor, TypedArrayList, invalidIndex, isTypedArray, typedArrayConstructor } from "../../utils/index.js"
import { FieldPoint, FieldPointMapped, FieldPointPrimitive } from "../point.js"
import { FieldPointType } from "../type.js"
import { FieldPointVectorIterator } from "./iterator.js"
import { vectorIterator } from "./iterators/factory.js"
import { PrimitiveFieldPointVectorIterator } from "./iterators/primitive.js"

export const ItemObjValuesOffsetsKey = Symbol("objValueOffsets")
export const ItemObjIDsKey = Symbol("objIDs")

export type FieldPointVectorContainerStatic<TArray extends TypedArray = Float64Array> = TArray
export type FieldPointVectorContainerDynamic<TArray extends TypedArray = Float64Array> = TypedArrayList<TArray>
export type FieldPointVectorContainer<TArray extends TypedArray = Float64Array> = FieldPointVectorContainerStatic<TArray> | FieldPointVectorContainerDynamic<TArray>
export type FieldPointVectorContainerType<Container extends FieldPointVectorContainer<TypedArray>> = Container extends FieldPointVectorContainer<infer TArray> ? TArray : never

export type IsDynamicVectorContainer<Container extends FieldPointVectorContainer<TypedArray>> = Container extends FieldPointVectorContainerDynamic ? true : false
export function isDynamicVectorContainer<Container extends FieldPointVectorContainer<TypedArray>>(container: Container): IsDynamicVectorContainer<Container> {
    return <IsDynamicVectorContainer<Container>>(container instanceof TypedArrayList)
}

export function fieldPointVectorContainerArrayType<
        T extends number | bigint = number,
        ArrayType extends TypedArray<T> = TypedArray<T>,
        Container extends FieldPointVectorContainer<ArrayType> = FieldPointVectorContainer<ArrayType>
    >(container: Container): TypedArrayConstructor<T, ArrayType> {
    if (isTypedArray(container))
        return typedArrayConstructor(<ArrayType>container)
    else if (container instanceof TypedArrayList)
        return <TypedArrayConstructor<T, ArrayType>>container.type
    else
        throw new Error("invalid container")
}

export type FieldPointVector<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<TypedArray> = FieldPointVectorContainerStatic<TypedArray>
    > = FieldPointMapped<Point, Container>

export type FieldPointVectorStatic<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainerStatic<TypedArray> = FieldPointVectorContainerStatic<TypedArray>
    > = FieldPointVector<Point, Container>

export type FieldPointVectorDynamic<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainerDynamic<TypedArray> = FieldPointVectorContainerDynamic<TypedArray>
    > = FieldPointVector<Point, Container>

export type IsDynamicVector<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<TypedArray> = FieldPointVectorContainerStatic
    > =
    Point extends FieldPointPrimitive ?
        IsDynamicVectorContainer<Container> :
    Point extends { [MultiObjectsGroupedObjectsKey]: infer InnerType extends FieldPoint } ?
        IsDynamicVector<InnerType, Container> :
        undefined

export function isDynamicVector<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<TypedArray> = FieldPointVectorContainerStatic
    >(vector: FieldPointVector<Point, Container>): IsDynamicVector<Point, Container> {
    if (isTypedArray(vector))
        return <IsDynamicVector<Point, Container>>false
    else if (vector instanceof TypedArrayList)
        return <IsDynamicVector<Point, Container>>true
    
    return <IsDynamicVector<Point, Container>>undefined
}

export type WithMultiObjects = {
    [ItemObjIDsKey]: number
}

export type FieldPointVectorWithMultiObjects<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<TypedArray> = FieldPointVectorContainer,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>
    > = FieldPointVector<Point, Container> & {
    [ItemObjValuesOffsetsKey]: Uint32Array
    [ItemObjIDsKey]: FieldPointVector<ObjIDsT, ObjIDsContainer>
}

export type FieldPointVectorWithMultiObjRoot<
        VectorizedPoint extends FieldPoint,
        Container extends FieldPointVectorContainer<TypedArray>,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        VectorizedRoot extends
            FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer<TypedArray>, ObjIDsT, ObjIDsContainer> =
            FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer<TypedArray>, ObjIDsT, ObjIDsContainer>
    > = {
    vectorized: FieldPointVector<VectorizedPoint, Container>
    vectorizedRoot: VectorizedRoot
}

export function field_point_vectorized_new<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<TypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>
    >(
        type: FieldPointType<Point>,
        length: number,
        isDynamic?: IsDynamicVector<Point, Container>,
        objectValuesStaticLength?: IsDynamicVector<Point, Container> extends false ? IsDynamicVectorContainer<ObjIDsContainer> extends false ? number : never : never,
        value?: Point
    ): FieldPointVector<Point, Container> {
    if (type instanceof Function) {
        const iterator = <PrimitiveFieldPointVectorIterator<FieldPointPrimitive, Container>><FieldPointVectorIterator<FieldPoint, Container>>vectorIterator<Point, Container, Objects, ObjIDsT>(type, isDynamic)
        return <FieldPointMapped<Point, Container>>iterator.makeContainer(length, <FieldPointPrimitive | undefined>value)
    }
    else if (MultiObjectsGroupedObjectsKey in type) 
        return <FieldPointVector<Point, Container>>field_point_vectorized_new<
                Point,
                IsDynamicVectorContainer<Container> extends true ?
                    FieldPointVectorContainerDynamic :
                    IsDynamicVectorContainer<ObjIDsContainer> extends true ?
                        FieldPointVectorContainerDynamic :
                        FieldPointVectorContainerStatic,
                Objects,
                ObjIDsT,
                ObjIDsContainer
            >(
                (<any>type)[MultiObjectsGroupedObjectsKey],
                objectValuesStaticLength ?? length,
                <any>(isDynamic || objectValuesStaticLength === undefined),
                <any>objectValuesStaticLength,
                value ? (<any>value)[MultiObjectsGroupedObjectsKey] : undefined
            )
    else {
        const result: any = {}

        for (const [key, subtype] of Reflect_entries(type)) {
            result[key] = field_point_vectorized_new(
                <FieldPointType>subtype,
                length,
                isDynamic,
                objectValuesStaticLength,
                value ? (<any>value)[key] : undefined
            )
        }

        return <FieldPointVector<Point, Container>>result
    }
}

export function field_point_vectorized_multi_objects_new<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>
    >(
        type: FieldPointType<Point>,
        length: number,
        isDynamic?: IsDynamicVector<Point, Container>,
        objIDsType?: TypedArrayConstructor<number, ObjIDsT> | undefined,
        objectValuesStaticLength?: IsDynamicVector<Point, Container> extends false ? IsDynamicVectorContainer<ObjIDsContainer> extends false ? number : never : never
    ): FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer> {
    const result = <FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer>>field_point_vectorized_new(type, length, isDynamic, objectValuesStaticLength)

    if (objIDsType) {
        result[ItemObjIDsKey] = <FieldPointVector<ObjIDsT, ObjIDsContainer>>((isDynamic || (objectValuesStaticLength === undefined)) ? new TypedArrayList<ObjIDsT>(<any>objIDsType!) : new objIDsType(objectValuesStaticLength))
        result[ItemObjValuesOffsetsKey] = new Uint32Array(length).fill(invalidIndex(objIDsType))
    }

    return result
}