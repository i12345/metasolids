import { MultiObjectsGroupedObjectsKey } from "../../paradigm/trees/multi-objects-groups.js"
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js"
import { IndicesTypedArray, Reflect_entries, NumberTypedArray, TypedArrayConstructor, TypedArrayList, invalidIndex, isNumberTypedArray, sumIndexedDeltas, typedArrayConstructor, typedArrayInvalid, typedArrayClone, Reflect_fromEntries } from "../../utils/index.js"
import { FieldPoint, FieldPointMapped, FieldPointMappedObjectsGroupedRemoved, FieldPointPrimitive, FieldsPoint } from "../point.js"
import { FieldPointType, field_point_multiObj_count, field_point_type_is_multiObj, field_point_type_singleObj } from "../type.js"
import { FieldPointVectorIterator } from "./iterator.js"
import { vectorIterator } from "./iterators/factory.js"
import { PrimitiveFieldPointVectorIterator } from "./iterators/primitive.js"

export const ItemObjValuesOffsetsKey = Symbol("objValueOffsets")
export const ItemObjIDsKey = Symbol("objIDs")

export type FieldPointVectorContainerStatic<TArray extends NumberTypedArray = Float64Array> = TArray
export type FieldPointVectorContainerDynamic<TArray extends NumberTypedArray = Float64Array> = TypedArrayList<number, TArray>
export type FieldPointVectorContainer<TArray extends NumberTypedArray = Float64Array> = FieldPointVectorContainerStatic<TArray> | FieldPointVectorContainerDynamic<TArray>
export type FieldPointVectorContainerType<Container extends FieldPointVectorContainer<NumberTypedArray>> = Container extends FieldPointVectorContainer<infer TArray> ? TArray : never

export type IsDynamicVectorContainer<Container extends FieldPointVectorContainer<NumberTypedArray>> = (
    Container extends FieldPointVectorContainerDynamic<NumberTypedArray> ? true :
    Container extends FieldPointVectorContainerStatic<NumberTypedArray> ? false :
    (true | false)
)

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
    IsDynamicVectorContainer<Container>
    // ElementType extends FieldPointPrimitive ?
    //     IsDynamicVectorContainer<Container> :
    // ElementType extends { [MultiObjectsGroupedObjectsKey]: infer InnerType extends FieldPoint } ?
    //     IsDynamicVector<InnerType, Container> :
    //     undefined

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
            throw new Error("no container")
        }
        else if (MultiObjectsGroupedObjectsKey in elementType)
            return isDynamicVectorContainer(vectorRoot![ItemObjIDsKey])
        else {
            let atLeastOneStatic = false
            for (const key of Reflect.ownKeys(elementType)) {
                const isDynamic = recursive(elementType[key], (<FieldPointVector<FieldsPoint>>vector)[key], vectorRoot)
                if (isDynamic)
                    return isDynamic
                else atLeastOneStatic = true
            }

            if (atLeastOneStatic)
                return false

            return undefined
        }
    }

    vectorRoot ??= <any>vector

    if (ItemObjIDsKey in vectorRoot!)
        return isDynamicVectorContainer<Container>((<any>vectorRoot)[ItemObjIDsKey])

    return <IsDynamicVector<ElementType, Container>>recursive(elementType, vector)!
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
    [ItemObjIDsKey]: ObjIDsContainer
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

