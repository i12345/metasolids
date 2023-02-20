import { Field } from "../field.js";
import { VectorInterpolationType } from "../interpolators/vector.js";
import { Vector } from "../point.js";

export class VectorField implements Field<Vector> {
    interpolationType = new VectorInterpolationType()
}