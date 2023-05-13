import { onlyOne } from "../../../../../utils/index.js";
import { Cost_Space, Cost_Space_VertexColors, MaterialSemanticImplementationStorageClass, MaterialSemanticImplementationStorageClassInstanceIndividual, MaterialSemanticImplementationStorageClassInstanceShared, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { PackedRenderedBufferForSemantic, PackedRenderedBufferForSemanticWithRefCount, pack, renderPack } from "../packer.js";
import { colorChannelsString } from "../color-channels.js";
import { SurfaceRendererIndividual, SurfaceRendererShared } from "../../renderer.js";
import { Mesh } from "playcanvas-extended";

interface PackedRenderedBufferForSemanticWithMixedBuffer
    extends PackedRenderedBufferForSemanticWithRefCount<RenderedBufferForSemanticWithImplementation> {
    quality: number
    buffer: ReturnType<typeof renderPack>
    renderedMeshes?: Mesh[]
}

export class MaterialSemanticImplementationStorageClass_VertexColors
    implements MaterialSemanticImplementationStorageClass {
    readonly $class = MaterialSemanticImplementationStorageClass_VertexColors.$class
    
    startingSpace(renderer: SurfaceRendererIndividual): Cost_Space {
        return {
            // elements: renderer.mesh.decimation.numRenderVerts * 4,
            elements: renderer.shared.surface.mesh.vertices.length * 4,
            vertexColorChannels: 4
        } as Cost_Space_VertexColors
    }

    instance(renderer: SurfaceRendererShared) {
        return new MaterialSemanticImplementationStorageClassInstanceShared_VertexColors(renderer)
    }

    private constructor() { }

    static readonly instance = new this()
    static readonly $class = Symbol("material-semantic-implementation-storage-class:vertex-colors")
}

export class MaterialSemanticImplementationStorageClassInstanceShared_VertexColors
    implements MaterialSemanticImplementationStorageClassInstanceShared {
    readonly packs_stage0: PackedRenderedBufferForSemanticWithMixedBuffer[] = []
    
    get $class() {
        return MaterialSemanticImplementationStorageClass_VertexColors.instance
    }
    
    constructor(public readonly renderer: SurfaceRendererShared) {
        const callback = (renderer: SurfaceRendererIndividual) => {
            renderer
                .material
                .storageClassInstances
                .find($class => $class instanceof MaterialSemanticImplementationStorageClassInstanceIndividual_VertexColors)!
                .apply([], [])
        }

        renderer.mesh.computeBackingCallbacks.push(({ renderer }) => callback(renderer))
        renderer.material.computeBackingCallbacks.push(({ renderer }) => callback(renderer))
    }

    individualize(renderer: SurfaceRendererIndividual) {
        return new MaterialSemanticImplementationStorageClassInstanceIndividual_VertexColors(this, renderer)
    }
}

export class MaterialSemanticImplementationStorageClassInstanceIndividual_VertexColors
    implements MaterialSemanticImplementationStorageClassInstanceIndividual {
    readonly rendered: RenderedBufferForSemanticWithImplementation[] = []
    private _renderedPacked?: PackedRenderedBufferForSemanticWithMixedBuffer
    private _hasRequestedIndividual_material = false
    
    constructor(
        public readonly $class: MaterialSemanticImplementationStorageClassInstanceShared_VertexColors,
        public readonly renderer: SurfaceRendererIndividual
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
        const decimation = this.renderer.mesh.decimation
        const mesh = this.renderer.mesh.implementation
        const material = this.renderer.material.implementation

        for (const remove_buffer of remove) {
            this.rendered.splice(this.rendered.indexOf(remove_buffer), 1);

            (material as any)[remove_buffer.semantic as string] = false;
            (material as any)[`${remove_buffer.semantic}Channel`] = undefined;
        }

        this.rendered.push(...add)
        
        const isShareable = this.rendered.every(rendered => rendered.implementation.stage === 0)

        const shared_renderedPack =
            !isShareable ?
                undefined :
                this.$class.packs_stage0.find(pack =>
                    pack.quality === this.renderer.mesh.decimation.quality &&
                    this.rendered.every(({ implementation }) =>
                        pack.sources.some(source =>
                            implementation.equals(source.implementation))))

        if (shared_renderedPack) {
            shared_renderedPack.refCount++
            this._renderedPacked = shared_renderedPack
        }
        else {
            const useHdr = !this.rendered.every(buffer => buffer.buffer instanceof Uint8Array)
            const packed = onlyOne(pack(this.rendered, useHdr ? [1, 2, 3, 4] : [4]))
        
            let buffer: NonNullable<typeof this._renderedPacked>["buffer"]

            if ((packed.sources.length === 1 && decimation.quality === 1) &&
                (packed.sources[0].buffer instanceof Float32Array ||
                    (packed.sources[0].buffer instanceof Uint8Array && packed.sources[0].channels === 4))) {
                buffer = packed.sources[0].buffer
            }
            else {
                const elements = packed.channels * decimation.numRenderVerts

                if (useHdr)
                    buffer = new Float32Array(elements)
                else buffer = new Uint8Array(elements)
            }

            renderPack(
                buffer,
                packed,
                decimation.indices.render2samples
            )

            if (this._renderedPacked) {
                this._renderedPacked.refCount--
                if (this._renderedPacked.refCount === 0)
                    this.$class.packs_stage0.splice(this.$class.packs_stage0.indexOf(this._renderedPacked), 1)
            }

            this._renderedPacked = {
                quality: this.renderer.mesh.decimation.quality,
                buffer,
                refCount: isShareable ? 1 : NaN,
                renderedMeshes: isShareable ? [] : undefined,
                ...packed
            }

            if (isShareable)
                this.$class.packs_stage0.push(this._renderedPacked!)
        }

        if (this._renderedPacked!.renderedMeshes &&
            !this._renderedPacked!.renderedMeshes.includes(mesh)) {
            if (this._renderedPacked!.buffer instanceof Float32Array) {
                mesh.setColors(this._renderedPacked!.buffer, this._renderedPacked!.channels)
                mesh.setColors32([])
            }
            else {
                mesh.setColors32(this._renderedPacked!.buffer, this._renderedPacked!.channels)
                mesh.setColors([])
            }
            this._renderedPacked!.renderedMeshes?.push(mesh)
        }

        for (const { source: { implementation, semantic }, channels } of this._renderedPacked.targets) {
            if (this.rendered.some(rendered => rendered.implementation.equals(implementation))) {
                (material as any)[semantic as string] = true;
                (material as any)[`${semantic}Channel`] = colorChannelsString(channels);
            }
        }
    }
}