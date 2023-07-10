import { Ray } from "playcanvas-extended";
import { groupKindObjectsGrouped, groupKinds, iterObjects, MultiObjectsGrouped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplate_Leaf, MultiObjectsMapped, MultiObjectsMappedAgainGrouped, MultiObjectsTemplate } from "../../../paradigm/multi-objects.js";
import { ExtraFields, FieldPoint, FieldsPointMapped } from "../../../fields/point.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplatedWithObjects } from "../../../textures/texture.js";
import { SurfaceObjectsTexturesGroupKindsTemplate, SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping, SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping } from "../types.js";
import { makeIntractor } from "../../../paradigm/tree.js";
import { change } from "../../../fields/object-algebra.js";
import { defaultField, Field, FieldsField, MultiObjectsDomainInternalPreservedGroupsKindsTemplate, MultiObjectsSampleDomain, SampleDomainLocationField, Vec2Field } from "../../../fields/index.js";
import { Surface, SurfaceInstance, SurfaceSample } from "../../surface.js";
import { SurfaceProcessingContext } from "../../surface-samples.js";
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeProcessingWithSurfacesInstance, VolumeSurfacesKey } from "../../volume-surfaces.js";
import { VolumeLocation } from "../../../volumes/volume.js";
import { VolumeWithSurfacesUVRayCollider, VolumeWithSurfacesUVRayColliderProcessingContext, VolumeWithSurfacesUVRayCollision } from "../../uv-unwrapping/ray-collider.js";
import { VolumeWithSurfacesRayCollider } from "../../ray-collider.js";

export interface VolumeWithSurfacesObjectsTexturesRayCollision<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureSampleT extends FieldPoint = FieldPoint,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>
    > extends VolumeWithSurfacesUVRayCollision {
    samples: any
    // samples: MultiObjectsMappedAgainGrouped<
    //         Objects,
    //         TextureGroups,
    //         TextureSampleT,
    //         TextureSamplesGrouped
    //     >
}

export interface VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, TextureGroups> =
            MultiObjectsGrouped<Objects, TextureGroups>,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT> =
            TextureSamplingContext<TextureLocationT>,
        TextureT extends
            Texture<TextureLocationT, TextureSampleT, TextureSamplingContextT> =
            Texture<TextureLocationT, TextureSampleT, TextureSamplingContextT>,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>,
        TexturesGrouped extends
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                > =
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                >,
        SampleT extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any,
        SurfaceT extends
            Surface<SampleT> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureSampleT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleT
                > =
            Surface<SampleT> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureSampleT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleT
                >,
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
            SurfaceProcessingContextT
        > {
    extraLocationParameters: ExtraFields<TextureLocationT, TextureLocation>
}

interface VolumeWithSurfacesObjectsTexturesRayColliderProcessingContextPrivate<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, TextureGroups> =
            MultiObjectsGrouped<Objects, TextureGroups>,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT> =
            TextureSamplingContext<TextureLocationT>,
        TextureT extends
            Texture<TextureLocationT, TextureSampleT, TextureSamplingContextT> =
            Texture<TextureLocationT, TextureSampleT, TextureSamplingContextT>,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>,
        TexturesGrouped extends
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                > =
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                >,
        SampleT extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any,
        SurfaceT extends
            Surface<SampleT> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureSampleT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleT
                > =
            Surface<SampleT> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureSampleT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleT
                >,
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
    VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
            UVUnwrappingGroup,
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            TextureLocationT,
            TextureSampleT,
            TextureSamplingContextT,
            TextureT,
            TextureSamplesGrouped,
            TexturesGrouped,
            SampleT,
            SampleProcessingContextT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        > {
    /**
     * textures[i_surface] = information for textures for surface
     */
    textures: {
        texture: Texture<
            TextureLocationT,
            MultiObjectsMappedAgainGrouped<
                Objects,
                TextureGroups,
                TextureSampleT,
                TextureSamplesGrouped
            >,
            TextureSamplingContextT
        >
        samplingContext: TextureSamplingContextT
        intract: ReturnType<typeof makeIntractor<TextureSampleT>>
    }[][]
}

