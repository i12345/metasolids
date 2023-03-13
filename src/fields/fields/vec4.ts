import { Vec4 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Vec4InterpolationType } from "../interpolators/vec4.js";

export class Vec4Field implements Field<Vec4> {
    readonly interpolationType = new Vec4InterpolationType()
    
    constructor(
        public range: [min: Vec4, max: Vec4] = [
            new Vec4(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
            new Vec4(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
        ]
    ) { }
}