import { Curve, CURVE_SPLINE } from "playcanvas-extended";
import { applyCurveConfig, CurveConfig, CurveType, defaultCurveConfig } from "../curve.js";
import { FieldInterpolationKeypoint, FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class ScalarInterpolationType implements FieldInterpolationType<number> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }

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

    static {
        InterpolationManager.register(new this())
    }
}