import { Mat4, Ray, Vec2, Vec3 } from "playcanvas-extended";
import { Triangles2DMesh } from "../fields/triangles-2D-mesh.js";
import { Triangles2DMeshCollider } from "../fields/triangles-2D-mesh.js";
import { Quat } from "playcanvas-extended";
import { Surface } from "./surface.js";
import { TriangleCollision } from "../fields/triangles-2D-mesh.js";
import { SurfaceProcessingContext } from "./processor.js";

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

export interface RayCollider<
        Collision extends RayCollision = RayCollision,
        SurfaceT extends Surface = Surface,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    > {
    readonly surface: SurfaceT
    transformWorld: Mat4

    init(context: SurfaceProcessingContextT): void
    sample(ray: Ray, context: SurfaceProcessingContextT): Collision | undefined
    sample_multiple(ray: Ray, context: SurfaceProcessingContextT): Collision[]
}

export interface TriangleRayCollision extends RayCollision {
    triangle: TriangleCollision
}

export class TriangleRayCollider<
        SurfaceT extends Surface = Surface,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    >
    implements
    RayCollider<
        TriangleRayCollision,
        SurfaceT,
        SampleProcessingContextT,
        SurfaceProcessingContextT
    > {
    constructor(
        public readonly surface: SurfaceT,
        public transformWorld: Mat4 = new Mat4().setIdentity()
    ) {
    }

    private _transform(ray: Ray) {
        const transformView = new Mat4().setTRS(
            ray.origin,
            new Quat().setFromDirections(Vec3.FORWARD, ray.direction.clone().normalize()),
            Vec3.ONE
        )
        
        transformView.invert()

        return new Mat4().mul2(transformView, this.transformWorld)
    }

    init() {
    }

    sample_multiple(ray: Ray) {
        const collisions: TriangleRayCollision[] = []

        const transform = this._transform(ray)
        const collider = this.triangle2DmeshCollider(transform)
        collider.collide(Vec2.ZERO, (tri, w1, w2) => {
            const v0 = this.surface.mesh.vertices[this.surface.mesh.triangles[tri + 0]]
            const v1 = this.surface.mesh.vertices[this.surface.mesh.triangles[tri + 1]]
            const v2 = this.surface.mesh.vertices[this.surface.mesh.triangles[tri + 2]]
            const v01 = new Vec3().sub2(v1, v0)
            const v02 = new Vec3().sub2(v2, v0)

            const p_local =
                v0.clone()
                    .add(v01.mulScalar(w1))
                    .add(v02.mulScalar(w2))
            
            const p_world = this.transformWorld.transformPoint(p_local)
            
            const p_ray = transform.transformPoint(p_local)
            console.assert(Math.abs(p_ray.x) < 0.01 && Math.abs(p_ray.y) < 0.01)

            const t = -p_ray.z
            
            collisions.push({
                p: {
                    world: p_world,
                    local: p_local,
                },
                t,
                triangle: { tri, w1, w2 }
            })
        })

        return collisions
    }

    sample(ray: Ray): TriangleRayCollision | undefined {
        const collisions = this.sample_multiple(ray)
        if (collisions.length === 0)
            return undefined
        
        const min_t = Math.min(...collisions.map(({ t }) => t))
        return collisions.find(({ t }) => t === min_t)
    }

    private triangle2DmeshCollider(transform: Mat4) {
        const mesh = this.surface.mesh
        const vertices = new Array<Vec2>(mesh.vertices.length)
        
        const transformed = new Vec3()
        for (let i = 0; i < mesh.vertices.length; i++){
            transform.transformPoint(mesh.vertices[i], transformed)
            vertices[i] = new Vec2(transformed.x, transformed.y)
        }

        return new Triangles2DMeshCollider(Triangles2DMesh.build(vertices, mesh.triangles))
    }
}