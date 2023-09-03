import { Vec2 } from "playcanvas-extended";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsIDsKey, WithMultiObjectsIDs } from "../../paradigm/trees/index.js";
import { Field, FieldPoint, Triangles2DMesh, Triangles2DMeshCollider, Triangles2DMeshInterpolator, field_point_identity } from "../../fields/index.js";
import { Texture, TextureLocation, TextureSamplingContext } from "../texture.js";
import { IndicesArray } from "../../utils/indices-array.js";
import { defaultField } from "../../fields/fields/default.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorStatic } from "../../fields/vectorized/point.js";
import { NumberTypedArray, TypedArray } from "../../utils/typed-array.js";

export type VertexInterpolatingTexturesTemplated<
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
                        Groups[K],
                        TextureLocationT,
                        TextureLocationElementType,
                        TextureLocationFuseMode,
                        TexelType,
                        TexelTypesGrouped[K]
                    > :
                never) :
            VertexInterpolatingTexture<
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TexelTypesGrouped[K]
            >
    }

export class VertexInterpolatingTexture<
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        VertexSample extends FieldPoint = FieldPoint,
        VertexSampleElementType extends FieldPoint = VertexSample,
        VertexSampleFuseMode extends FieldPoint = VertexSample,
        VertexSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        VertexSampleVector extends
            FieldPointVector<VertexSampleElementType, VertexSampleContainer> =
            FieldPointVector<VertexSampleElementType, VertexSampleContainer>,
        Context extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> & Partial<WithMultiObjectsIDs> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> & Partial<WithMultiObjectsIDs>
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
        public vertices: VertexSampleVector,
        public uv: FieldPointVectorStatic<Vec2, FieldPointVectorContainerStatic<NumberTypedArray>>,
        public triangles: IndicesArray,
        public readonly field: Field<VertexSample, VertexSampleElementType, VertexSampleFuseMode>
    ) {
    }

    sample(location: TextureLocation): VertexSample {
        const collision = this.collider!.collision_first(location.uv)

        if (collision === undefined)
            return undefined!

        const { tri, w1, w2 } = collision
        return this.interpolator!.interpolate(tri, w1, w2)
    }

    init(context: Context): void {
        const mesh = Triangles2DMesh.build(this.uv, this.triangles)
        this.collider = new Triangles2DMeshCollider(mesh)
        this.interpolator = new Triangles2DMeshInterpolator<VertexSample, VertexSampleElementType, VertexSampleContainer, VertexSampleVector>(this.field.elementType, this.vertices, this.triangles, context[MultiObjectsIDsKey])
    }
}