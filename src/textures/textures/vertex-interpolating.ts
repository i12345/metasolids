import { Vec2 } from "playcanvas-physics-advanced";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs } from "../../paradigm/trees/index.js";
import { Field, FieldPoint, FieldPointMapped, FieldPointNumbers, Triangles2DMesh, Triangles2DMeshCollider, Triangles2DMeshInterpolator, field_point_new, tensor } from "../../fields/index.js";
import { Texture, TextureLocation, TextureRenderContext, TextureSamplingContext } from "../texture.js";
import { IndicesArray, IndicesTypedArray } from "../../utils/indices-array.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorStatic } from "../../fields/vectorized/point.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { vectorized } from "vectorized-functions";
import * as tf from "@tensorflow/tfjs";
import { FieldPointTensor, field_point_tensor_encode, field_point_tensor_map } from "../../fields/tensor/tensor.js";

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
            WithMultiObjectsIDs<Objects, ObjIDsT> & TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureLocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        TextureLocationVector extends
            FieldPointVector<TextureLocationElementType, TextureLocationContainer> =
            FieldPointVector<TextureLocationElementType, TextureLocationContainer>,
    > implements
    Texture<
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureLocationContainer,
        VertexSample,
        VertexSampleElementType,
        VertexSampleFuseMode,
        VertexSampleContainer,
        Context,
        Objects,
        ObjIDsT,
        FieldPointVectorContainerStatic<ObjIDsT>,
        TextureLocationVector,
        VertexSampleVector
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

    render(resolution: Vec2, context: TextureRenderContext<
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureLocationContainer,
            VertexSample,
            VertexSampleElementType,
            VertexSampleFuseMode,
            VertexSampleContainer,
            Context,
            Objects,
            ObjIDsT,
            FieldPointVectorContainerStatic<ObjIDsT>,
            TextureLocationVector,
            VertexSampleVector
        >): tensor.FieldPointTensor2D<VertexSampleElementType> {
        const collision = this.collider!.render(resolution, true, context.transform)
        const interpolated = this.interpolator!.interpolate_vectorized(collision.tri, collision.w1, collision.w2)
        return field_point_tensor_encode(
            this.field.elementType,
            [resolution.y, resolution.x],
            undefined,
            interpolated
        )
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
                WithMultiObjectsIDs<Objects, ObjIDsT> & TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
            TextureLocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
            TextureLocationVector extends
                FieldPointVector<TextureLocationElementType, TextureLocationContainer> =
                FieldPointVector<TextureLocationElementType, TextureLocationContainer>,
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
                    Context,
                    TextureLocationContainer,
                    TextureLocationVector
                >,
            locations: FieldPointVector<TextureLocationElementType, FieldPointVectorContainerStatic>,
            context: Context
        ): VertexSampleVector {
        const collisions = this.collider!.collide_first_vectorized(locations.uv)
        return this.interpolator!.interpolate_vectorized(<IndicesTypedArray>collisions.tri, collisions.w1, collisions.w2)
    }
}