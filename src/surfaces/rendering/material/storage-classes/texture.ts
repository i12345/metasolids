import { Texture } from "playcanvas-extended";
import { Cost_Space_Texture, MaterialSemanticImplementationStorageClass, MaterialSemanticImplementationStorageClassInstanceIndividual, MaterialSemanticImplementationStorageClassInstanceShared, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { PackedRenderedBufferForSemanticWithRefCount, pack, renderPack } from "../packer.js";
import { format_selector } from "../texture-formats.js";
import { colorChannelsString } from "../color-channels.js";
import { SurfaceRendererIndividual, SurfaceRendererShared } from "../../renderer.js";
import { MultiObjectsGroupsTemplate } from "../../../../paradigm/multi-objects.js";
import { VolumeLocation } from "../../../../volumes/volume.js";

interface PackedRenderedBufferForSemanticWithTexture
    extends PackedRenderedBufferForSemanticWithRefCount<RenderedBufferForSemanticWithImplementation> {
    texture: Texture
}

export class MaterialSemanticImplementationStorageClass_Texture<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >
    implements MaterialSemanticImplementationStorageClass<VolumeLocationT, SurfaceUVUnwrappingGroup> {
    readonly $class = MaterialSemanticImplementationStorageClass_Texture.$class
    
    startingSpace(renderer: SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>): Cost_Space_Texture {
        return {
            // 8 textures x (4 channels/pixel * 2048*2048 pixels)
            elements: 8 * (4 * (2048 ** 2))
        }
    }

    instance(renderer: SurfaceRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>) {
        return new MaterialSemanticImplementationStorageClassInstanceShared_Texture<VolumeLocationT, SurfaceUVUnwrappingGroup>(this, renderer)
    }

    static readonly $class = Symbol("material-semantic-implementation-storage-class:texture")
}

export class MaterialSemanticImplementationStorageClassInstanceShared_Texture<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >
    implements MaterialSemanticImplementationStorageClassInstanceShared<VolumeLocationT, SurfaceUVUnwrappingGroup> {
    readonly rendered_packs_stage0: PackedRenderedBufferForSemanticWithTexture[] = []

    constructor(
            public readonly $class: MaterialSemanticImplementationStorageClass_Texture<VolumeLocationT, SurfaceUVUnwrappingGroup>,    
            public readonly renderer: SurfaceRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>
        ) {
        renderer.material.computeBackingCallbacks.push(renderer => {
            renderer
                .storageClassInstances
                .find($class => $class instanceof MaterialSemanticImplementationStorageClassInstanceIndividual_Texture)!
                .apply([], [])
        })}
    
    individualize(renderer: SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>) {
        return new MaterialSemanticImplementationStorageClassInstanceIndividual_Texture<VolumeLocationT, SurfaceUVUnwrappingGroup>(this, renderer)
    }
}

export class MaterialSemanticImplementationStorageClassInstanceIndividual_Texture<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >
    implements MaterialSemanticImplementationStorageClassInstanceIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup> {
    readonly rendered: RenderedBufferForSemanticWithImplementation[] = []
    private readonly rendered_packs: PackedRenderedBufferForSemanticWithTexture[] = []
    private _hasRequestedIndividual_material = false

    constructor(
        public readonly $class: MaterialSemanticImplementationStorageClassInstanceShared_Texture<VolumeLocationT, SurfaceUVUnwrappingGroup>,
        public readonly renderer: SurfaceRendererIndividual<VolumeLocationT, SurfaceUVUnwrappingGroup>
    ) { }

    preoptimize(
            add: RenderedBufferForSemanticWithImplementation[],
            remove: RenderedBufferForSemanticWithImplementation[]
        ): void {
        const final = [...this.rendered, ...add]
        remove.forEach(remove => {
            const removeIndex = final.indexOf(remove)
            if (removeIndex !== -1)
                final.splice(removeIndex, 1)
        })
        
        const maxStage = Math.max(0, ...final.map(renderedBuffer => renderedBuffer.implementation.stage))
        const nowRequestsIndividual_material = maxStage > 0
        if (nowRequestsIndividual_material && !this._hasRequestedIndividual_material)
            this.renderer.material.individuality.inc()
        else if (!nowRequestsIndividual_material && this._hasRequestedIndividual_material)
            this.renderer.material.individuality.dec()
        this._hasRequestedIndividual_material = nowRequestsIndividual_material
    }

    apply(
            add: RenderedBufferForSemanticWithImplementation[],
            remove: RenderedBufferForSemanticWithImplementation[]
        ): void {
        const fragmented_buffers: RenderedBufferForSemanticWithImplementation[] = []

        this.rendered.push(...add)
        for (const remove_buffer of remove) {
            this.rendered.splice(this.rendered.indexOf(remove_buffer), 1);

            (this.renderer.implementation.material as any)[remove_buffer.semantic] = null;
            // (this.renderer.implementation.material as any)[`${remove_buffer.semantic}Channel`] = null;

            const pack_index = this.rendered_packs.findIndex(pack => pack.sources.includes(remove_buffer))
            if (pack_index !== -1) {
                const pack = this.rendered_packs.splice(pack_index, 1)[0]
                fragmented_buffers.push(...pack.sources.filter(buffer => this.rendered.includes(buffer)))
                
                pack.refCount--
                if (pack.refCount === 0) {
                    for (const { source } of pack.targets)
                        (this.renderer.material.implementation as any)[source.semantic] = undefined
                    pack.texture.destroy()
                    this.$class.rendered_packs_stage0.splice(this.$class.rendered_packs_stage0.indexOf(pack), 1)
                }
            }
            else {
                const fragmented_buffer_index = fragmented_buffers.indexOf(remove_buffer)
                if (fragmented_buffer_index !== -1)
                    fragmented_buffers.splice(fragmented_buffer_index, 1)
                else throw new Error("remove_buffer not found")
            }
        }

        const final = [...add, ...fragmented_buffers]
        for (let stage = 0; stage <= Math.max(...final.map(final => final.implementation.stage)); stage++) {
            const final_filtered = final.filter(final => final.implementation.stage === stage)

            if (stage === 0) {
                for (const pack of this.$class.rendered_packs_stage0) {
                    const common = pack.sources.filter(source => final_filtered.includes(source))
                    if (common.length > 0) {
                        for (const common_buffer of common)
                            final.splice(final.indexOf(common_buffer), 1)

                        pack.refCount++
                        this.rendered_packs.push(pack)
                    }
                }
            }

            for (const packed of pack(final_filtered, [1, 2, 3, 4])) {
                const resolution = Math.sqrt(packed.sources[0].buffer.length / packed.sources[0].channels)
                const texture = new Texture(this.renderer.mesh.implementation.device, {
                    width: resolution,
                    height: resolution,
                    format: format_selector(
                        packed.channels,
                        packed.sources.some(source => !(source.buffer instanceof Uint8Array))
                    )
                })
                const buffer = texture.lock() as Float32Array
                renderPack(buffer, packed)
                texture.unlock()

                const packed_final: PackedRenderedBufferForSemanticWithTexture = {
                    ...packed,
                    texture,
                    refCount: 1
                }

                this.rendered_packs.push(packed_final)
                if (stage === 0)
                    this.$class.rendered_packs_stage0.push(packed_final)
            }
        }

        for (const pack of this.rendered_packs) {
            for (const { source, channels } of pack.targets) {
                if (this.rendered.includes(source)) {
                    (this.renderer.material.implementation as any)[source.semantic] = pack.texture;
                    (this.renderer.material.implementation as any)[`${source.semantic}Channel`] = colorChannelsString(channels);
                }
            }
        }
    }
}