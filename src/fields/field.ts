import { FieldInterpolationType } from "./interpolation";
import { FieldPoint } from "./point";

export interface Field<Point extends FieldPoint = FieldPoint> {
    interpolationType: FieldInterpolationType<Point>
}