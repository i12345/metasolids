import { CurveSet, Vec2 } from "playcanvas-extended";
import { applyCurveConfig, CurveConfig, defaultCurveConfig } from "../curve.js";
import { FieldInterpolationKeypoint, FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class Vec2InterpolationType implements FieldInterpolationType<Vec2> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }
    

    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: FieldInterpolationKeypoint<Location, Vec2>[]
        ): Interpolator<Location, Vec2> {
        if (!(keypoints[0].value instanceof Vec2))
            return undefined
        
        if (typeof keypoints[0].location !== 'number')
            throw new Error('not implemented')
        
        const curves = new CurveSet([
            keypoints.flatMap(({ location: t, value: p }) => [t, p.x]),
            keypoints.flatMap(({ location: t, value: p }) => [t, p.y])
        ])

        curves.type = this.curveConfig.type
        curves.curves.forEach(curve => applyCurveConfig(curve, this.curveConfig))

        return location => new Vec2(curves.value(location as number))
    }

    static {
        InterpolationManager.register(new this())
    }
}