export function field_point_vector_multi_objs_extract<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        Vector extends
            FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer> =
            FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>
    >(
        vector: Vector,
        type: FieldPointType<ElementType>,
        multiObjectIDs: MultiObjectsIDs<Objects, ObjIDsT>,
        objIDs?: ObjIDsT,
        referenceNonMultiObjContainers: boolean = true,
        outputMultiObjVectors: boolean = false
    ): [objID: number, objVector: Vector][] {
    const iterator = vectorIterator<ElementType, Container, Objects, ObjIDsT, ElementType, Vector>(type, isDynamicVector<ElementType, Container>(type, vector, <any>vector), multiObjectIDs, vector)
    const length = iterator.length(vector, vector)

    if (!objIDs) {
        objIDs = <ObjIDsT>new multiObjectIDs.IDsType(multiObjectIDs.paths.length)
        for (let objID = 0; objID < objIDs.length; objID++)
            objIDs[objID] = objID
    }

    const obj_vectors = new Array<[objID: number, Vector]>(objIDs.length)

    const objVector_objOffsets_reusable = new Uint32Array(length)
    for (let i = 0; i < objVector_objOffsets_reusable.length; i++)
        objVector_objOffsets_reusable[i] = i + 1
    
    const indices = new Uint32Array(length)
    const indices_invalid = <number>typedArrayInvalid(indices)

    for (let objID_i = 0; objID_i < objIDs.length; objID_i++) {
        const objID = objIDs[objID_i]

        const src_objOffsets = vector[ItemObjValuesOffsetsKey]
        const src_objIDs_container = vector[ItemObjIDsKey]
        let src_objOffset_prev = 0
        let src_objOffset_next: number
        let objCount = 0

        if (src_objIDs_container instanceof TypedArrayList) {
            const src_objIDs = <TypedArrayList<number, ObjIDsT>>src_objIDs_container

            for (let i = 0; i < length; i++) {
                for (src_objOffset_next = src_objOffsets[i];
                    src_objOffset_prev < src_objOffset_next;
                    src_objOffset_prev++) {
                    if (src_objIDs.get(src_objOffset_prev) === objID) {
                        indices[i] = src_objOffset_prev
                        objCount++
                        break
                    }
                }

                if (src_objOffset_prev === src_objOffset_next)
                    indices[i] = indices_invalid
                else
                    src_objOffset_prev = src_objOffset_next
            }
        }
        else {
            const src_objIDs = <ObjIDsT>src_objIDs_container

            for (let i = 0; i < length; i++) {
                for (src_objOffset_next = src_objOffsets[i];
                    src_objOffset_prev < src_objOffset_next;
                    src_objOffset_prev++) {
                    if (src_objIDs[src_objOffset_prev] === objID) {
                        indices[i] = src_objOffset_prev
                        objCount++
                        break
                    }
                }

                if (src_objOffset_prev === src_objOffset_next)
                    indices[i] = indices_invalid
                else
                    src_objOffset_prev = src_objOffset_next
            }
        }

        const objVector_objOffsets = objVector_objOffsets_reusable.subarray(0, objCount)
        const objVector_objIDs_static = <ObjIDsT>(new (typedArrayConstructor(objIDs))(objCount))
        objVector_objIDs_static.fill(objID)

        const dst_root = <FieldPointVectorWithMultiObjects<FieldPoint, Container, ObjIDsT, ObjIDsContainer>>{
            [ItemObjIDsKey]: (src_objIDs_container instanceof TypedArrayList) ? TypedArrayList.from(objVector_objIDs_static) : objVector_objIDs_static,
            [ItemObjValuesOffsetsKey]: objVector_objOffsets
        }

        function recurse(
                type: FieldPointType,
                src_vector: FieldPointVector,
                isMultiObj: boolean,
                src_root: FieldPointVectorWithMultiObjects<FieldPoint, Container, ObjIDsT, ObjIDsContainer>,
                dst_root: FieldPointVectorWithMultiObjects<FieldPoint, Container, ObjIDsT, ObjIDsContainer>
            ): FieldPointVectorStatic {
            if (type instanceof Function) {
                if (isMultiObj) {
                    const isDynamic = isDynamicVectorContainer(<FieldPointVectorContainer>src_vector)
                    const dst_vector = field_point_vectorized_new(type, length, isDynamic)
                    const iterator = vectorIterator<FieldPoint, FieldPointVectorContainer<NumberTypedArray>>(type, isDynamic)
                    iterator.scatter(
                        dst_vector,
                        dst_root,
                        <FieldPointVectorContainer>src_vector,
                        src_root,
                        indices
                    )
                    if (isDynamic)
                        return iterator.copyStatic(dst_vector, dst_vector)
                    else return <FieldPointVectorStatic>dst_vector
                }
                else {
                    const isDynamic = isDynamicVectorContainer(<FieldPointVectorContainer>src_vector)
                    if (isDynamic)
                        return (<FieldPointVectorDynamic<FieldPointPrimitive>><unknown>src_vector).arrayView(referenceNonMultiObjContainers)
                    else {
                        if (referenceNonMultiObjContainers)
                            return <FieldPointVectorStatic>dst_root
                        else return <FieldPointVectorContainerType<FieldPointVectorContainerStatic>>typedArrayClone(<FieldPointVectorStatic<FieldPointPrimitive>>dst_root)
                    }
                }
            }
            else if (MultiObjectsGroupedObjectsKey in type) {
                if (isMultiObj)
                    throw new Error()

                return recurse(type[MultiObjectsGroupedObjectsKey], src_vector, true, src_root, dst_root)
            }
            else return Reflect_fromEntries<FieldPointVector<FieldsPoint>>(
                Reflect_entries(type).map<any>(([key, subtype]) => [key, recurse(
                    subtype,
                    (<FieldPointVector<FieldsPoint>>src_vector)[key],
                    isMultiObj,
                    src_root,
                    dst_root
                )])
            )
        }

        const obj_vector = recurse(
            type,
            <FieldPointVector>vector,
            false,
            vector,
            dst_root
        )

        if (outputMultiObjVectors) {
            (<Partial<FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>, ObjIDsT, FieldPointVectorContainerStatic<ObjIDsT>>>>obj_vector)[ItemObjIDsKey] = <ObjIDsT>objVector_objIDs_static;
            (<Partial<FieldPointVectorWithMultiObjects>>obj_vector)[ItemObjValuesOffsetsKey] = objVector_objOffsets
        }

        obj_vectors[objID_i] = [objID, <Vector>obj_vector]
    }

    return obj_vectors
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

    if (objIDsType && field_point_type_is_multiObj(type)) {
        const objID_invalid = invalidIndex(objIDsType)
        if (isDynamic || (objectValuesStaticLength === undefined)) {
            const objIDs = new TypedArrayList<number, ObjIDsT>(<any>objIDsType!)
            objIDs.defaultValue = objID_invalid
            result[ItemObjIDsKey] = <ObjIDsContainer>objIDs
        }
        else result[ItemObjIDsKey] = <ObjIDsContainer>new objIDsType(objectValuesStaticLength).fill(objID_invalid)
        
        result[ItemObjValuesOffsetsKey] = new Uint32Array(length).fill(invalidIndex(Uint32Array))
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

export function field_point_vector_static<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
    >(
        elementType: FieldPointType<ElementType>,
        src: FieldPointVector<ElementType, Container> | FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>,
        multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ): FieldPointVector<ElementType, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>> {
    if (!isDynamicVector<ElementType, Container>(elementType, src, <FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, ObjIDsContainer>><unknown>src))
        return <FieldPointVector<ElementType, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>>><unknown>src

    const dst = <FieldPointVector<ElementType, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>>>vectorIterator(elementType, false, multiObjectIDs, src).copyStatic(<any>src, src)

    if (ItemObjIDsKey in src) {
        const src_multiObj = <FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>>src
        const dst_multiObj = <FieldPointVectorWithMultiObjects<ElementType, FieldPointVectorContainerStatic<FieldPointVectorContainerType<Container>>, ObjIDsT, FieldPointVectorContainerStatic<ObjIDsT>>><unknown>dst
        dst_multiObj[ItemObjIDsKey] = <FieldPointVector<number, FieldPointVectorContainerStatic<ObjIDsT>>>field_point_vector_static(Number, src_multiObj[ItemObjIDsKey])
        dst_multiObj[ItemObjValuesOffsetsKey] = src_multiObj[ItemObjValuesOffsetsKey]
    }

    return dst
}

export function field_point_vector_dynamic<
        ElementType extends FieldPoint = FieldPoint,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
    >(
        elementType: FieldPointType<ElementType>,
        src: FieldPointVector<ElementType, Container> | FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>,
        multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ): FieldPointVector<ElementType, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>> {
    const dst = <FieldPointVector<ElementType, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>>><unknown>vectorIterator<ElementType, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>>(elementType, <IsDynamicVector<ElementType, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>>>true, multiObjectIDs, src).copyDynamic(<any>src, src)

    if (ItemObjIDsKey in src) {
        const src_multiObj = <FieldPointVectorWithMultiObjects<ElementType, Container, ObjIDsT, ObjIDsContainer>>src
        const dst_multiObj = <FieldPointVectorWithMultiObjects<ElementType, FieldPointVectorContainerDynamic<FieldPointVectorContainerType<Container>>, ObjIDsT, FieldPointVectorContainerDynamic<ObjIDsT>>><unknown>dst
        dst_multiObj[ItemObjIDsKey] = <FieldPointVector<number, FieldPointVectorContainerDynamic<ObjIDsT>>>field_point_vector_dynamic(Number, src_multiObj[ItemObjIDsKey])
        dst_multiObj[ItemObjValuesOffsetsKey] = src_multiObj[ItemObjValuesOffsetsKey]
    }

    return dst
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
        ItemT extends FieldPoint = FieldPoint,
        ItemElementType extends FieldPoint = ItemT,
        ResultElementType extends ItemElementType = ItemElementType,
        Container extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainerDynamic<ObjIDsT>,
        Vector extends FieldPointVector<ResultElementType, Container> | FieldPointVectorWithMultiObjects<ResultElementType, Container, ObjIDsT, ObjIDsContainer> = FieldPointVectorWithMultiObjects<ResultElementType, Container, ObjIDsT, ObjIDsContainer>
    >(
        resultType: FieldPointType<ResultElementType>,
        itemType: FieldPointType<ItemElementType>,
        result: Vector,
        item: ItemT,
        multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ) {
    const isDynamic = isDynamicVector<ResultElementType, Container>(resultType, result)
    const isMultiObjMapped = ItemObjIDsKey in result
    const isDynamicObjIDsContainer = isDynamicVectorContainer((<FieldPointVectorWithMultiObjects>result)[ItemObjIDsKey])
    const resultIterator = vectorIterator(resultType, isDynamic, multiObjectIDs)
    const itemIterator = vectorIterator(itemType, isDynamic, multiObjectIDs)
    const indices = new Uint32Array(resultIterator.length(result, result)).fill(0)
    const copy = field_point_vectorized_multi_objects_new(
        resultType, 1, isDynamic, multiObjectIDs?.IDsType,
        <any>((!isDynamic && !isDynamicObjIDsContainer) ? field_point_multiObj_count(itemType, item) : undefined)
    )
    itemIterator.set(copy, copy, item, 0)
    itemIterator.scatter(result, result, copy, copy, indices, isMultiObjMapped)
}