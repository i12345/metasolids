import { CurveSet, Color } from "playcanvas-extended";
import { applyCurveConfig, CurveConfig, defaultCurveConfig } from "../curve.js";
import { FieldInterpolationKeypoint, FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

//TODO: implement HSL curve interpolation

export class ColorRGBAClampedCurveInterpolationType implements FieldInterpolationType<Color> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }
    

    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: FieldInterpolationKeypoint<Location, Color>[]
        ): Interpolator<Location, Color> {
        if (!(keypoints[0].value instanceof Color))
            return undefined
        
        if (typeof keypoints[0].location !== 'number')
            throw new Error('not implemented')
        
        const curves = new CurveSet([
            keypoints.flatMap(({ location: t, value: color }) => [t, color.r]),
            keypoints.flatMap(({ location: t, value: color }) => [t, color.g]),
            keypoints.flatMap(({ location: t, value: color }) => [t, color.b]),
            keypoints.flatMap(({ location: t, value: color }) => [t, color.a])
        ])

        curves.type = this.curveConfig.type
        curves.curves.forEach(curve => applyCurveConfig(curve, this.curveConfig))

        return location => {
            const color = new Color(curves.value(location as number))
            color.r = Math.min(Math.max(color.r, 0), 1)
            color.g = Math.min(Math.max(color.g, 0), 1)
            color.b = Math.min(Math.max(color.b, 0), 1)
            color.a = Math.min(Math.max(color.a, 0), 1)
            return color
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}