import { Color } from "playcanvas-extended";
import { Field } from "../field.js";
import { ColorRGBAClampedCurveInterpolationType } from "../interpolators/color.js";

export class ColorField implements Field<Color> {
    interpolationType = new ColorRGBAClampedCurveInterpolationType()

    distance(x: Color, y: Color): number {
        //TODO: use HSV
        return (
            ((x.r - y.r) ** 2) +
            ((x.g - y.g) ** 2) +
            ((x.b - y.b) ** 2) +
            ((x.a - y.a) ** 2)
        )
    }

    static readonly instance = new this()
}