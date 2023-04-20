import { Mat4, Quat } from "playcanvas-extended";
import { FieldInterpolationKeypoint, FieldInterpolationType, FieldInterpolator, InterpolationManager, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";
import { Field } from "../index.js";

export class Mat4InterpolationType implements FieldInterpolationType<Mat4> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: FieldInterpolationKeypoint<Location, Mat4>[],
            locationField: Field<Location>
        ): FieldInterpolator<Location, Mat4> {
        if (typeof keypoints[0].location !== 'number')
            return undefined
        
        if (!(keypoints[0].value instanceof Mat4))
            return undefined
        
        const t = keypoints.map(({ location, value: m }) => ({ location, value: m.getTranslation() }))
        const r = keypoints.map(({ location, value: m }) => ({ location, value: new Quat().setFromMat4(m) }))
        const s = keypoints.map(({ location, value: m }) => ({ location, value: m.getScale() }))

        const t_interpolator = InterpolationManager[makeInterpolator](t, locationField)
        const r_interpolator = InterpolationManager[makeInterpolator](r, locationField)
        const s_interpolator = InterpolationManager[makeInterpolator](s, locationField)

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