import { Mat3, Mat4 } from "playcanvas-extended";
import { Field } from "../field.js";
import { Mat3InterpolationType } from "../interpolators/mat3.js";
import { mat4_from_mat3, trs } from "../../utils/matrix.js";
import { QuatField } from "./quat.js";
import { Ratio3Field } from "./ratio3.js";
import { Mat4Field } from "./mat4.js";

export class Mat3Field implements Field<Mat3> {
    interpolationType = new Mat3InterpolationType()

    distance(x: Mat3, y: Mat3): number {
        const trs_x = trs(mat4_from_mat3(x))
        const trs_y = trs(mat4_from_mat3(y))

        return (
            Mat4Field.fields.rotation.distance(trs_x.r, trs_y.r) +
            Mat4Field.fields.scale.distance(trs_x.s, trs_y.s)
        )
    }
}