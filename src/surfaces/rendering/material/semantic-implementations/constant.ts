import { Vec3, Vec2, Vec4, Color, StandardMaterial, BasicMaterial } from "playcanvas-physics-advanced"
import { TextureSample } from "../../../../textures/texture.js"
import { Cost_Space, RenderedBufferForSemanticWithImplementation } from "../implementation.js"
import { MaterialSemanticImplementationStorageClass_Constant } from "../storage-classes/constant.js"
import { SurfaceRendererIndividual } from "../../renderer.js"
import { field_point_equal } from "../../../../fields/point.js"
import { MaterialSemanticImplementation_Immediate } from "./immediate.js"
import { VolumeLocation } from "../../../../volumes/volume.js"
import { MultiObjectsTemplate } from "../../../../paradigm/trees/index.js"
import { IndicesTypedArray } from "../../../../utils/indices-array.js"

export class MaterialSemanticImplementation_Constant<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        TexelTypeT extends TextureSample = TextureSample
    >
    implements MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT> {
    readonly cost: {
        time: 0,
        space: Cost_Space
    }

    constructor(
        public readonly semantic: keyof StandardMaterial | keyof BasicMaterial,
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

    equals(that: MaterialSemanticImplementation_Immediate<Objects, ObjIDsT, VolumeLocationT>): boolean {
        return that instanceof MaterialSemanticImplementation_Constant &&
            ///@ts-ignore
            field_point_equal(this.meanValue, that.meanValue) &&
            this.channels === that.channels &&
            this.stage === that.stage &&
            this.semantic === that.semantic
    }

    implement(renderer: SurfaceRendererIndividual<Objects, ObjIDsT, VolumeLocationT>): RenderedBufferForSemanticWithImplementation<Objects, ObjIDsT, VolumeLocationT>[] {
        const buffer = new Float32Array(this.channels)

        if (typeof this.meanValue === 'number')
            buffer[0] = this.meanValue
        else if (this.meanValue instanceof Vec3) {
            buffer[0] = this.meanValue.x
            buffer[1] = this.meanValue.y
            buffer[2] = this.meanValue.z
        }
        else if (this.meanValue instanceof Vec2) {
            buffer[0] = this.meanValue.x
            buffer[1] = this.meanValue.y
        }
        else if (this.meanValue instanceof Vec4) {
            buffer[0] = this.meanValue.x
            buffer[1] = this.meanValue.y
            buffer[2] = this.meanValue.z
            buffer[3] = this.meanValue.w
        }
        else if (this.meanValue instanceof Color) {
            buffer[0] = this.meanValue.r
            buffer[1] = this.meanValue.g
            buffer[2] = this.meanValue.b
            buffer[3] = this.meanValue.a
        }
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