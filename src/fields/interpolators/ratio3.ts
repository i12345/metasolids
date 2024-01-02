import { CurveSet, Vec3 } from "playcanvas-physics-advanced";
import { applyCurveConfig, CurveConfig, defaultCurveConfig } from "../curve.js";
import { FieldInterpolationKeypoint, FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";
import { Field } from "../field.js";

export class Ratio3InterpolationType implements FieldInterpolationType<Vec3> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }


    [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
        >(
            keypoints: FieldInterpolationKeypoint<Location, Vec3>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): Interpolator<Location, Vec3> | undefined {
        if (!(keypoints[0].value instanceof Vec3))
            return undefined

        if (typeof keypoints[0].location !== 'number')
            return undefined

        const epsilon = 1e-6

        const curves = new CurveSet([
            keypoints.flatMap(({ location: t, value: p }) => [t, Math.log2(p.x + epsilon)]),
            keypoints.flatMap(({ location: t, value: p }) => [t, Math.log2(p.y + epsilon)]),
            keypoints.flatMap(({ location: t, value: p }) => [t, Math.log2(p.z + epsilon)])
        ])

        curves.type = this.curveConfig.type
        curves.curves.forEach(curve => applyCurveConfig(curve, this.curveConfig))

        return location => {
            const [x, y, z] = curves.value(location as number)
            return new Vec3(
                (2 ** x) - epsilon,
                (2 ** y) - epsilon,
                (2 ** z) - epsilon
            )
        }
    }
}