import { Sign } from "../../utils/sign.js";
import { Field } from "../field.js";
import { ConstantInterpolationType } from "../interpolators/constant.js";
import { FuseMode, fuseModes } from "../vectorized/index.js";

export class SignField implements Field<Sign> {
    interpolationType = new ConstantInterpolationType<Sign>()

    readonly elementType = Number

    constructor(public readonly fuseMode: FuseMode<Sign>) { }

    distance(x: Sign, y: Sign): number {
        return x === y ? 0 : 1
    }

    static readonly instance = new this(<FuseMode<Sign>>fuseModes.ConcatPrimitiveFuseMode.instance)
}