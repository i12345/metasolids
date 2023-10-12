import { Cloneable, clone } from "../../utils/cloneable.js";
import { Field } from "../field.js";
import { FieldInterpolationType } from "../interpolation.js";
import { ConstantInterpolationType } from "../interpolators/constant.js";
import { ArithmeticPrimitiveFuseMode } from "../vectorized/fuse-modes/arithmetic.js";
import { PrimitiveFuseMode } from "../vectorized/fusing.js";

export class BooleanField implements Field<boolean>, Cloneable<BooleanField> {
    readonly interpolationType: FieldInterpolationType<boolean> = new ConstantInterpolationType()
    readonly elementType = Boolean
    readonly fuseMode = <PrimitiveFuseMode<true> | PrimitiveFuseMode<false>>ArithmeticPrimitiveFuseMode.add // TODO: ReplacePrimitiveFuseMode.instance

    distance(x: boolean, y: boolean): number {
        return x === y ? 0 : 1
    }
    
    [clone]() {
        return this
    }

    private constructor() { }
    public static readonly instance = new this()
}