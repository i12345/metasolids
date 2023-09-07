import { MultiObjectsGroupedObjectsKey } from "../../paradigm/trees/multi-objects-groups.js"
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js"
import { IndicesTypedArray, Reflect_entries, NumberTypedArray, TypedArrayConstructor, TypedArrayList, invalidIndex, isNumberTypedArray, sumIndexedDeltas, typedArrayConstructor } from "../../utils/index.js"
import { FieldPoint, FieldPointMapped, FieldPointMappedObjectsGroupedRemoved, FieldPointPrimitive, FieldsPoint } from "../point.js"
import { FieldPointType, field_point_type_multiObj_count } from "../type.js"
import { FieldPointVectorIterator } from "./iterator.js"
import { vectorIterator } from "./iterators/factory.js"
import { PrimitiveFieldPointVectorIterator } from "./iterators/primitive.js"

export const ItemObjValuesOffsetsKey = Symbol("objValueOffsets")
export const ItemObjIDsKey = Symbol("objIDs")

export type FieldPointVectorContainerStatic<TArray extends NumberTypedArray = Float64Array> = TArray
export type FieldPointVectorContainerDynamic<TArray extends NumberTypedArray = Float64Array> = TypedArrayList<number, TArray>
export type FieldPointVectorContainer<TArray extends NumberTypedArray = Float64Array> = FieldPointVectorContainerStatic<TArray> | FieldPointVectorContainerDynamic<TArray>
export type FieldPointVectorContainerType<Container extends FieldPointVectorContainer<NumberTypedArray>> = Container extends FieldPointVectorContainer<infer TArray> ? TArray : never

export type IsDynamicVectorContainer<Container extends FieldPointVectorContainer<NumberTypedArray>> = Container extends FieldPointVectorContainerDynamic ? true : false
export function isDynamicVectorContainer<Container extends FieldPointVectorContainer<NumberTypedArray>>(container: Container): IsDynamicVectorContainer<Container> {
    return <IsDynamicVectorContainer<Container>>(container instanceof TypedArrayList)
}

export function fieldPointVectorContainerArrayType<
        ArrayType extends NumberTypedArray = NumberTypedArray,
        Container extends FieldPointVectorContainer<ArrayType> = FieldPointVectorContainer<ArrayType>
    >(container: Container): TypedArrayConstructor<number, ArrayType> {
    if (isNumberTypedArray(container))
        return typedArrayConstructor<number, ArrayType>(<ArrayType>container)
    else if (container instanceof TypedArrayList)
        return <TypedArrayConstructor<number, ArrayType>><unknown>container.type
    else
        throw new Error("invalid container")
}

export type FieldPointVector<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>
    > = FieldPointMappedObjectsGroupedRemoved<ElementType, Container>

export type FieldPointVectorStatic<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>
    > = FieldPointVector<ElementType, Container>

export type FieldPointVectorDynamic<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainerDynamic<NumberTypedArray> = FieldPointVectorContainerDynamic<NumberTypedArray>
    > = FieldPointVector<ElementType, Container>

export type IsDynamicVector<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic
    > =
    ElementType extends FieldPointPrimitive ?
        IsDynamicVectorContainer<Container> :
    ElementType extends { [MultiObjectsGroupedObjectsKey]: infer InnerType extends FieldPoint } ?
        IsDynamicVector<InnerType, Container> :
        undefined

export function isDynamicVector<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic
    >(
        elementType: FieldPointType<ElementType>,
        vector: FieldPointVector<ElementType, Container>,
        vectorRoot?: FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer<NumberTypedArray>, IndicesTypedArray, FieldPointVectorContainer<IndicesTypedArray>>
    ): IsDynamicVector<ElementType, Container> {
    function recursive(
        elementType: FieldPointType,
        vector: FieldPointVector<FieldPoint, FieldPointVectorContainer<NumberTypedArray>>,
        vectorRoot?: FieldPointVectorWithMultiObjects
    ): boolean | undefined {
        if (elementType instanceof Function) {
            if (isNumberTypedArray(vector))
                return <IsDynamicVector<ElementType, Container>>false
            else if (vector instanceof TypedArrayList)
                return <IsDynamicVector<ElementType, Container>>true
            return <IsDynamicVector<ElementType, Container>>undefined
        }
        else if (MultiObjectsGroupedObjectsKey in elementType)
            return isDynamicVectorContainer(vectorRoot![ItemObjIDsKey])
        else {
            for (const key of Reflect.ownKeys(elementType)) {
                const isDynamic = recursive(elementType[key], (<FieldPointVector<FieldsPoint>>vector)[key], vectorRoot)
                if (isDynamic !== undefined)
                    return isDynamic
            }

            return undefined
        }
    }

    return <IsDynamicVector<ElementType, Container>>recursive(elementType, vector, vectorRoot ?? <any>vector)!
}

