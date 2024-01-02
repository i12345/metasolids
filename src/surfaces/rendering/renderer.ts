import { Entity, MeshInstance, Vec2 } from "playcanvas-physics-advanced"
import { VolumeLocation } from "../../volumes/volume.js"
import { MaterialRendererIndividual, MaterialRendererShared } from "./material/renderer.js"
import { MeshRendererIndividual, MeshRendererShared } from "./mesh/renderer.js"
import { Material_Groups_TextureContexts, Material_Groups_Textures, Material_Texture_Context, Material_Texture_Location } from "./material/material-texture.js"
import { SurfaceUVUnwrapping } from "../unwrapping/uv/index.js"
import { MeshDataWithNormals } from "../mesh-data.js"
import { MultiObjectsIDs, MultiObjectsIDsKey, MultiObjectsTemplate, groups } from "../../paradigm/trees/index.js"
import { Material_Groups_Template } from "./material/groups.js"
import { ExtraFields, Field, FieldsPoint, FieldsPointMapped, GroupFieldKey, SampleDomainLocationFieldKey } from "../../fields/index.js"
import { FieldsField, Vec2Field, defaultField } from "../../fields/fields/index.js"
import { preDeserializer, serializableClass, serializableProperty } from "simple-typed-serialization"
import 'reflect-metadata'
import { ArithmeticPrimitiveFuseMode } from "../../fields/vectorized/fuse-modes/arithmetic.js"
import { IndicesTypedArray } from "../../utils/indices-array.js"

@serializableClass()
export class SurfaceRendererShared<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends FieldsPoint & VolumeLocation = VolumeLocation
    > {
    readonly mesh: MeshRendererShared<Objects, ObjIDsT, VolumeLocationT>
    readonly material: MaterialRendererShared<Objects, ObjIDsT, VolumeLocationT>
    readonly textureContexts: Material_Groups_TextureContexts<Objects, ObjIDsT, VolumeLocationT>

    @serializableProperty({ preDeserialize: true })
    readonly meshData: MeshDataWithNormals

    @serializableProperty({ preDeserialize: true })
    readonly textures: Material_Groups_Textures<Objects, ObjIDsT, VolumeLocationT>

    @serializableProperty({ preDeserialize: true })
    readonly surfaceUVUnwrapping?: SurfaceUVUnwrapping

    @serializableProperty({ preDeserialize: true })
    readonly extraLocationParameters: ExtraFields<VolumeLocationT, VolumeLocation>

    @serializableProperty({ preDeserialize: true })
    readonly multiObjectsIDs: MultiObjectsIDs<Objects, ObjIDsT>

    @preDeserializer
    static preDeserializer(serialized: SurfaceRendererShared) {
        ///@ts-ignore
        return new SurfaceRendererShared(
            serialized.meshData,
            serialized.textures,
            serialized.surfaceUVUnwrapping,
            serialized.extraLocationParameters,
            serialized.multiObjectsIDs,
        )
    }

    constructor(
            meshData: MeshDataWithNormals,
            textures: Material_Groups_Textures<Objects, ObjIDsT, VolumeLocationT>,
            surfaceUVUnwrapping: SurfaceUVUnwrapping | undefined,
            extraLocationParameters: ExtraFields<VolumeLocationT, VolumeLocation>,
            multiObjectsIDs: MultiObjectsIDs<Objects, ObjIDsT>,
        ) {
        this.meshData = meshData
        this.textures = textures
        this.surfaceUVUnwrapping = surfaceUVUnwrapping
        this.extraLocationParameters = extraLocationParameters
        this.multiObjectsIDs = multiObjectsIDs

        type TextureLocationT = Material_Texture_Location<VolumeLocationT>
        type TextureContextT = Omit<Material_Texture_Context<Objects, ObjIDsT, VolumeLocationT>, typeof GroupFieldKey>

        //TODO: use material.textures context from surface processing context rather than makeing new context here

        const sharedContext = {
            [MultiObjectsIDsKey]: multiObjectsIDs,
            [SampleDomainLocationFieldKey]: FieldsField.merge(
                defaultField(<any>extraLocationParameters) as FieldsField<TextureLocationT>,
                new FieldsField<TextureLocationT>({
                    uv: new Vec2Field(<ArithmeticPrimitiveFuseMode<Vec2>>ArithmeticPrimitiveFuseMode.none)
                } as FieldsPointMapped<TextureLocationT, Field>)
            )
        } as TextureContextT

        this.textureContexts = {} as Material_Groups_TextureContexts<Objects, ObjIDsT, VolumeLocationT>
        for (const group of groups(Material_Groups_Template))
            group.set(this.textureContexts, { ...sharedContext })

        this.mesh = new MeshRendererShared<Objects, ObjIDsT, VolumeLocationT>(this)
        this.material = new MaterialRendererShared<Objects, ObjIDsT, VolumeLocationT>(this)

        this.material.init()
    }

    individualize(entity: Entity): SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT> {
        ///@ts-ignore
        return new SurfaceRendererIndividual<VolumeLocationT>(this, entity)
    }
}

export class SurfaceRendererIndividual<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    readonly mesh: MeshRendererIndividual<Objects, ObjIDsT, VolumeLocationT>
    readonly material: MaterialRendererIndividual<Objects, ObjIDsT, VolumeLocationT>
    readonly implementation!: MeshInstance

    get attached() {
        return (
            (this.entity.render !== undefined) &&
            this.entity.render.enabled &&
            this.entity.render.meshInstances.includes(this.implementation)
        )
    }

    set attached(attached) {
        if (!this.attached && attached) {
            if (!this.entity.render)
                this.entity.addComponent('render', { enabled: true })
            else if (!this.entity.render.enabled)
                this.entity.render.enabled = true

            this.entity.render!.meshInstances = [...this.entity.render!.meshInstances, this.implementation]
        }
        else if (this.attached && !attached) {
            const meshInstances = [...this.entity.render!.meshInstances]
            meshInstances.splice(meshInstances.indexOf(this.implementation), 1)
            this.entity.render!.meshInstances = meshInstances
        }
    }

    constructor(
            public readonly shared: SurfaceRendererShared<Objects, ObjIDsT, VolumeLocationT>,
            public readonly entity: Entity,
        ) {
        this.mesh = shared.mesh.individualize(this)
        this.material = shared.material.individualize(this)

        this.material.init()

        this.implementation = new MeshInstance(this.mesh.implementation, this.material.implementation)
    }

    update(invalidateStagesSince = 1) {
        this.mesh.update()
        this.material.update(invalidateStagesSince)
    }
}
