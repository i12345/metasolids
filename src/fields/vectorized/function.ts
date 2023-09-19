import { VectorFunction } from "vectorized-functions"
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js"
import { PropertyPath } from "../../paradigm/trees/path.js"
import { extract } from "../../paradigm/trees/tree.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { FieldPoint } from "../point.js"
import { FieldPointType, field_point_new } from "../type.js"
import { vectorIterator, vectorizedIteratorGetSetLengthCurried } from "./iterators/factory.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorWithMultiObjects, field_point_vectorized_multi_objects_new, isDynamicVector } from "./point.js"
import { NumberTypedArray } from "../../utils/typed-array.js"

export const VectorCallManager = Symbol()

export type VectorizedType = FieldPoint | undefined | typeof VectorCallManager
export type VectorizedTypes<Method extends (...args: any[]) => any> =
    VectorizedType[]
    // {
    //     [i in keyof Parameters<Method>]:
    //         i extends keyof any[] ?
    //             Parameters<Method>[i] :
    //             VectorizedType
    //             // Parameters<Method>[i] extends FieldPoint ?
    //             //     VectorizedType :
    //             //     (undefined | typeof VectorCallManager)
    // }

export type FieldPointGarunteed<T> = T extends FieldPoint ? T : FieldPoint

export type VectorizedArgs<
        Target extends object,
        MethodName extends (keyof Target) & (string | symbol),
        Method extends Target[MethodName] & ((this: Target, ...args: any[]) => FieldPoint | void),
        VectorizedArgsTypes extends VectorizedTypes<Method>,
        ParameterContainers extends (FieldPointVectorContainer<NumberTypedArray> | undefined)[] = (FieldPointVectorContainer | undefined)[],
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainer<ObjIDsT>
    > = {
    [i in keyof VectorizedArgsTypes]:
        i extends keyof any[] ?
            VectorizedArgsTypes[i] :
            VectorizedArgsTypes[i] extends FieldPoint ?
                i extends keyof ParameterContainers ?
                    ParameterContainers[i] extends FieldPointVectorContainer<NumberTypedArray> ?
                        FieldPointVector<FieldPointGarunteed<VectorizedArgsTypes[i]>, ParameterContainers[i]> |
                        FieldPointVectorWithMultiObjects<FieldPointGarunteed<VectorizedArgsTypes[i]>, ParameterContainers[i], ObjIDsT, ObjIDsContainer> :
                        (i extends keyof Parameters<Method> ? Parameters<Method>[i] : VectorizedArgsTypes[i]) :
                    (i extends keyof Parameters<Method> ? Parameters<Method>[i] : VectorizedArgsTypes[i]) :
                (i extends keyof Parameters<Method> ? Parameters<Method>[i] : VectorizedArgsTypes[i])
    }

