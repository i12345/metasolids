import { Mat4 } from "playcanvas-extended";
import { Field } from "../field";
import { Mat4InterpolationType } from "../interpolators";

export class Mat4Field implements Field<Mat4> {
    interpolationType = new Mat4InterpolationType()
}