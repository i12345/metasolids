import { Entity, MeshInstance, Vec3 } from "playcanvas-extended"
import { VolumeLocation } from "../../volumes/volume.js"
import { MaterialRendererIndividual, MaterialRendererShared } from "./material/renderer.js"
import { MeshRendererIndividual, MeshRendererShared } from "./mesh/renderer.js"
import { Material_Groups_TextureContexts, Material_Groups_Textures, Material_Texture_Context, Material_Texture_Location } from "./material/material-texture.js"
import { SurfaceUVUnwrapping } from "../uv-unwrapping/algorithm.js"
import { MeshDataWithNormals } from "../surface.js"
import { groups } from "../../paradigm/index.js"
import { Material_Groups_Template } from "./material/groups.js"
import { ExtraFields, Field, FieldsField, FieldsPoint, FieldsPointMapped, SampleDomainLocationField, Vec2Field, defaultField } from "../../fields/index.js"
import { preDeserializer, serializableClass, serializableProperty } from "simple-typed-serialization"
import 'reflect-metadata'

@serializableClass()
export class SurfaceRendererShared<
        VolumeLocationT extends FieldsPoint & VolumeLocation = VolumeLocation
    > {
    readonly mesh: MeshRendererShared<VolumeLocationT>
    readonly material: MaterialRendererShared<VolumeLocationT>
    readonly textureContexts: Material_Groups_TextureContexts<VolumeLocationT>

    @serializableProperty({ preDeserialize: true })
    readonly meshData: MeshDataWithNormals

    @serializableProperty({ preDeserialize: true })
    readonly textures: Material_Groups_Textures<VolumeLocationT>
    
    @serializableProperty({ preDeserialize: true })
    readonly surfaceUVUnwrapping: SurfaceUVUnwrapping

    @serializableProperty({ preDeserialize: true })
    readonly extraLocationParameters: ExtraFields<VolumeLocationT, VolumeLocation>

    @preDeserializer
    static preDeserializer(serialized: SurfaceRendererShared) {
        ///@ts-ignore
        return new SurfaceRendererShared(
            serialized.meshData,
            serialized.textures,
            serialized.surfaceUVUnwrapping,
            serialized.extraLocationParameters
        )
    }

    constructor(
        meshData: MeshDataWithNormals,
        textures: Material_Groups_Textures<VolumeLocationT>,
        surfaceUVUnwrapping: SurfaceUVUnwrapping,
        extraLocationParameters: ExtraFields<VolumeLocationT, VolumeLocation>
    ) {
        this.meshData = meshData
        this.textures = textures
        this.surfaceUVUnwrapping = surfaceUVUnwrapping
        this.extraLocationParameters = extraLocationParameters

        type TextureLocationT = Material_Texture_Location<VolumeLocationT>
        type TextureContextT = Material_Texture_Context<VolumeLocationT>

        const sharedContext = {
            [SampleDomainLocationField]: FieldsField.merge(
                defaultField(extraLocationParameters) as FieldsField<TextureLocationT>,
                new FieldsField<TextureLocationT>({
                    uv: new Vec2Field()
                } as FieldsPointMapped<TextureLocationT, Field>)
            )
        } as TextureContextT

        this.textureContexts = {} as Material_Groups_TextureContexts<VolumeLocationT>
        for (const group of groups(Material_Groups_Template))
            group.set(this.textureContexts, { ...sharedContext })

        this.mesh = new MeshRendererShared<VolumeLocationT>(this)
        this.material = new MaterialRendererShared<VolumeLocationT>(this)
        
        this.material.init()
    }

    individualize(entity: Entity): SurfaceRendererIndividual<VolumeLocationT> {
        ///@ts-ignore
        return new SurfaceRendererIndividual<VolumeLocationT>(this, entity)
    }
}

export class SurfaceRendererIndividual<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > {
    readonly mesh: MeshRendererIndividual<VolumeLocationT>
    readonly material: MaterialRendererIndividual<VolumeLocationT>
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
            public readonly shared: SurfaceRendererShared<VolumeLocationT>,
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
