import { Color } from "playcanvas-extended";
import { Field } from "../field.js";
import { ColorRGBAClampedCurveInterpolationType } from "../interpolators/color.js";
import { FuseMode, PrimitiveFuseMode, fuseModes } from "../vectorized/index.js";
import { clone } from "../../utils/cloneable.js";

export class ColorField implements Field<Color> {
    interpolationType = new ColorRGBAClampedCurveInterpolationType()

    readonly elementType = Color

    constructor(public readonly fuseMode: PrimitiveFuseMode<Color> = <PrimitiveFuseMode<Color>>fuseModes.ArithmeticPrimitiveFuseMode.add) { }

    distance(x: Color, y: Color): number {
        //TODO: use HSV
        return (
            ((x.r - y.r) ** 2) +
            ((x.g - y.g) ** 2) +
            ((x.b - y.b) ** 2) +
            ((x.a - y.a) ** 2)
        )
    }

    [clone]() {
        return this
    }

    static readonly instance = new this(<FuseMode<Color>>fuseModes.ArithmeticPrimitiveFuseMode.add)
}