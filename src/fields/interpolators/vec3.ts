import { Vec3 } from "playcanvas-physics-advanced";
import { InterpolationManager } from "../interpolation.js";
import { SplineInterpolationType } from "./spline.js";

export class Vec3InterpolationType extends SplineInterpolationType<Vec3> {
    constructor() {
        super(Vec3)
    }

    static {
        InterpolationManager.register(new this())
    }
}