import { Vec4 } from "playcanvas-extended";
import { Field } from "../field";
import { Vec4InterpolationType } from "../interpolators";

export class Vec4Field implements Field<Vec4> {
    interpolationType = new Vec4InterpolationType()
}