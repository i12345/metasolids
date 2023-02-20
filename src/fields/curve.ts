import { Curve, CURVE_LINEAR, CURVE_SMOOTHSTEP, CURVE_SPLINE, CURVE_STEP, Vec3 } from "playcanvas-extended";
// import { InterpolableFieldsPoint } from "./fields-sample.js";
// import { FieldPoint } from "./point.js";

export type CurveType =
    typeof CURVE_LINEAR | 
    typeof CURVE_SMOOTHSTEP | 
    typeof CURVE_SPLINE | 
    typeof CURVE_STEP

export interface CurveConfig {
    type: CurveType
    tension: number
}

export const defaultCurveConfig = (): CurveConfig => ({
    type: CURVE_SPLINE,
    tension: 0.5
})

export function applyCurveConfig(curve: Curve, config: CurveConfig): void {
    curve.type = config.type
    curve.tension = config.tension
}

// export class InterpolableFieldsCurve<Point extends FieldPoint = FieldPoint> {
//     private curves: { [field in keyof FieldsPoint]: Curve }

//     constructor(
//         public readonly keypoints: [number, FieldsPoint][],
//         public type: CurveType = CURVE_SPLINE,
//         public tension: number = 0.5
//     ) {
//         this.curves = {
//             x: new Curve(points.map(([t, point]) => [t, point.x]).flat()),
//             y: new Curve(points.map(([t, point]) => [t, point.y]).flat()),
//             z: new Curve(points.map(([t, point]) => [t, point.z]).flat())
//         }

//         this.curves.x.tension = tension
//         this.curves.x.tension = tension
//         this.curves.x.tension = tension
//     }

//     valueAt(t: number): FieldsPoint {

//     }
// }
export { }