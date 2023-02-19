import { clone, Cloneable } from "../../utils";
import { InterpolationManager, InterpolationType, Interpolator, makeInterpolator } from "../interpolation";
import { FieldPoint } from "../point";

export class ObjectInterpolationType<T extends object & Cloneable> implements InterpolationType<T> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: [Location, T][]
        ): Interpolator<Location, T> {
        if (keypoints.some(([_, obj]) => Object.getPrototypeOf(obj) !== Object.getPrototypeOf(keypoints[0][1])))
            return undefined
        
        const propertyInterpolators = Reflect.ownKeys(keypoints[0][1])
            .map(key => [key, keypoints.map(([location, keypoint]) => [location, keypoint[key]] as [Location, any])] as [PropertyKey, [Location, any][]])
            .map(([key, propertyKeypoints]) => [key, InterpolationManager[makeInterpolator](propertyKeypoints)] as [PropertyKey, Interpolator<Location, any>])
        
        if (propertyInterpolators.some(([_, interpolator]) => interpolator === undefined))
            return undefined
        
        const template = keypoints[0][1]
        
        return location => {
            const obj = template[clone]() as T
            
            for (const [key, interpolator] of propertyInterpolators)
                obj[key] = interpolator(location)

            return obj
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}