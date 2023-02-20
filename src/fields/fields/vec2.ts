import { Vec2 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Vec2InterpolationType } from "../interpolators/vec2.js";

export class Vec2Field implements Field<Vec2> {
    interpolationType = new Vec2InterpolationType()
}