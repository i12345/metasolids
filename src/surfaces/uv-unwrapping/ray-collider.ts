import { Ray, Vec2 } from "playcanvas-extended";
import { SurfaceInstance, SurfaceSample } from "../surface.js";
import { SurfaceProcessingContextWithUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate, SurfaceWithUVUnwrapping } from "./surface.js";
import { MultiObjectsGroupsTemplate, groupKinds } from "../../paradigm/trees/index.js";
import { Triangles2DMeshInterpolator } from "../../fields/triangles-2D-mesh.js";
import { onlyOne } from "../../utils/only-one.js";
import { SurfaceUVUnwrapping } from "./algorithm.js";
import { VolumeWithSurfacesRayCollider, VolumeWithSurfacesTriangleRayCollider, VolumeWithSurfacesTriangleRayColliderProcessingContext, VolumeWithSurfacesTriangleRayCollision } from "../ray-collider.js";
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeProcessingWithSurfacesInstance, VolumeSurfacesKey } from "../volume-surfaces.js";
import { Volume, VolumeLocation, VolumeSamplingContext } from "../../volumes/volume.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";

export interface VolumeWithSurfacesUVRayCollision extends VolumeWithSurfacesTriangleRayCollision {
    uv: Vec2
}

export interface VolumeWithSurfacesUVRayColliderProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceSampleT extends SurfaceSample = SurfaceSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<VolumeLocationT, SurfaceSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            Volume<VolumeLocationT, SurfaceSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        SurfaceT extends
            SurfaceWithUVUnwrapping<IndicesT, UVUnwrappingGroup, SurfaceSampleT> =
            SurfaceWithUVUnwrapping<IndicesT, UVUnwrappingGroup, SurfaceSampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup, VolumeSampleProcessingContextT> =
            SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup, VolumeSampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                > =
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
    > extends
    VolumeWithSurfacesTriangleRayColliderProcessingContext<
            IndicesT,
            VolumeLocationT,
            SurfaceSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        > {
}

interface VolumeWithSurfacesUVRayColliderProcessingContextPrivate<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceSampleT extends SurfaceSample = SurfaceSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<VolumeLocationT, SurfaceSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            Volume<VolumeLocationT, SurfaceSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        SurfaceT extends
            SurfaceWithUVUnwrapping<IndicesT, UVUnwrappingGroup, SurfaceSampleT> =
            SurfaceWithUVUnwrapping<IndicesT, UVUnwrappingGroup, SurfaceSampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup, VolumeSampleProcessingContextT> =
            SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup, VolumeSampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                > =
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
    > extends
    VolumeWithSurfacesUVRayColliderProcessingContext<
        IndicesT,
        UVUnwrappingGroup,
        VolumeLocationT,
        SurfaceSampleT,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
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
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceSampleT extends SurfaceSample = SurfaceSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<VolumeLocationT, SurfaceSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            Volume<VolumeLocationT, SurfaceSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        SurfaceT extends
            SurfaceWithUVUnwrapping<IndicesT, UVUnwrappingGroup, SurfaceSampleT> =
            SurfaceWithUVUnwrapping<IndicesT, UVUnwrappingGroup, SurfaceSampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup, VolumeSampleProcessingContextT> =
            SurfaceProcessingContextWithUVUnwrapping<UVUnwrappingGroup, VolumeSampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                > =
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
    > implements
    VolumeWithSurfacesRayCollider<
        IndicesT,
        VolumeWithSurfacesUVRayCollision,
        VolumeLocationT,
        SurfaceSampleT,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        SurfaceT,
        SurfaceInstanceT,
        SurfaceProcessingContextT,
        VolumeProcessingT,
        VolumeProcessingInstanceT,
        VolumeProcessingContextT,
        VolumeWithSurfacesUVRayColliderProcessingContext<
            IndicesT,
            UVUnwrappingGroup,
            VolumeLocationT,
            SurfaceSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
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
            IndicesT,
            UVUnwrappingGroup,
            VolumeLocationT,
            SurfaceSampleT,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        >): void {
        type ContextPrivateT = VolumeWithSurfacesUVRayColliderProcessingContextPrivate<
                IndicesT,
                UVUnwrappingGroup,
                VolumeLocationT,
                SurfaceSampleT,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
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
            
            const uvs = new Array<Vec2>(UVunwrapping.UVs.length / 2)
            for (let i = 0; i < uvs.length; i++) {
                uvs[i] = new Vec2(
                    UVunwrapping.UVs[(2 * i) + 0],
                    UVunwrapping.UVs[(2 * i) + 1]
                )
            }

            return new Triangles2DMeshInterpolator(uvs, UVunwrapping.finalIndices)
        })

        this.triCollider.init(context)
    }

    private transformCollision(
            collision: VolumeWithSurfacesTriangleRayCollision,
            context: VolumeWithSurfacesUVRayColliderProcessingContext<
                    IndicesT,
                    UVUnwrappingGroup,
                    VolumeLocationT,
                    SurfaceSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingInstanceT,
                    VolumeProcessingContextT
                >
        ): VolumeWithSurfacesUVRayCollision {
        type ContextPrivateT = VolumeWithSurfacesUVRayColliderProcessingContextPrivate<
                IndicesT,
                UVUnwrappingGroup,
                VolumeLocationT,
                SurfaceSampleT,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
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
                IndicesT,
                UVUnwrappingGroup,
                VolumeLocationT,
                SurfaceSampleT,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
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
                IndicesT,
                UVUnwrappingGroup,
                VolumeLocationT,
                SurfaceSampleT,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
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