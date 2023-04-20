import { Vec4 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Vec4InterpolationType } from "../interpolators/vec4.js";
import { ScalarField } from "./scalar.js";

export class Vec4Field implements Field<Vec4> {
    readonly interpolationType = new Vec4InterpolationType()
    
    constructor(
        public range: [min: Vec4, max: Vec4] = [
            new Vec4(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
            new Vec4(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
        ]
    ) { }
    
    distance(x: Vec4, y: Vec4): number {
        return Math.sqrt(
            (ScalarField.distance(x.x, y.x, [this.range[0].x, this.range[1].x]) ** 2) +
            (ScalarField.distance(x.y, y.y, [this.range[0].y, this.range[1].y]) ** 2) +
            (ScalarField.distance(x.z, y.z, [this.range[0].z, this.range[1].z]) ** 2) +
            (ScalarField.distance(x.w, y.w, [this.range[0].w, this.range[1].w]) ** 2)
        )
    }
}