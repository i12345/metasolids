import { Quat } from "playcanvas-physics-advanced";
import { Field } from "../field.js";
import { QuatInterpolationType } from "../interpolators/quat.js";
import { FuseMode, PrimitiveFuseMode, fuseModes } from "../vectorized/index.js";
import { clone } from "../../utils/cloneable.js";

export class QuatField implements Field<Quat> {
    interpolationType = new QuatInterpolationType()

    readonly elementType = Quat

    constructor(public readonly fuseMode: PrimitiveFuseMode<Quat> = <PrimitiveFuseMode<Quat>>fuseModes.ArithmeticPrimitiveFuseMode.multiply) { }

    distance(x: Quat, y: Quat): number {
        return x.distance(y)
    }

    [clone]() {
        return this
    }

    static readonly instance = new this(<FuseMode<Quat>>fuseModes.ArithmeticPrimitiveFuseMode.multiply)
}