import { VectorFunction } from "vectorized-functions"
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js"
import { PropertyPath } from "../../paradigm/trees/path.js"
import { extract } from "../../paradigm/trees/tree.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { FieldPointType, FieldPoint } from "../point.js"
import { vectorizedIteratorGetSetLengthCurried } from "./iterators/factory.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, WithMultiObjects, field_point_vectorized_multi_objects_new } from "./point.js"

export type VectorizedTypes = (FieldPointType | undefined)[]

export type VectorizedTypesFlags<VectorizedTypesT extends VectorizedTypes> = {
    [i in keyof VectorizedTypesT]: VectorizedTypesT[i] extends undefined ? false : true
}

export type SingleOrVectorized<
        Vectorized extends boolean[],
        T extends FieldPoint[],
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainer<ObjIDsT>
    > = {
    [K in keyof T]:
        K extends keyof any[] ?
            T[K] :
            K extends keyof Vectorized ?
                Vectorized[K] extends true ?
                    FieldPointVector<T[K], Container> |            
                    FieldPointVectorWithMultiObjects<T[K], Container, ObjIDsT, ObjIDsContainer> :
                    T[K] :
                T[K]
    }

export type FieldPointVectorizedFunction<
        Target extends object,
        MethodName extends (keyof Target) & (string | symbol),
        Method extends Target[MethodName] & ((this: Target, ...args: any[]) => FieldPoint),
        VectorizedArgs extends boolean[],
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainer<ObjIDsT>
    > =
    (
        this: Target,
        ...args: SingleOrVectorized<
            VectorizedArgs,
            Parameters<Method>,
            Container,
            ObjIDsT,
            ObjIDsContainer
        >
    ) => FieldPointVectorWithMultiObjects<
        ReturnType<Method>,
        FieldPointVectorContainer,
        ObjIDsT,
        ObjIDsContainer
    >

export class FieldPointVectorFunction<
        Target extends object,
        MethodName extends (keyof Target) & (string | symbol),
        Method extends Target[MethodName] & ((this: Target, ...args: any[]) => FieldPoint),
        VectorizedArgsTypes extends VectorizedTypes,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainer<ObjIDsT>
    >
    extends
    VectorFunction<
            Target,
            MethodName,
            Method,
            Parameters<FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedTypesFlags<VectorizedArgsTypes>, Container, ObjIDsT, ObjIDsContainer>>,
            FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedTypesFlags<VectorizedArgsTypes>, Container, ObjIDsT, ObjIDsContainer>
        > {
    constructor(
        method: MethodName,
        public readonly vectorizedParameterTypes: VectorizedTypes,
        public readonly returnType: FieldPointType<ReturnType<Method>>,

        /**
         * parameter index and property path to a {@link MultiObjectsIDs} object
         */
        public readonly multiObjectsContextParamPath?: PropertyPath
    ) {
        super(method)
    }

    protected vectorizeSingularCall(
            target: Target,
            singularMethod: Method,
            params: SingleOrVectorized<VectorizedTypesFlags<VectorizedArgsTypes>, Parameters<Method>, Container, ObjIDsT, ObjIDsContainer>
        ): ReturnType<FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedTypesFlags<VectorizedArgsTypes>, Container, ObjIDsT, ObjIDsContainer>> {
        const args = new Array(params.length)
        
        let vectorizedLength: undefined | number = undefined

        const getters = new Array<(index: number) => void>(this.vectorizedParameterTypes.length)

        const multiObjectsIDs = this.multiObjectsContextParamPath ? extract<MultiObjectsIDs<Objects, ObjIDsT>>(params, this.multiObjectsContextParamPath) : undefined

        params.forEach((paramValue: FieldPoint | FieldPointVector<FieldPoint, Container> | FieldPointVectorWithMultiObjects<FieldPoint, Container, ObjIDsT, ObjIDsContainer>, paramIndex: number) => {
            const type = this.vectorizedParameterTypes[paramIndex]
            if (type === undefined)
                args[paramIndex] = paramValue
            else {
                const { get, length } = vectorizedIteratorGetSetLengthCurried(
                    type,
                    paramValue as any,
                    {
                        obj: args,
                        property: paramIndex
                    },
                    multiObjectsIDs,
                )

                getters.push(get)
                vectorizedLength ??= length
            }
        })

        const result = field_point_vectorized_multi_objects_new<ReturnType<Method>, FieldPointVectorContainer, ObjIDsT, ObjIDsContainer>(
            this.returnType,
            length,
            false,
            <any>multiObjectsIDs?.IDsType,
        )

        const result_objRef = { value: <any>undefined }
        const result_iterator = vectorizedIteratorGetSetLengthCurried<ReturnType<Method>, FieldPointVectorContainer, Objects, ObjIDsT, ObjIDsContainer>(
            this.returnType,
            result,
            {
                obj: result_objRef,
                property: "value"
            },
            multiObjectsIDs,
        )

        for (let i = 0; i < length; i++){
            getters.forEach(getter => getter(i))
            result_objRef.value = singularMethod.call(target, ...args)
            result_iterator.set(i)
        }

        return result
    }
}