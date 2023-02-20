import { keypoint_index } from "../../utils/keypoints_index.js";
import { InterpolationType, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class ConstantInterpolationType<T> implements InterpolationType<T> {
    [makeInterpolator]<Location extends FieldPoint>(keypoints: [Location, T][]): Interpolator<Location, T> {
        if (typeof keypoints[0][0] !== 'number')
            return undefined
        
        return t => {
            const index = keypoint_index(t as number, keypoints as [number, any][])
            if (index < 0) return keypoints[0][1]
            else if (index >= keypoints.length) return keypoints[keypoints.length - 1][1]
            else return keypoints[index][1]
        }
    }
}