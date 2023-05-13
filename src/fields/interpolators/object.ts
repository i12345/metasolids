import { clone, Cloneable, makeClone } from "../../utils/cloneable.js";
import { Field } from "../field.js";
import { InterpolationKeypoint, InterpolationManager, InterpolationType, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class ObjectInterpolationType<T extends object & Cloneable> implements InterpolationType<T> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: InterpolationKeypoint<Location, T>[],
            locationField: Field<Location>
        ): Interpolator<Location, T> | undefined {
        //TODO: does this always have to be the case
        // if (keypoints.some(({ value: obj }) => Object.getPrototypeOf(obj) !== Object.getPrototypeOf(keypoints[0][1])))
        //     return undefined
        if (typeof keypoints[0].value !== 'object')
            return undefined
        
        const propertyInterpolators = Reflect.ownKeys(keypoints[0].value)
            .map(key => ({
                key,
                interpolator: InterpolationManager[makeInterpolator](
                    keypoints.map(
                        ({ location, value: keypoint }) =>
                            ({ location, value: (keypoint as any)[key] })
                    ),
                    locationField
                )
            }))
        
        if (propertyInterpolators.some(({ interpolator }) => interpolator === undefined))
            return undefined
        
        const template = keypoints[0].value
        
        return location => {
            const obj = makeClone(template) as any
            
            for (const { key, interpolator } of propertyInterpolators)
                obj[key] = interpolator(location)

            return obj as T
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}