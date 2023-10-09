import { describe, it } from "mocha"
import { assert } from "chai"
import { fullname } from "type-namespace"
import { VolumeWithSurfacesTriangleRayCollider, VolumeWithSurfacesTriangleRayColliderProcessingContext } from "./ray-collider.js"
import { Ray, Vec3 } from "playcanvas-extended"
import { MeshData, MeshDataWithNormals } from "./mesh-data.js"
import { Surface, SurfaceInstance } from "./surface.js"
import { VolumeSurfacesKey } from "./volume-surfaces.js"
import { VolumeKey } from "../volumes/processor.js"

describe(fullname(VolumeWithSurfacesTriangleRayCollider), () => {
    interface Case {
        mesh: MeshData
        ray: Ray
        t: number[]
    }

    const surfaces: MeshData[] = [
        {
            vertices: new Float32Array([
                0, 0, 0,
                1, 0, 0,
                1, 1, 0,
                0, 1, 0,
            ]),
            triangles: new Uint32Array([
                0, 1, 2,
                0, 2, 3,
            ]),
            dualCellReferences: {
                layers: undefined!,
                localIndices: undefined!
            }
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

    cases.forEach(({ mesh, ray, t }, i) => it(`case ${i}`, () => {
        const surface: Surface = {
            mesh: mesh as MeshDataWithNormals,
            samples: undefined!,
            isClosed: false,
        }

        const instance: SurfaceInstance = {
            entity: undefined!,
            shared: surface
        }

        const collider = new VolumeWithSurfacesTriangleRayCollider()

        const context: VolumeWithSurfacesTriangleRayColliderProcessingContext = {
            context: undefined!,
            instance: {
                entity: undefined!,
                shared: {
                    [VolumeKey]: undefined!,
                    [VolumeSurfacesKey]: [surface]
                },
                [VolumeSurfacesKey]: [instance],
                spaceTransformations: []
            }
        }

        collider.init(context)

        const collision = collider.sample_multiple(ray, context)
        assert.deepEqual(collision.map(({ t }) => t), t)
    }))
})