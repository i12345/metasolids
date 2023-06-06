import { Mat4, Ray, Vec2, Vec3 } from "playcanvas-extended";
import { TriangleCollisionHandler, Triangles2DMesh } from "../fields/triangles-2D-mesh.js";
import { Triangles2DMeshCollider } from "../fields/triangles-2D-mesh.js";
import { Quat } from "playcanvas-extended";
import { Surface } from "./surface.js";

export class RayCollider {
    constructor(
        public readonly surface: Surface,
        public readonly transformWorld: Mat4 = new Mat4().setIdentity()
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

    collider(ray: Ray, collisionHandler: TriangleCollisionHandler) {
        this.triangle2DmeshCollider(this._transform(ray)).collide(Vec2.ZERO, collisionHandler)
    }

    collision_first(ray: Ray) {
        return this.triangle2DmeshCollider(this._transform(ray)).collision_first(Vec2.ZERO)
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