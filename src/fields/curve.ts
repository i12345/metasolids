import { Curve, CURVE_LINEAR, CURVE_SMOOTHSTEP, CURVE_SPLINE, CURVE_STEP } from "playcanvas-extended";

export type CurveType =
    typeof CURVE_LINEAR |
    typeof CURVE_SMOOTHSTEP |
    typeof CURVE_SPLINE |
    typeof CURVE_STEP

export interface CurveConfig {
    type: CurveType
    tension: number
    closed?: boolean
}

export const defaultCurveConfig = (): CurveConfig => ({
    type: CURVE_SPLINE,
    tension: 0.5
})

export function applyCurveConfig(curve: Curve, config: CurveConfig): void {
    curve.type = config.type
    curve.tension = config.tension
}