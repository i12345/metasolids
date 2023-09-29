import { InterpolationManager } from "../interpolation.js";
import { SplineInterpolationType } from "./spline.js";

export class ScalarInterpolationType extends SplineInterpolationType<number> {
    constructor() {
        super(Number)
    }

    static {
        InterpolationManager.register(new this())
    }
}