export class VolumeWithSurfacesObjectsTexturesRayCollider<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, TextureGroups> =
            MultiObjectsGrouped<Objects, TextureGroups>,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT> =
            TextureSamplingContext<TextureLocationT>,
        TextureT extends
            Texture<TextureLocationT, TextureSampleT, TextureSamplingContextT> =
            Texture<TextureLocationT, TextureSampleT, TextureSamplingContextT>,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>,
        TexturesGrouped extends
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                > =
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                >,
        SampleT extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any,
        SurfaceT extends
            Surface<SampleT> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureSampleT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleT
                > =
            Surface<SampleT> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureSampleT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleT
                >,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    SampleProcessingContextT
                > =
            SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    SampleProcessingContextT
                >,
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
        VolumeWithSurfacesObjectsTexturesRayCollision<
            Objects,
            TextureGroups,
            TextureSampleT,
            TextureSamplesGrouped
        >,
        SampleT,
        SampleProcessingContextT,
        SurfaceT,
        SurfaceInstanceT,
        SurfaceProcessingContextT,
        // VolumeProcessingT,
        // VolumeProcessingInstanceT,
        // VolumeProcessingContextT,
        VolumeProcessingWithSurfaces<SampleT, SurfaceT>,
        VolumeProcessingWithSurfacesInstance<
                SampleT,
                SurfaceT,
                SurfaceInstanceT//,
                // VolumeProcessingT
            >,
        VolumeProcessingWithSurfacesContext<
                VolumeLocation,
                SampleT,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >,
        VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
                UVUnwrappingGroup,
                Objects,
                TextureGroups,
                ObjectsTexturesGrouped,
                TextureLocationT,
                TextureSampleT,
                TextureSamplingContextT,
                TextureT,
                TextureSamplesGrouped,
                TexturesGrouped,
                SampleT,
                SampleProcessingContextT,
                SurfaceT,
                SurfaceInstanceT,
                SurfaceProcessingContextT,
                // VolumeProcessingT,
                // VolumeProcessingInstanceT,
                // VolumeProcessingContextT
                VolumeProcessingWithSurfaces<SampleT, SurfaceT>,
                VolumeProcessingWithSurfacesInstance<
                        SampleT,
                        SurfaceT,
                        SurfaceInstanceT//,
                        // VolumeProcessingT
                    >,
                VolumeProcessingWithSurfacesContext<
                        VolumeLocation,
                        SampleT,
                        SampleProcessingContextT,
                        SurfaceProcessingContextT
                    >
            >
    > {
    private readonly UVcollider: VolumeWithSurfacesUVRayCollider<
            UVUnwrappingGroup,
            SampleT,
            SurfaceT,
            SurfaceInstanceT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
        >

    constructor(
        public readonly UVunwrappingGroup?: UVUnwrappingGroup,
        public readonly textureGroups?: TextureGroups
    ) {
        this.UVcollider = new VolumeWithSurfacesUVRayCollider(UVunwrappingGroup)
    }

    init(context: VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
            UVUnwrappingGroup,
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            TextureLocationT,
            TextureSampleT,
            TextureSamplingContextT,
            TextureT,
            TextureSamplesGrouped,
            TexturesGrouped,
            SampleT,
            SampleProcessingContextT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        >): void {
        this.UVcollider.init(context)
        
        type ContextPrivateT = VolumeWithSurfacesObjectsTexturesRayColliderProcessingContextPrivate<
            UVUnwrappingGroup,
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            TextureLocationT,
            TextureSampleT,
            TextureSamplingContextT,
            TextureT,
            TextureSamplesGrouped,
            TexturesGrouped,
            SampleT,
            SampleProcessingContextT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        >
        
        const context_private = context as ContextPrivateT

        const textureGroups = groupKindObjectsGrouped(
            undefined!,
            context.context[VolumeSurfacesKey],
            SurfaceObjectsTexturesGroupKindsTemplate,
            this.textureGroups
        )

        const sharedContext = {
            [SampleDomainLocationField]: FieldsField.merge(
                defaultField(context.extraLocationParameters) as unknown as FieldsField<TextureLocationT>,
                new FieldsField<TextureLocationT>({
                    uv: Vec2Field.instance
                } as FieldsPointMapped<TextureLocationT, Field>)
            )
        }

        context_private.textures = context.instance[VolumeSurfacesKey].map(surface => {
            const textures = []
            for (const { group, objects } of textureGroups) {
                const objectsTextures = group.get<MultiObjectsMapped<Objects, TextureT>>(surface.shared)
                // This will eventually need to be changed
                // because the context is where private variables are stored.
                // There could be a [Private] field in the context for this
                // and this group could be automatically covered by the sole
                // group kind that could be added 

                const texture = MultiObjectsSampleDomain.build(
                    objectsTextures as any,
                    objects.template
                ) as Texture<
                    TextureLocationT,
                    MultiObjectsMappedAgainGrouped<
                        Objects,
                        TextureGroups,
                        TextureSampleT,
                        TextureSamplesGrouped
                    >,
                    TextureSamplingContextT
                >

                const specializedContext = group.get<TextureSamplingContextT>(context.context) ?? {}

                const samplingContext = (specializedContext ? {
                    ...sharedContext,
                    ...specializedContext,
                    [SampleDomainLocationField]: FieldsField.merge(
                        sharedContext[SampleDomainLocationField],
                        specializedContext[SampleDomainLocationField] as FieldsField<TextureLocationT>
                    )
                } : sharedContext) as unknown as TextureSamplingContextT

                textures.push({
                    intract: group.set,
                    texture,
                    samplingContext
                })

                iterObjects(
                    objectsTextures,
                    objects.template,
                    (texture: TextureT) => texture.init(samplingContext)
                )
            }
            return textures
        })
    }

    private transformCollision(
            collision: VolumeWithSurfacesUVRayCollision,
            context: VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
                UVUnwrappingGroup,
                Objects,
                TextureGroups,
                ObjectsTexturesGrouped,
                TextureLocationT,
                TextureSampleT,
                TextureSamplingContextT,
                TextureT,
                TextureSamplesGrouped,
                TexturesGrouped,
                SampleT,
                SampleProcessingContextT,
                SurfaceT,
                SurfaceInstanceT,
                SurfaceProcessingContextT,
                VolumeProcessingT,
                VolumeProcessingInstanceT,
                VolumeProcessingContextT
            >
        ): VolumeWithSurfacesObjectsTexturesRayCollision<
                Objects,
                TextureGroups,
                TextureSampleT,
                TextureSamplesGrouped
            > {
        type ContextPrivateT = VolumeWithSurfacesObjectsTexturesRayColliderProcessingContextPrivate<
            UVUnwrappingGroup,
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            TextureLocationT,
            TextureSampleT,
            TextureSamplingContextT,
            TextureT,
            TextureSamplesGrouped,
            TexturesGrouped,
            SampleT,
            SampleProcessingContextT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        >
        
        const context_private = context as ContextPrivateT
        
        const samples = {} as TextureSamplesGrouped

        const location = change<TextureLocationT, TextureLocation, {}>({ uv: collision.uv }, [], context.extraLocationParameters)

        for (const { texture, samplingContext, intract } of context_private.textures[collision.i_surface])
            intract(samples, texture.sample(location, samplingContext))
        
        return {
            ...collision,
            samples
        }
    }

    sample_multiple(
            ray: Ray,
            context: VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureLocationT,
                    TextureSampleT,
                    TextureSamplingContextT,
                    TextureT,
                    TextureSamplesGrouped,
                    TexturesGrouped,
                    SampleT,
                    SampleProcessingContextT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingInstanceT,
                    VolumeProcessingContextT
                >
        ) {
        return this.UVcollider.sample_multiple(ray, context).map(collision => this.transformCollision(collision, context))
    }

    sample(
            ray: Ray,
            context: VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureLocationT,
                    TextureSampleT,
                    TextureSamplingContextT,
                    TextureT,
                    TextureSamplesGrouped,
                    TexturesGrouped,
                    SampleT,
                    SampleProcessingContextT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingInstanceT,
                    VolumeProcessingContextT
                >
        ) {
        const collision = this.UVcollider.sample(ray, context)
        if (collision)
            return this.transformCollision(collision, context)
        return undefined
    }
}