import { keypoint_index } from "../../utils/keypoints_index.js";
import { InterpolationKeypoint, InterpolationType, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class ConstantInterpolationType<T> implements InterpolationType<T> {
    [makeInterpolator]<Location extends FieldPoint>(keypoints: InterpolationKeypoint<Location, T>[]): Interpolator<Location, T> | undefined {
        if (typeof keypoints[0].location !== 'number')
            return undefined
        
        const t_keypoints = keypoints.map(({ location }) => <number>location)
        
        return t => {
            const index = keypoint_index(t as number, t_keypoints)
            if (index < 0) return keypoints[0].value
            else if (index >= keypoints.length) return keypoints[keypoints.length - 1].value
            else return keypoints[index].value
        }
    }
}