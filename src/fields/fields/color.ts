import { Color } from "playcanvas-extended";
import { Field } from "../field";
import { ColorRGBAClampedCurveInterpolationType } from "../interpolators";

export class ColorField implements Field<Color> {
    interpolationType = new ColorRGBAClampedCurveInterpolationType()
}