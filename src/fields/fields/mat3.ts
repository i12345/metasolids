import { Mat3 } from "playcanvas-extended";
import { Field } from "../field";
import { Mat3InterpolationType } from "../interpolators";

export class Mat3Field implements Field<Mat3> {
    interpolationType = new Mat3InterpolationType()
}