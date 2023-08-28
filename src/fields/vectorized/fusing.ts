import { MultiObjectsGroupedObjectsKey, PropertyPath, extract, hasPath, intract } from "../../paradigm/trees/index.js"
import { MultiObjectsCombinedValue, MultiObjectsIDs, MultiObjectsMapped, MultiObjectsTemplate, MultiObjectsTemplate_Leaf } from "../../paradigm/trees/multi-objects.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { Reflect_entries } from "../../utils/reflect-entries.js"
import { TypedArray } from "../../utils/typed-array.js"
import { FieldPoint, FieldPointMapped, FieldPointPrimitive, FieldsPoint } from "../point.js"
import { FieldPointType } from "../type.js"
import { vectorIterator } from "./iterators/factory.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjRoot, FieldPointVectorWithMultiObjects, ItemObjValuesOffsetsKey, field_point_vectorized_multi_objects_new } from "./point.js"

export const ItemNextObjectIndexKey = Symbol("nextObjectIndex")

export type FusingFieldPointVectorWithMultiObjects<
        Point extends FieldPoint = FieldPoint,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        Container extends FieldPointVectorContainerStatic<TypedArray> = FieldPointVectorContainerStatic,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>
    > = FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer> & {
    /**
     * this is a temporary variable reused often
     */
    [ItemNextObjectIndexKey]: ObjIDsT
}

export type FuseMode<Point extends FieldPoint = FieldPoint> =
    Point extends FieldPointPrimitive ? PrimitiveFuseMode<Point> :
    Point extends { [MultiObjectsGroupedObjectsKey]: infer Inner extends FieldPoint } ?
        { [MultiObjectsGroupedObjectsKey]: FuseMode<Point> } :
    Point extends FieldsPoint ? {
        [K in keyof Point]: FuseMode<Point[K]>
    } :
    never

export function fuse_mode_equal<Point extends FieldPoint>(mode1: FuseMode<Point>, mode2: FuseMode<Point>): boolean {
    if ((mode1 === undefined || mode2 === undefined) ||
        (mode1 instanceof Function || mode2 instanceof Function))
        return mode1 === mode2
    else {
        for (const key of new Set([...Reflect.ownKeys(mode1), ...Reflect.ownKeys(mode2)]))
            if (!fuse_mode_equal<FieldPoint>((<FuseMode<FieldsPoint>>mode1)[key], (<FuseMode<FieldsPoint>>mode2)[key]))
                return false
        return true
    }
}

export function fuse_mode_contains<Superset extends FieldPoint, Subset extends FieldPoint>(superset: FuseMode<Superset>, subset: FuseMode<Subset>): boolean {
    if ((superset === undefined || subset === undefined) ||
        (superset instanceof Function || subset instanceof Function))
        return superset === <any>subset
    else {
        for (const key of Reflect.ownKeys(subset))
            if (!fuse_mode_contains<FieldPoint, FieldPoint>((<FuseMode<FieldsPoint>>superset)[key], (<FuseMode<FieldsPoint>>subset)[key]))
                return false
        return true
    }
}

export type FieldPointWithMultiObjectPath<Point extends FieldPoint = FieldPoint> = {
    value: Point
    multiObjPath?: PropertyPath
}

export interface PrimitiveFuseMode<Point extends FieldPointPrimitive = FieldPointPrimitive> {
    fuseSingle<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate
        >(
            type: FieldPointType<Point>,
            points: FieldPointWithMultiObjectPath<Point>[],
            multiObjectIDs?: MultiObjectsIDs<Objects>,
            isMultiObjMappedResult?: boolean
        ): {
            reducedValue: Point
            objectValues?: FieldPointWithMultiObjectPath<Point>[]
        } | {
            reducedValue?: Point
            objectValues: FieldPointWithMultiObjectPath<Point>[]
        }
    
    fuseVector<
            Container extends FieldPointVectorContainer<TypedArray>,
            ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>
        >(
            elementType: FieldPointType<Point>,
            results: FieldPointVectorWithMultiObjRoot<
                    Point,
                    Container,
                    ObjIDsT,
                    ObjIDsContainer,
                    FusingFieldPointVectorWithMultiObjects<FieldPoint, ObjIDsT, FieldPointVectorContainerStatic, ObjIDsContainer>
                >,
            points: FieldPointVectorWithMultiObjRoot<Point, Container>[],
            isMultiObjMapped?: {
                points: boolean
                result: boolean
            }
        ): void
}

