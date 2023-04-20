import { Field } from "../field.js";
import { VectorInterpolationType } from "../interpolators/vector.js";
import { Vector } from "../point.js";
import { ScalarField } from "./scalar.js";

export class VectorField implements Field<Vector> {
    readonly interpolationType = new VectorInterpolationType()
    
    constructor(
        public range: [min: number, max: number] = [
            Number.NEGATIVE_INFINITY,
            Number.POSITIVE_INFINITY
        ]
    ) { }

    distance(x: Vector, y: Vector): number {
        const n = x.length
        console.assert(x.length === y.length)

        let distance = 0
        for (let i = 0; i < n; i++)
            distance += ScalarField.distance(x[i], y[i], this.range)
        
        return distance
    }
}