import { Vec3 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Vec3InterpolationType } from "../interpolators/vec3.js";
import { ScalarField } from "./scalar.js";
import { PrimitiveFuseMode } from "../vectorized/index.js";
import { ArithmeticPrimitiveFuseMode } from "../vectorized/fuse-modes/index.js";
import { clone } from "../../utils/cloneable.js";

export class Vec3Field implements Field<Vec3> {
    readonly interpolationType = new Vec3InterpolationType()

    readonly elementType = Vec3

    constructor(
        public readonly fuseMode: PrimitiveFuseMode<Vec3> = <ArithmeticPrimitiveFuseMode<Vec3>>ArithmeticPrimitiveFuseMode.add,
        public readonly range: [min: Vec3, max: Vec3] = [
            new Vec3(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY),
            new Vec3(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)
        ]
    ) { }

    distance(x: Vec3, y: Vec3): number {
        return Math.sqrt(
            (ScalarField.distance(x.x, y.x, [this.range[0].x, this.range[1].x]) ** 2) +
            (ScalarField.distance(x.y, y.y, [this.range[0].y, this.range[1].y]) ** 2) +
            (ScalarField.distance(x.z, y.z, [this.range[0].z, this.range[1].z]) ** 2)
        )
    }

    [clone]() {
        return this
    }

    static readonly instance = new this(<ArithmeticPrimitiveFuseMode<Vec3>>ArithmeticPrimitiveFuseMode.add)
}