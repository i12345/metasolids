import { Vec2 } from "playcanvas-extended";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsIDs, MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs } from "../../paradigm/trees/index.js";
import { Field, FieldPoint, Triangles2DMesh, Triangles2DMeshCollider, Triangles2DMeshInterpolator, field_point_identity, field_point_new } from "../../fields/index.js";
import { Texture, TextureLocation, TextureSamplingContext } from "../texture.js";
import { IndicesArray, IndicesTypedArray } from "../../utils/indices-array.js";
import { defaultField } from "../../fields/fields/default.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorStatic } from "../../fields/vectorized/point.js";
import { NumberTypedArray, TypedArray } from "../../utils/typed-array.js";

export type VertexInterpolatingTexturesTemplated<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TexelType extends FieldPoint = FieldPoint,
        TexelTypesGrouped extends
            MultiObjectsGroupsMapped<Groups, TexelType> =
            MultiObjectsGroupsMapped<Groups, TexelType>
    > = {
    [K in keyof TexelTypesGrouped]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            (TexelTypesGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TexelType> ?
                VertexInterpolatingTexturesTemplated<
                        Objects,
                        ObjIDsT,
                        Groups[K],
                        TextureLocationT,
                        TextureLocationElementType,
                        TextureLocationFuseMode,
                        TexelType,
                        TexelTypesGrouped[K]
                    > :
                never
            ) :
            VertexInterpolatingTexture<
                Objects,
                ObjIDsT,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TexelTypesGrouped[K]
            >
    }

export class VertexInterpolatingTexture<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        VertexSample extends FieldPoint = FieldPoint,
        VertexSampleElementType extends FieldPoint = VertexSample,
        VertexSampleFuseMode extends FieldPoint = VertexSample,
        VertexSampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        VertexSampleVector extends
            FieldPointVector<VertexSampleElementType, VertexSampleContainer> =
            FieldPointVector<VertexSampleElementType, VertexSampleContainer>,
        Context extends
            WithMultiObjectsIDs<Objects, ObjIDsT> & TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            WithMultiObjectsIDs<Objects, ObjIDsT> & TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>
    > implements
    Texture<
        TextureLocationT,
        VertexSample,
        TextureLocationElementType,
        TextureLocationFuseMode,
        VertexSampleElementType,
        VertexSampleFuseMode,
        Context
    > {
    private collider?: Triangles2DMeshCollider
    private interpolator?: Triangles2DMeshInterpolator<VertexSample, VertexSampleElementType, VertexSampleContainer, VertexSampleVector>

    constructor(
        public readonly vertices: VertexSampleVector,
        public readonly uv: FieldPointVectorStatic<Vec2, FieldPointVectorContainerStatic<NumberTypedArray>>,
        public readonly triangles: IndicesArray,
        public readonly field: Field<VertexSample, VertexSampleElementType, VertexSampleFuseMode>,
        public readonly defaultValue: VertexSample = <VertexSample><unknown>field_point_new(field.elementType)
    ) {
    }

    sample(location: TextureLocation): VertexSample {
        const collision = this.collider!.collision_first(location.uv)

        if (collision === undefined)
            return this.defaultValue

        const { tri, w1, w2 } = collision
        return this.interpolator!.interpolate(tri, w1, w2)
    }

    init(context: Context): void {
        const mesh = Triangles2DMesh.build(this.uv, this.triangles)
        this.collider = new Triangles2DMeshCollider(mesh)
        this.interpolator = new Triangles2DMeshInterpolator<VertexSample, VertexSampleElementType, VertexSampleContainer, VertexSampleVector>(this.field.elementType, this.vertices, this.triangles, context[MultiObjectsIDsKey])
    }
}