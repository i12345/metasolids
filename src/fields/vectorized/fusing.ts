import { MultiObjectsGroup, MultiObjectsGroupedObjectsKey, PropertyPath, extract, hasPath, intract } from "../../paradigm/trees/index.js"
import { MultiObjectsCombinedValue, MultiObjectsIDs, MultiObjectsMapped, MultiObjectsTemplate, MultiObjectsTemplateOrLeaf, MultiObjectsTemplate_Leaf } from "../../paradigm/trees/multi-objects.js"
import { Equalable, equals } from "../../utils/equals.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { Reflect_entries } from "../../utils/reflect-entries.js"
import { NumberTypedArray } from "../../utils/typed-array.js"
import { FieldPoint, FieldPointMapped, FieldPointPrimitive, FieldsPoint } from "../point.js"
import { FieldPointType } from "../type.js"
import { vectorIterator } from "./iterators/factory.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjRoot, FieldPointVectorWithMultiObjects, ItemObjValuesOffsetsKey, field_point_vectorized_multi_objects_new } from "./point.js"

export const ItemNextObjectIndexKey = Symbol("nextObjectIndex")

export type FusingFieldPointVectorWithMultiObjects<
        Point extends FieldPoint = FieldPoint,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        Container extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
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
    if (mode1 === undefined || mode2 === undefined)
        return mode1 === mode2
    else if (equals in mode1)
        return (<PrimitiveFuseMode>mode1)[equals](<PrimitiveFuseMode>mode2)
    else {
        for (const key of new Set([...Reflect.ownKeys(mode1), ...Reflect.ownKeys(mode2)]))
            if (!fuse_mode_equal<FieldPoint>((<FuseMode<FieldsPoint>>mode1)[key], (<FuseMode<FieldsPoint>>mode2)[key]))
                return false
        return true
    }
}