export function fusePoints<
            Point extends FieldPoint,
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate
        >(
        type: FieldPointType<Point>,
        fuseMode: FuseMode<Point>,
        // points: Point[],
        points: FieldPointWithMultiObjectPath<Point>[],
        multiObjectIDs?: MultiObjectsIDs<Objects>
    ): FieldPoint {
    /**
        const point1 = {
            alpha: 0.5,
            contrivedField: {
                objA: {
                    uv: new Vec2(0, 1),
                    color: 12
                },
                objB: {
                    uv: new Vec2(2, 3),
                    color: 10
                },
                c: {
                    a: {
                        uv: new Vec2(1, 2),
                        color: 100
                    },
                    b: {
                        uv: new Vec2(10, 20),
                        color: 0
                    }
                }
            }
        }

        const point2 = {
            alpha: 0.7,
            contrivedField: {
                objC: {
                    uv: new Vec2(0, 0),
                    color: 10
                },
                c: {
                    d: {
                        uv: new Vec2(0, 5),
                        color: 50
                    },
                    c: {
                        uv: new Vec2(10, 20),
                        color: 0
                    }
                }
            }
        }

        const fuseMode = {
            alpha: "max",
            contrivedFields: {
                ["multiObjects"]: { // for each object in the contrivedField,
                    uv: "add", // the uv's for all objects should reduce by addition
                    color: "concat" // and the colors for each object should concat
                }
            }
        }

        const fused = {
            alpha: 0.7,
            contrivedField: {
                ["multiObjectsCombined"]: {
                    uv: new Vec2(0+2+1+10+0+0+10, 1+3+2+20+0+5+20),
                },
                objA: {
                    color: 12
                },
                objB: {
                    color: 10
                },
                c: {
                    a: {
                        color: 100
                    },
                    b: {
                        color: 0
                    },
                    d: {
                        color: 50
                    },
                    c: {
                        color: 0
                    }
                },
                objC: {
                    color: 10
                },
            }
        }
     */

    function recursive<Point extends FieldPoint = FieldPoint>(
            type: FieldPointType<Point>,
            fuseMode: FuseMode<Point>,
            points: FieldPointWithMultiObjectPath<Point>[],
            isMultiObjMappedResult?: boolean
        ): {
            reducedValue: Point
            objectValues?: FieldPointWithMultiObjectPath<Point>[]
        } | {
            reducedValue?: Point
            objectValues: FieldPointWithMultiObjectPath<Point>[]
        } {
        if (type instanceof Function)
            return (<PrimitiveFuseMode<FieldPointPrimitive & Point>>fuseMode).fuseSingle(type, <FieldPointWithMultiObjectPath<FieldPointPrimitive & Point>[]>points, multiObjectIDs, isMultiObjMappedResult)
        else if (MultiObjectsGroupedObjectsKey in type) {
            if (!multiObjectIDs || points.some(point => point.multiObjPath))
                throw new Error()

            function objRecurse(
                path: PropertyPath,
                path_slice_start: number,
                descendantPoints: FieldPointWithMultiObjectPath<Point>[],
                point_value: FieldPoint,
                objsTemplate: MultiObjectsTemplate | typeof MultiObjectsTemplate_Leaf,
                depth: number
            ) {
                if (objsTemplate === MultiObjectsTemplate_Leaf) {
                    descendantPoints.push({
                        value: extract<Point>(point_value, path.slice(path_slice_start, path_slice_start + depth)),
                        multiObjPath: path.slice(0, path_slice_start + depth)
                    })
                }
                else {
                    for (const key of Reflect.ownKeys(<FieldsPoint>point_value)) {
                        console.assert(key in objsTemplate)
                        path[path_slice_start + depth] = key
                        objRecurse(
                            path,
                            path_slice_start,
                            descendantPoints,
                            (<FieldsPoint>point_value)[key],
                            objsTemplate[key],
                            depth + 1
                        )
                    }
                }
            }
            
            // each object should only appear in one descendant at most
            const descendantPoints = points.flatMap(({ value, multiObjPath: point_multiObjPath }) => {
                const path = point_multiObjPath ? [...point_multiObjPath] : []
                const path_slice_start = point_multiObjPath ? point_multiObjPath.length : 0
                const descendantPoints = <FieldPointWithMultiObjectPath<Point>[]>[]

                objRecurse.bind(undefined, path, path_slice_start, descendantPoints)(value, multiObjectIDs.template, 0)

                return descendantPoints
            })
            
            const fused = recursive<FieldPoint>(<FieldPointType>type[MultiObjectsGroupedObjectsKey], (<any>fuseMode)[MultiObjectsGroupedObjectsKey], descendantPoints, true)
            
            if (fused.objectValues === undefined)
                return { reducedValue: <Point>fused.reducedValue }
            
            const combined = <any>{}
            for (const obj of fused.objectValues!) {
                if (hasPath(combined, obj.multiObjPath!))
                    throw new Error("can only use object once in given field points")
                intract(combined, obj.multiObjPath!, obj.value)
            }

            //TODO: this could be a mistake
            if (fused.reducedValue !== undefined)
                combined[MultiObjectsCombinedValue] = fused.reducedValue

            return { reducedValue: <Point>combined }
        }
        else {
            const merged = <ReturnType<typeof recursive<FieldsPoint>>>{}
            
            const objectsCombinedValues = <FieldPointMapped<FieldsPoint, FieldPointWithMultiObjectPath>>{}

            for (const key of Reflect.ownKeys(type)) {
                const sub_type = <FieldPointType>type[key]
                const sub_fuseMode = <FuseMode<FieldPoint>>(<any>fuseMode)[key]
                const sub_points = points.map<FieldPointWithMultiObjectPath>(point => ({
                    value: (<FieldsPoint>point.value)[key],
                    multiObjPath: point.multiObjPath
                }))

                const sub_merged = recursive(sub_type, sub_fuseMode, sub_points, isMultiObjMappedResult)
                
                if (sub_merged.objectValues) {
                    for (const { value, multiObjPath } of sub_merged.objectValues) {
                        const combination =
                            multiObjPath ?
                                hasPath(objectsCombinedValues, multiObjPath) ?
                                    extract<FieldsPoint>(objectsCombinedValues, multiObjPath) :
                                    intract<FieldsPoint>(objectsCombinedValues, multiObjPath, {}) :
                                (merged.reducedValue ??= {})
                        combination[key] = value
                    }
                }

                if (sub_merged.reducedValue)
                    (merged.reducedValue ??= {})[key] = sub_merged.reducedValue
            }

            if (Reflect.ownKeys(objectsCombinedValues).length > 0) {
                merged.objectValues = []

                const objPath: PropertyPath = []
                function objRecurse(
                        objs: MultiObjectsTemplate | typeof MultiObjectsTemplate_Leaf,
                        combined: MultiObjectsMapped<MultiObjectsTemplate, any>,
                        depth: number
                    ) {
                    if (objs === MultiObjectsTemplate_Leaf) {
                        merged.objectValues!.push({
                            value: combined,
                            multiObjPath: objPath.slice(0, depth)
                        })
                    }
                    else {
                        for (const key of Reflect.ownKeys(objs)) {
                            if (!(key in objs)) continue
                            
                            objPath[depth] = key
                            const subobjs = objs[key]
                            const subcombined = combined[key]
                            
                            objRecurse(subobjs, subcombined, depth + 1)
                        }
                    }
                }

                objRecurse(multiObjectIDs!.template, objectsCombinedValues, 0)
            }
            
            return <ReturnType<typeof recursive<Point>>>merged
        }
    }

    return recursive(type, fuseMode, points /* points.map(value => ({ value })) */).reducedValue!
}

