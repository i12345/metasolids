import { describe, it } from "mocha"
import { assert } from "chai"
import { fullname } from "type-namespace"
import { SurfaceTriangleRayCollider, SurfaceTriangleRayColliderProcessingContext } from "./ray-collider.js"
import { Ray, Vec3 } from "playcanvas-extended"
import { MeshData } from "./meshing/types.js"
import { MeshDataWithNormals, Surface, SurfaceInstance } from "./surface.js"

describe(fullname(SurfaceTriangleRayCollider), () => {
    interface Case {
        mesh: MeshData
        ray: Ray
        t: number[]
    }
    
    const surfaces: MeshData[] = [
        {
            vertices: [
                new Vec3(0, 0, 0),
                new Vec3(1, 0, 0),
                new Vec3(1, 1, 0),
                new Vec3(0, 1, 0),
            ],
            triangles: [
                0, 1, 2,
                0, 2, 3,
            ]
        },
    ]

    const cases: Case[] = [
        {
            mesh: surfaces[0],
            ray: new Ray(
                new Vec3(0.5, 0.5, -1),
                new Vec3(0, 0, 1)
            ),
            t: [1]
        },
        {
            mesh: surfaces[0],
            ray: new Ray(
                new Vec3(0.5, 0.5, -1),
                new Vec3(0, 0, 2)
            ),
            t: [0.5]
        },
        {
            mesh: surfaces[0],
            ray: new Ray(
                new Vec3(0.5, 0.25, -1),
                new Vec3(0, 0, 1)
            ),
            t: [1]
        },
        {
            mesh: surfaces[0],
            ray: new Ray(
                new Vec3(0.5, 0.25, -1),
                new Vec3(0, 0, 2)
            ),
            t: [0.5]
        },
    ]

    cases.forEach(({ mesh, ray, t }) => it("", () => {
        const surface: Surface = {
            mesh: mesh as MeshDataWithNormals,
            samples: []
        }

        const instance: SurfaceInstance = {
            entity: undefined!,
            shared: surface
        }

        const collider = new SurfaceTriangleRayCollider()
        
        const context: SurfaceTriangleRayColliderProcessingContext = {
            context: undefined!,
            surfaces: [instance]
        }
        
        collider.init(context)

        const collision = collider.sample_multiple(ray, context)
        assert.deepEqual(collision.map(({ t }) => t), t)
    }))
})