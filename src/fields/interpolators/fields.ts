import { MultiObjectsIDs, MultiObjectsTemplate, extract } from "../../paradigm/trees/index.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"
import { Reflect_entries } from "../../utils/reflect-entries.js"
import { NumberTypedArray } from "../../utils/typed-array.js"
import { Field } from "../field.js"
import { FieldInterpolationType, makeInterpolator, FieldInterpolator, FieldInterpolationKeypoint, InterpolationManager, VectorFieldInterpolationType, InterpolationKeypoint, VectorInterpolator } from "../interpolation.js"
import { FieldsPoint, FieldsPointMapped, FieldPoint, fields_point_map, FieldPointMappedObjectsGroupedRemoved } from "../point.js"
import { FieldPointType } from "../type.js"
import { FieldPointVector, FieldPointVectorContainer, IsDynamicVectorContainer } from "../vectorized/index.js"

export class FieldsInterpolationType<
        Point extends FieldsPoint = FieldsPoint,
        PointElementType extends FieldPoint = Point,
        PointFuseMode extends FieldPoint = Point,
        PointContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        PointVector extends FieldPointVector<PointElementType, PointContainer> = FieldPointVector<PointElementType, PointContainer>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array
    >
    implements VectorFieldInterpolationType<
        Point,
        PointElementType,
        PointFuseMode,
        PointContainer,
        PointVector,
        Objects,
        ObjIDsT
    > {
    constructor(
        public interpolators: FieldsPointMapped<Point, FieldInterpolationType>
    ) {
    }

    [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
        >(
            keypoints: FieldInterpolationKeypoint<Location, Point>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): FieldInterpolator<Location, Point> | undefined {
        let anyUndefined = false

        const interpolators =
            fields_point_map(
                this.interpolators,
                value => value[makeInterpolator] !== undefined,
                (valueField, path) => {
                    const interpolator = InterpolationManager[makeInterpolator](
                        keypoints.map(
                            ({ location, value: keypoint_value }) => ({
                                location,
                                value: extract(keypoint_value, path)
                            })
                        ),
                        locationField
                    )

                    if (interpolator === undefined)
                        anyUndefined = true

                    return interpolator
                }
            )

        if (anyUndefined)
            return undefined

        return location =>
            fields_point_map(
                interpolators,
                value => typeof value === 'function',
                (value, path) =>
                    (value as FieldInterpolator)(
                        extract(location as FieldsPoint, path)
                    )
            ) as unknown as Point
    }

    makeInterpolator_vectorized<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainer<NumberTypedArray> = NumberTypedArray,
            LocationVector extends
                FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>
        >(
            keypoints: InterpolationKeypoint<Location, Point>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>,
            resultType: FieldPointType<PointElementType>,
            isDynamicLocation: IsDynamicVectorContainer<LocationContainer>,
            isDynamicResult: IsDynamicVectorContainer<PointContainer>,
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
        > | undefined {
        let anyUndefined = false

        const interpolators =
            fields_point_map(
                this.interpolators,
                value => value[makeInterpolator] !== undefined,
                (valueInterpolationType, path) => {
                    const interpolator = InterpolationManager.makeInterpolatorVectorized(
                        keypoints.map(
                            ({ location, value: keypoint_value }) => ({
                                location,
                                value: extract<FieldPoint>(keypoint_value, path)
                            })
                        ),
                        locationField,
                        extract<FieldPointType>(resultType, path),
                        isDynamicLocation,
                        isDynamicResult,
                        multiObjectIDs,
                        valueInterpolationType
                    )

                    if (interpolator === undefined)
                        anyUndefined = true

                    return interpolator
                }
            )

        if (anyUndefined)
            return undefined

        return (location, results) =>
            results ?
                <PointVector>fields_point_map(
                    interpolators,
                    value => typeof value === 'function',
                    (value, path) =>
                        (<VectorInterpolator<Location, LocationElementType, LocationFuseMode, LocationContainer, FieldPoint, FieldPoint, FieldPoint, PointContainer, LocationVector>><unknown>value)(
                            location,
                            extract<FieldPointVector<FieldPoint, PointContainer>>(results, path)
                        )
                ) :
                <PointVector>fields_point_map(
                    interpolators,
                    value => typeof value === 'function',
                    (value, path) =>
                        (<VectorInterpolator<Location, LocationElementType, LocationFuseMode, LocationContainer, FieldPoint, FieldPoint, FieldPoint, PointContainer, LocationVector>><unknown>value)(location)
                )
    }
}