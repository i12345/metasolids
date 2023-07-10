import { Ray } from "playcanvas-extended";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, groupKinds } from "../../../paradigm/multi-objects.js";
import { ExtraFields, FieldPoint, FieldsPointMapped } from "../../../fields/point.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "../../../textures/texture.js";
import { SurfaceIndividualTexturesGroupKindsTemplate, SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping, SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping } from "../types.js";
import { makeIntractor } from "../../../paradigm/tree.js";
import { change } from "../../../fields/object-algebra.js";
import { Surface, SurfaceInstance, SurfaceSample } from "../../surface.js";
import { SurfaceProcessingContext } from "../../surface-samples.js";
import { Field, FieldsField, SampleDomainLocationField, Vec2Field, defaultField } from "../../../fields/index.js";
import { VolumeWithSurfacesUVRayCollider, VolumeWithSurfacesUVRayColliderProcessingContext, VolumeWithSurfacesUVRayCollision } from "../../uv-unwrapping/ray-collider.js";
import { VolumeWithSurfacesRayCollider } from "../../ray-collider.js";
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeProcessingWithSurfacesInstance, VolumeSurfacesKey } from "../../volume-surfaces.js";
import { VolumeLocation } from "../../../volumes/volume.js";

export interface VolumeWithSurfacesIndividualTexturesRayCollision<
    TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    TextureSampleT extends FieldPoint = FieldPoint,
    TextureSamplesGrouped extends
        MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
        MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>
    > extends VolumeWithSurfacesUVRayCollision {
    samples: TextureSamplesGrouped
}

export interface VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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
            TexturesTemplated<
                    TextureGroups,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                > =
            TexturesTemplated<
                    TextureGroups,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                >,
        SampleT extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any,
        SurfaceT extends
            Surface<SampleT> &
            SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureSampleT,
                    TextureT
                    // TexturesGrouped
                > =
            Surface<SampleT> &
            SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureSampleT,
                    TextureT
                    // TexturesGrouped
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
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        > {
    extraLocationParameters: ExtraFields<TextureLocationT, TextureLocation>
}

interface VolumeWithSurfacesIndividualTexturesRayColliderProcessingContextPrivate<
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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
            TexturesTemplated<
                    TextureGroups,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                > =
            TexturesTemplated<
                    TextureGroups,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureSamplingContextT
                >,
        SampleT extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any,
        SurfaceT extends
            Surface<SampleT> &
            SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureSampleT,
                    TextureT
                    // TexturesGrouped
                > =
            Surface<SampleT> &
            SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureSampleT,
                    TextureT
                    // TexturesGrouped
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
    VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
        UVUnwrappingGroup,
        TextureGroups,
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
        texture: TextureT
        samplingContext: TextureSamplingContextT
        intract: ReturnType<typeof makeIntractor<TextureSampleT>>
    }[][]
}

export class VolumeWithSurfacesIndividualTexturesRayCollider<
    UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
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
        TexturesTemplated<
                TextureGroups,
                TextureSampleT,
                TextureSamplesGrouped,
                TextureLocationT,
                TextureSamplingContextT
            > =
        TexturesTemplated<
                TextureGroups,
                TextureSampleT,
                TextureSamplesGrouped,
                TextureLocationT,
                TextureSamplingContextT
            >,
    SampleT extends SurfaceSample = SurfaceSample,
    SurfaceT extends
        Surface<SampleT> &
        SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                UVUnwrappingGroup,
                TextureGroups,
                TextureLocationT,
                TextureSampleT,
                TextureT
                // TexturesGrouped
        > =
        Surface<SampleT> &
        SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                UVUnwrappingGroup,    
                TextureGroups,
                TextureLocationT,
                TextureSampleT,
                TextureT
                // TexturesGrouped
            >,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    TextureGroups,
                    SampleProcessingContextT
                > =
            SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    TextureGroups,
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
        VolumeWithSurfacesIndividualTexturesRayCollision<
            TextureGroups,
            TextureSampleT,
            TextureSamplesGrouped
        >,
        SampleT,
        SampleProcessingContextT,
        SurfaceT,
        SurfaceInstanceT,
        SurfaceProcessingContextT,
        VolumeProcessingT,
        VolumeProcessingInstanceT,
        VolumeProcessingContextT,
        VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
                UVUnwrappingGroup,
                TextureGroups,
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

    init(context: VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
            UVUnwrappingGroup,
            TextureGroups,
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

        type ContextPrivateT = VolumeWithSurfacesIndividualTexturesRayColliderProcessingContextPrivate<
            UVUnwrappingGroup,
            TextureGroups,
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

        const textureGroups = groupKinds(
            context.context[VolumeSurfacesKey],
            SurfaceIndividualTexturesGroupKindsTemplate,
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
            for (const { group } of textureGroups) {
                const texture = group.get<TextureT>(surface.shared)
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

                texture.init(samplingContext)
            }
            return textures
        })
    }

    private transformCollision(
            collision: VolumeWithSurfacesUVRayCollision,
            context: VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
                UVUnwrappingGroup,
                TextureGroups,
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
        ): VolumeWithSurfacesIndividualTexturesRayCollision<
                TextureGroups,
                TextureSampleT,
                TextureSamplesGrouped
            > {
        type ContextPrivateT = VolumeWithSurfacesIndividualTexturesRayColliderProcessingContextPrivate<
            UVUnwrappingGroup,
            TextureGroups,
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
            context: VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
                    UVUnwrappingGroup,
                    TextureGroups,
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
            context: VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
                    UVUnwrappingGroup,
                    TextureGroups,
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