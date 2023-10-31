import { VectorFunction } from "vectorized-functions"
import { Field } from "./field.js"
import { FieldPoint } from "./point.js"
import { FieldPointType } from "./type.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, IsDynamicVector, ItemObjIDsKey, field_point_vectorized_multi_objects_new } from "./vectorized/index.js"
import { vectorIterator } from "./vectorized/iterators/factory.js"
import { MultiObjectsIDs, MultiObjectsTemplate } from "../paradigm/trees/multi-objects.js"
import { IndicesTypedArray } from "../paradigm/arrays/indices-array.js"
import { NumberTypedArray, TypedArrayConstructor, sum, typedArrayConstructor } from "../paradigm/arrays/typed-array.js"

export interface InterpolationKeypoint<
        Location extends FieldPoint = FieldPoint,
        Value = any
    > {
    location: Location
    value: Value
}

export interface FieldInterpolationKeypoint<
        Location extends FieldPoint = FieldPoint,
        Value extends FieldPoint = FieldPoint
    > extends
    InterpolationKeypoint<Location, Value> { }

export type Interpolator<
        Location extends FieldPoint,
        Point
    > = (location: Location) => Point

export type VectorInterpolator<
        Location extends FieldPoint,
        LocationElementType extends FieldPoint,
        LocationFuseMode extends FieldPoint,
        LocationContainer extends FieldPointVectorContainer<NumberTypedArray>,
        Point extends FieldPoint,
        PointElementType extends FieldPoint,
        PointFuseMode extends FieldPoint,
        PointContainer extends FieldPointVectorContainer<NumberTypedArray>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        PointVector extends FieldPointVector<PointElementType, PointContainer> = FieldPointVector<PointElementType, PointContainer>
    > = (locations: LocationVector, results?: PointVector) => PointVector

export const makeInterpolator = Symbol('makeInterpolator')

