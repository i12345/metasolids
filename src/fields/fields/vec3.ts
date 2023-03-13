import { Vec3 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Vec3InterpolationType } from "../interpolators/vec3.js";

export class Vec3Field implements Field<Vec3> {
    readonly interpolationType = new Vec3InterpolationType()

    constructor(
        public range: [min: Vec3, max: Vec3] = [
            new Vec3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
            new Vec3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
        ]
    ) { }
}