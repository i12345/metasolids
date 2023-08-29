import { MultiObjectsGroupedObjectsKey } from "../../paradigm/trees/multi-objects-groups.js"
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js"
import { IndicesTypedArray, Reflect_entries, TypedArray, TypedArrayConstructor, TypedArrayList, indicesArrayType, invalidIndex, isTypedArray, typedArrayConstructor } from "../../utils/index.js"
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
    //TODO: this does not support dynamic indices
    [ItemObjValuesOffsetsKey]: Uint32Array
    [ItemObjIDsKey]: FieldPointVector<ObjIDsT, ObjIDsContainer>
}

export type FieldPointVectorWithMultiObjRoot<
        VectorizedPoint extends FieldPoint,
        Container extends FieldPointVectorContainer<TypedArray>,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
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
        Container extends FieldPointVectorContainer<TypedArray> = FieldPointVectorContainer,
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

export function field_point_vector_multiObjs_count<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<TypedArray> = FieldPointVectorContainer,
    >(
        src: FieldPointVector<Point, Container> | FieldPointVectorWithMultiObjects<Point, Container>,
        indices?: IndicesTypedArray
    ): number | undefined {
    if (indices === undefined)
        return (<FieldPointVectorWithMultiObjects<Point, Container>>src)[ItemObjIDsKey]?.length
    else {
        const src_objOffsets = (<FieldPointVectorWithMultiObjects<Point, Container>>src)[ItemObjValuesOffsetsKey]
        if (!src_objOffsets)
            throw new Error()

        let sum = 0
        
        let src_index: number
        let src_objOffset_prev: number
        let src_objOffset_next: number

        for (let i = 0; i < indices.length; i++) {
            src_index = indices[i]
            src_objOffset_prev = src_index === 0 ? 0 : src_objOffsets[src_index - 1]
            src_objOffset_next = src_objOffsets[src_index]
            sum += (src_objOffset_next - src_objOffset_prev)
        }

        return sum
    }
}

function field_point_vector_append_scattered_prelim<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<TypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>,
        Vector extends FieldPointVector<Point, Container> | FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer> = FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer>
    >(
        type: FieldPointType<Point>,
        src: Vector,
        scatter_src: Vector,
        /** scatter_indices[offset from end of src] = index in scatter_src */
        scatter_indices: IndicesTypedArray,
        multiObjectsIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ) {
    const isDynamic = isDynamicVector<Point, Container>(src)
    const iterator = vectorIterator(type, isDynamic, multiObjectsIDs)
    const src_length = iterator.length(src, src)
    const final_length = src_length + scatter_indices.length

    const objectValuesStaticLength_src = field_point_vector_multiObjs_count<Point, Container>(src)
    const objectValuesStaticLength_scatter = field_point_vector_multiObjs_count<Point, Container>(scatter_src, scatter_indices)
    if ((objectValuesStaticLength_src === undefined) !== (objectValuesStaticLength_scatter === undefined))
        throw new Error()

    const objectValuesStaticLength = ((objectValuesStaticLength_src !== undefined) && (objectValuesStaticLength_scatter !== undefined)) ? (objectValuesStaticLength_src + objectValuesStaticLength_scatter) : undefined
    
    const isMultiObj = ItemObjIDsKey in (<FieldPointVectorWithMultiObjects>src)
    const dst = isMultiObj ?
        <Vector>field_point_vectorized_multi_objects_new(type, final_length, isDynamic, multiObjectsIDs!.IDsType, <any>(isDynamic ? undefined : objectValuesStaticLength)) :
        <Vector>field_point_vectorized_new(type, final_length, isDynamic)
    
    if (isMultiObj) {
        const dst_objIDs_container = (<FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer>>dst)[ItemObjIDsKey]
        const dst_objIDs_dynamic = isDynamicVectorContainer(dst_objIDs_container)
        const dst_objOffsets = (<FieldPointVectorWithMultiObjects>dst)[ItemObjValuesOffsetsKey]

        const src_objIDs_container = (<FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer>>src)[ItemObjIDsKey]
        const src_objIDs_dynamic = isDynamicVectorContainer(src_objIDs_container)
        const src_objOffsets = (<FieldPointVectorWithMultiObjects>src)[ItemObjValuesOffsetsKey]

        const scatter_objIDs_container = (<FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer>>scatter_src)[ItemObjIDsKey]
        const scatter_objIDs_dynamic = isDynamicVectorContainer(scatter_objIDs_container)
        const scatter_objOffsets = (<FieldPointVectorWithMultiObjects>scatter_src)[ItemObjValuesOffsetsKey]

        if (dst_objIDs_dynamic === false && src_objIDs_dynamic === false && scatter_objIDs_dynamic === false) {
            const dst_objIDs = <FieldPointVectorContainerStatic<ObjIDsT>>dst_objIDs_container
            const src_objIDs = <FieldPointVectorContainerStatic<ObjIDsT>>src_objIDs_container
            const scatter_objIDs = <FieldPointVectorContainerStatic<ObjIDsT>>scatter_objIDs_container

            dst_objIDs.subarray(0, src_objIDs.length).set(src_objIDs)
            dst_objOffsets.subarray(0, src_objOffsets.length).set(src_objOffsets)

            for (let scatter_offset_index = 0; scatter_offset_index < scatter_indices.length; scatter_offset_index++) {
                const scatter_src_index = scatter_indices[scatter_offset_index]
                const dst_index = src_objOffsets.length + scatter_offset_index
                const scatter_objOffset_prev = scatter_src_index === 0 ? 0 : scatter_objOffsets[scatter_src_index - 1]
                const scatter_objOffset_next = scatter_objOffsets[scatter_src_index]
                dst_objOffsets[dst_index] = scatter_objOffset_next - scatter_objOffset_prev
            }
            
            for (let scatter_offset_index = 0; scatter_offset_index < scatter_indices.length; scatter_offset_index++) {
                const dst_index = src_objOffsets.length + scatter_offset_index
                const dst_objOffset_prev = dst_index === 0 ? 0 : dst_objOffsets[dst_index - 1]
                const dst_objOffset_delta = dst_objOffsets[dst_index]
                dst_objOffsets[dst_index] = dst_objOffset_prev + dst_objOffset_delta
                const scatter_src_index = scatter_indices[scatter_offset_index]
                const scatter_objOffset_prev = scatter_src_index === 0 ? 0 : scatter_objOffsets[scatter_src_index - 1]

                for (let objIndex = 0; objIndex < dst_objOffset_delta; objIndex++)
                    dst_objIDs[dst_objOffset_prev + objIndex] = scatter_objIDs[scatter_objOffset_prev + objIndex]
            }
        }
        else throw new Error("not implemented")
    }

    return {
        iterator,
        src_length,
        final_length,
        dst,
    }
}

