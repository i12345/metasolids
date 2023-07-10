import { Ray, Vec2 } from "playcanvas-extended";
import { SurfaceInstance, SurfaceSample } from "../surface.js";
import { SurfaceProcessingContextWithUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate, SurfaceWithUVUnwrapping } from "./surface.js";
import { MultiObjectsGroupsTemplate, groupKinds } from "../../paradigm/multi-objects.js";
import { Triangles2DMeshInterpolator } from "../../fields/triangles-2D-mesh.js";
import { onlyOne } from "../../utils/only-one.js";
import { SurfaceUVUnwrapping } from "./algorithm.js";
import { SurfaceProcessingContext } from "../surface-samples.js";
import { VolumeWithSurfacesRayCollider, VolumeWithSurfacesTriangleRayCollider, VolumeWithSurfacesTriangleRayColliderProcessingContext, VolumeWithSurfacesTriangleRayCollision } from "../ray-collider.js";
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeProcessingWithSurfacesInstance, VolumeSurfacesKey } from "../volume-surfaces.js";
import { VolumeLocation } from "../../volumes/volume.js";

export interface VolumeWithSurfacesUVRayCollision extends VolumeWithSurfacesTriangleRayCollision {
    uv: Vec2
}

export interface VolumeWithSurfacesUVRayColliderProcessingContext<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleT extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any,
        SurfaceT extends
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT> =
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<SampleT, SurfaceT> =
            VolumeProcessingWithSurfaces<SampleT, SurfaceT>,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    SampleT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                > =
            VolumeProcessingWithSurfacesInstance<
                    SampleT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeLocation,
                    SampleT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeLocation,
                    SampleT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
    > extends
    VolumeWithSurfacesTriangleRayColliderProcessingContext<
            SampleT,
            SampleProcessingContextT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        > {
}

interface VolumeWithSurfacesUVRayColliderProcessingContextPrivate<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleT extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any,
        SurfaceT extends
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT> =
            SurfaceWithUVUnwrapping<UVUnwrappingGroup, SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<SampleT, SurfaceT> =
            VolumeProcessingWithSurfaces<SampleT, SurfaceT>,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    SampleT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                > =
            VolumeProcessingWithSurfacesInstance<
                    SampleT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeLocation,
                    SampleT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeLocation,
                    SampleT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
    > extends
    VolumeWithSurfacesUVRayColliderProcessingContext<
        UVUnwrappingGroup,
        SampleT,
        SampleProcessingContextT,
        SurfaceT,
        SurfaceInstanceT,
        SurfaceProcessingContextT,
        VolumeProcessingT,
        VolumeProcessingInstanceT,
        VolumeProcessingContextT
    > {
    UVinterpolators: Triangles2DMeshInterpolator<Vec2>[]
}

//TODO: re-write using transforming sample domain <Ray, SurfaceUVRayCollision>
// after making sample domains able to have multiple values
export class VolumeWithSurfacesUVRayCollider<
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
            SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<SampleT, SurfaceT> =
            VolumeProcessingWithSurfaces<SampleT, SurfaceT>,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    SampleT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                > =
            VolumeProcessingWithSurfacesInstance<
                    SampleT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeLocation,
                    SampleT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeLocation,
                    SampleT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
    > implements
    VolumeWithSurfacesRayCollider<
        VolumeWithSurfacesUVRayCollision,
        SampleT,
        SampleProcessingContextT,
        SurfaceT,
        SurfaceInstanceT,
        SurfaceProcessingContextT,
        VolumeProcessingT,
        VolumeProcessingInstanceT,
        VolumeProcessingContextT,
        VolumeWithSurfacesUVRayColliderProcessingContext<
            UVUnwrappingGroup,
            SampleT,
            SampleProcessingContextT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        >
    > {
    private readonly triCollider = new VolumeWithSurfacesTriangleRayCollider()

    constructor(
        public readonly UVunwrappingGroup?: UVUnwrappingGroup
    ) { }

    init(context: VolumeWithSurfacesUVRayColliderProcessingContext<
            UVUnwrappingGroup,
            SampleT,
            SampleProcessingContextT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        >): void {
        type ContextPrivateT = VolumeWithSurfacesUVRayColliderProcessingContextPrivate<
                UVUnwrappingGroup,    
                SampleT,
                SampleProcessingContextT,
                SurfaceT,
                SurfaceInstanceT,
                SurfaceProcessingContextT,
                VolumeProcessingT,
                VolumeProcessingInstanceT,
                VolumeProcessingContextT
            >
        
        const context_private = context as unknown as ContextPrivateT
        
        const surfaces = context_private.instance[VolumeSurfacesKey]

        const { group: UVunwrapping_group } = onlyOne(groupKinds(
            context.context[VolumeSurfacesKey],
            SurfaceUVUnwrappingGroupKindsTemplate,
            this.UVunwrappingGroup
        ))

        context_private.UVinterpolators = surfaces.map(surface => {
            const UVunwrapping = UVunwrapping_group.get<SurfaceUVUnwrapping>(surface.shared)
            return new Triangles2DMeshInterpolator(UVunwrapping.UVs, UVunwrapping.finalIndices)
        })

        this.triCollider.init(context)
    }

    private transformCollision(
            collision: VolumeWithSurfacesTriangleRayCollision,
            context: VolumeWithSurfacesUVRayColliderProcessingContext<
                    UVUnwrappingGroup,
                    SampleT,
                    SampleProcessingContextT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingInstanceT,
                    VolumeProcessingContextT
                >
        ): VolumeWithSurfacesUVRayCollision {
        type ContextPrivateT = VolumeWithSurfacesUVRayColliderProcessingContextPrivate<
                UVUnwrappingGroup,    
                SampleT,
                SampleProcessingContextT,
                SurfaceT,
                SurfaceInstanceT,
                SurfaceProcessingContextT,
                VolumeProcessingT,
                VolumeProcessingInstanceT,
                VolumeProcessingContextT
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
        context: VolumeWithSurfacesUVRayColliderProcessingContext<
                UVUnwrappingGroup,
                SampleT,
                SampleProcessingContextT,
                SurfaceT,
                SurfaceInstanceT,
                SurfaceProcessingContextT,
                VolumeProcessingT,
                VolumeProcessingInstanceT,
                VolumeProcessingContextT
            >
    ): VolumeWithSurfacesUVRayCollision[] {
        return this.triCollider.sample_multiple(ray, context).map(collision => this.transformCollision(collision, context))
    }

    sample(
        ray: Ray,
        context: VolumeWithSurfacesUVRayColliderProcessingContext<
                UVUnwrappingGroup,
                SampleT,
                SampleProcessingContextT,
                SurfaceT,
                SurfaceInstanceT,
                SurfaceProcessingContextT,
                VolumeProcessingT,
                VolumeProcessingInstanceT,
                VolumeProcessingContextT
            >
    ): VolumeWithSurfacesUVRayCollision | undefined {
        const collision = this.triCollider.sample(ray, context)
        if (collision)
            return this.transformCollision(collision, context)
        return undefined
    }
}