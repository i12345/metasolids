import { CURVE_LINEAR, CURVE_SPLINE } from "playcanvas-extended"
import { MultiObjectsGroupedObjectsKey, MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/index.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { NumberArrayLike, NumberTypedArray } from "../../utils/typed-array.js"
import { CurveConfig } from "../curve.js"
import { Field } from "../field.js"
import { FieldInterpolationType, InterpolationKeypoint, Interpolator, VectorFieldInterpolationType, VectorInterpolator, makeInterpolator } from "../interpolation.js"
import { FieldPoint, FieldPointMapped, FieldPointMappedObjectsGroupedRemoved, FieldsPoint } from "../point.js"
import { FieldPointType, field_point_type_contains, field_point_type_default, field_point_type_is_instance, field_point_type_is_multiObj, field_point_type_size } from "../type.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorStatic, IsDynamicVector, IsDynamicVectorContainer, field_point_vectorized_new } from "../vectorized/point.js"
import { CurveInterpolator } from "curve-interpolator-vectorized"
import { Reflect_fromEntries, Reflect_entries } from "../../utils/reflect-entries.js"
import { TypedArrayList } from "../../utils/typed-array-list.js"
import { FieldPointVectorIterator } from "../vectorized/iterator.js"
import { vectorIterator } from "../vectorized/iterators/factory.js"
import { vectorized } from "vectorized-functions"

export class SplineInterpolationType<
        Point extends FieldPoint = FieldPoint,
        PointElementType extends FieldPoint = Point,
        PointFuseMode extends FieldPoint = Point,
        PointContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic,
        PointVector extends FieldPointVector<PointElementType, PointContainer> = FieldPointVector<PointElementType, PointContainer>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
    >
    implements VectorFieldInterpolationType<
        Point,
        PointElementType,
        PointFuseMode,
        PointContainer,
        PointVector
    > {
    constructor(public readonly resultType?: FieldPointType<PointElementType>) { }
    
    @vectorized(SplineInterpolationType.prototype.makeInterpolator_vectorized)
    [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location
        >(
            keypoints: InterpolationKeypoint<Location, Point>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): Interpolator<Location, Point> | undefined {
        if (locationField.elementType !== Number)
            return undefined

        if (this.resultType && !keypoints.every(({ value }) => field_point_type_is_instance(this.resultType!, value)))
            return undefined

        const curveConfig: CurveConfig = {
            tension: 0.5,
            type: CURVE_SPLINE
        }
        
        type LocationContainer = FieldPointVectorContainerStatic

        const interpolator = new SplineInterpolator<
                LocationContainer,
                FieldPointVector<number, LocationContainer>,
                Point,
                PointElementType,
                PointFuseMode,
                FieldPointVectorContainerStatic
            >(
                curveConfig,
                <InterpolationKeypoint<number, Point>[]>keypoints,
                <FieldPointType<PointElementType>><unknown>field_point_type_default(keypoints[0].value),
                false,
                false
            )
        
        return <(location: Location) => Point>interpolator.interpolate.bind(interpolator)
    }
    
    makeInterpolator_vectorized<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
            LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>
        >(
            keypoints: InterpolationKeypoint<Location, Point>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>,
            resultType: FieldPointType<PointElementType>,
            isDynamicLocation: IsDynamicVectorContainer<LocationContainer>,
            isDynamicResult: IsDynamicVectorContainer<PointContainer>,
            multiObjectIDs?: MultiObjectsIDs<MultiObjectsTemplate, Uint32Array>
        ): VectorInterpolator<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Point,
            PointElementType,
            PointFuseMode,
            PointContainer,
            LocationVector,
            PointVector
        > | undefined {
        if (!keypoints.every(({ value }) => field_point_type_is_instance(resultType, value)))
            return undefined

        if (this.resultType && !field_point_type_contains(this.resultType, resultType))
            return undefined
    
        if (locationField.elementType !== Number)
            return undefined

        const curveConfig: CurveConfig = {
            tension: 0.5,
            type: CURVE_SPLINE
        }
        
        const interpolator = new SplineInterpolator<
                LocationContainer,
                FieldPointVector<number, LocationContainer>,
                Point,
                PointElementType,
                PointFuseMode,
                PointContainer,
                PointVector
            >(
                curveConfig,
                <InterpolationKeypoint<number, Point>[]>keypoints,
                resultType,
                isDynamicLocation,
                isDynamicResult,
                multiObjectIDs
            )
        
        return <(locations: LocationVector) => PointVector><unknown>interpolator.interpolate_vectorized.bind(interpolator)
    }
}

export class SplineInterpolator<
        LocationContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic,
        LocationVector extends FieldPointVector<number, LocationContainer> = FieldPointVector<number, LocationContainer>,
        Point extends FieldPoint = FieldPoint,
        PointElementType extends FieldPoint = Point,
        PointFuseMode extends FieldPoint = Point,
        PointContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic,
        PointVector extends FieldPointVector<PointElementType, PointContainer> = FieldPointVector<PointElementType, PointContainer>,
    > {
    private readonly curves: FieldPointMapped<PointElementType, CurveInterpolator>
    private readonly result_iterator: FieldPointVectorIterator<Point, PointContainer, PointVector, PointElementType>

    constructor(
        public readonly curveConfig: CurveConfig,
        public readonly keypoints: InterpolationKeypoint<number, Point>[],
        public readonly resultType: FieldPointType<PointElementType>,
        public readonly isDynamicLocation: IsDynamicVector<number, LocationContainer>,
        public readonly isDynamicResult: IsDynamicVector<PointElementType, PointContainer>,
        public readonly multiObjectIDs?: MultiObjectsIDs
    ) {
        const tension = curveConfig.type === CURVE_LINEAR ? 0 : curveConfig.tension
        const closed = curveConfig.closed
        this.result_iterator = vectorIterator(resultType, isDynamicResult, multiObjectIDs)

        if (![CURVE_LINEAR, CURVE_SPLINE].includes(curveConfig.type))
            throw new Error()
    
        if (field_point_type_is_multiObj(resultType))
            throw new Error()
                    
        function recurse_curves_construct(type: FieldPointType, keypoint_vectors: InterpolationKeypoint<number, FieldPointVectorStatic>[]): FieldPointMapped<FieldPoint, CurveInterpolator> {
            if (type instanceof Function) {
                const elementSize = field_point_type_size(type)
                const final_keypoints = keypoint_vectors.map(({ location, value }) => {
                    const keypoint = new Float64Array(1 + elementSize)
                    keypoint[0] = location
                    keypoint.subarray(1).set(<FieldPointVectorContainerStatic>value)
                    return keypoint
                })
                return new CurveInterpolator(final_keypoints, { tension, closed })
            }
            else if (MultiObjectsGroupedObjectsKey in type) {
                throw new Error()
            }
            else return Reflect_fromEntries<any>(
                Reflect_entries(type)
                    .map(([key, subtype]) => [
                            key,
                            recurse_curves_construct(
                                subtype,
                                keypoint_vectors.map(({ location, value }) =>
                                    ({ location, value: (<FieldPointVectorStatic<FieldsPoint>>value)[key] }))
                            )
                        ] as [typeof key, FieldPointMapped<FieldPoint, CurveInterpolator>]
                    )
            )
        }
    
    
        const keypoints_vectors = keypoints.map(({ location, value }) => ({ location: <number>location, value: <FieldPointVectorStatic>field_point_vectorized_new(resultType, 1, false, undefined, <PointElementType><unknown>value) }))
        this.curves = <typeof this.curves>recurse_curves_construct(resultType, keypoints_vectors)
    }
    
    private interpolator_vectorized(x: NumberTypedArray) {
        function recurse_curves_interpolate<T>(
                container_function: (c: FieldPointVectorContainerStatic) => T,
                type: FieldPointType,
                curves: FieldPointMapped<FieldPoint, CurveInterpolator>,
                x: NumberTypedArray,
            ): FieldPointMapped<FieldPoint, T> {
            if (type instanceof Function) {
                const elementSize = field_point_type_size(type)
                const curve = <CurveInterpolator>curves
                const t = curve.getIntersectsAsTime_vectorized(x, 0)
                const y = curve.getPointAtTime_vectorized_custom(t, new Uint32Array(elementSize).map((_, i) => i + 1), undefined, false)
                return container_function(y)
            }
            else if (MultiObjectsGroupedObjectsKey in type) {
                throw new Error()
            }
            else return Reflect_fromEntries<any>(
                Reflect_entries(type)
                    .map(([key, subtype]) => [
                            key,
                            recurse_curves_interpolate(
                                container_function,
                                subtype,
                                (<FieldPointMapped<FieldsPoint, CurveInterpolator>>curves)[key],
                                x
                            )
                        ] as [typeof key, T]
                    )
            )
        }

        return recurse_curves_interpolate<FieldPointVectorContainer>(
            this.isDynamicResult ? y => TypedArrayList.from(y) : y => y,
            this.resultType,
            this.curves,
            x
        )
    }

    interpolate(location: number) {
        const location_array = new Float64Array([location])
        const interpolated = this.interpolate_vectorized(<LocationVector>(this.isDynamicLocation ? TypedArrayList.from(location_array) : location_array))
        return this.result_iterator.get_returnValue(interpolated, interpolated, 0)
    }

    interpolate_vectorized(location: LocationVector) {
        if (this.isDynamicLocation) {
            const locations_typed = <TypedArrayList<number, NumberTypedArray>>location
            const x = locations_typed.arrayView(true)
            return <PointVector>this.interpolator_vectorized(x)
        }
        else {
            const locations_typed = <NumberTypedArray>location
            const x = locations_typed
            return <PointVector>this.interpolator_vectorized(x)
        }
    }
}