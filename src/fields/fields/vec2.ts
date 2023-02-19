import { Vec2 } from "playcanvas-extended";
import { Field } from "../field";
import { Vec2InterpolationType } from "../interpolators";

export class Vec2Field implements Field<Vec2> {
    interpolationType = new Vec2InterpolationType()
}