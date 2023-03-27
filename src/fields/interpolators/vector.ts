import { CurveSet } from "playcanvas-extended";
import { applyCurveConfig, CurveConfig, defaultCurveConfig } from "../curve.js";
import { FieldInterpolationKeypoint, FieldInterpolationType, FieldInterpolator, InterpolationManager, makeInterpolator } from "../interpolation.js";
import { FieldPoint, Vector } from "../point.js";

export class VectorInterpolationType implements FieldInterpolationType<Vector> {
    constructor(
        public curveConfig: CurveConfig = defaultCurveConfig()
    ) { }

    [makeInterpolator]<Location extends FieldPoint>(keypoints: FieldInterpolationKeypoint<Location, Vector>[]): FieldInterpolator<Location, Vector> {
        const template = keypoints[0].value
        const n = template.length
        const k = keypoints.length

        if (!(template instanceof Array ||
            template instanceof Uint8Array ||
            template instanceof Uint8ClampedArray ||
            template instanceof Int8Array ||
            template instanceof Uint16Array ||
            template instanceof Int16Array ||
            template instanceof Uint32Array ||
            template instanceof Int32Array ||
            template instanceof Float32Array ||
            template instanceof Float64Array))
            return undefined
        
        if (typeof keypoints[0].location !== 'number')
            throw new Error("only supports scalar interpolation locations")
        
        const data = new Array<Float64Array>(n)
        for (let i = 0; i < n; i++) {
            const data_i = data[i] = new Float64Array(2 * k)
            for (let j = 0; j < k; j++) {
                data_i[(2 * j) + 0] = keypoints[j].location as number
                data_i[(2 * j) + 1] = keypoints[j].value[i]
            }
        }
        
        const curves = new CurveSet(data)

        curves.type = this.curveConfig.type
        curves.curves.forEach(curve => applyCurveConfig(curve, this.curveConfig))
        
        return location => {
            const result = new Float64Array(n)
            curves.value(location as number, result as any as number[])
            return result
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}