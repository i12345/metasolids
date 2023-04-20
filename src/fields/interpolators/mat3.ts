import { CurveSet, Mat3, Mat4, Quat, Vec3 } from "playcanvas-extended";
import { FieldInterpolationKeypoint, FieldInterpolationType, FieldInterpolator, InterpolationManager, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";
import { Field } from "../field.js";

export class Mat3InterpolationType implements FieldInterpolationType<Mat3> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: FieldInterpolationKeypoint<Location, Mat3>[],
            locationField: Field<Location>
        ): FieldInterpolator<Location, Mat3> {
        if (typeof keypoints[0].location !== 'number')
            return undefined
        
        if (!(keypoints[0].value instanceof Mat3))
            return undefined
        
        const m4 = keypoints.map(({ value: m }) => new Mat4().set([
            m.data[0], m.data[1], m.data[2], 0,
            m.data[3], m.data[4], m.data[5], 0,
            m.data[6], m.data[7], m.data[8], 0,
            0, 0, 0, 1
        ]))
        
        const r = keypoints.map(({ location }, i) => ({ location, value: new Quat().setFromMat4(m4[i]) }))
        const s = keypoints.map(({ location }, i) => ({ location, value: m4[i].getScale() }))

        const r_interpolator = InterpolationManager[makeInterpolator](r, locationField)
        const s_interpolator = InterpolationManager[makeInterpolator](s, locationField)

        return location => {
            const m4 = new Mat4().setTRS(
                Vec3.ZERO,
                r_interpolator(location),
                s_interpolator(location)
            )

            return new Mat3().set([
                m4.data[0], m4.data[1], m4.data[2],
                m4.data[4], m4.data[5], m4.data[6],
                m4.data[8], m4.data[9], m4.data[10],
            ])
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}