import { Vec3 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Vec3InterpolationType } from "../interpolators/vec3.js";

export class Vec3Field implements Field<Vec3> {
    interpolationType = new Vec3InterpolationType()
}