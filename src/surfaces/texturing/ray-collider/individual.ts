import { Mat4, Ray } from "playcanvas-extended";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate } from "../../../fields/multi-objects-fields-point.js";
import { ExtraFields, FieldPoint } from "../../../fields/point.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "../../../textures/texture.js";
import { RayCollider, RayCollision } from "../../ray-collider.js";
import { SurfaceIndividualTexturesGroupKindsTemplate, SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping, SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping } from "../types.js";
import { SurfaceUVRayCollider, SurfaceUVRayCollision } from "../../uv-unwrapping/ray-collider.js";
import { makeIntractor } from "../../../utils/tree.js";
import { change } from "../../../fields/object-algebra.js";
import { groupKinds } from "../../../fields/multi-objects-fields-point.js";

export interface SurfaceIndividualTextureRayCollision<
    TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    TextureSampleT extends FieldPoint = FieldPoint,
    TextureSamplesGrouped extends
        MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
        MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>
    > extends RayCollision {
    samples: TextureSamplesGrouped
}

export class SurfaceIndividualTexturesRayCollider<
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
    SurfaceT extends
        SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                UVUnwrappingGroup,
                TextureGroups,
                TextureLocationT,
                TextureSampleT,
                TextureT
                // TexturesGrouped
            > =
        SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                UVUnwrappingGroup,    
                TextureGroups,
                TextureLocationT,
                TextureSampleT,
                TextureT
                // TexturesGrouped
            >,
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
                >
    > implements
    RayCollider<
        SurfaceIndividualTextureRayCollision<
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
        texture: TextureT
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
            SurfaceIndividualTexturesGroupKindsTemplate,
            this.textureGroups
        )

        this.textures = []
        for (const { group } of textureGroups) {
            const texture = group.get<TextureT>(this.surface)
            const samplingContext = group.get<TextureSamplingContextT>(context)
            this.textures.push({
                intract: group.set,
                texture,
                samplingContext
            })
        }
    }

    private transformCollision(collision: SurfaceUVRayCollision):
        SurfaceIndividualTextureRayCollision<
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