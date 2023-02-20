import { CurveSet } from "playcanvas-extended";
import { applyCurveConfig, CurveConfig, defaultCurveConfig } from "../curve.js";
import { FieldInterpolationType, FieldInterpolator, InterpolationManager, makeInterpolator } from "../interpolation.js";
import { FieldPoint, Vector } from "../point.js";

export class VectorInterpolationType implements FieldInterpolationType<Vector> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }

    [makeInterpolator]<Location extends FieldPoint>(keypoints: [Location, Vector][]): FieldInterpolator<Location, Vector> {
        if (typeof keypoints[0][0] !== 'number')
            throw new Error("only supports scalar interpolation locations")
        
        if (!(keypoints[0][1] instanceof Array ||
            keypoints[0][1] instanceof Uint8Array ||
            keypoints[0][1] instanceof Uint8ClampedArray ||
            keypoints[0][1] instanceof Int8Array ||
            keypoints[0][1] instanceof Uint16Array ||
            keypoints[0][1] instanceof Int16Array ||
            keypoints[0][1] instanceof Uint32Array ||
            keypoints[0][1] instanceof Int32Array ||
            keypoints[0][1] instanceof Float32Array ||
            keypoints[0][1] instanceof Float64Array))
            return undefined
        
        const curves = new CurveSet(
            (keypoints[0][1] as number[]).map((_, i) =>
                keypoints.flatMap(([t, vector]) => [t as number, vector[i]] as [number, number])
            ))

        curves.type = this.curveConfig.type
        curves.curves.forEach(curve => applyCurveConfig(curve, this.curveConfig))
        
        return location => {
            const result = new Float64Array(keypoints[0][1].length)
            curves.value(location as number, result as any as number[])
            return result
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}