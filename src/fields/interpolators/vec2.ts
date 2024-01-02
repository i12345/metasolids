import { Vec2 } from "playcanvas-physics-advanced";
import { InterpolationManager } from "../interpolation.js";
import { SplineInterpolationType } from "./spline.js";

export class Vec2InterpolationType extends SplineInterpolationType<Vec2> {
    constructor() {
        super(Vec2)
    }

    static {
        InterpolationManager.register(new this())
    }
}