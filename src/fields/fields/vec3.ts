import { Vec3 } from "playcanvas-extended";
import { Field } from "../field";
import { Vec3InterpolationType } from "../interpolators";

export class Vec3Field implements Field<Vec3> {
    interpolationType = new Vec3InterpolationType()
}