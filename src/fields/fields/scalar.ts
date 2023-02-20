import { Field } from "../field.js";
import { ScalarInterpolationType } from "../interpolators/scalar.js";

export class ScalarField implements Field<number> {
    interpolationType = new ScalarInterpolationType()
}