import { Ray, Vec3 } from "playcanvas-extended";
import { Surface, SurfaceInstance, SurfaceSample } from "./surface.js";
import { TriangleCollision } from "../fields/triangles-2D-mesh.js";
import { SurfaceProcessingContext } from "./processing.js";
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeProcessingWithSurfacesInstance, VolumeSurfacesKey } from "./volume-surfaces.js";
import { Volume, VolumeLocation, VolumeSamplingContext } from "../volumes/volume.js";
import { IndicesTypedArray } from "../utils/indices-array.js";
import { FieldPointVector, FieldPointVectorContainer } from "../fields/vectorized/index.js";
import { NumberTypedArray } from "../utils/typed-array.js";

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

export interface VolumeWithSurfacesRayColliderProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends SurfaceSample = SurfaceSample,
        VolumeSampleElementType extends SurfaceSample = VolumeSampleT,
        VolumeSampleFuseMode extends SurfaceSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
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
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
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
    > {
    instance: VolumeProcessingInstanceT
    context: VolumeProcessingContextT
}

export interface VolumeWithSurfacesRayCollider<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        Collision extends RayCollision = RayCollision,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends SurfaceSample = SurfaceSample,
        VolumeSampleElementType extends SurfaceSample = VolumeSampleT,
        VolumeSampleFuseMode extends SurfaceSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
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
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
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
        RayColliderProcessingContextT extends
            VolumeWithSurfacesRayColliderProcessingContext<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingInstanceT,
                    VolumeProcessingContextT
                > =
            VolumeWithSurfacesRayColliderProcessingContext<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingInstanceT,
                    VolumeProcessingContextT
                >,
    > {
    init(context: RayColliderProcessingContextT): void
    sample(ray: Ray, context: RayColliderProcessingContextT): Collision | undefined
    sample_multiple(ray: Ray, context: RayColliderProcessingContextT): Collision[]
}

export interface VolumeWithSurfacesTriangleRayCollision extends RayCollision {
    i_surface: number
    triangle: TriangleCollision
}

export interface VolumeWithSurfacesTriangleRayColliderProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends SurfaceSample = SurfaceSample,
        VolumeSampleElementType extends SurfaceSample = VolumeSampleT,
        VolumeSampleFuseMode extends SurfaceSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
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
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
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
    VolumeWithSurfacesRayColliderProcessingContext<
            IndicesT,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleContainer,
            VolumeSampleVector,
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

interface VolumeWithSurfacesTriangleRayColliderProcessingContextPrivate<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends SurfaceSample = SurfaceSample,
        VolumeSampleElementType extends SurfaceSample = VolumeSampleT,
        VolumeSampleFuseMode extends SurfaceSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
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
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
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
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
        VolumeSampleContainer,
        VolumeSampleVector,
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
    precomputed: {
        tri_n: number

        v0: Float64Array
        v01: Float64Array
        v02: Float64Array

        // this cannot be substituted with MeshData.normals because
        // these normals are computed after space transformations
        n: Float64Array

        uu: Float64Array
        uv: Float64Array
        vv: Float64Array
        D: Float64Array
    }[]
}

