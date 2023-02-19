import { Sign } from "../../utils";
import { Field } from "../field";
import { ConstantInterpolationType } from "../interpolators";

export class SignField implements Field<Sign> {
    interpolationType = new ConstantInterpolationType<Sign>()
}