export type FieldPointVectorizedFunction<
        Target extends object,
        MethodName extends (keyof Target) & (string | symbol),
        Method extends Target[MethodName] & ((this: Target, ...args: any[]) => FieldPoint | void),
        VectorizedArgsTypes extends VectorizedTypes<Method>,
        VectorizedReturnType extends FieldPoint | void = ReturnType<Method>,
        ParameterContainers extends (FieldPointVectorContainer<NumberTypedArray> | undefined)[] = (FieldPointVectorContainer | undefined)[],
        ReturnTypeContainer extends FieldPointVectorContainer<NumberTypedArray> | undefined = FieldPointVectorContainer | undefined,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainer<ObjIDsT>
    > =
    (
        this: Target,
        ...args: VectorizedArgs<
            Target,
            MethodName,
            Method,
            VectorizedArgsTypes,
            ParameterContainers,
            ObjIDsT,
            ObjIDsContainer
        >
    ) => VectorizedReturnType extends FieldPoint ?
        ReturnTypeContainer extends FieldPointVectorContainer<NumberTypedArray> ?
            FieldPointVectorWithMultiObjects<
                VectorizedReturnType,
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
        VectorizedArgsTypes extends VectorizedTypes<Method>,
        VectorizedReturnType extends FieldPoint | void = ReturnType<Method>,
        // template containers with nesting
        ParameterContainers extends (FieldPointVectorContainer<NumberTypedArray> | undefined)[] = (FieldPointVectorContainer | undefined)[],
        ReturnTypeContainer extends FieldPointVectorContainer<NumberTypedArray> | undefined = FieldPointVectorContainer | undefined,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainer<ObjIDsT>,
    >
    extends
    VectorFunction<
            Target,
            MethodName,
            Method,
            VectorizedArgs<Target, MethodName, Method, VectorizedArgsTypes, ParameterContainers, ObjIDsT, ObjIDsContainer>,
            FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedArgsTypes, VectorizedReturnType, ParameterContainers, ReturnTypeContainer, ObjIDsT, ObjIDsContainer>
        > {
    constructor(
        method: MethodName,
        public readonly vectorizedParameterTypes: { [i in keyof VectorizedArgsTypes]: VectorizedArgsTypes[i] extends FieldPoint ? FieldPointType<VectorizedArgsTypes[i]> : VectorizedArgsTypes[i] },
        public readonly returnType: VectorizedReturnType extends FieldPoint ? (FieldPointType<VectorizedReturnType> | undefined) : undefined,

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
            params: VectorizedArgs<Target, MethodName, Method, VectorizedArgsTypes, ParameterContainers, ObjIDsT, ObjIDsContainer>
        ): ReturnType<FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedArgsTypes, VectorizedReturnType, ParameterContainers, ReturnTypeContainer, ObjIDsT, ObjIDsContainer>> {
        const args = new Array(params.length)
        let argIndexNext = 0

        let vectorizedLength: undefined | number = undefined

        const getters = new Array<(index: number) => void>((<VectorizedType[]>this.vectorizedParameterTypes).length)

        const multiObjectsIDs = this.multiObjectsContextParamPath ? extract<MultiObjectsIDs<Objects, ObjIDsT>>(params, this.multiObjectsContextParamPath) : undefined

        params.forEach((value, paramIndex) => {
            const paramValue = <FieldPoint | FieldPointVector | FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, ObjIDsContainer>>value
            const type = this.vectorizedParameterTypes[paramIndex]
            if (type === undefined)
                args[argIndexNext++] = paramValue
            else if (type === VectorCallManager) { }
            else {
                args[argIndexNext] = field_point_new(<FieldPointType>type)

                const { get, length } = vectorizedIteratorGetSetLengthCurried(
                    <FieldPointType>type,
                    paramValue as any,
                    {
                        obj: args,
                        property: argIndexNext
                    },
                    multiObjectsIDs,
                )

                argIndexNext++
                getters.push(get)
                vectorizedLength ??= length
            }
        })

        if (vectorizedLength === undefined)
            throw new Error("no vectorized args given")

        if (this.returnType) {
            const result = field_point_vectorized_multi_objects_new(
                this.returnType,
                vectorizedLength,
                false,
                multiObjectsIDs?.IDsType,
            )

            const result_iterator = vectorIterator(
                this.returnType,
                isDynamicVector<FieldPoint, FieldPointVectorContainer>(<FieldPointType>this.returnType, result),
                multiObjectsIDs,
                result
            )

            let result_value: FieldPoint
            for (let i = 0; i < vectorizedLength; i++) {
                getters.forEach(getter => getter(i))
                result_value = <FieldPoint>singularMethod.call(target, ...args)
                result_iterator.set(result, result, result_value, i)
            }

            return <ReturnType<FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedArgsTypes, VectorizedReturnType, ParameterContainers, ReturnTypeContainer, ObjIDsT, ObjIDsContainer>>>result
        }
        else {
            for (let i = 0; i < vectorizedLength; i++) {
                getters.forEach(getter => getter(i))
                singularMethod.call(target, ...args)
            }

            return <ReturnType<FieldPointVectorizedFunction<Target, MethodName, Method, VectorizedArgsTypes, VectorizedReturnType, ParameterContainers, ReturnTypeContainer, ObjIDsT, ObjIDsContainer>>>undefined
        }
    }
}