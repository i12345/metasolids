import { Mat4, Ray } from "playcanvas-extended";
import { MultiObjectsGrouped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsMappedAgainGrouped, MultiObjectsMappedGrouped, MultiObjectsTemplate } from "../../../fields/multi-objects-fields-point.js";
import { ExtraFields, FieldPoint } from "../../../fields/point.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated, TexturesTemplatedWithObjects } from "../../../textures/texture.js";
import { RayCollider, RayCollision } from "../../ray-collider.js";
import { SurfaceObjectsTexturesGroupKindsTemplate, SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping, SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping } from "../types.js";
import { SurfaceUVRayCollider, SurfaceUVRayCollision } from "../../uv-unwrapping/ray-collider.js";
import { makeIntractor } from "../../../utils/tree.js";
import { change } from "../../../fields/object-algebra.js";
import { groupKinds } from "../../../fields/multi-objects-fields-point.js";
import { MultiObjectsSampleDomain } from "../../../fields/index.js";
import { Reflect_entries } from "../../../utils/reflect-entries.js";

export interface SurfaceObjectsTextureRayCollision<
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
    SurfaceT extends
        SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                UVUnwrappingGroup,
                Objects,
                TextureGroups,
                TextureLocationT,
                TextureSampleT,
                TextureT
                // TexturesGrouped
            > =
        SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                UVUnwrappingGroup,
                Objects,
                TextureGroups,
                TextureLocationT,
                TextureSampleT,
                TextureT
                // TexturesGrouped
            >,
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
        SurfaceObjectsTextureRayCollision<
            Objects,
            TextureGroups,
            TextureSampleT,
            TextureSamplesGrouped
        >,
        SurfaceT,
        SampleProcessingContextT,
        SurfaceProcessingContextT
    > {
    private readonly UVcollider: SurfaceUVRayCollider<UVUnwrappingGroup>
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

    get UVunwrappingGroup() {
        return this.UVcollider.UVunwrappingGroup
    }

    get transformWorld() {
        return this.UVcollider.transformWorld
    }

    set transformWorld(transformWorld) {
        this.UVcollider.transformWorld = transformWorld
    }

    constructor(
        public readonly surface: SurfaceT,
        UVunwrappingGroup: UVUnwrappingGroup,
        public readonly textureGroups?: TextureGroups,
        public extraLocationFields: ExtraFields<TextureLocationT, TextureLocation> = {} as ExtraFields<TextureLocationT, TextureLocation>,
        transformWorld: Mat4 = new Mat4().setIdentity()
    ) {
        this.UVcollider = new SurfaceUVRayCollider(surface, UVunwrappingGroup, transformWorld)
    }

    init(context: SurfaceProcessingContextT): void {
        const textureGroups = groupKinds(
            context,
            SurfaceObjectsTexturesGroupKindsTemplate,
            this.textureGroups
        )

        this.textures = []
        for (const { group } of textureGroups) {
            const textures = group.get<{ [Object in keyof Objects]: TextureT }>(this.surface)
            //TODO: move the multiObj settings to the context object
            ///@ts-ignore
            const texture = new MultiObjectsSampleDomain(textures, undefined) as any

            const samplingContext = group.get<TextureSamplingContextT>(context)
            this.textures.push({
                intract: group.set,
                texture,
                samplingContext
            })
        }
    }

    private transformCollision(collision: SurfaceUVRayCollision):
        SurfaceObjectsTextureRayCollision<
            Objects,
            TextureGroups,
            TextureSampleT,
            TextureSamplesGrouped
        > {
        const samples = {} as TextureSamplesGrouped

        const location = change<TextureLocationT, TextureLocation, {}>({ uv: collision.uv }, [], this.extraLocationFields)

        for (const { texture, samplingContext, intract } of this.textures)
            intract(samples, texture.sample(location, samplingContext))
        
        return {
            ...collision,
            samples
        }
    }

    sample_multiple(ray: Ray) {
        return this.UVcollider.sample_multiple(ray).map(collision => this.transformCollision(collision))
    }

    sample(ray: Ray) {
        const collision = this.UVcollider.sample(ray)
        if (collision)
            return this.transformCollision(collision)
        return undefined
    }
}