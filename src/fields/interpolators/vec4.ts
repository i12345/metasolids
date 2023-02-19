import { CurveSet, Vec4 } from "playcanvas-extended";
import { applyCurveConfig, CurveConfig, defaultCurveConfig } from "../curve";
import { FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation";
import { FieldPoint } from "../point";

export class Vec4InterpolationType implements FieldInterpolationType<Vec4> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }
    

    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: [Location, Vec4][]
        ): Interpolator<Location, Vec4> {
        if (!(keypoints[0][1] instanceof Vec4))
            return undefined
        
        if (typeof keypoints[0][0] !== 'number')
            throw new Error('not implemented')
        
        const curves = new CurveSet([
            keypoints.flatMap(([t, p]) => [t, p.x]),
            keypoints.flatMap(([t, p]) => [t, p.y]),
            keypoints.flatMap(([t, p]) => [t, p.z]),
            keypoints.flatMap(([t, p]) => [t, p.w])
        ])

        curves.type = this.curveConfig.type
        curves.curves.forEach(curve => applyCurveConfig(curve, this.curveConfig))

        return location => new Vec4(curves.value(location as number))
    }

    static {
        InterpolationManager.register(new this())
    }
}