export class VolumeWithSurfacesTriangleRayCollider<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends SurfaceSample = SurfaceSample,
        VolumeSampleElementType extends SurfaceSample = VolumeSampleT,
        VolumeSampleFuseMode extends SurfaceSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
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
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
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
        RayColliderProcessingContextT extends
            VolumeWithSurfacesTriangleRayColliderProcessingContext<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingInstanceT,
                    VolumeProcessingContextT
                > =
            VolumeWithSurfacesTriangleRayColliderProcessingContext<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingInstanceT,
                    VolumeProcessingContextT
                >,
    >
    implements
    VolumeWithSurfacesRayCollider<
        IndicesT,
        VolumeWithSurfacesTriangleRayCollision,
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
        VolumeSampleContainer,
        VolumeSampleVector,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        SurfaceT,
        SurfaceInstanceT,
        SurfaceProcessingContextT,
        VolumeProcessingT,
        VolumeProcessingInstanceT,
        VolumeProcessingContextT,
        RayColliderProcessingContextT
    > {
    init(context: RayColliderProcessingContextT) {
        type ContextPrivateT = VolumeWithSurfacesTriangleRayColliderProcessingContextPrivate<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleContainer,
                VolumeSampleVector,
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
        context_private.precomputed ??= []

        const {
            [VolumeSurfacesKey]: surfaces,
            spaceTransformations
        } = context.instance

        if (context_private.precomputed.length > surfaces.length) {
            context_private.precomputed.splice(
                surfaces.length,
                surfaces.length - context_private.precomputed.length
            )
        }

        for (let i_surface = 0; i_surface < surfaces.length; i_surface++) {
            const surface = surfaces[i_surface]
            const mesh = surface.shared.mesh
            const tri_n = mesh.triangles.length / 3

            const transformed_vertices = new Float32Array(3 * mesh.vertices.length)
            new Uint8Array(transformed_vertices.buffer).set(new Uint8Array(mesh.vertices.buffer))

            spaceTransformations.forEach(spaceTransformation => spaceTransformation.transform(transformed_vertices))

            //TODO: consider when the space transformations should be applied
            // Also, how are they related to the surface and to the volume?

            if (context_private.precomputed[i_surface] &&
                context_private.precomputed[i_surface].tri_n !== tri_n)
                delete context_private.precomputed[i_surface]

            if (context_private.precomputed[i_surface] === undefined) {
                context_private.precomputed[i_surface] = {
                    tri_n,
                    n: new Float64Array(3 * tri_n),
                    v0: new Float64Array(3 * tri_n),
                    v01: new Float64Array(3 * tri_n),
                    v02: new Float64Array(3 * tri_n),
                    uu: new Float64Array(tri_n),
                    uv: new Float64Array(tri_n),
                    vv: new Float64Array(tri_n),
                    D: new Float64Array(tri_n),
                }
            }

            function loadV3(v3: Vec3, array: Float32Array | Float64Array, tri: number) {
                return v3.set(
                    array[(3 * tri) + 0],
                    array[(3 * tri) + 1],
                    array[(3 * tri) + 2]
                )
            }

            function saveV3(v3: Vec3, array: Float64Array, tri: number) {
                array[(3 * tri) + 0] = v3.x
                array[(3 * tri) + 1] = v3.y
                array[(3 * tri) + 2] = v3.z
            }

            const precomputed = context_private.precomputed[i_surface]

            const v0 = new Vec3(), v1 = new Vec3(), v2 = new Vec3()
            const v01 = new Vec3(), v02 = new Vec3(), n = new Vec3()
            let uu: number, uv: number, vv: number
            for (let tri = 0; tri < tri_n; tri++) {
                loadV3(v0, transformed_vertices, mesh.triangles[(3 * tri) + 0])
                loadV3(v1, transformed_vertices, mesh.triangles[(3 * tri) + 1])
                loadV3(v2, transformed_vertices, mesh.triangles[(3 * tri) + 2])

                saveV3(v0, precomputed.v0, tri)
                saveV3(v01.sub2(v1, v0), precomputed.v01, tri)
                saveV3(v02.sub2(v2, v0), precomputed.v02, tri)
                saveV3(n.cross(v01, v02), precomputed.n, tri)

                uu = precomputed.uu[tri] = v01.dot(v01)
                uv = precomputed.uv[tri] = v01.dot(v02)
                vv = precomputed.vv[tri] = v02.dot(v02)
                precomputed.D[tri] = (uv * uv) - (uu * vv)
            }
        }
    }

    sample_multiple(ray: Ray, context: RayColliderProcessingContextT) {
        type ContextPrivateT = VolumeWithSurfacesTriangleRayColliderProcessingContextPrivate<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleContainer,
                VolumeSampleVector,
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

        const collisions: VolumeWithSurfacesTriangleRayCollision[] = []

        const v0 = new Vec3(), v01 = new Vec3(), v02 = new Vec3(), n = new Vec3()
        const w0 = new Vec3(), I = new Vec3(), w = new Vec3()

        function loadV3(v3: Vec3, array: Float64Array, tri: number) {
            return v3.set(
                array[(3 * tri) + 0],
                array[(3 * tri) + 1],
                array[(3 * tri) + 2]
            )
        }

        const potential_duplicates: Vec3[] = []
        const potential_duplicate_parametric_margin = 0.0001
        const potential_duplicate_comparison = new Vec3()
        const potential_duplicate_position_margin_sq = 0.0001 ** 2;

        // adapted from http://www.geomalgorithms.com/code.html
        // "C06_Ray_Triangle_Intersection.cpp"

        // Copyright 2001, 2012, 2021 Dan Sunday
        // This code may be freely used and modified for any purpose
        // providing that this copyright notice is included with it.
        // There is no warranty for this code, and the author of it cannot
        // be held liable for any real or imagined damage from its use.
        // Users of this code must verify correctness for their application.

        // Assume that classes are already given for the objects:
        //    Point and Vector with
        //        coordinates {float x, y, z;}
        //        operators for:
        //            == to test  equality
        //            != to test  inequality
        //            (Vector)0 =  (0,0,0)        (null vector)
        //            Point  = Point ± Vector     (translation)
        //            Vector = Point - Point
        //            Vector = Scalar * Vector    (scalar product)
        //            Vector = Vector * Vector    (cross product)
        //    Line and Ray and Segment with defining  points {Point P0, P1;}
        //        A Line is infinite, Rays and  Segments start at P0.
        //        A Ray extends beyond P1, but a  Segment ends at P1.
        //    Plane with a point and a normal {Point V0; Vector n;}
        //    Triangle with defining vertices {Point V0, V1, V2;}
        //    Polyline and Polygon with n vertices {int n;  Point *V;}
        //        A Polygon has V[n]=V[0].
        //===================================================================

        // #define SMALL_NUM   0.00000001 // anything that avoids division overflow
        // dot product (3D) which allows vector operations in arguments
        // #define dot(u,v)   ((u).x * (v).x + (u).y * (v).y + (u).z * (v).z)

        // intersect3D_RayTriangle(): find the 3D intersection of a ray with a triangle
        //    Input:  a ray R, and a triangle T
        ////    Output: *I = intersection point (when it exists)
        ////    Return: -1 = triangle is degenerate (a segment or point)
        ////             0 =  disjoint (no intersect)
        ////             1 =  intersect in unique point I1
        ////             2 =  are in the same Plane

        for (let i_surface = 0; i_surface < surfaces.length; i_surface++) {
            const precomputed = context_private.precomputed[i_surface]

            for (let tri = 0; tri < precomputed.tri_n; tri++) {
                //Vector    u, v, n;              // triangle vectors
                //Vector    dir, w0, w;           // ray vectors
                //float     r, a, b;              // params to calc ray-plane intersect

                loadV3(v0, precomputed.v0, tri)
                loadV3(v01, precomputed.v01, tri)
                loadV3(v02, precomputed.v02, tri)
                loadV3(n, precomputed.n, tri)

                const uu = precomputed.uu[tri]
                const uv = precomputed.uv[tri]
                const vv = precomputed.vv[tri]
                const D = precomputed.D[tri]

                // get triangle edge vectors and plane normal
                // u = v01, v = v02
                // u = T.V1 - T.V0;
                // v = T.V2 - T.V0;
                // n = u * v;              // cross product
                // if (n == (Vector)0)             // triangle is degenerate
                //     return -1;                  // do not deal with this case

                // dir = R.direction
                //dir = R.P1 - R.P0;              // ray direction vector

                w0.sub2(ray.origin, v0)
                const a = n.dot(w0)
                const b = -n.dot(ray.direction)
                if (Math.abs(b) < 0.0001)
                    continue

                //w0 = R.P0 - T.V0;
                // a = -dot(n,w0);
                // b = dot(n,dir);
                // if (fabs(b) < SMALL_NUM) {     // ray is  parallel to triangle plane
                //     if (a == 0)                 // ray lies in triangle plane
                //         return 2;
                //     else return 0;              // ray disjoint from plane
                // }

                // get intersect point of ray with triangle plane
                const r = a / b;
                if (r < 0.0)                    // ray goes away from triangle
                    continue;                   // => no intersect
                // for a segment, also test if (r > 1.0) => no intersect

                I.copy(ray.direction).mulScalar(r).add(ray.origin)
                // * I = R.P0 + r * dir;            // intersect point of ray and plane

                // is I inside T?
                // float    uu, uv, vv, wu, wv, D;
                // uu = dot(u, u);
                // uv = dot(u, v);
                // vv = dot(v, v);
                // w = * I - T.V0;
                // wu = dot(w, u);
                // wv = dot(w, v);
                // D = uv * uv - uu * vv;
                w.sub2(I, v0)
                const wu = w.dot(v01)
                const wv = w.dot(v02)
                // const uu = v01.dot(v01)
                // const uv = v01.dot(v02)
                // const vv = v02.dot(v02)
                // const D = (uv * uv) - (uu * vv)

                // get and test parametric coords
                // float s, t;
                // s = (uv * wv - vv * wu) / D;
                // if (s < 0.0 || s > 1.0)         // I is outside T
                //     return 0;
                // t = (uv * wu - uu * wv) / D;
                // if (t < 0.0 || (s + t) > 1.0)  // I is outside T
                //     return 0;
                // return 1;                       // I is in T

                const s = (uv * wv - vv * wu) / D
                if (s < 0.0 || s > 1.0) continue
                const t = (uv * wu - uu * wv) / D
                if (t < 0.0 || (s + t) > 1.0) continue

                // this ends adapted code from "C06_Ray_Triangle_Intersection.cpp"

                if (s <= potential_duplicate_parametric_margin ||
                    t <= potential_duplicate_parametric_margin ||
                    (1 - s - t) <= potential_duplicate_parametric_margin) {
                    let isDuplicate = false
                    for (let i = 0; i < potential_duplicates.length; i++) {
                        if (potential_duplicate_comparison.sub2(potential_duplicates[i], I).lengthSq() < potential_duplicate_position_margin_sq) {
                            isDuplicate = true
                            break
                        }
                    }

                    if (isDuplicate)
                        continue
                    else
                        potential_duplicates.push(I)
                }

                collisions.push({
                    p: {
                        //TODO: compute local & world using interpolated vertex positions and spaceTransformations
                        local: w,
                        world: I
                    },
                    t: r,
                    i_surface,
                    triangle: {
                        tri,
                        w1: s,
                        w2: t
                    }
                })
            }
        }

        return collisions
    }

    sample(ray: Ray, context: RayColliderProcessingContextT): VolumeWithSurfacesTriangleRayCollision | undefined {
        const collisions = this.sample_multiple(ray, context)
        if (collisions.length === 0)
            return undefined

        let min = collisions[0]
        for (let i = 1; i < collisions.length; i++)
            if (min.t < collisions[i].t)
                min = collisions[i]

        return min
    }
}