import { extract } from "../../utils/tree.js"
import { FieldInterpolationType, makeInterpolator, FieldInterpolator } from "../interpolation.js"
import { FieldsPoint, FieldsPointMapped, FieldPoint, fields_point_map } from "../point.js"

export class FieldsInterpolationType<Point extends FieldsPoint = FieldsPoint>
    implements FieldInterpolationType<Point> {
    constructor(
        public interpolators: FieldsPointMapped<Point, FieldInterpolationType>
    ) {
    }

    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: [Location, Point][]
        ): FieldInterpolator<Location, Point> {
        const interpolators =
            fields_point_map(
                this.interpolators,
                value => value[makeInterpolator] !== undefined,
                (value, path) => (value as FieldInterpolationType)[makeInterpolator](
                    keypoints.map(
                        ([location, keypoint_value]) => [
                                location,
                                extract(keypoint_value, path)
                            ]
                    )
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