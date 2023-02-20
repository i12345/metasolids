import { CurveSet, Mat4, Quat, Vec3 } from "playcanvas-extended";
import { FieldInterpolationType, FieldInterpolator, InterpolationManager, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class Mat4InterpolationType implements FieldInterpolationType<Mat4> {
    [makeInterpolator]<Location extends FieldPoint>(keypoints: [Location, Mat4][]): FieldInterpolator<Location, Mat4> {
        if (typeof keypoints[0][0] !== 'number')
            throw new Error("only supports scalar interpolation locations")
        
        if (!(keypoints[0][1] instanceof Mat4))
            return undefined
        
        const t = keypoints.map(([t, m]) => [t, m.getTranslation()] as [Location, Vec3])
        const r = keypoints.map(([t, m]) => [t, new Quat().setFromMat4(m)] as [Location, Quat])
        const s = keypoints.map(([t, m]) => [t, m.getScale()] as [Location, Vec3])

        const t_interpolator = InterpolationManager[makeInterpolator](t)
        const r_interpolator = InterpolationManager[makeInterpolator](r)
        const s_interpolator = InterpolationManager[makeInterpolator](s)

        return location => new Mat4().setTRS(
            t_interpolator(location),
            r_interpolator(location),
            s_interpolator(location)
        )
    }

    static {
        InterpolationManager.register(new this())
    }
}