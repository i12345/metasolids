import { Mat4 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Mat4InterpolationType } from "../interpolators/mat4.js";

export class Mat4Field implements Field<Mat4> {
    interpolationType = new Mat4InterpolationType()
}