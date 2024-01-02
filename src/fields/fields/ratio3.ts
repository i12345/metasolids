import { Vec3 } from "playcanvas-physics-advanced";
import { Field } from "../field.js";
import { Ratio3InterpolationType } from "../interpolators/ratio3.js";
import { FuseMode, PrimitiveFuseMode, fuseModes } from "../vectorized/index.js";
import { clone } from "../../utils/cloneable.js";

export class Ratio3Field implements Field<Vec3> {
    readonly interpolationType = new Ratio3InterpolationType()

    readonly elementType = Vec3

    constructor(public readonly fuseMode: PrimitiveFuseMode<Vec3> = <PrimitiveFuseMode<Vec3>>fuseModes.ArithmeticPrimitiveFuseMode.multiply) { }

    distance(x: Vec3, y: Vec3): number {
        return (
            Math.log(x.x / y.x) +
            Math.log(x.y / y.y) +
            Math.log(x.z / y.z)
        )
    }

    [clone]() {
        return this
    }

    static readonly instance = new this(<FuseMode<Vec3>>fuseModes.ArithmeticPrimitiveFuseMode.multiply)
}