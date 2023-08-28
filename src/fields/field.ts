import { FieldInterpolationType } from "./interpolation.js";
import { FieldPoint } from "./point.js";
import { FieldPointType } from "./type.js"
import { FuseMode } from "./vectorized/fusing.js";

export interface Field<
        Point extends FieldPoint = FieldPoint,
        ElementTypePoint extends FieldPoint = Point,
        FuseModePoint extends FieldPoint = Point
    > {
    interpolationType: FieldInterpolationType<Point>

    elementType: FieldPointType<ElementTypePoint>

    fuseMode: FuseMode<FuseModePoint>

    distance(x: Point, y: Point): number
}