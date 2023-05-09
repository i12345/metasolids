import { Vec3, Vec2, Vec4, Color, StandardMaterial } from "playcanvas-extended"
import { TextureSample } from "../../../../../textures/texture.js"
import { Cost_Space, RenderedBufferForSemanticWithImplementation } from "../implementation.js"
import { MaterialSemanticImplementationStorageClass_Constant } from "../storage-classes/constant.js"
import { SurfaceRendererIndividual } from "../../renderer.js"
import { FieldPoint, field_point_equal } from "../../../../../fields/point.js"
import { MaterialSemanticImplementation_Immediate } from "./immediate.js"

export class MaterialSemanticImplementation_Constant<
        TexelTypeT extends TextureSample = TextureSample
    >
    implements MaterialSemanticImplementation_Immediate {
    readonly cost: {
        time: 0,
        space: Cost_Space
    }
    
    constructor(
        public readonly semantic: keyof StandardMaterial,
        public readonly meanValue: TexelTypeT,
        public readonly channels: number,
        public readonly stage: number,
        public readonly constancy: number,
    ) { 
        this.cost = {
            time: 0,
            space: {
                elements: channels
            }
        }
    }

    quality(): number {
        return this.constancy
    }

    equals(that: MaterialSemanticImplementation_Immediate): boolean {
        return that instanceof MaterialSemanticImplementation_Constant &&
            field_point_equal(this.meanValue, that.meanValue) &&
            this.channels === that.channels &&
            this.stage === that.stage &&
            this.semantic === that.semantic
    }
    
    implement(renderer: SurfaceRendererIndividual): RenderedBufferForSemanticWithImplementation[] {
        let buffer: Float32Array

        if (typeof this.meanValue === 'number')
            buffer = new Float32Array([this.meanValue])
        else if (this.meanValue instanceof Vec3)
            buffer = new Float32Array([this.meanValue.x, this.meanValue.y, this.meanValue.z])
        else if (this.meanValue instanceof Vec2)
            buffer = new Float32Array([this.meanValue.x, this.meanValue.y])
        else if (this.meanValue instanceof Vec4)
            buffer = new Float32Array([this.meanValue.x, this.meanValue.y, this.meanValue.z, this.meanValue.w])
        else if (this.meanValue instanceof Color)
            buffer = new Float32Array([this.meanValue.r, this.meanValue.g, this.meanValue.b, this.meanValue.a])
        else throw new Error("unsupported type")
        
        return [{
            storageClass: MaterialSemanticImplementationStorageClass_Constant.$class,
            implementation: this,
            buffer,
            channels: this.channels,
            semantic: this.semantic
        }]
    }
}