import { Vec4 } from "playcanvas-physics-advanced";
import { InterpolationManager } from "../interpolation.js";
import { SplineInterpolationType } from "./spline.js";

export class Vec4InterpolationType extends SplineInterpolationType<Vec4> {
    constructor() {
        super(Vec4)
    }

    static {
        InterpolationManager.register(new this())
    }
}