import { CurveSet, Vec4 } from "playcanvas-extended";
import { applyCurveConfig, CurveConfig, defaultCurveConfig } from "../curve.js";
import { FieldInterpolationKeypoint, FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class Vec4InterpolationType implements FieldInterpolationType<Vec4> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }
    

    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: FieldInterpolationKeypoint<Location, Vec4>[]
        ): Interpolator<Location, Vec4> {
        if (!(keypoints[0].value instanceof Vec4))
            return undefined
        
        if (typeof keypoints[0].location !== 'number')
            return undefined
        
        const curves = new CurveSet([
            keypoints.flatMap(({ location: t, value: p }) => [t, p.x]),
            keypoints.flatMap(({ location: t, value: p }) => [t, p.y]),
            keypoints.flatMap(({ location: t, value: p }) => [t, p.z]),
            keypoints.flatMap(({ location: t, value: p }) => [t, p.w])
        ])

        curves.type = this.curveConfig.type
        curves.curves.forEach(curve => applyCurveConfig(curve, this.curveConfig))

        return location => new Vec4(curves.value(location as number))
    }

    static {
        InterpolationManager.register(new this())
    }
}