import { Quat } from "playcanvas-extended";
import { Field } from "../field";
import { QuatInterpolationType } from "../interpolators";

export class QuatField implements Field<Quat> {
    interpolationType = new QuatInterpolationType()
}