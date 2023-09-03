import { Curve, CURVE_LINEAR, CURVE_SMOOTHSTEP, CURVE_SPLINE, CURVE_STEP, CurveSet, Vec3 } from "playcanvas-extended";
import { field_point_identity, field_point_invalid, field_point_map, FieldPoint, FieldPointMapped, FieldPointNumbers, FieldsPoint } from "./point.js";
import { LeafInterface, makeExtractor, makeIntractor } from "../paradigm/trees/tree.js";

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

export class InterpolableFieldsCurve<Point extends FieldPoint = FieldPoint> {
    private readonly curves_intractors: LeafInterface<number>["set"][]
    private readonly curves: CurveSet

    constructor(
        //TODO: work with vectorized field points
        public readonly keypoints: [number, Point][],
        public readonly type: CurveType = CURVE_SPLINE,
        public readonly tension: number = 0.5
    ) {
        const arrays_intractors = new Array<{ array: Float64Array, intract: LeafInterface<number>["set"] }>()

        field_point_map(
            keypoints[0][1] as unknown as FieldPointMapped<FieldPointNumbers<Point>, number>,
            leaf => typeof leaf === 'number',
            (_, path) => {
                const get = makeExtractor<number>(path)
                const set = makeIntractor<number>(path)

                const array = new Float64Array(2 * keypoints.length)
                for (let i = 0; i < keypoints.length; i++){
                    array[(2 * i) + 0] = keypoints[i][0]
                    array[(2 * i) + 1] = get(keypoints[i][1])
                }

                arrays_intractors.push({
                    array,
                    intract: set
                })
            }
        )

        this.curves = new CurveSet(arrays_intractors.map(({ array }) => array))
        this.curves.type = this.type
        this.curves.curves.forEach(curve => curve.tension = tension)
        this.curves_intractors = arrays_intractors.map(({ intract }) => intract)
    }

    valueAt(t: number): Point {
        const values = new Float64Array(this.curves_intractors.length)
        this.curves.value(t, values as unknown as number[])

        if (typeof this.keypoints[0][1] === 'number')
            return values[0] as Point

        const result = field_point_invalid(this.keypoints[0][1])
        for (let i = 0; i < values.length; i++)
            this.curves_intractors[i](result, values[i])

        return result
    }
}