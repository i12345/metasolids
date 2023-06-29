import { Ray } from "playcanvas-extended";
import { groupKindObjectsGrouped, groupKinds, iterObjects, MultiObjectsGrouped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplate_Leaf, MultiObjectsMapped, MultiObjectsMappedAgainGrouped, MultiObjectsTemplate } from "../../../paradigm/multi-objects.js";
import { ExtraFields, FieldPoint, FieldsPointMapped } from "../../../fields/point.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplatedWithObjects } from "../../../textures/texture.js";
import { SurfaceObjectsTexturesGroupKindsTemplate, SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping, SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping } from "../types.js";
import { SurfaceUVRayCollider, SurfaceUVRayColliderProcessingContext, SurfaceUVRayCollision } from "../../uv-unwrapping/ray-collider.js";
import { makeIntractor } from "../../../paradigm/tree.js";
import { change } from "../../../fields/object-algebra.js";
import { defaultField, Field, FieldsField, MultiObjectsDomainInternalPreservedGroupsKindsTemplate, MultiObjectsSampleDomain, SampleDomainLocationField, Vec2Field } from "../../../fields/index.js";
import { Surface, SurfaceInstance, SurfaceSample } from "../../surface.js";
import { SurfaceProcessingContext } from "../../surface-samples.js";
import { SurfaceRayCollider } from "../../ray-collider.js";

export interface SurfaceObjectsTexturesRayCollision<
    Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    TextureSampleT extends FieldPoint = FieldPoint,
    TextureSamplesGrouped extends
        MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
        MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>
    > extends SurfaceUVRayCollision {
    samples: any
    // samples: MultiObjectsMappedAgainGrouped<
    //         Objects,
    //         TextureGroups,
    //         TextureSampleT,
    //         TextureSamplesGrouped
    //     >
}

export interface SurfaceObjectsTexturesRayColliderProcessingContext<
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
    extraLocationParameters: ExtraFields<TextureLocationT, TextureLocation>
}

interface SurfaceObjectsTexturesRayColliderProcessingContextPrivate<
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
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    > extends
    SurfaceObjectsTexturesRayColliderProcessingContext<
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
            SurfaceT,
            SurfaceInstanceT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
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

export class SurfaceObjectsTexturesRayCollider<
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
    SampleProcessingContextT = any,
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
            >
    > implements
    SurfaceRayCollider<
        SurfaceObjectsTexturesRayCollision<
            Objects,
            TextureGroups,
            TextureSampleT,
            TextureSamplesGrouped
        >,
        SampleT,
        SurfaceT,
        SurfaceInstanceT,
        SampleProcessingContextT,
        SurfaceProcessingContextT,
        SurfaceObjectsTexturesRayColliderProcessingContext<
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
                SurfaceT,
                SurfaceInstanceT,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >
    > {
    private readonly UVcollider: SurfaceUVRayCollider<
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
        this.UVcollider = new SurfaceUVRayCollider(UVunwrappingGroup)
    }

    init(context: SurfaceObjectsTexturesRayColliderProcessingContext<
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
            SurfaceT,
            SurfaceInstanceT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
        >): void {
        this.UVcollider.init(context)
        
        type ContextPrivateT = SurfaceObjectsTexturesRayColliderProcessingContextPrivate<
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
            SurfaceT,
            SurfaceInstanceT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
        >
        
        const context_private = context as ContextPrivateT

        const textureGroups = groupKindObjectsGrouped(
            undefined!,
            context.context,
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

        context_private.textures = context.surfaces.map(surface => {
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
            collision: SurfaceUVRayCollision,
            context: SurfaceObjectsTexturesRayColliderProcessingContext<
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
                SurfaceT,
                SurfaceInstanceT,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >
        ): SurfaceObjectsTexturesRayCollision<
                Objects,
                TextureGroups,
                TextureSampleT,
                TextureSamplesGrouped
            > {
        type ContextPrivateT = SurfaceObjectsTexturesRayColliderProcessingContextPrivate<
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
            SurfaceT,
            SurfaceInstanceT,
            SampleProcessingContextT,
            SurfaceProcessingContextT
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
            context: SurfaceObjectsTexturesRayColliderProcessingContext<
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
                    SurfaceT,
                    SurfaceInstanceT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                >
        ) {
        return this.UVcollider.sample_multiple(ray, context).map(collision => this.transformCollision(collision, context))
    }

    sample(
            ray: Ray,
            context: SurfaceObjectsTexturesRayColliderProcessingContext<
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
                    SurfaceT,
                    SurfaceInstanceT,
                    SampleProcessingContextT,
                    SurfaceProcessingContextT
                >
        ) {
        const collision = this.UVcollider.sample(ray, context)
        if (collision)
            return this.transformCollision(collision, context)
        return undefined
    }
}