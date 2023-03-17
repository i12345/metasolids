import { FieldPoint, field_point_add_inplace_weighted, field_point_identity, field_point_path } from "../point.js";
import { FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation.js";
import { Vec2 } from "playcanvas-extended";
import { makeExtractor } from "../../utils/tree.js";
import { Triangles2DMesh, Triangles2DMeshCollider } from "../triangles-2D-mesh.js";
import { Pi, TwoPi } from "../../utils/pi.js";

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
        if(!path_vec2) return undefined

        const extractor = makeExtractor<Vec2>(path_vec2)
        const q = keypoints.map(([location]) => extractor(location))

        if(!isConvexPolygon(q)) return undefined

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

    static {
        InterpolationManager.register(new this())
    }
}

function isConvexPolygon(polygon: Vec2[]): boolean {
    // translated from Rory Daulton's answer to the question
    // "How do I efficiently determine if a polygon is convex, non-convex or complex?"
    // https://stackoverflow.com/a/45372025

    /**
    Return True if the polynomial defined by the sequence of 2D
    points is 'strictly convex': points are valid, side lengths non-
    zero, interior angles are strictly between zero and a straight
    angle, and the polygon does not intersect itself.

    NOTES:  1.  Algorithm: the signed changes of the direction angles
                from one side to the next side must be all positive or
                all negative, and their sum must equal plus-or-minus
                one full turn (2 pi radians). Also check for too few,
                invalid, or repeated points.
            2.  No check is explicitly done for zero internal angles
                (180 degree direction-change angle) as this is covered
                in other ways, including the `n < 3` check.
     */
    
    // Check for too few points
    if (polygon.length < 3)
        return false
    // Get starting information
    let { x: old_x, y: old_y } = polygon.at(-2)
    let { x: new_x, y: new_y } = polygon.at(-1)
    let old_direction: number
    let new_direction = Math.atan2(new_y - old_y, new_x - old_x)
    let angle_sum = 0.0
    // Check each point (the side ending there, its angle) and accum. angles
    let orientation: number
    for (const [ndx, newpoint] of polygon.entries()) {
        // Update point coordinates and side directions, check side length
        [old_x, old_y, old_direction] = [new_x, new_y, new_direction];
        new_x = newpoint.x
        new_y = newpoint.y
        new_direction = Math.atan2(new_y - old_y, new_x - old_x)
        if (old_x == new_x && old_y == new_y)
            return false  // repeated consecutive points
        // Calculate & check the normalized direction - change angle
        let angle = new_direction - old_direction
        if (angle <= -Pi)
            angle += TwoPi  // make it in half - open interval(-Pi, Pi]
        else if(angle > Pi)
            angle -= TwoPi
        if (ndx == 0) { // if first time through loop, initialize orientation
            if (angle == 0.0)
                return false
            orientation = (angle > 0.0) ? 1.0 : -1.0
        }
        else {  // if other time through loop, check orientation is stable
            if (orientation * angle <= 0.0)  // not both pos.or both neg.
                return false
        }
        // Accumulate the direction - change angle
        angle_sum += angle
    }
    // Check that the total number of full turns is plus-or-minus 1
    return Math.abs(Math.round(angle_sum / TwoPi)) == 1
}