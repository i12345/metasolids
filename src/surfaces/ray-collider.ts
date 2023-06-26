import { Mat4, Quat, Ray, Vec2, Vec3 } from "playcanvas-extended";
import { Triangles2DMesh } from "../fields/triangles-2D-mesh.js";
import { Triangles2DMeshCollider } from "../fields/triangles-2D-mesh.js";
import { Surface, SurfaceInstance, SurfaceSample } from "./surface.js";
import { TriangleCollision } from "../fields/triangles-2D-mesh.js";
import { SurfaceProcessingContext } from "./surface-samples.js";

export interface RayCollision {
    /**
     * point of collision
     */
    p: {
        world: Vec3
        local: Vec3
    }

    /**
     * time along ray
     */
    t: number
}

export interface RayColliderProcessingContext<
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends Surface<SampleT> = Surface<SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    > {
    surface: SurfaceInstanceT
    context: SurfaceProcessingContextT
}

export interface RayCollider<
        Collision extends RayCollision = RayCollision,
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends Surface<SampleT> = Surface<SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        RayColliderProcessingContextT extends
            RayColliderProcessingContext<
                    SampleT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            RayColliderProcessingContext<
                    SampleT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                >
    > {
    init(context: RayColliderProcessingContextT): void
    sample(ray: Ray, context: RayColliderProcessingContextT): Collision | undefined
    sample_multiple(ray: Ray, context: RayColliderProcessingContextT): Collision[]
}

export interface TriangleRayCollision extends RayCollision {
    triangle: TriangleCollision
}

export interface TriangleRayColliderProcessingContext<
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends Surface<SampleT> = Surface<SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    > extends
    RayColliderProcessingContext<
            SampleT,
            SurfaceT,
            SurfaceInstanceT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
        > {
    precomputed: {
        tri_n: number
        
        v0: Float32Array
        v01: Float32Array
        v02: Float32Array

        //TODO: this may be substitutable with MeshData.normals
        n: Float32Array
    }
}

