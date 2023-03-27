import { clone, Cloneable } from "../../utils/cloneable.js";
import { InterpolationKeypoint, InterpolationManager, InterpolationType, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class ObjectInterpolationType<T extends object & Cloneable> implements InterpolationType<T> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: InterpolationKeypoint<Location, T>[]
        ): Interpolator<Location, T> {
        if (keypoints.some(({ value: obj }) => Object.getPrototypeOf(obj) !== Object.getPrototypeOf(keypoints[0][1])))
            return undefined
        
        const propertyInterpolators = Reflect.ownKeys(keypoints[0][1])
            .map(key => ({
                key,
                interpolator: InterpolationManager[makeInterpolator](
                    keypoints.map(
                        ({ location, value: keypoint }) =>
                            ({ location, value: keypoint[key] })
                    )
                )
            }))
        
        if (propertyInterpolators.some(({ interpolator }) => interpolator === undefined))
            return undefined
        
        const template = keypoints[0].value
        
        return location => {
            const obj = template[clone]() as T
            
            for (const { key, interpolator } of propertyInterpolators)
                obj[key] = interpolator(location)

            return obj
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}