export type WithMultiObjects = {
    [ItemObjIDsKey]: number
}

export type FieldPointVectorWithMultiObjects<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>
    > = FieldPointVector<ElementType, Container> & {
    //TODO: this does not support dynamic indices
    [ItemObjValuesOffsetsKey]: Uint32Array
    [ItemObjIDsKey]: FieldPointVector<ObjIDsT, ObjIDsContainer>
}

export function field_point_vector_multi_objs_static_length<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>,
        Vector extends
            FieldPointVector<ElementType, Container> | FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer> =
            FieldPointVector<ElementType, Container> | FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>
    >(
        vector: Vector,
        objIndices: IndicesTypedArray
    ): Vector extends FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer> ? number : undefined {
    const vector_multiObj = <FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>>vector
    return <Vector extends FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer> ? number : undefined>((ItemObjValuesOffsetsKey in vector_multiObj) ? sumIndexedDeltas(vector_multiObj[ItemObjValuesOffsetsKey], objIndices) : undefined)
}

export type FieldPointVectorWithMultiObjRoot<
        ElementType extends FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray>,
        Vector extends FieldPointVector<ElementType, Container> = FieldPointVector<ElementType, Container>,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        VectorizedRoot extends
            FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer<NumberTypedArray>, ObjIDsT, ObjIDsContainer> =
            FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer<NumberTypedArray>, ObjIDsT, ObjIDsContainer>
    > = {
    vector: Vector
    vectorizedRoot: VectorizedRoot
}

export function field_point_vectorized_new<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>
    >(
        type: FieldPointType<ElementType>,
        length: number,
        isDynamic?: IsDynamicVector<ElementType, Container>,
        objectValuesStaticLength?: IsDynamicVector<ElementType, Container> extends false ? IsDynamicVectorContainer<ObjIDsContainer> extends false ? number : never : never,
        value?: ElementType
    ): FieldPointVector<ElementType, Container> {
    if (type instanceof Function) {
        const iterator = <PrimitiveFieldPointVectorIterator<FieldPointPrimitive, Container>><FieldPointVectorIterator<FieldPoint, Container>>vectorIterator<ElementType, Container, Objects, ObjIDsT>(type, isDynamic)
        return <FieldPointMapped<ElementType, Container>>iterator.makeContainer(length, <FieldPointPrimitive | undefined>value)
    }
    else if (MultiObjectsGroupedObjectsKey in type)
        return <FieldPointVector<ElementType, Container>>field_point_vectorized_new<
                ElementType,
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

        return <FieldPointVector<ElementType, Container>>result
    }
}

export function field_point_vectorized_multi_objects_new<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>
    >(
        type: FieldPointType<ElementType>,
        length: number,
        isDynamic?: IsDynamicVector<ElementType, Container>,
        objIDsType?: TypedArrayConstructor<number, ObjIDsT> | undefined,
        objectValuesStaticLength?: IsDynamicVector<ElementType, Container> extends false ? IsDynamicVectorContainer<ObjIDsContainer> extends false ? number : never : never
    ): FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer> {
    const result = <FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>>field_point_vectorized_new(type, length, isDynamic, objectValuesStaticLength)

    if (objIDsType) {
        result[ItemObjIDsKey] = <FieldPointVector<ObjIDsT, ObjIDsContainer>>((isDynamic || (objectValuesStaticLength === undefined)) ? new TypedArrayList<number, ObjIDsT>(<any>objIDsType!) : new objIDsType(objectValuesStaticLength))
        result[ItemObjValuesOffsetsKey] = new Uint32Array(length).fill(invalidIndex(objIDsType))
    }

    return result
}

