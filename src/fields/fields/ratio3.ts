import { Vec3 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Ratio3InterpolationType } from "../interpolators/ratio3.js";

export class Ratio3Field implements Field<Vec3> {
    readonly interpolationType = new Ratio3InterpolationType()

    constructor() { }

    distance(x: Vec3, y: Vec3): number {
        return (
            Math.log(x.x / y.x) +
            Math.log(x.y / y.y) +
            Math.log(x.z / y.z)
        )
    }

    static readonly instance = new this()
}