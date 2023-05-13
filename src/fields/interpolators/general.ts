import { Field } from "../field.js";
import { FieldInterpolator, InterpolationKeypoint, InterpolationManager, InterpolationType, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint, field_point_sum_weighted } from "../point.js";

export class GeneralInterpolationType<Point extends FieldPoint = FieldPoint>
    implements InterpolationType<Point> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: InterpolationKeypoint<Location, Point>[],
            locationField: Field<Location>
        ): FieldInterpolator<Location, Point> | undefined {
        const locations = keypoints.map(({ location }) => location)
        const values = keypoints.map(({ value }) => value)

        return x => {
            const distances = locations.map(location => locationField.distance(x, location))
            const atIndex = distances.findIndex(d => d < 1e-6)
            if (atIndex !== -1)
                return values[atIndex]
            
            const proximities = distances.map(d => 1 / d)
            const proximitiesSum = proximities.reduce((acc, item) => acc + item, 0)
            const weights = proximities.map(x => x / proximitiesSum)

            return field_point_sum_weighted(values, weights)
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}