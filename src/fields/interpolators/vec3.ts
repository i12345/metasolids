import { CurveSet, Vec3 } from "playcanvas-extended";
import { applyCurveConfig, CurveConfig, defaultCurveConfig } from "../curve";
import { FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation";
import { FieldPoint } from "../point";

export class Vec3InterpolationType implements FieldInterpolationType<Vec3> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }
    

    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: [Location, Vec3][]
        ): Interpolator<Location, Vec3> {
        if (!(keypoints[0][1] instanceof Vec3))
            return undefined
        
        if (typeof keypoints[0][0] !== 'number')
            throw new Error('not implemented')
        
        const curves = new CurveSet([
            keypoints.flatMap(([t, p]) => [t, p.x]),
            keypoints.flatMap(([t, p]) => [t, p.y]),
            keypoints.flatMap(([t, p]) => [t, p.z])
        ])

        curves.type = this.curveConfig.type
        curves.curves.forEach(curve => applyCurveConfig(curve, this.curveConfig))

        return location => new Vec3(curves.value(location as number))
    }

    static {
        InterpolationManager.register(new this())
    }
}