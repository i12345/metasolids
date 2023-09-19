import { Vec2 } from "playcanvas-extended";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs } from "../../paradigm/trees/index.js";
import { Field, FieldPoint, Triangles2DMesh, Triangles2DMeshCollider, Triangles2DMeshInterpolator, field_point_new } from "../../fields/index.js";
import { Texture, TextureLocation, TextureSamplingContext } from "../texture.js";
import { IndicesArray, IndicesTypedArray } from "../../utils/indices-array.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorStatic } from "../../fields/vectorized/point.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { vectorized } from "vectorized-functions";

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

    init(context: Context): void {
        const mesh = Triangles2DMesh.build(this.uv, this.triangles)
        this.collider = new Triangles2DMeshCollider(mesh)
        this.interpolator = new Triangles2DMeshInterpolator<VertexSample, VertexSampleElementType, VertexSampleContainer, VertexSampleVector>(this.field.elementType, this.vertices, this.triangles, context[MultiObjectsIDsKey])
    }

    @vectorized(VertexInterpolatingTexture.sample_vectorized)
    sample(location: TextureLocation): VertexSample {
        const collision = this.collider!.collision_first(location.uv)

        if (collision === undefined)
            return this.defaultValue

        const { tri, w1, w2 } = collision
        return this.interpolator!.interpolate(tri, w1, w2)
    }

    private static sample_vectorized<
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
        >(
            this: VertexInterpolatingTexture<
                    Objects,
                    ObjIDsT,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    VertexSample,
                    VertexSampleElementType,
                    VertexSampleFuseMode,
                    VertexSampleContainer,
                    VertexSampleVector,
                    Context
                >,
            locations: FieldPointVector<TextureLocationElementType, FieldPointVectorContainerStatic>,
            context: Context
        ): VertexSampleVector {
        const collisions = this.collider!.collide_first_vectorized(locations.uv)
        return this.interpolator!.interpolate_vectorized(<IndicesTypedArray>collisions.tri, collisions.w1, collisions.w2)
    }
}