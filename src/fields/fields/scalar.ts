import { Field } from "../field.js";
import { ScalarInterpolationType } from "../interpolators/scalar.js";

export class ScalarField implements Field<number> {
    readonly interpolationType = new ScalarInterpolationType()

    constructor(
        public range: [min: number, max: number] = [
            Number.NEGATIVE_INFINITY,
            Number.POSITIVE_INFINITY
        ]
    ) { }
}