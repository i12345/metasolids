import { Sign } from "../../utils/sign.js";
import { Field } from "../field.js";
import { ConstantInterpolationType } from "../interpolators/constant.js";

export class SignField implements Field<Sign> {
    interpolationType = new ConstantInterpolationType<Sign>()

    distance(x: Sign, y: Sign): number {
        return x === y ? 0 : 1
    }
}