import { extract } from "../../utils/tree.js"
import { Field } from "../field.js"
import { FieldInterpolationType, makeInterpolator, FieldInterpolator, FieldInterpolationKeypoint, InterpolationManager } from "../interpolation.js"
import { FieldsPoint, FieldsPointMapped, FieldPoint, fields_point_map } from "../point.js"

export class FieldsInterpolationType<Point extends FieldsPoint = FieldsPoint>
    implements FieldInterpolationType<Point> {
    constructor(
        public interpolators: FieldsPointMapped<Point, FieldInterpolationType>
    ) {
    }

    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: FieldInterpolationKeypoint<Location, Point>[],
            locationField: Field<Location>
        ): FieldInterpolator<Location, Point> {
        const interpolators =
            fields_point_map(
                this.interpolators,
                value => value[makeInterpolator] !== undefined,
                (valueField, path) => InterpolationManager[makeInterpolator](
                    keypoints.map(
                        ({ location, value: keypoint_value }) => ({
                            location,
                            value: extract(keypoint_value, path)
                        })
                    ),
                    locationField
                )
            )
    
        return location =>
            fields_point_map(
                interpolators,
                value => typeof value === 'function',
                (value, path) =>
                    (value as FieldInterpolator)(
                        extract(location as FieldsPoint, path)
                    )
            ) as unknown as Point
    }
}