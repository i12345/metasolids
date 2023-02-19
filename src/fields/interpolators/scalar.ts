import { Curve, CURVE_SPLINE } from "playcanvas-extended";
import { applyCurveConfig, CurveConfig, CurveType, defaultCurveConfig } from "../curve";
import { FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation";
import { FieldPoint } from "../point";

export class ScalarInterpolationType implements FieldInterpolationType<number> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }

    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: [Location, number][]
        ): Interpolator<Location, number> {
        if (!keypoints.every(([t, keypoint]) => typeof keypoint === 'number'))
            return undefined
        
        if (typeof keypoints[0][0] !== 'number')
            throw new Error('not implemented')
        
        const curve = new Curve(keypoints.flat() as number[])
        applyCurveConfig(curve, this.curveConfig)

        return location => curve.value(location as number)
    }

    static {
        InterpolationManager.register(new this())
    }
}