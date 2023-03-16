import { FieldPoint, field_point_add_inplace_weighted, field_point_identity, field_point_path } from "../point.js";
import { FieldInterpolationType, Interpolator, makeInterpolator } from "../interpolation.js";
import { Vec2 } from "playcanvas-extended";
import { makeExtractor } from "../../utils/tree.js";

// based on paper "Generalized Barycentric Coordinates on Irregular Polygons"
// by Mark Meyer, Haeyoung Lee, Alan Barr, and Mathieu Desbrun from Caltech & USC
// http://geometry.caltech.edu/pubs/MHBD02.pdf

function cotangent(a: Vec2, b: Vec2, c: Vec2, bc: Vec2) {
    // adapted for 2D

    const ba_x = b.x - a.x
    const ba_y = b.y - a.y

    const bc_dot_ba = (bc.x * ba_x) + (bc.y * ba_y)
    const bc_cross_ba = Math.abs((bc.x * ba_y) - (bc.y * ba_x))

    return bc_dot_ba / bc_cross_ba
}

export class ConvexPolygonInterpolationType<Point extends FieldPoint = FieldPoint>
    implements FieldInterpolationType<Point> {
    [makeInterpolator]<Location extends FieldPoint>(keypoints: [Location, Point][]): Interpolator<Location, Point> {
        const path_vec2 = field_point_path(keypoints[0][0], location => location instanceof Vec2)
        const extractor = makeExtractor<Vec2>(path_vec2)
        const q = keypoints.map(([location]) => extractor(location))
        const q_q_prev = q.map((q_i, i) => new Vec2().sub2(q[(i - 1 + q.length) % q.length], q_i))
        const q_q_next = q.map((q_i, i) => new Vec2().sub2(q[(i + 1) % q.length], q_i))
        
        const samples = keypoints.map(([_, sample]) => sample)

        return (location: Location) => {
            const p = extractor(location)

            let weightSum = 0
            const weights = new Float64Array(q.length)
            for (let i = 0; i < q.length; i++) {
                const q_i = q[i]
                const q_prev = q[(i - 1 + q.length) % q.length]
                const q_next = q[(i + 1) % q.length]
                const p_q_dist_sq = ((p.x - q_i.x) ** 2) + ((p.y - q_i.y) ** 2)
                weights[i] = (cotangent(p, q_i, q_prev, q_q_prev[i]) + cotangent(p, q_i, q_next, q_q_next[i])) / p_q_dist_sq
                weightSum += weights[i]
            }

            let result = field_point_identity(samples[0])
            for (let i = 0; i < weights.length; i++) {
                result = field_point_add_inplace_weighted(
                    result,
                    samples[i],
                    weights[i] / weightSum
                )
            }
            
            return result
        }
    }
}