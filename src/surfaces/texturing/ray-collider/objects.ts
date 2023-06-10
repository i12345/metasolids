import { Mat4, Ray } from "playcanvas-extended";
import { groupKinds, MultiObjectsGrouped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsMappedAgainGrouped, MultiObjectsMappedGrouped, MultiObjectsTemplate } from "../../../paradigm/multi-objects.js";
import { ExtraFields, FieldPoint } from "../../../fields/point.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated, TexturesTemplatedWithObjects } from "../../../textures/texture.js";
import { RayCollider, RayCollision, TriangleRayColliderProcessingContext } from "../../ray-collider.js";
import { SurfaceObjectsTexturesGroupKindsTemplate, SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping, SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping } from "../types.js";
import { SurfaceUVRayCollider, SurfaceUVRayColliderProcessingContext, SurfaceUVRayCollision } from "../../uv-unwrapping/ray-collider.js";
import { makeIntractor } from "../../../paradigm/tree.js";
import { change } from "../../../fields/object-algebra.js";
import { MultiObjectsSampleDomain } from "../../../fields/index.js";
import { Reflect_entries } from "../../../utils/reflect-entries.js";
import { Surface, SurfaceInstance, SurfaceSample } from "../../surface.js";
import { SurfaceProcessingContext } from "../../processor.js";
import { onlyOne } from "../../../utils/only-one.js";

export interface SurfaceObjectsTexturesRayCollision<
    Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    TextureSampleT extends FieldPoint = FieldPoint,
    TextureSamplesGrouped extends
        MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
        MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>
    > extends RayCollision {
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
            SurfaceInstance<SampleT, SurfaceT> =
            SurfaceInstance<SampleT, SurfaceT>,
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
    extraLocationFields: ExtraFields<TextureLocationT, TextureLocation>
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
            SurfaceInstance<SampleT, SurfaceT> =
            SurfaceInstance<SampleT, SurfaceT>,
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
    RayCollider<
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
    
    private textures!: {
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
    }[]

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
        
        const textureGroups = groupKinds(
            context.context,
            SurfaceObjectsTexturesGroupKindsTemplate,
            this.textureGroups
        )

        this.textures = []
        for (const { group } of textureGroups) {
            const textures = group.get<{ [Object in keyof Objects]: TextureT }>(context.surface)
            //TODO: move the multiObj settings to the context object
            ///@ts-ignore
            const texture = new MultiObjectsSampleDomain(textures, undefined) as any

            const samplingContext = group.get<TextureSamplingContextT>(context.context)
            this.textures.push({
                intract: group.set,
                texture,
                samplingContext
            })
        }
    }

    private transformCollision(
            collision: SurfaceUVRayCollision,
            { extraLocationFields }: SurfaceObjectsTexturesRayColliderProcessingContext<
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
        const samples = {} as TextureSamplesGrouped

        const location = change<TextureLocationT, TextureLocation, {}>({ uv: collision.uv }, [], extraLocationFields)

        for (const { texture, samplingContext, intract } of this.textures)
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