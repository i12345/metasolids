import { Quat } from "playcanvas-extended";
import { keypoint_index } from "../../utils/keypoints_index.js";
import { FieldInterpolationKeypoint, FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class QuatInterpolationType implements FieldInterpolationType<Quat> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: FieldInterpolationKeypoint<Location, Quat>[]
        ): Interpolator<Location, Quat> {
        if (!keypoints.every(({ value }) => value instanceof Quat))
            return undefined
        
        if (typeof keypoints[0].location !== 'number')
            return undefined
        
        return location => {
            const t = location as number
            const i = keypoint_index(t, keypoints as FieldInterpolationKeypoint<number, Quat>[])
            if (keypoints[i].location === t)
                return keypoints[i].value
            else if (i >= 0 && i + 1 < keypoints.length)
                return new Quat().slerp(
                    keypoints[i].value,
                    keypoints[i + 1].value,
                    (t - (keypoints[i].location as number)) /
                    ((keypoints[i + 1].location as number) - (keypoints[i].location as number))
                )
            else if(i < 0) return keypoints[0].value
            else /* i >= keypoints.length */ return keypoints[keypoints.length - 1].value
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}