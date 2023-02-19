import { Field } from "../field";
import { VectorInterpolationType } from "../interpolators";
import { Vector } from "../point";

export class VectorField implements Field<Vector> {
    interpolationType = new VectorInterpolationType()
}