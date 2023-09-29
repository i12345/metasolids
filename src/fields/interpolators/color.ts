import { Color } from "playcanvas-extended";
import { InterpolationManager } from "../interpolation.js";
import { SplineInterpolationType } from "./spline.js";

export class ColorRGBAInterpolationType extends SplineInterpolationType<Color> {
    constructor() {
        super(Color)
    }

    static {
        InterpolationManager.register(new this())
    }
}