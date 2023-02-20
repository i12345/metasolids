import { Quat } from "playcanvas-extended";
import { Field } from "../field.js";
import { QuatInterpolationType } from "../interpolators/quat.js";

export class QuatField implements Field<Quat> {
    interpolationType = new QuatInterpolationType()
}