export function field_point_vector_append_scattered_separate<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<TypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>,
        Vector extends FieldPointVector<Point, Container> | FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer> = FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer>
    >(
        type: FieldPointType<Point>,
        src: Vector,
        scatter_src: Vector,
        /** scatter_indices[offset from end of src] = index in scatter_src */
        scatter_indices: IndicesTypedArray,
        multiObjectsIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ): Vector {
    const {
            iterator,
            src_length,
            final_length,
            dst,
        } = field_point_vector_append_scattered_prelim<
                Point,
                Container,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                Vector
            >(
                type,
                src,
                scatter_src,
                scatter_indices,
                multiObjectsIDs
            )
    
    const copyIndices = new Uint32Array(src_length)
    for (let i = 0; i < copyIndices.length; i++) copyIndices[i] = i
    iterator.scatter(dst, dst, src, src, copyIndices)

    const addedScatterIndices = new (typedArrayConstructor(scatter_indices))(final_length)
    addedScatterIndices.fill(-1, 0, src_length)
    addedScatterIndices.subarray(src_length, addedScatterIndices.length).set(scatter_indices)
    iterator.scatter(dst, dst, scatter_src, scatter_src, addedScatterIndices)

    return dst
}

export function field_point_vector_append_scattered_same<
        Point extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<TypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>,
        Vector extends FieldPointVector<Point, Container> | FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer> = FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer>
    >(
        type: FieldPointType<Point>,
        src: Vector,
        /** scatter_indices[offset from end of src] = index in src */
        scatter_indices: IndicesTypedArray,
        multiObjectsIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ): Vector {
    const {
            iterator,
            src_length,
            final_length,
            dst,
        } = field_point_vector_append_scattered_prelim<
                Point,
                Container,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                Vector
            >(
                type,
                src,
                src,
                scatter_indices,
                multiObjectsIDs
            )
    
    const final_scatter_indices = new (typedArrayConstructor(scatter_indices))(final_length)
    for (let i = 0; i < src_length; i++) final_scatter_indices[i] = i
    final_scatter_indices.subarray(src_length, final_scatter_indices.length).set(scatter_indices)
    iterator.scatter(dst, dst, src, src, final_scatter_indices)

    return dst
}