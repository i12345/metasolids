import { VectorFunction } from "vectorized-functions"
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js"
import { PropertyPath } from "../../paradigm/trees/path.js"
import { extract } from "../../paradigm/trees/tree.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { FieldPoint } from "../point.js"
import { FieldPointType } from "../type.js"
import { vectorizedIteratorGetSetLengthCurried } from "./iterators/factory.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorWithMultiObjects, field_point_vectorized_multi_objects_new } from "./point.js"
import { TypedArray } from "../../utils/typed-array.js"

export const VectorCallManager = Symbol()
export type VectorizedTypes = (FieldPointType | undefined | typeof VectorCallManager)[]

export type VectorizedTypesFlags<VectorizedTypesT extends VectorizedTypes> = {
    [i in keyof VectorizedTypesT]: VectorizedTypesT[i] extends (undefined | typeof VectorCallManager) ? false : true
}

export type SingleOrVectorized<
        Vectorized extends boolean[],
        T extends FieldPoint[],
        Containers extends (FieldPointVectorContainer<TypedArray> | undefined)[] = (FieldPointVectorContainer | undefined)[],
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainer<ObjIDsT>
    > = {
    [K in keyof T]:
        K extends keyof any[] ?
            T[K] :
            K extends keyof Vectorized ?
                Vectorized[K] extends true ?
                    K extends keyof Containers ?
                        Containers[K] extends FieldPointVectorContainer<TypedArray> ?
                            FieldPointVector<T[K], Containers[K]> |
                            FieldPointVectorWithMultiObjects<T[K], Containers[K], ObjIDsT, ObjIDsContainer> :
                            T[K] :
                        T[K] :
                    T[K] :
                T[K]
    }

export type FieldPointVectorizedFunction<
        Target extends object,
        MethodName extends (keyof Target) & (string | symbol),
        Method extends Target[MethodName] & ((this: Target, ...args: any[]) => FieldPoint | void),
        VectorizedArgs extends boolean[],
        ParameterContainers extends (FieldPointVectorContainer<TypedArray> | undefined)[] = (FieldPointVectorContainer | undefined)[],
        ReturnTypeContainer extends FieldPointVectorContainer<TypedArray> | undefined = FieldPointVectorContainer | undefined,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainer<ObjIDsT>
    > =
    (
        this: Target,
        ...args: SingleOrVectorized<
            VectorizedArgs,
            Parameters<Method>,
            ParameterContainers,
            ObjIDsT,
            ObjIDsContainer
        >
    ) => ReturnType<Method> extends FieldPoint ?
        ReturnTypeContainer extends FieldPointVectorContainer<TypedArray> ?
            FieldPointVectorWithMultiObjects<
                ReturnType<Method>,
                ReturnTypeContainer,
                ObjIDsT,
                ObjIDsContainer
            > :
            void :
        void

export class FieldPointVectorFunction<
        Target extends object,
        MethodName extends (keyof Target) & (string | symbol),
        Method extends Target[MethodName] & ((this: Target, ...args: any[]) => FieldPoint | void),
        VectorizedArgsTypes extends VectorizedTypes,
        // template containers with nesting
        ParameterContainers extends (FieldPointVectorContainer<TypedArray> | undefined)[] = (FieldPointVectorContainer | undefined)[],
        ReturnTypeContainer extends FieldPointVectorContainer<TypedArray> | undefined = FieldPointVectorContainer | undefined,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainer<ObjIDsT>,
    >
    extends
    VectorFunction<
            Target,
            MethodName,
            Method,
            Parameters<FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedTypesFlags<VectorizedArgsTypes>, ParameterContainers, ReturnTypeContainer, ObjIDsT, ObjIDsContainer>>,
            FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedTypesFlags<VectorizedArgsTypes>, ParameterContainers, ReturnTypeContainer, ObjIDsT, ObjIDsContainer>
        > {
    constructor(
        method: MethodName,
        public readonly vectorizedParameterTypes: VectorizedTypes,
        public readonly returnType: ReturnType<Method> extends FieldPoint ? FieldPointType<ReturnType<Method>> : undefined,

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
            params: SingleOrVectorized<VectorizedTypesFlags<VectorizedArgsTypes>, Parameters<Method>, ParameterContainers, ObjIDsT, ObjIDsContainer>
        ): ReturnType<FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedTypesFlags<VectorizedArgsTypes>, ParameterContainers, ReturnTypeContainer, ObjIDsT, ObjIDsContainer>> {
        const args = new Array(params.length)
        let argIndexNext = 0
        
        let vectorizedLength: undefined | number = undefined

        const getters = new Array<(index: number) => void>(this.vectorizedParameterTypes.length)

        const multiObjectsIDs = this.multiObjectsContextParamPath ? extract<MultiObjectsIDs<Objects, ObjIDsT>>(params, this.multiObjectsContextParamPath) : undefined

        params.forEach((paramValue: FieldPoint | FieldPointVector | FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, ObjIDsContainer>, paramIndex: number) => {
            const type = this.vectorizedParameterTypes[paramIndex]
            if (type === undefined)
                args[argIndexNext++] = paramValue
            else if (type === VectorCallManager) { }
            else {
                const { get, length } = vectorizedIteratorGetSetLengthCurried(
                    type,
                    paramValue as any,
                    {
                        obj: args,
                        property: argIndexNext++
                    },
                    multiObjectsIDs,
                )

                getters.push(get)
                vectorizedLength ??= length
            }
        })

        if (this.returnType) {
            const result = field_point_vectorized_multi_objects_new(
                this.returnType,
                length,
                false,
                multiObjectsIDs?.IDsType,
            )

            const result_objRef = { value: <any>undefined }
            const result_iterator = vectorizedIteratorGetSetLengthCurried(
                this.returnType,
                result,
                {
                    obj: result_objRef,
                    property: "value"
                },
                multiObjectsIDs,
            )

            for (let i = 0; i < length; i++) {
                getters.forEach(getter => getter(i))
                result_objRef.value = singularMethod.call(target, ...args)
                result_iterator.set(i)
            }

            return <ReturnType<FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedTypesFlags<VectorizedArgsTypes>, ParameterContainers, ReturnTypeContainer, ObjIDsT, ObjIDsContainer>>>result
        }
        else {
            for (let i = 0; i < length; i++) {
                getters.forEach(getter => getter(i))
                singularMethod.call(target, ...args)
            }

            return <ReturnType<FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedTypesFlags<VectorizedArgsTypes>, ParameterContainers, ReturnTypeContainer, ObjIDsT, ObjIDsContainer>>>undefined
        }
    }
}