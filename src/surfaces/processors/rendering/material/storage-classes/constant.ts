import { StandardMaterial, Color, Vec3, Vec2, Vec4 } from "playcanvas-extended";
import { Cost_Space, MaterialSemanticImplementationStorageClass, MaterialSemanticImplementationStorageClassInstanceIndividual, MaterialSemanticImplementationStorageClassInstanceShared, RenderedBufferForSemanticWithImplementation } from "../implementation.js";
import { SurfaceRendererIndividual, SurfaceRendererShared } from "../../renderer.js";

export class MaterialSemanticImplementationStorageClass_Constant
    implements MaterialSemanticImplementationStorageClass {
    readonly $class = MaterialSemanticImplementationStorageClass_Constant.$class

    startingSpace(): Cost_Space {
        return { elements: 16 }
    }

    instance(renderer: SurfaceRendererShared) {
        return new MaterialSemanticImplementationStorageClassInstanceShared_Constant(renderer)
    }

    private constructor() { }

    static readonly instance = new this()
    static readonly $class = Symbol("material-semantic-implementation-storage-class:constant")
}

let defaultMaterial: StandardMaterial

class MaterialSemanticImplementationStorageClassInstanceShared_Constant
    implements MaterialSemanticImplementationStorageClassInstanceShared {
    get $class() {
        return MaterialSemanticImplementationStorageClass_Constant.instance
    }

    constructor(public readonly renderer: SurfaceRendererShared) {
        renderer.material.computeBackingCallbacks.push(renderer => {
            renderer
                .storageClassInstances
                .find($class => $class instanceof MaterialSemanticImplementationStorageClassInstanceIndividual_Constant)!
                .apply([], [])
        })
    }

    individualize(renderer: SurfaceRendererIndividual) {
        return new MaterialSemanticImplementationStorageClassInstanceIndividual_Constant(this, renderer)
    }
}

class MaterialSemanticImplementationStorageClassInstanceIndividual_Constant
    implements MaterialSemanticImplementationStorageClassInstanceIndividual {
    readonly rendered: RenderedBufferForSemanticWithImplementation[] = []
    private _hasRequestedIndividual_material = false
    
    constructor(
        public readonly $class: MaterialSemanticImplementationStorageClassInstanceShared_Constant,
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
        if (!defaultMaterial)
            defaultMaterial = new StandardMaterial()
        
        for (const { semantic } of remove)
            (this.renderer.implementation.material as any)[semantic as string] = defaultMaterial[semantic]
        
        for (const { semantic, buffer } of add) {
            const mat_semantic = this.renderer.material.implementation[semantic]

            if (typeof mat_semantic === 'number')
                (this.renderer.material.implementation as any)[semantic] = buffer[0]
            else if (mat_semantic instanceof Color)
                mat_semantic.set(buffer[0], buffer[1], buffer[2], buffer[3])
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