export function fuseVectors<
        Point extends FieldPoint,
        Container extends FieldPointVectorContainerStatic<TypedArray> = FieldPointVectorContainerStatic,
        Vector extends FieldPointVector<Point, Container> = FieldPointVector<Point, Container>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
    >(
        resultType: FieldPointType<Point>,
        pointsType: FieldPointType<Point>,
        fuseMode: FuseMode<Point>,
        vectors: Vector[],
        multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>,
        resultsOrResultDefaultLength?: FusingFieldPointVectorWithMultiObjects<Point, ObjIDsT, Container, ObjIDsContainer> | number,
        updateNextIndices: boolean = false
    ): Vector {
    if (vectors.length === 0)
        if (resultsOrResultDefaultLength === undefined)
            throw new Error()
        
    const resultDynamic = false
    
    const pointIterator = vectorIterator<Point, Container, Objects, ObjIDsT>(pointsType /* resultType */, <any>resultDynamic, multiObjectIDs)
    const length = (typeof resultsOrResultDefaultLength === 'number' ? resultsOrResultDefaultLength : undefined) ?? pointIterator.length(vectors[0], vectors[0])

    const vectorizedWithRoots = vectors.map<FieldPointVectorWithMultiObjRoot<Point, Container, ObjIDsT, ObjIDsContainer>>(vector => ({
        vectorized: vector,
        vectorizedRoot: <FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, ObjIDsContainer>>vector
    }))

    let results = <FusingFieldPointVectorWithMultiObjects<Point, ObjIDsT, Container, ObjIDsContainer>>resultsOrResultDefaultLength

    if (typeof results === "number" || results === undefined) {
        if (length === undefined)
            throw new Error("must defined length")

        results = <FusingFieldPointVectorWithMultiObjects<Point, ObjIDsT, Container, ObjIDsContainer>><unknown>field_point_vectorized_multi_objects_new(
            resultType,
            length,
            <any>resultDynamic,
            multiObjectIDs?.IDsType,
            undefined
        )

        if (multiObjectIDs)
            results[ItemNextObjectIndexKey] = <ObjIDsT>new multiObjectIDs.IDsType(length).fill(0)
    }

    const resultWithRoot: FieldPointVectorWithMultiObjRoot<Point, Container, ObjIDsT, ObjIDsContainer, FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, ObjIDsContainer>> = {
        vectorized: results,
        vectorizedRoot: results
    }

    // iterator.fuse(<any>resultWithRoot, vectorizedWithRoots, fuseMode)

    function recursive(
            results: typeof resultWithRoot,
            points: typeof vectorizedWithRoots,
            resultType: FieldPointType,
            pointType: FieldPointType,
            fuseMode: FuseMode,
            isMultiObjMapped/* ? */: {
                points: boolean
                result: boolean
            }
        ) {
        if (MultiObjectsGroupedObjectsKey in pointType) {
            if (isMultiObjMapped.points)
                throw new Error()

            recursive(
                results,
                vectorizedWithRoots,
                resultType,
                pointType[MultiObjectsGroupedObjectsKey],
                fuseMode,
                // <FuseMode>(<any>fuseMode)[MultiObjectsGroupedObjectsKey],
                {
                    points: true,
                    result: isMultiObjMapped.result
                }
            )
        }
        else if (MultiObjectsGroupedObjectsKey in resultType) {
            if (isMultiObjMapped.result)
                throw new Error()

            recursive(
                results,
                vectorizedWithRoots,
                resultType[MultiObjectsGroupedObjectsKey],
                pointType,
                fuseMode,
                {
                    points: isMultiObjMapped.points,
                    result: true
                }
            )
        }
        else if (fuseMode instanceof Function) {
            (<PrimitiveFuseMode>fuseMode).fuseVector(
                <FieldPointType<FieldPointPrimitive>>resultType,
                <FieldPointVectorWithMultiObjRoot<
                    FieldPointPrimitive,
                    Container,
                    ObjIDsT,
                    ObjIDsContainer,
                    FusingFieldPointVectorWithMultiObjects<FieldPoint, ObjIDsT, FieldPointVectorContainerStatic, ObjIDsContainer>
                >>results,
                <FieldPointVectorWithMultiObjRoot<FieldPointPrimitive, Container>[]>points,
                isMultiObjMapped
            )
        }
        else {
            for (const [key, subtype] of Reflect_entries(resultType)) {
                const submode = (<FuseMode<FieldsPoint>>fuseMode)[key]
                if (submode) {
                    const subresults = <FieldPointVector<FieldPoint, Container>>(<FieldPointVector<FieldsPoint, Container>>results.vectorized)[key]
                    const subpoints = points.map/* <FieldPointVectorWithMultiObjRoot<FieldPoint, Container>> */(({ vectorized, vectorizedRoot }) => ({
                        vectorized: <FieldPointVector<Point, Container>>(<FieldPointVector<FieldsPoint, Container>>vectorized)[key],
                        vectorizedRoot
                    }))
                    recursive(
                        {
                            vectorized: <any>subresults,
                            vectorizedRoot: results.vectorizedRoot
                        },
                        subpoints,
                        (<FieldPointType<FieldsPoint>>resultType)[key],
                        (<FieldPointType<FieldsPoint>>pointType)[key],
                        submode,
                        isMultiObjMapped
                    )
                }
            }
        }
    }

    recursive(
        resultWithRoot,
        vectorizedWithRoots,
        resultType,
        pointsType,
        fuseMode,
        {
            points: false,
            result: false
        }
    )

    if (updateNextIndices) {
        if (!results[ItemNextObjectIndexKey])
            throw new Error()
        
        for (const vector of vectors) {
            const vector_objOffsets = (<FieldPointVectorWithMultiObjects>vector)[ItemObjValuesOffsetsKey]
            const results_objIndicesNext = results[ItemNextObjectIndexKey]

            let objOffset_prev = 0
            let objOffset_next: number

            for (let i = 0; i < vector_objOffsets.length; i++) {
                objOffset_next = vector_objOffsets[i]
                results_objIndicesNext[i] += (objOffset_next - objOffset_prev)
                objOffset_prev = objOffset_next
            }
        }
    }

    return <Vector><any>results
}