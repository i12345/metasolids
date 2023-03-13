import { Field } from "../field.js";
import { VectorInterpolationType } from "../interpolators/vector.js";
import { Vector } from "../point.js";

export class VectorField implements Field<Vector> {
    readonly interpolationType = new VectorInterpolationType()
    
    constructor(
        public range: [min: number, max: number] = [
            Number.NEGATIVE_INFINITY,
            Number.POSITIVE_INFINITY
        ]
    ) { }
}