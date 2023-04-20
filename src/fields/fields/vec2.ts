import { Vec2 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Vec2InterpolationType } from "../interpolators/vec2.js";
import { ScalarField } from "./scalar.js";

export class Vec2Field implements Field<Vec2> {
    readonly interpolationType = new Vec2InterpolationType()

    constructor(
        public range: [min: Vec2, max: Vec2] = [
            new Vec2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
            new Vec2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
        ]
    ) { }

    distance(x: Vec2, y: Vec2): number {
        return Math.sqrt(
            (ScalarField.distance(x.x, y.x, [this.range[0].x, this.range[1].x]) ** 2) +
            (ScalarField.distance(x.y, y.y, [this.range[0].y, this.range[1].y]) ** 2)
        )
    }
}