export function field_point_vector_multiObjs_count<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
    >(
        src: FieldPointVector<ElementType, Container> | FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>,
        indices?: IndicesTypedArray
    ): number | undefined {
    if (indices === undefined)
        return (<FieldPointVectorWithMultiObjects<ElementType, Container>>src)[ItemObjIDsKey]?.length
    else {
        const src_objOffsets = (<FieldPointVectorWithMultiObjects<ElementType, Container>>src)[ItemObjValuesOffsetsKey]
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
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        Vector extends FieldPointVector<ElementType, Container> | FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer> = FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>
    >(
        type: FieldPointType<ElementType>,
        src: FieldPointVectorWithMultiObjRoot<ElementType, Container, Vector, ObjIDsT, ObjIDsContainer>,
        scatter_src: FieldPointVectorWithMultiObjRoot<ElementType, Container, Vector, ObjIDsT, ObjIDsContainer>,
        /** scatter_indices[offset from end of src] = index in scatter_src */
        scatter_indices: IndicesTypedArray,
        multiObjectsIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ) {
    const isDynamic = isDynamicVector<ElementType, Container>(type, src.vector, src.vectorizedRoot)
    const iterator = vectorIterator(type, isDynamic, multiObjectsIDs)
    const src_length = iterator.length(src.vector, src.vectorizedRoot)
    const final_length = src_length + scatter_indices.length

    const objectValuesStaticLength_src = field_point_vector_multiObjs_count(<any>src.vectorizedRoot)
    const objectValuesStaticLength_scatter = field_point_vector_multiObjs_count(<any>scatter_src.vectorizedRoot, scatter_indices)
    if ((objectValuesStaticLength_src === undefined) !== (objectValuesStaticLength_scatter === undefined))
        throw new Error()

    const objectValuesStaticLength = ((objectValuesStaticLength_src !== undefined) && (objectValuesStaticLength_scatter !== undefined)) ? (objectValuesStaticLength_src + objectValuesStaticLength_scatter) : undefined

    const isMultiObj = ItemObjIDsKey in src.vectorizedRoot
    const dst = isMultiObj ?
        <Vector>field_point_vectorized_multi_objects_new<ElementType, Container, ObjIDsT, ObjIDsContainer>(type, final_length, isDynamic, multiObjectsIDs!.IDsType, <any>(isDynamic ? undefined : objectValuesStaticLength)) :
        <Vector>field_point_vectorized_new(type, final_length, isDynamic)

    if (isMultiObj) {
        const dst_objIDs_container = (<FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>>dst)[ItemObjIDsKey]
        const dst_objIDs_dynamic = isDynamicVectorContainer(dst_objIDs_container)
        const dst_objOffsets = (<FieldPointVectorWithMultiObjects>dst)[ItemObjValuesOffsetsKey]

        const src_objIDs_container = src.vectorizedRoot[ItemObjIDsKey]
        const src_objIDs_dynamic = isDynamicVectorContainer(src_objIDs_container)
        const src_objOffsets = src.vectorizedRoot[ItemObjValuesOffsetsKey]

        const scatter_objIDs_container = scatter_src.vectorizedRoot[ItemObjIDsKey]
        const scatter_objIDs_dynamic = isDynamicVectorContainer(scatter_objIDs_container)
        const scatter_objOffsets = scatter_src.vectorizedRoot[ItemObjValuesOffsetsKey]

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
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        Vector extends FieldPointVector<ElementType, Container> | FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer> = FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>
    >(
        type: FieldPointType<ElementType>,
        src: FieldPointVectorWithMultiObjRoot<ElementType, Container, Vector, ObjIDsT, ObjIDsContainer>,
        scatter_src: FieldPointVectorWithMultiObjRoot<ElementType, Container, Vector, ObjIDsT, ObjIDsContainer>,
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
                ElementType,
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
    iterator.scatter(dst, dst, src.vector, src.vectorizedRoot, copyIndices)

    const addedScatterIndices = new (typedArrayConstructor(scatter_indices))(final_length)
    addedScatterIndices.fill(-1, 0, src_length)
    addedScatterIndices.subarray(src_length, addedScatterIndices.length).set(scatter_indices)
    iterator.scatter(dst, dst, scatter_src.vector, scatter_src.vectorizedRoot, addedScatterIndices)

    return dst
}

export function field_point_vector_append_scattered_same<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        Vector extends FieldPointVector<ElementType, Container> | FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer> = FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>
    >(
        type: FieldPointType<ElementType>,
        src: FieldPointVectorWithMultiObjRoot<ElementType, Container, Vector, ObjIDsT, ObjIDsContainer>,
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
                ElementType,
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
    iterator.scatter(dst, dst, src.vector, src.vectorizedRoot, final_scatter_indices)

    return dst
}

export function field_point_vector_fill<
        ElementT extends FieldPoint = FieldPoint,
        ElementType extends FieldPoint = ElementT,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>,
        Vector extends FieldPointVector<ElementType, Container> | FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer> = FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>
    >(
        resultType: FieldPointType<ElementType>,
        result: Vector,
        item: ElementT,
        multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ) {
    const isDynamic = isDynamicVector<ElementType, Container>(resultType, result)
    const isMultiObjMapped = ItemObjIDsKey in result
    const isDynamicObjIDsContainer = isDynamicVectorContainer((<FieldPointVectorWithMultiObjects>result)[ItemObjIDsKey])
    const iterator = vectorIterator(resultType, isDynamic, multiObjectIDs)
    const indices = new Uint32Array(iterator.length(result, result)).fill(0)
    const copy = field_point_vectorized_multi_objects_new(
        resultType, 1, isDynamic, multiObjectIDs?.IDsType,
        <any>((!isDynamic && !isDynamicObjIDsContainer) ? field_point_type_multiObj_count(resultType, item) : undefined)
    )
    iterator.scatter(result, result, copy, copy, indices, isMultiObjMapped)
}