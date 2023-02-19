import { Field } from "../field";
import { ScalarInterpolationType } from "../interpolators";

export class ScalarField implements Field<number> {
    interpolationType = new ScalarInterpolationType()
}