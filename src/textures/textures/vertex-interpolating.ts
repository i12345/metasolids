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
        TexelType extends FieldPoint = FieldPoint,
        TexelTypesGrouped extends
            MultiObjectsGroupsMapped<Groups, TexelType> =
            MultiObjectsGroupsMapped<Groups, TexelType>
    > = {
    [K in keyof TexelTypesGrouped]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            (TexelTypesGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TexelType> ?
                VertexInterpolatingTexturesTemplated<Groups[K], TextureLocationT, TexelType, TexelTypesGrouped[K]> :
                never) :
            VertexInterpolatingTexture<TextureLocationT, TexelTypesGrouped[K]>
    }

export class VertexInterpolatingTexture<
        TextureLocationT extends TextureLocation = TextureLocation,
        VertexSample extends FieldPoint = FieldPoint,
        VertexSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer,
        VertexSampleVector extends
            FieldPointVector<VertexSample, VertexSampleContainer> =
            FieldPointVector<VertexSample, VertexSampleContainer>,
        Context extends
            TextureSamplingContext<TextureLocationT> & Partial<WithMultiObjectsIDs> =
            TextureSamplingContext<TextureLocationT> & Partial<WithMultiObjectsIDs>
    > implements
    Texture<
        TextureLocationT,
        VertexSample,
        Context
    > {
    private collider?: Triangles2DMeshCollider
    private interpolator?: Triangles2DMeshInterpolator<VertexSample, VertexSampleContainer, VertexSampleVector>

    constructor(
        public vertices: VertexSampleVector,
        public uv: FieldPointVectorStatic<Vec2, FieldPointVectorContainerStatic<NumberTypedArray>>,
        public triangles: IndicesArray,
        public readonly field: Field<VertexSample>
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
        this.interpolator = new Triangles2DMeshInterpolator<VertexSample, VertexSampleContainer, VertexSampleVector>(this.field.elementType, this.vertices, this.triangles, context[MultiObjectsIDsKey])
    }
}