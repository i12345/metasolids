import { FieldPoint, field_point_add_inplace_weighted, field_point_clone, field_point_identity, field_point_invalid, field_point_path } from "../point.js";
import { FieldInterpolationKeypoint, FieldInterpolationType, InterpolationManager, Interpolator, makeInterpolator } from "../interpolation.js";
import { Vec2 } from "playcanvas-physics-advanced";
import { makeExtractor } from "../../paradigm/trees/index.js";
import { Triangles2DMesh, Triangles2DMeshCollider } from "../triangle-2D-mesh/index.js";
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
    [makeInterpolator]<Location extends FieldPoint>(keypoints: FieldInterpolationKeypoint<Location, Point>[]): Interpolator<Location, Point> | undefined {
        const path_vec2 = field_point_path(keypoints[0].location, location => location instanceof Vec2)
        if(!path_vec2) return undefined

        const extractor = makeExtractor<Vec2>(path_vec2)
        const q = keypoints.map(({ location }) => extractor(location))

        const center = findPolygonCenter(q)
        const order = findPolygonOrder(q, center)
        reorder(q, order)

        if(!isConvexPolygon(q, center)) return undefined

        const n = q.length

        const q_q_prev = q.map((q_i, i) => new Vec2().sub2(q[(i - 1 + n) % n], q_i))
        const q_q_next = q.map((q_i, i) => new Vec2().sub2(q[(i + 1) % n], q_i))
        const q_q_next_length_sq = q_q_next.map(vector => vector.lengthSq())

        const samples = order.map(i => keypoints[i].value)

        const triangles = new Uint16Array(3 * (n - 2))
        for (let i = 2; i < n; i++) {
            triangles[(3 * (i - 2)) + 0] = 0
            triangles[(3 * (i - 2)) + 1] = i - 1
            triangles[(3 * (i - 2)) + 2] = i
        }

        const q_data = new Float64Array(2 * q.length)
        for (let i = 0; i < q.length; i++) {
            q_data[(2 * i) + 0] = q[i].x
            q_data[(2 * i) + 1] = q[i].y
        }

        const collider = new Triangles2DMeshCollider(Triangles2DMesh.build(q_data, triangles), 1)
        const invalid = field_point_invalid(samples[0])

        return (location: Location) => {
            const p = extractor(location)
            const inside = undefined !== collider.collision_first(p)
            if (!inside)
                return invalid

            let weightSum = 0
            const weights = new Float64Array(n)

            const p_line = new Vec2()
            for (let i = 0; i < n; i++) {
                const q_i = q[i]
                const q_q_next_i = q_q_next[(i + 1) % n]

                p_line.sub2(p, q_i)
                const p_line_t = p_line.dot(q_q_next_i) / q_q_next_length_sq[i]
                if (p_line_t >= 0 && p_line_t <= 1) {
                    p_line.copy(q_q_next_i).mulScalar(p_line_t)

                    const rejection_sq = p_line.sub(p).lengthSq()
                    if (rejection_sq < 1e-6) {
                        let result = field_point_clone(samples[i])
                        result = field_point_add_inplace_weighted(result, samples[(i + 1) % n], p_line_t)
                        return result
                    }
                }
            }

            for (let i = 0; i < n; i++) {
                const q_i = q[i]
                const q_prev = q[(i - 1 + n) % n]
                const q_next = q[(i + 1) % n]
                const p_q_dist_sq = ((p.x - q_i.x) ** 2) + ((p.y - q_i.y) ** 2)

                const weight = (cotangent(p, q_i, q_prev, q_q_prev[i]) + cotangent(p, q_i, q_next, q_q_next[i])) / p_q_dist_sq
                if (!isFinite(weight))
                    return invalid
                weights[i] = weight
                weightSum += weight
            }

            let result = field_point_identity(samples[0])
            for (let i = 0; i < n; i++) {
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

function findPolygonCenter(polygon: Vec2[]) {
    const mean = new Vec2()
    for (const p of polygon)
        mean.add(p)
    mean.divScalar(polygon.length)
    return mean
}

function findPolygonOrder(polygon: Vec2[], center: Vec2) {
    const i_theta = polygon.map((p, i) => {
        const dx = p.x - center.x
        const dy = p.y - center.y
        return { i, theta: Math.atan2(dy, dx) }
    })

    i_theta.sort((a, b) => a.theta - b.theta)
    return i_theta.map(({ i }) => i)
}

function reorder<T>(arr: T[], order: number[]): void {
    const items = [...arr]
    for (const i in order)
        arr[order[i]] = items[i]
}

function isConvexPolygon(polygon: Vec2[], center: Vec2): boolean {
    const
        rA = new Vec2(),
        rB = new Vec2(),
        rC = new Vec2()

    let t0AB_times_2: number,
        t0BC_times_2: number,
        tABC_times_2: number,
        t0AC_times_2: number

    for (let i = 0; i < polygon.length; i++) {
        rA.sub2(polygon.at(i + 0)!, center)
        rB.sub2(polygon.at(i + 1)!, center)
        rC.sub2(polygon.at(i + 2)!, center)
        t0AB_times_2 = (rA.x * rB.y) - (rA.y * rB.x)
        t0BC_times_2 = (rB.x * rC.y) - (rB.y * rC.x)
        t0AC_times_2 = (rA.x * rC.y) - (rA.y * rC.x)
        rA.sub(rB)
        rC.sub(rB)
        tABC_times_2 = (rA.x * rC.y) - (rA.y * rC.x)

        if ((tABC_times_2 + t0AC_times_2) - (t0AB_times_2 + t0BC_times_2) > 0.001)
            return false
    }

    return true
}