export interface InterpolationType<Point> {
    [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
        >(
            keypoints: InterpolationKeypoint<Location, Point>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): Interpolator<Location, Point> | undefined
}

export interface FieldInterpolator<
        Location extends FieldPoint = FieldPoint,
        Value extends FieldPoint = FieldPoint
    > extends
    Interpolator<Location, Value> { }

export interface FieldInterpolationType<
        Value extends FieldPoint = FieldPoint
    > extends
    InterpolationType<Value> { }

export interface VectorFieldInterpolationType<
        Point extends FieldPoint = FieldPoint,
        PointElementType extends FieldPoint = Point,
        PointFuseMode extends FieldPoint = Point,
        PointContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        PointVector extends FieldPointVector<PointElementType, PointContainer> = FieldPointVector<PointElementType, PointContainer>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array
    > extends
    InterpolationType<Point> {
    makeInterpolator_vectorized<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
            LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        >(
            keypoints: InterpolationKeypoint<Location, Point>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>,
            resultType: FieldPointType<PointElementType>,
            isDynamicLocation: IsDynamicVector<LocationElementType, LocationContainer>,
            isDynamicResult: IsDynamicVector<PointElementType, PointContainer>,
            multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
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
        > | undefined
}

//TODO: this should perhaps be replaced with individual field interpolators
export class InterpolationManager implements InterpolationType<any>, VectorFieldInterpolationType {
    [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location
        >(
            keypoints: InterpolationKeypoint<Location, any>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): Interpolator<Location, any> {
        for (const interpolationType of InterpolationManager.interpolationTypes) {
            const interpolator = interpolationType[makeInterpolator](keypoints, locationField)
            if (interpolator)
                return interpolator
        }

        throw new Error('matching interpolator not found')
    }

    makeInterpolator_vectorized<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint,
            LocationFuseMode extends FieldPoint,
            LocationContainer extends FieldPointVectorContainer<NumberTypedArray>,
            Point extends FieldPoint,
            PointElementType extends FieldPoint,
            PointFuseMode extends FieldPoint,
            PointContainer extends FieldPointVectorContainer<NumberTypedArray>,
            LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
            PointVector extends FieldPointVector<PointElementType, PointContainer> = FieldPointVector<PointElementType, PointContainer>,
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>
        >(
            keypoints: InterpolationKeypoint<Location, Point>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>,
            resultType: FieldPointType<PointElementType>,
            isDynamicLocation: IsDynamicVector<LocationElementType, LocationContainer>,
            isDynamicResult: IsDynamicVector<PointElementType, PointContainer>,
            multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>,
            preferredInterpolationType?: InterpolationType<Point>
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
        > {
        const makeInterpolatorVF = new (class extends VectorFunction<
                {
                    [makeInterpolator](
                        keypoints: InterpolationKeypoint<Location, any>[],
                        locationField: Field<Location, LocationElementType, LocationFuseMode>,
                        resultType: FieldPointType<PointElementType>,
                        isDynamicLocation: IsDynamicVector<LocationElementType, LocationContainer>,
                        isDynamicResult: IsDynamicVector<PointElementType, PointContainer>,
                        multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
                    ): Interpolator<Location, Point>
                },
                typeof makeInterpolator,
                (
                    keypoints: InterpolationKeypoint<Location, any>[],
                    locationField: Field<Location, LocationElementType, LocationFuseMode>,
                    resultType: FieldPointType<PointElementType>,
                    isDynamicLocation: IsDynamicVector<LocationElementType, LocationContainer>,
                    isDynamicResult: IsDynamicVector<PointElementType, PointContainer>,
                    multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
                ) => Interpolator<Location, Point>,
                [
                    typeof keypoints,
                    typeof locationField,
                    FieldPointType<PointElementType>,
                    IsDynamicVector<LocationElementType, LocationContainer>,
                    IsDynamicVector<PointElementType, PointContainer>,
                    MultiObjectsIDs<Objects, ObjIDsT> | undefined
                ],
                (
                    keypoints: InterpolationKeypoint<Location, any>[],
                    locationField: Field<Location, LocationElementType, LocationFuseMode>,
                    resultType: FieldPointType<PointElementType>,
                    isDynamicLocation: IsDynamicVector<LocationElementType, LocationContainer>,
                    isDynamicResult: IsDynamicVector<PointElementType, PointContainer>,
                    multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
                ) => VectorInterpolator<
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
                >
            > {
            constructor() {
                super(makeInterpolator)
            }

            protected vectorizeSingularCall() {
                return undefined!
            }
        })()

        if (preferredInterpolationType) {
            const interpolator = makeInterpolatorVF.call(<any>preferredInterpolationType, keypoints, locationField, resultType, isDynamicLocation, isDynamicResult, multiObjectIDs)
            if (interpolator)
                return interpolator
        }

        for (const interpolationType of InterpolationManager.interpolationTypes) {
            const interpolator = makeInterpolatorVF.call(<any>interpolationType, keypoints, locationField, resultType, isDynamicLocation, isDynamicResult, multiObjectIDs)
            if (interpolator)
                return interpolator
        }

        const singular = <Interpolator<Location, Point>>this[makeInterpolator](keypoints, locationField)

        return (locations, results) => {
            const locations_multiObj = <FieldPointVectorWithMultiObjects<LocationElementType, LocationContainer, ObjIDsT, ObjIDsContainer>><unknown>locations

            const locationIterator = vectorIterator<Location, LocationContainer, Objects, ObjIDsT, LocationElementType>(locationField.elementType, isDynamicLocation, multiObjectIDs)
            const resultIterator = vectorIterator<Point, PointContainer, Objects, ObjIDsT, PointElementType>(resultType, isDynamicResult, multiObjectIDs)
            const length = locationIterator.length(locations, locations)

            results ??= <PointVector><unknown>field_point_vectorized_multi_objects_new(
                resultType,
                length,
                isDynamicResult,
                <TypedArrayConstructor<number, ObjIDsT> | undefined>(locations_multiObj[ItemObjIDsKey] ? typedArrayConstructor(locations_multiObj[ItemObjIDsKey]) : undefined),
                <any>(locations_multiObj[ItemObjIDsKey] ? sum(locations_multiObj[ItemObjIDsKey]) : undefined)
            )

            const locations_get = locationIterator.get_returnValue.bind(locationIterator, locations, locations)
            const results_set = resultIterator.set.bind(resultIterator, results, results)

            for (let i = 0; i < length; i++) {
                const location = locations_get(i)
                const sample = singular(location)
                results_set(sample, i)
            }

            return results
        }
    }

    private static interpolationTypes: InterpolationType<any>[] = []

    static register(type: InterpolationType<any>): void {
        this.interpolationTypes.push(type)
    }

    static [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
        >(
            keypoints: InterpolationKeypoint<Location, any>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): Interpolator<Location, any> {
        return this.instance[makeInterpolator](keypoints, locationField)
    }

    static makeInterpolatorVectorized<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint,
            LocationFuseMode extends FieldPoint,
            LocationContainer extends FieldPointVectorContainer<NumberTypedArray>,
            Point extends FieldPoint,
            PointElementType extends FieldPoint,
            PointFuseMode extends FieldPoint,
            PointContainer extends FieldPointVectorContainer<NumberTypedArray>,
            LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
            PointVector extends FieldPointVector<PointElementType, PointContainer> = FieldPointVector<PointElementType, PointContainer>,
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array
        >(
            keypoints: InterpolationKeypoint<Location, Point>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>,
            resultType: FieldPointType<PointElementType>,
            isDynamicLocation: IsDynamicVector<LocationElementType, LocationContainer>,
            isDynamicResult: IsDynamicVector<PointElementType, PointContainer>,
            multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>,
            preferredInterpolationType?: InterpolationType<Point>
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
        > {
        return this.instance.makeInterpolator_vectorized(keypoints, locationField, resultType, isDynamicLocation, isDynamicResult, multiObjectIDs, preferredInterpolationType)
    }

    static readonly instance = new InterpolationManager()
}