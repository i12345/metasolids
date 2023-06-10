import { Ray, Vec2 } from "playcanvas-extended";
import { RayCollider, TriangleRayCollider, TriangleRayColliderProcessingContext, TriangleRayCollision } from "../ray-collider.js";
import { SurfaceInstance, SurfaceSample } from "../surface.js";
import { SurfaceProcessingContextWithUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate, SurfaceWithUVUnwrapping } from "./surface.js";
import { MultiObjectsGroupsTemplate, groupKinds } from "../../paradigm/multi-objects.js";
import { Triangles2DMeshInterpolator } from "../../fields/triangles-2D-mesh.js";
import { onlyOne } from "../../utils/only-one.js";
import { SurfaceUVUnwrapping } from "./algorithm.js";
import { SurfaceProcessingContext } from "../surface-samples.js";

export interface SurfaceUVRayCollision extends TriangleRayCollision {
    uv: Vec2
}

export interface SurfaceUVRayColliderProcessingContext<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT> =
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SampleT, SurfaceT> =
            SurfaceInstance<SampleT, SurfaceT>,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    > extends
    TriangleRayColliderProcessingContext<
            SampleT,
            SurfaceT,
            SurfaceInstanceT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
        > {
}


//TODO: re-write using transforming sample domain <Ray, SurfaceUVRayCollision>
// after making sample domains able to have multiple values
export class SurfaceUVRayCollider<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT> =
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SampleT, SurfaceT> =
        SurfaceInstance<SampleT, SurfaceT>,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup> =
            SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup>
    > implements
    RayCollider<
        SurfaceUVRayCollision,
        SampleT,
        SurfaceT,
        SurfaceInstanceT,
        SampleProcessingContextT,
        SurfaceProcessingContextT,
        SurfaceUVRayColliderProcessingContext<
            UVUnwrappingGroup,
            SampleT,
            SurfaceT,
            SurfaceInstanceT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
        >
    > {
    private readonly triCollider = new TriangleRayCollider()
    private UVinterpolator!: Triangles2DMeshInterpolator<Vec2>

    constructor(
        public readonly UVunwrappingGroup?: UVUnwrappingGroup
    ) { }

    init({ surface, context }: SurfaceUVRayColliderProcessingContext<
            UVUnwrappingGroup,
            SampleT,
            SurfaceT,
            SurfaceInstanceT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
        >): void {
        const { group: UVunwrapping_group } = onlyOne(groupKinds(
            context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            this.UVunwrappingGroup
        ))
        const UVunwrapping = UVunwrapping_group.get<SurfaceUVUnwrapping>(surface)
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

    sample_multiple(
        ray: Ray,
        context: SurfaceUVRayColliderProcessingContext<
                UVUnwrappingGroup,
                SampleT,
                SurfaceT,
                SurfaceInstanceT,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >
    ): SurfaceUVRayCollision[] {
        return this.triCollider.sample_multiple(ray, context).map(collision => this.transformCollision(collision))
    }

    sample(
        ray: Ray,
        context: SurfaceUVRayColliderProcessingContext<
                UVUnwrappingGroup,
                SampleT,
                SurfaceT,
                SurfaceInstanceT,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >
    ): SurfaceUVRayCollision | undefined {
        const collision = this.triCollider.sample(ray, context)
        if (collision)
            return this.transformCollision(collision)
        return undefined
    }
}