import { Color } from "playcanvas-extended";
import { Field } from "../field.js";
import { ColorRGBAClampedCurveInterpolationType } from "../interpolators/color.js";

export class ColorField implements Field<Color> {
    interpolationType = new ColorRGBAClampedCurveInterpolationType()
}