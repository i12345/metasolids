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
            SurfaceInstance<SampleT, SurfaceT> =
            SurfaceInstance<SampleT, SurfaceT>,
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
            SurfaceInstance<SampleT, SurfaceT> =
            SurfaceInstance<SampleT, SurfaceT>,
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
            SurfaceInstance<SampleT, SurfaceT> =
            SurfaceInstance<SampleT, SurfaceT>,
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
}

export class TriangleRayCollider<
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends Surface<SampleT> = Surface<SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SampleT, SurfaceT> =
            SurfaceInstance<SampleT, SurfaceT>,
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

    init({ surface }: RayColliderProcessingContextT) {
        // const mesh = surface.shared.mesh
        // const vertices = new Array<Vec2>(mesh.vertices.length)
        
        // this.update_transform(surface, view)
        // const transformed = new Vec3()
        // for (let i = 0; i < mesh.vertices.length; i++) {
        //     this.transform.local_to_2D.transformPoint(mesh.vertices[i], transformed)
        //     vertices[i] = new Vec2(transformed.x, transformed.y)
        // }

        // return new Triangles2DMeshCollider(Triangles2DMesh.build(vertices, mesh.triangles))
    }

    sample_multiple(ray: Ray, { surface }: RayColliderProcessingContextT) {
        const collisions: TriangleRayCollision[] = []

        // if (!ray.direction.equals(this.transform.view.direction))
        //     throw new Error("view direction must be the same from init()")
        // if (!surface.transform.equals(this.transform.world))
        //     throw new Error("surface transform must be the same from init()")

        // const mesh = surface.shared.mesh

        // const ray_origin_2Dspace = this.transform.local_to_2D.transformPoint(ray.origin)
        // const ray_origin_2Dspace_2D = new Vec2(ray_origin_2Dspace.x, ray_origin_2Dspace.y)

        // this.collider.collide(ray_origin_2Dspace_2D, (tri, w1, w2) => {
        //     const v0 = mesh.vertices[mesh.triangles[tri + 0]]
        //     const v1 = mesh.vertices[mesh.triangles[tri + 1]]
        //     const v2 = mesh.vertices[mesh.triangles[tri + 2]]
        //     const v01 = new Vec3().sub2(v1, v0)
        //     const v02 = new Vec3().sub2(v2, v0)

        //     const p_local =
        //         v0.clone()
        //             .add(v01.mulScalar(w1))
        //             .add(v02.mulScalar(w2))
            
        //     const p_world = surface.transform.transformPoint(p_local)
            
        //     const p_ray = this.transform.local_to_2D.transformPoint(p_local)
        //     console.assert(Math.abs(p_ray.x) < 0.01 && Math.abs(p_ray.y) < 0.01)

        //     const t = -p_ray.z
            
        //     collisions.push({
        //         p: {
        //             world: p_world,
        //             local: p_local,
        //         },
        //         t,
        //         triangle: { tri, w1, w2 }
        //     })
        // })

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