import { Quat } from "playcanvas-physics-advanced";
import { InterpolationManager } from "../interpolation.js";
import { SplineInterpolationType } from "./spline.js";

export class QuatInterpolationType extends SplineInterpolationType<Quat> {
    constructor() {
        super(Quat)
    }

    static {
        InterpolationManager.register(new this())
    }
}