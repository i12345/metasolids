import { Curve, CURVE_SPLINE } from "playcanvas-extended";
import { applyCurveConfig, CurveConfig, CurveType, defaultCurveConfig } from "../curve.js";
import { FieldInterpolationKeypoint, FieldInterpolationType, InterpolationKeypoint, InterpolationManager, Interpolator, makeInterpolator, VectorFieldInterpolationType, VectorInterpolator } from "../interpolation.js";
import { FieldPoint, FieldPointMapped } from "../point.js";
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js";
import { Field } from "../field.js";
import { FieldPointVectorContainer } from "../vectorized/point.js";
import { vectorized } from "vectorized-functions";
import { NumberArrayLike } from "../../utils/typed-array.js";

export class ScalarInterpolationType implements VectorFieldInterpolationType<number> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }

    @vectorized()
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: FieldInterpolationKeypoint<Location, number>[]
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
            LocationContainer extends FieldPointVectorContainer,
            LocationVector extends FieldPointMapped<Location, LocationContainer> = FieldPointMapped<Location, LocationContainer>
        >(
            keypoints: InterpolationKeypoint<Location, number>[],
            locationField: Field<Location>,
            resultType: typeof Number,
            multiObjectIDs?: MultiObjectsIDs
        ): VectorInterpolator<
            Location,
            LocationContainer,
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

        return locations => {
            const locations_typed = <NumberArrayLike>locations

            const result = new Float64Array(locations_typed.length)
            for (let i = 0; i < locations_typed.length; i++)
                result[i] = curve.value(locations_typed[i])

            return result
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}