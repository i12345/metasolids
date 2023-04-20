import { FieldInterpolationType } from "./interpolation.js";
import { FieldPoint } from "./point.js";

export interface Field<Point extends FieldPoint = FieldPoint> {
    interpolationType: FieldInterpolationType<Point>

    distance(x: Point, y: Point): number
}