export class TriangleRayCollider<
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends Surface<SampleT> = Surface<SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        RayColliderProcessingContextT extends
            TriangleRayColliderProcessingContext<
                    SampleT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            TriangleRayColliderProcessingContext<
                    SampleT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                >
    >
    implements
    RayCollider<
        TriangleRayCollision,
        SampleT,
        SurfaceT,
        SurfaceInstanceT,
        SampleProcessingContextT,
        SurfaceProcessingContextT
    > {
    // private collider!: Triangles2DMeshCollider
    // private readonly transform = {
    //     /**
    //      * This transformation gives the mostly-projected coordinates,
    //      * from local space to 2D space. The view position is not included
    //      * since it is esaily customized.
    //      */
    //     local_to_2D: new Mat4(),

    //     world: new Mat4(),
    //     view: {
    //         direction: new Vec3()
    //     }
    // }

    // private update_transform(surface: SurfaceInstanceT, view: RayColliderProcessingContextT["view"]) {
    //     this.transform.view.direction.copy(view.direction)
    //     this.transform.view.direction.normalize()

    //     this.transform.world.copy(surface.transform)

    //     const transform_view = new Mat4().setTRS(
    //         Vec3.ZERO,
    //         new Quat().setFromDirections(Vec3.FORWARD, this.transform.view.direction),
    //         Vec3.ONE
    //     )
        
    //     transform_view.invert()

    //     this.transform.local_to_2D.mul2(transform_view, this.transform.world)
    // }

    init(context: RayColliderProcessingContextT) {
        const mesh = context.surface.shared.mesh
        const tri_n = mesh.triangles.length / 3

        context.precomputed = {
            tri_n,
            n: new Float32Array(3 * tri_n),
            v0: new Float32Array(3 * tri_n),
            v01: new Float32Array(3 * tri_n),
            v02: new Float32Array(3 * tri_n),
        }

        function saveV3(v3: Vec3, array: Float32Array, tri_i: number) {
            array[(3 * tri_i) + 0] = v3.x
            array[(3 * tri_i) + 1] = v3.y
            array[(3 * tri_i) + 2] = v3.z
        }

        const v01 = new Vec3(), v02 = new Vec3(), n = new Vec3()
        for (let tri_i = 0; tri_i < tri_n; tri_i++) {
            const v0 = mesh.vertices[mesh.triangles[(3 * tri_i) + 0]]
            const v1 = mesh.vertices[mesh.triangles[(3 * tri_i) + 1]]
            const v2 = mesh.vertices[mesh.triangles[(3 * tri_i) + 2]]

            saveV3(v0, context.precomputed.v0, tri_i)
            saveV3(v01.sub2(v1, v0), context.precomputed.v01, tri_i)
            saveV3(v02.sub2(v2, v0), context.precomputed.v02, tri_i)
            saveV3(n.cross(v01, v02), context.precomputed.n, tri_i)
        }
    }

    sample_multiple(ray: Ray, { surface, precomputed }: RayColliderProcessingContextT) {
        const collisions: TriangleRayCollision[] = []

        const v0 = new Vec3(), v01 = new Vec3(), v02 = new Vec3(), n = new Vec3()
        const w0 = new Vec3(), I = new Vec3(), w = new Vec3()

        function loadV3(v3: Vec3, array: Float32Array, tri_i: number) {
            return v3.set(
                array[(3 * tri_i) + 0],
                array[(3 * tri_i) + 1],
                array[(3 * tri_i) + 2]
            )
        }

        // adapted from http://www.geomalgorithms.com/code.html
        // "C06_Ray_Triangle_Intersection.cpp"

        // Copyright 2001, 2012, 2021 Dan Sunday
        // This code may be freely used and modified for any purpose
        // providing that this copyright notice is included with it.
        // There is no warranty for this code, and the author of it cannot
        // be held liable for any real or imagined damage from its use.
        // Users of this code must verify correctness for their application.

        // Assume that classes are already given for the objects:
        //    Point and Vector with
        //        coordinates {float x, y, z;}
        //        operators for:
        //            == to test  equality
        //            != to test  inequality
        //            (Vector)0 =  (0,0,0)        (null vector)
        //            Point  = Point ± Vector     (translation)
        //            Vector = Point - Point
        //            Vector = Scalar * Vector    (scalar product)
        //            Vector = Vector * Vector    (cross product)
        //    Line and Ray and Segment with defining  points {Point P0, P1;}
        //        A Line is infinite, Rays and  Segments start at P0.
        //        A Ray extends beyond P1, but a  Segment ends at P1.
        //    Plane with a point and a normal {Point V0; Vector n;}
        //    Triangle with defining vertices {Point V0, V1, V2;}
        //    Polyline and Polygon with n vertices {int n;  Point *V;}
        //        A Polygon has V[n]=V[0].
        //===================================================================

        // #define SMALL_NUM   0.00000001 // anything that avoids division overflow
        // dot product (3D) which allows vector operations in arguments
        // #define dot(u,v)   ((u).x * (v).x + (u).y * (v).y + (u).z * (v).z)

        // intersect3D_RayTriangle(): find the 3D intersection of a ray with a triangle
        //    Input:  a ray R, and a triangle T
        ////    Output: *I = intersection point (when it exists)
        ////    Return: -1 = triangle is degenerate (a segment or point)
        ////             0 =  disjoint (no intersect)
        ////             1 =  intersect in unique point I1
        ////             2 =  are in the same Plane

        for (let tri_i = 0; tri_i < precomputed.tri_n; tri_i++) {
            //Vector    u, v, n;              // triangle vectors
            //Vector    dir, w0, w;           // ray vectors
            //float     r, a, b;              // params to calc ray-plane intersect

            loadV3(v0, precomputed.v0, tri_i)
            loadV3(v01, precomputed.v01, tri_i)
            loadV3(v02, precomputed.v02, tri_i)
            loadV3(n, precomputed.n, tri_i)

            // get triangle edge vectors and plane normal
            // u = v01, v = v02
            // u = T.V1 - T.V0;
            // v = T.V2 - T.V0;
            // n = u * v;              // cross product
            // if (n == (Vector)0)             // triangle is degenerate
            //     return -1;                  // do not deal with this case

            // dir = R.direction
            //dir = R.P1 - R.P0;              // ray direction vector
            
            w0.sub2(ray.origin, v0)
            const a = -n.dot(w0)
            const b = n.dot(ray.direction)
            if (Math.abs(b) < 0.0001)
                continue
                
            //w0 = R.P0 - T.V0;
            // a = -dot(n,w0);
            // b = dot(n,dir);
            // if (fabs(b) < SMALL_NUM) {     // ray is  parallel to triangle plane
            //     if (a == 0)                 // ray lies in triangle plane
            //         return 2;
            //     else return 0;              // ray disjoint from plane
            // }

            // get intersect point of ray with triangle plane
            const r = a / b;
            if (r < 0.0)                    // ray goes away from triangle
                continue;                   // => no intersect
            // for a segment, also test if (r > 1.0) => no intersect

            I.copy(ray.direction).mulScalar(r).add(ray.origin)
            // * I = R.P0 + r * dir;            // intersect point of ray and plane

            // is I inside T?
            // float    uu, uv, vv, wu, wv, D;
            // uu = dot(u, u);
            // uv = dot(u, v);
            // vv = dot(v, v);
            // w = * I - T.V0;
            // wu = dot(w, u);
            // wv = dot(w, v);
            // D = uv * uv - uu * vv;
            const uu = v01.dot(v01)
            const uv = v01.dot(v02)
            const vv = v02.dot(v02)
            w.sub2(I, v0)
            const wu = w.dot(v01)
            const wv = w.dot(v02)
            const D = (uv * uv) - (uu * vv)

            // get and test parametric coords
            // float s, t;
            // s = (uv * wv - vv * wu) / D;
            // if (s < 0.0 || s > 1.0)         // I is outside T
            //     return 0;
            // t = (uv * wu - uu * wv) / D;
            // if (t < 0.0 || (s + t) > 1.0)  // I is outside T
            //     return 0;
            // return 1;                       // I is in T

            const s = (uv * wv - vv * wu) / D
            if (s < 0.0 || s > 1.0) continue
            const t = (uv * wu - uu * wv) / D
            if (t < 0.0 || (s + t) > 1.0) continue

            // this ends adapted code from "C06_Ray_Triangle_Intersection.cpp"

            collisions.push({
                p: {
                    local: w,
                    world: I
                },
                t: r,
                triangle: {
                    tri: tri_i,
                    w1: s,
                    w2: t
                }
            })
        }

        return collisions
    }

    sample(ray: Ray, context: RayColliderProcessingContextT): TriangleRayCollision | undefined {
        const collisions = this.sample_multiple(ray, context)
        if (collisions.length === 0)
            return undefined
        
        const min_t = Math.min(...collisions.map(({ t }) => t))
        return collisions.find(({ t }) => t === min_t)
    }
}