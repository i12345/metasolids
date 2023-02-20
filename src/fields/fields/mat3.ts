import { Mat3 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Mat3InterpolationType } from "../interpolators/mat3.js";

export class Mat3Field implements Field<Mat3> {
    interpolationType = new Mat3InterpolationType()
}