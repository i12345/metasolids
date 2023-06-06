import { Mat4, Ray, Vec2 } from "playcanvas-extended";
import { RayCollider, TriangleRayCollider, TriangleRayCollision } from "../ray-collider.js";
import { VolumeSample } from "../../volumes/volume.js";
import { Surface } from "../surface.js";
import { SurfaceProcessingContextWithUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate, SurfaceWithUVUnwrapping } from "./surface.js";
import { MultiObjectsGroupsTemplate, groupKinds, groups } from "../../fields/multi-objects-fields-point.js";
import { Triangles2DMeshInterpolator } from "../../fields/triangles-2D-mesh.js";
import { onlyOne } from "../../utils/only-one.js";
import { SurfaceUVUnwrapping } from "./algorithm.js";
import { SurfaceProcessingContext } from "../processor.js";

export interface SurfaceUVRayCollision extends TriangleRayCollision {
    uv: Vec2
}

//TODO: re-write using transforming sample domain <Ray, SurfaceUVRayCollision>
// after making sample domains able to have multiple values
export class SurfaceUVRayCollider<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > implements
    RayCollider<
        SurfaceUVRayCollision,
        SurfaceWithUVUnwrapping<UVUnwrappingGroup>,
        any,
        SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup>
    > {
    private readonly triCollider: TriangleRayCollider
    private UVinterpolator!: Triangles2DMeshInterpolator<Vec2>

    get transformWorld() {
        return this.triCollider.transformWorld
    }

    set transformWorld(transformWorld) {
        this.triCollider.transformWorld = transformWorld
    }

    constructor(
        public readonly surface: SurfaceWithUVUnwrapping<UVUnwrappingGroup>,
        public readonly UVunwrappingGroup?: UVUnwrappingGroup,
        transformWorld: Mat4 = new Mat4()
    ) {
        this.triCollider = new TriangleRayCollider(surface, transformWorld)
    }

    init(context: SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup>): void {
        const { group: UVunwrapping_group } = onlyOne(groupKinds(
            context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            this.UVunwrappingGroup
        ))
        const UVunwrapping = UVunwrapping_group.get<SurfaceUVUnwrapping>(this.surface)
        this.UVinterpolator = new Triangles2DMeshInterpolator(UVunwrapping.UVs, UVunwrapping.finalIndices)
    }

    private transformCollision(collision: TriangleRayCollision): SurfaceUVRayCollision {
        return {
            ...collision,
            uv: this.UVinterpolator.interpolate(
                collision.triangle.tri,
                collision.triangle.w1,
                collision.triangle.w2
            )
        }
    }

    sample_multiple(ray: Ray): SurfaceUVRayCollision[] {
        return this.triCollider.sample_multiple(ray).map(collision => this.transformCollision(collision))
    }

    sample(ray: Ray): SurfaceUVRayCollision | undefined {
        const collision = this.triCollider.sample(ray)
        if (collision)
            return this.transformCollision(collision)
        return undefined
    }
}