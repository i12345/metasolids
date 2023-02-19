import { CurveSet, CURVE_LINEAR, CURVE_SMOOTHSTEP, CURVE_SPLINE, CURVE_STEP, Quat, Vec3 } from "playcanvas-extended";
import { keypoint_index } from "../../utils";
import { CurveType } from "../curve";
import { FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation";
import { FieldPoint } from "../point";

export class QuatInterpolationType implements FieldInterpolationType<Quat> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: [Location, Quat][]
        ): Interpolator<Location, Quat> {
        if (!keypoints.every(([t, keypoint]) => keypoint instanceof Quat))
            return undefined
        
        if (typeof keypoints[0][0] !== 'number')
            throw new Error('not implemented')
        
        return location => {
            const t = location as number
            const i = keypoint_index(t, keypoints)
            if (keypoints[i][0] === t)
                return keypoints[i][1]
            else if (i >= 0 && i + 1 < keypoints.length)
                return new Quat().slerp(
                    keypoints[i][1],
                    keypoints[i + 1][1],
                    (t - (keypoints[i][0] as number)) /
                    ((keypoints[i + 1][0] as number) - (keypoints[i][0] as number))
                )
            else if(i < 0) return keypoints[0][1]
            else /* i >= keypoints.length */ return keypoints[keypoints.length - 1][1]
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}