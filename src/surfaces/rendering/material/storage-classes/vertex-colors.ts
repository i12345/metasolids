import { IndicesTypedArray, onlyOne } from "../../../../utils/index.js";
import { Cost_Space, Cost_Space_VertexColors, MaterialSemanticImplementationStorageClass, MaterialSemanticImplementationStorageClassInstanceIndividual, MaterialSemanticImplementationStorageClassInstanceShared, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { PackedRenderedBufferForSemanticWithRefCount, pack, renderPack } from "../packer.js";
import { colorChannelsString } from "../color-channels.js";
import { SurfaceRendererIndividual, SurfaceRendererShared } from "../../renderer.js";
import { Mesh } from "playcanvas-extended";
import { VolumeLocation } from "../../../../volumes/volume.js";
import { MultiObjectsTemplate } from "../../../../paradigm/trees/index.js";

interface PackedRenderedBufferForSemanticWithMixedBuffer<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    extends
    PackedRenderedBufferForSemanticWithRefCount<
        RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>
    > {
    quality: number
    buffer: ReturnType<typeof renderPack>
    renderedMeshes?: Mesh[]
}

export class MaterialSemanticImplementationStorageClass_VertexColors<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementationStorageClass<VolumeLocationT> {
    readonly $class = MaterialSemanticImplementationStorageClass_VertexColors.$class

    startingSpace<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array,
        >(renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>): Cost_Space {
        return {
            // elements: renderer.mesh.decimation.numRenderVerts * 4,
            elements: renderer.shared.meshData.vertices.length * 4,
            vertexColorChannels: 4
        } as Cost_Space_VertexColors
    }

    instance<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array,
        >(renderer: SurfaceRendererShared<Objects, ObjIDsT, VolumeLocationT>) {
        return new MaterialSemanticImplementationStorageClassInstanceShared_VertexColors<Objects, ObjIDsT, VolumeLocationT>(this, renderer)
    }

    static readonly $class = Symbol("material-semantic-implementation-storage-class:vertex-colors")
}

export class MaterialSemanticImplementationStorageClassInstanceShared_VertexColors<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementationStorageClassInstanceShared<Objects, ObjIDsT, VolumeLocationT> {
    readonly packs_stage0: PackedRenderedBufferForSemanticWithMixedBuffer<Objects, ObjIDsT, VolumeLocationT>[] = []

    constructor(
        public readonly $class: MaterialSemanticImplementationStorageClass_VertexColors<VolumeLocationT>,
        public readonly renderer: SurfaceRendererShared<Objects, ObjIDsT, VolumeLocationT>
    ) {
        const callback = (renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>) => {
            renderer
                .material
                .storageClassInstances
                .find($class => $class instanceof MaterialSemanticImplementationStorageClassInstanceIndividual_VertexColors)!
                .apply([], [])
        }

        renderer.mesh.computeBackingCallbacks.push(({ renderer }) => callback(renderer))
        renderer.material.computeBackingCallbacks.push(({ renderer }) => callback(renderer))
    }

    individualize(renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>) {
        return new MaterialSemanticImplementationStorageClassInstanceIndividual_VertexColors<Objects, ObjIDsT, VolumeLocationT>(this, renderer)
    }
}

export class MaterialSemanticImplementationStorageClassInstanceIndividual_VertexColors<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementationStorageClassInstanceIndividual<Objects, ObjIDsT, VolumeLocationT> {
    readonly rendered: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[] = []
    private _renderedPacked?: PackedRenderedBufferForSemanticWithMixedBuffer<Objects, ObjIDsT, VolumeLocationT>
    private _hasRequestedIndividual_material = false

    constructor(
        public readonly $class: MaterialSemanticImplementationStorageClassInstanceShared_VertexColors<Objects, ObjIDsT, VolumeLocationT>,
        public readonly renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>
    ) { }

    preoptimize(
            add: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[],
            remove: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[]
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
        add: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[],
        remove: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[]
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

        if (this.rendered.length === 0) {
            mesh.setColors32(new Uint8Array(4 * decimation.numRenderVerts).fill(0))
            return
        }

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

            const elements = packed.channels * decimation.numRenderVerts
            const buffer = useHdr ?
                new Float32Array(elements) :
                new Uint8Array(elements)

            renderPack(
                buffer,
                packed,
                decimation.indices.vertices_original
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
                // mesh.setColors32([])
                mesh.setColors(this._renderedPacked!.buffer, this._renderedPacked!.channels)
            }
            else {
                // mesh.setColors([])
                mesh.setColors32(this._renderedPacked!.buffer, this._renderedPacked!.channels)
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