import { Color, Vec3, Vec2, Vec4, Material } from "playcanvas-extended";
import { Cost_Space, MaterialSemanticImplementationStorageClass, MaterialSemanticImplementationStorageClassInstanceIndividual, MaterialSemanticImplementationStorageClassInstanceShared, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { SurfaceRendererIndividual, SurfaceRendererShared } from "../../renderer.js";
import { VolumeLocation } from "../../../../volumes/index.js";
import { MultiObjectsTemplate } from "../../../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../../../paradigm/arrays/indices-array.js";

export class MaterialSemanticImplementationStorageClass_Constant<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementationStorageClass<VolumeLocationT> {
    readonly $class = MaterialSemanticImplementationStorageClass_Constant.$class

    private readonly _defaultMaterials = new Map<typeof Material, Material>()

    defaultMaterial(materialType: typeof Material) {
        if (this._defaultMaterials.has(materialType))
            return this._defaultMaterials.get(materialType)
        else {
            const defaultMaterial = new materialType()
            this._defaultMaterials.set(materialType, defaultMaterial)
            return defaultMaterial
        }
    }

    startingSpace(): Cost_Space {
        return { elements: 16 }
    }

    instance<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array,
        >(renderer: SurfaceRendererShared<Objects, ObjIDsT, VolumeLocationT>) {
        return new MaterialSemanticImplementationStorageClassInstanceShared_Constant<Objects, ObjIDsT, VolumeLocationT>(this, renderer)
    }

    static readonly $class = Symbol("material-semantic-implementation-storage-class:constant")
}

class MaterialSemanticImplementationStorageClassInstanceShared_Constant<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementationStorageClassInstanceShared<Objects, ObjIDsT, VolumeLocationT> {
    constructor(
            public readonly $class: MaterialSemanticImplementationStorageClass_Constant<VolumeLocationT>,
            public readonly renderer: SurfaceRendererShared<Objects, ObjIDsT, VolumeLocationT>
        ) {
        renderer.material.computeBackingCallbacks.push(renderer => {
            renderer
                .storageClassInstances
                .find($class => $class instanceof MaterialSemanticImplementationStorageClassInstanceIndividual_Constant)!
                .apply([], [])
        })
    }

    individualize(renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>) {
        return new MaterialSemanticImplementationStorageClassInstanceIndividual_Constant<Objects, ObjIDsT, VolumeLocationT>(this, renderer)
    }
}

class MaterialSemanticImplementationStorageClassInstanceIndividual_Constant<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    >
    implements MaterialSemanticImplementationStorageClassInstanceIndividual<Objects, ObjIDsT, VolumeLocationT> {
    readonly rendered: RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[] = []
    private _hasRequestedIndividual_material = false

    constructor(
        public readonly $class: MaterialSemanticImplementationStorageClassInstanceShared_Constant<Objects, ObjIDsT, VolumeLocationT>,
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
        for (const { semantic } of remove)
            (this.renderer.implementation.material as any)[semantic as string] = (this.$class.$class.defaultMaterial(this.$class.renderer.material.materialType) as any)[semantic]

        for (const { semantic, buffer } of add) {
            const mat_semantic = (this.renderer.material.implementation as any)[semantic]

            if (typeof mat_semantic === 'number')
                (this.renderer.material.implementation as any)[semantic] = buffer[0]
            else if (mat_semantic instanceof Color) {
                switch (buffer.length) {
                    case 1:
                        mat_semantic.set(buffer[0], buffer[0], buffer[0])
                        break
                    case 2:
                        mat_semantic.set(buffer[0], buffer[1], 0)
                        break
                    case 3:
                        mat_semantic.set(buffer[0], buffer[1], buffer[2])
                        break
                    case 4:
                        mat_semantic.set(buffer[0], buffer[1], buffer[2], buffer[3])
                        break
                    default:
                        break
                }
            }
            else if (mat_semantic instanceof Vec3)
                mat_semantic.set(buffer[0], buffer[1], buffer[2])
            else if (mat_semantic instanceof Vec2)
                mat_semantic.set(buffer[0], buffer[1])
            else if (mat_semantic instanceof Vec4)
                mat_semantic.set(buffer[0], buffer[1], buffer[2], buffer[3])
            else throw new Error('invalid type')
        }
    }
}