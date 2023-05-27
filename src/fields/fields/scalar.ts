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

    distance(x: number, y: number): number {
        return ScalarField.distance(x, y, this.range)
    }

    static wrap(x: number, range: [min: number, max: number]) {
        if (x >= range[0] && x < range[1])
            return x
        
        const range_d = range[1] - range[0]
        
        return range[0] + ((((x - range[0]) % range_d) + range_d) % range_d)
    }

    static distance(x: number, y: number, range: [min: number, max: number]) {
        x = this.wrap(x, range)
        y = this.wrap(y, range)

        if (range[0] !== Number.NEGATIVE_INFINITY ||
            range[1] !== Number.POSITIVE_INFINITY) {
            if (x > y) {
                const tmp = y
                y = x
                x = tmp
            }
            
            // x <= y
            
            const directDistance = y - x
            const indirectDistance = (x - range[0]) + (range[1] - y)

            return Math.min(directDistance, indirectDistance)
        }
        else return Math.abs(x - y)
    }

    static readonly instance = new this()
}