import { Ray, Vec2 } from "playcanvas-extended";
import { SurfaceInstance, SurfaceSample } from "../surface.js";
import { SurfaceProcessingContextWithUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate, SurfaceWithUVUnwrapping } from "./surface.js";
import { MultiObjectsGroupsTemplate, groupKinds } from "../../paradigm/multi-objects.js";
import { Triangles2DMeshInterpolator } from "../../fields/triangles-2D-mesh.js";
import { onlyOne } from "../../utils/only-one.js";
import { SurfaceUVUnwrapping } from "./algorithm.js";
import { SurfaceProcessingContext } from "../surface-samples.js";
import { SurfaceRayCollider, SurfaceTriangleRayCollider, SurfaceTriangleRayColliderProcessingContext, SurfaceTriangleRayCollision } from "../ray-collider.js";

export interface SurfaceUVRayCollision extends SurfaceTriangleRayCollision {
    uv: Vec2
}

export interface SurfaceUVRayColliderProcessingContext<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT> =
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    > extends
    SurfaceTriangleRayColliderProcessingContext<
            SampleT,
            SurfaceT,
            SurfaceInstanceT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
        > {
}

interface SurfaceUVRayColliderProcessingContextPrivate<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT> =
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    > extends
    SurfaceUVRayColliderProcessingContext<
        UVUnwrappingGroup,
        SampleT,
        SurfaceT,
        SurfaceInstanceT,
        SampleProcessingContextT,
        SurfaceProcessingContextT
    > {
    UVinterpolators: Triangles2DMeshInterpolator<Vec2>[]
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
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup> =
            SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup>
    > implements
    SurfaceRayCollider<
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
    private readonly triCollider = new SurfaceTriangleRayCollider()

    constructor(
        public readonly UVunwrappingGroup?: UVUnwrappingGroup
    ) { }

    init(context: SurfaceUVRayColliderProcessingContext<
            UVUnwrappingGroup,
            SampleT,
            SurfaceT,
            SurfaceInstanceT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
        >): void {
        type ContextPrivateT = SurfaceUVRayColliderProcessingContextPrivate<
                UVUnwrappingGroup,    
                SampleT,
                SurfaceT,
                SurfaceInstanceT,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >
        
        const context_private = context as unknown as ContextPrivateT
        
        const { group: UVunwrapping_group } = onlyOne(groupKinds(
            context.context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            this.UVunwrappingGroup
        ))

        context_private.UVinterpolators = context.surfaces.map(surface => {
            const UVunwrapping = UVunwrapping_group.get<SurfaceUVUnwrapping>(surface.shared)
            return new Triangles2DMeshInterpolator(UVunwrapping.UVs, UVunwrapping.finalIndices)
        })

        this.triCollider.init(context)
    }

    private transformCollision(
            collision: SurfaceTriangleRayCollision,
            context: SurfaceUVRayColliderProcessingContext<
                    UVUnwrappingGroup,
                    SampleT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                >
        ): SurfaceUVRayCollision {
        type ContextPrivateT = SurfaceUVRayColliderProcessingContextPrivate<
                UVUnwrappingGroup,    
                SampleT,
                SurfaceT,
                SurfaceInstanceT,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >
        
        const context_private = context as unknown as ContextPrivateT
        
        const UVinterpolator = context_private.UVinterpolators[collision.i_surface]
        
        return {
            ...collision,
            uv: UVinterpolator.interpolate(
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
        return this.triCollider.sample_multiple(ray, context).map(collision => this.transformCollision(collision, context))
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
            return this.transformCollision(collision, context)
        return undefined
    }
}