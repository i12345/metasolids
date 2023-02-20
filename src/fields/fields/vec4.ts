import { Vec4 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Vec4InterpolationType } from "../interpolators/vec4.js";

export class Vec4Field implements Field<Vec4> {
    interpolationType = new Vec4InterpolationType()
}