export function fuse_mode_contains<Superset extends FieldPoint, Subset extends FieldPoint>(superset: FuseMode<Superset>, subset: FuseMode<Subset>): boolean {
    if (subset === undefined)
        return true
    else if (superset === undefined)
        return false
    else if (equals in superset)
        return (<PrimitiveFuseMode>superset)[equals](<PrimitiveFuseMode>subset)
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

export interface PrimitiveFuseMode<Point extends FieldPointPrimitive = FieldPointPrimitive>
    extends Equalable<PrimitiveFuseMode<Point>> {
    fuseSingle<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array
        >(
            type: FieldPointType<Point>,
            points: FieldPointWithMultiObjectPath<Point>[],
            multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>,
            isMultiObjMappedResult?: boolean
        ): {
            reducedValue: Point
            objectValues?: FieldPointWithMultiObjectPath<Point>[]
        } | {
            reducedValue?: Point
            objectValues: FieldPointWithMultiObjectPath<Point>[]
        }

    fuseVector<
            Container extends FieldPointVectorContainer<NumberTypedArray>,
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
            Result extends FieldPoint = Point,
            PointElementType extends FieldPoint = Point,
            ResultElementType extends FieldPoint = Point,
            ResultFuseMode extends FieldPoint = Point,
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array
        >(
        resultType: FieldPointType<ResultElementType>,
        pointsType: FieldPointType<PointElementType>,
        fuseMode: FuseMode<ResultFuseMode>,
        points: FieldPointWithMultiObjectPath<Point>[],
        multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ): Result {
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

    function recursive<
                Point extends FieldPoint,
                Result extends FieldPoint = Point,
                PointElementType extends FieldPoint = Point,
                ResultElementType extends FieldPoint = Result,
                ResultFuseMode extends FieldPoint = Result,
            >(
            resultType: FieldPointType<ResultElementType>,
            pointsType: FieldPointType<PointElementType>,
            fuseMode: FuseMode<ResultFuseMode>,
            points: FieldPointWithMultiObjectPath<Point>[],
            isMultiObjMappedResult?: boolean
        ): {
            reducedValue: Result
            objectValues?: FieldPointWithMultiObjectPath<Result>[]
        } | {
            reducedValue?: Result
            objectValues: FieldPointWithMultiObjectPath<Result>[]
        } {
        if (MultiObjectsGroupedObjectsKey in pointsType) {
            if (points.some(({ multiObjPath }) => multiObjPath))
                throw new Error()

            if (!multiObjectIDs)
                throw new Error()

            const obj_points: FieldPointWithMultiObjectPath<Result>[] = []
            const obj_path: PropertyPath = []

            function traverse_multiObjPoints(value: FieldPoint, objTemplate: MultiObjectsTemplateOrLeaf, depth: number) {
                if (objTemplate === MultiObjectsTemplate_Leaf)
                    obj_points.push({
                        value: <Result>value,
                        multiObjPath: obj_path.slice(0, depth)
                    })
                else {
                    for (const key of Reflect.ownKeys(objTemplate)) {
                        obj_path[depth] = key
                        traverse_multiObjPoints(
                            (<FieldsPoint>value)[key],
                            (<MultiObjectsTemplate>objTemplate)[key],
                            depth + 1
                        )
                    }
                }
            }

            for (const point of points)
                traverse_multiObjPoints(point.value, multiObjectIDs.template, 0)

            return recursive(
                resultType,
                (<MultiObjectsGroup<FieldPointType>>pointsType)[MultiObjectsGroupedObjectsKey],
                fuseMode,
                obj_points,
                isMultiObjMappedResult
            )
        }
        else if (MultiObjectsGroupedObjectsKey in resultType) {
            if (isMultiObjMappedResult)
                throw new Error()

            if (!multiObjectIDs || !(points.every(point => point.multiObjPath)))
                throw new Error()

            return recursive(
                (<MultiObjectsGroup<FieldPointType>>resultType)[MultiObjectsGroupedObjectsKey],
                pointsType,
                fuseMode,
                points,
                true
            )
        }
        else if (pointsType instanceof Function) {
            const fuseMode_primitive = <PrimitiveFuseMode<FieldPointPrimitive & Result & Point>>fuseMode
            return fuseMode_primitive.fuseSingle(
                <FieldPointType<FieldPointPrimitive & Result & Point>><unknown>pointsType,
                <FieldPointWithMultiObjectPath<FieldPointPrimitive & Result & Point>[]>points,
                multiObjectIDs,
                isMultiObjMappedResult
            )
        }
        else {
            const merged = <ReturnType<typeof recursive<FieldsPoint>>>{}

            const objectsCombinedValues = <FieldPointMapped<FieldsPoint, FieldPointWithMultiObjectPath>>{}

            for (const key of Reflect.ownKeys(pointsType)) {
                const sub_resultType = (<FieldPointType<FieldsPoint>>resultType)[key]
                const sub_pointsType = <FieldPointType>pointsType[key]
                const sub_fuseMode = (<FuseMode<FieldsPoint>>fuseMode)[key]
                const sub_points = points.map<FieldPointWithMultiObjectPath>(point => ({
                    value: (<FieldsPoint>point.value)[key],
                    multiObjPath: point.multiObjPath
                }))

                const sub_merged = recursive<FieldPoint>(sub_resultType, sub_pointsType, sub_fuseMode, sub_points, isMultiObjMappedResult)

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

            return <ReturnType<typeof recursive<Point, Result>>>merged
        }
    }

    return recursive<Point, Result, PointElementType, ResultElementType, ResultFuseMode>(resultType, pointsType, fuseMode, points).reducedValue!
}

export function fuseVectors<
        Point extends FieldPoint,
        PointElementType extends FieldPoint = Point,
        ResultElementType extends FieldPoint = Point,
        ResultFuseMode extends FieldPoint = Point,
        Container extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        PointVector extends FieldPointVector<PointElementType, Container> = FieldPointVector<PointElementType, Container>,
        ResultVector extends FieldPointVector<PointElementType, Container> = FieldPointVector<PointElementType, Container>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
    >(
        resultType: FieldPointType<ResultElementType>,
        pointsType: FieldPointType<PointElementType>,
        fuseMode: FuseMode<ResultFuseMode>,
        vectors: PointVector[],
        multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>,
        resultsOrResultDefaultLength?: FusingFieldPointVectorWithMultiObjects<ResultElementType, ObjIDsT, Container, ObjIDsContainer> | number,
        updateNextIndices: boolean = false
    ): ResultVector {
    if (vectors.length === 0)
        if (resultsOrResultDefaultLength === undefined)
            throw new Error()

    const resultDynamic = false

    const pointIterator = vectorIterator<PointElementType, Container, Objects, ObjIDsT>(pointsType, <any>resultDynamic, multiObjectIDs)
    const length = (typeof resultsOrResultDefaultLength === 'number' ? resultsOrResultDefaultLength : undefined) ?? pointIterator.length(vectors[0], vectors[0])

    const vectorizedWithRoots = vectors.map<FieldPointVectorWithMultiObjRoot<PointElementType, Container, ObjIDsT, ObjIDsContainer>>(vector => ({
        vectorized: vector,
        vectorizedRoot: <FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, ObjIDsContainer>>vector
    }))

    let results = <FusingFieldPointVectorWithMultiObjects<ResultElementType, ObjIDsT, Container, ObjIDsContainer>>resultsOrResultDefaultLength

    if (typeof results === "number" || results === undefined) {
        if (length === undefined)
            throw new Error("must defined length")

        results = <FusingFieldPointVectorWithMultiObjects<ResultElementType, ObjIDsT, Container, ObjIDsContainer>>field_point_vectorized_multi_objects_new<ResultElementType, Container, ObjIDsT, ObjIDsContainer>(
            resultType,
            length,
            <any>resultDynamic,
            multiObjectIDs?.IDsType,
            undefined
        )

        if (multiObjectIDs)
            results[ItemNextObjectIndexKey] = <ObjIDsT>new multiObjectIDs.IDsType(length).fill(0)
    }

    const resultWithRoot: FieldPointVectorWithMultiObjRoot<ResultElementType, Container, ObjIDsT, ObjIDsContainer, FieldPointVectorWithMultiObjects<FieldPoint, FieldPointVectorContainer, ObjIDsT, ObjIDsContainer>> = {
        vectorized: results,
        vectorizedRoot: <any>results
    }

    function recursive(
            results: typeof resultWithRoot,
            points: FieldPointVectorWithMultiObjRoot<FieldPoint, Container, ObjIDsT, ObjIDsContainer>[],
            resultType: FieldPointType,
            pointType: FieldPointType,
            fuseMode: FuseMode,
            isMultiObjMapped: {
                points: boolean
                result: boolean
            }
        ) {
        if (MultiObjectsGroupedObjectsKey in pointType) {
            if (isMultiObjMapped.points)
                throw new Error()

            recursive(
                results,
                points,
                resultType,
                pointType[MultiObjectsGroupedObjectsKey],
                fuseMode,
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
                points,
                resultType[MultiObjectsGroupedObjectsKey],
                pointType,
                fuseMode,
                {
                    points: isMultiObjMapped.points,
                    result: true
                }
            )
        }
        else if (pointType instanceof Function) {
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
                    const subpoints = points.map(({ vectorized, vectorizedRoot }) => ({
                        vectorized: <FieldPointVector<FieldPoint, Container>>(<FieldPointVector<FieldsPoint, Container>>vectorized)[key],
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

    return <ResultVector><any>results
}