import { Curve, CURVE_SPLINE } from "playcanvas-extended";
import { applyCurveConfig, CurveConfig, CurveType, defaultCurveConfig } from "../curve.js";
import { FieldInterpolationKeypoint, FieldInterpolationType, InterpolationKeypoint, InterpolationManager, Interpolator, makeInterpolator, VectorFieldInterpolationType, VectorInterpolator } from "../interpolation.js";
import { FieldPoint, FieldPointMapped } from "../point.js";
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js";
import { Field } from "../field.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorContainerType, IsDynamicVector } from "../vectorized/point.js";
import { vectorized } from "vectorized-functions";
import { NumberArrayLike, NumberTypedArray } from "../../utils/typed-array.js";
import { TypedArrayList } from "../../utils/typed-array-list.js";

export class ScalarInterpolationType implements VectorFieldInterpolationType<number> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }

    @vectorized(ScalarInterpolationType.prototype.makeInterpolator_vectorized)
    [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
        >(
            keypoints: FieldInterpolationKeypoint<Location, number>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): Interpolator<Location, number> | undefined {
        if (!keypoints.every(({ value }) => typeof value === 'number'))
            return undefined

        if (typeof keypoints[0].location !== 'number')
            return undefined

        const data = new Float64Array(keypoints.length * 2)
        for (let i = 0; i < keypoints.length; i++) {
            data[(2 * i) + 0] = keypoints[i].location as number
            data[(2 * i) + 1] = keypoints[i].value
        }
        const curve = new Curve(data as unknown as number[])
        applyCurveConfig(curve, this.curveConfig)

        return location => curve.value(location as number)
    }

    makeInterpolator_vectorized<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainer = FieldPointVectorContainerStatic,
            LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        >(
            keypoints: InterpolationKeypoint<Location, number>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>,
            resultType: typeof Number,
            isDynamicLocation: IsDynamicVector<LocationElementType, LocationContainer>,
            isDynamicResult: IsDynamicVector<number, FieldPointVectorContainer>,
            multiObjectIDs?: MultiObjectsIDs
        ): VectorInterpolator<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            number,
            number,
            number,
            FieldPointVectorContainer,
            LocationVector,
            FieldPointVectorContainer
        > | undefined {
        if (!keypoints.every(({ value }) => typeof value === 'number'))
            return undefined

        if (typeof keypoints[0].location !== 'number')
            return undefined

        const data = new Float64Array(keypoints.length * 2)
        for (let i = 0; i < keypoints.length; i++) {
            data[(2 * i) + 0] = keypoints[i].location as number
            data[(2 * i) + 1] = keypoints[i].value
        }
        const curve = new Curve(data as unknown as number[])
        applyCurveConfig(curve, this.curveConfig)

        if (isDynamicLocation) {
            if (isDynamicResult) {
                return locations => {
                    const locations_typed = <TypedArrayList<number, NumberTypedArray>>locations

                    const result = new TypedArrayList<number, Float64Array>(Float64Array, locations_typed.length)
                    for (let i = 0; i < locations_typed.length; i++)
                        result.set(i, curve.value(locations_typed.get(i)))

                    return result
                }
            }
            else {
                return locations => {
                    const locations_typed = <TypedArrayList<number, NumberTypedArray>>locations

                    const result = new Float64Array(locations_typed.length)
                    for (let i = 0; i < locations_typed.length; i++)
                        result[i] = curve.value(locations_typed.get(i))

                    return result
                }
            }
        }
        else {
            if (isDynamicResult) {
                return locations => {
                    const locations_typed = <NumberTypedArray>locations

                    const result = new TypedArrayList<number, Float64Array>(Float64Array, locations_typed.length)
                    for (let i = 0; i < locations_typed.length; i++)
                        result.set(i, curve.value(locations_typed[i]))

                    return result
                }
            }
            else {
                return locations => {
                    const locations_typed = <NumberTypedArray>locations

                    const result = new Float64Array(locations_typed.length)
                    for (let i = 0; i < locations_typed.length; i++)
                        result[i] = curve.value(locations_typed[i])

                    return result
                }
            }
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}