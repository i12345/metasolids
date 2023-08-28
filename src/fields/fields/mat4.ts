import { Mat4 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Mat4InterpolationType } from "../interpolators/mat4.js";
import { trs } from "../../utils/matrix.js";
import { Vec3Field } from "./vec3.js";
import { QuatField } from "./quat.js";
import { Ratio3Field } from "./ratio3.js";
import { FuseMode, PrimitiveFuseMode, fuseModes } from "../vectorized/index.js";

export class Mat4Field implements Field<Mat4> {
    interpolationType = new Mat4InterpolationType()

    readonly elementType = Mat4

    constructor(public readonly fuseMode: PrimitiveFuseMode<Mat4>) { }

    distance(x: Mat4, y: Mat4): number {
        const trs_x = trs(x)
        const trs_y = trs(y)

        return (
            Mat4Field.fields.translation.distance(trs_x.t, trs_y.t) +
            Mat4Field.fields.rotation.distance(trs_x.r, trs_y.r) +
            Mat4Field.fields.scale.distance(trs_x.s, trs_y.s)
        )
    }

    static readonly fields = {
        translation: Vec3Field.instance,
        rotation: QuatField.instance,
        scale: Ratio3Field.instance
    }

    static readonly instance = new this(<FuseMode<Mat4>>fuseModes.ArithmeticPrimitiveFuseMode.multiply)
}