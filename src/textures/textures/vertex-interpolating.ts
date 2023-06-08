import { Vec2 } from "playcanvas-extended";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate } from "../../paradigm/index.js";
import { Field, FieldPoint, Triangles2DMesh, Triangles2DMeshCollider, Triangles2DMeshInterpolator, defaultField, field_point_identity } from "../../fields/index.js";
import { Texture, TextureLocation } from "../texture.js";
import { IndiciesArray } from "../../utils/indices-array.js";

export type VertexInterpolatingTexturesTemplated<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TexelType extends FieldPoint = FieldPoint,
        TexelTypesGrouped extends
            MultiObjectsGroupsMapped<Groups, TexelType> =
            MultiObjectsGroupsMapped<Groups, TexelType>
    > = {
    [K in keyof TexelTypesGrouped]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            (TexelTypesGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], TexelType> ?
                VertexInterpolatingTexturesTemplated<Groups[K], TexelTypesGrouped[K]> :
                never) :
            VertexInterpolatingTexture<TexelTypesGrouped[K]>
    }

export class VertexInterpolatingTexture
    <VertexSample extends FieldPoint = FieldPoint>
    implements
    Texture<
        TextureLocation,
        VertexSample
    > {
    field: Field<VertexSample>
    
    private collider?: Triangles2DMeshCollider
    private interpolator?: Triangles2DMeshInterpolator<VertexSample>
    

    constructor(
        public vertices: VertexSample[],
        public uv: Vec2[],
        public triangles: IndiciesArray,
    ) {
        this.field = vertices.length > 0 ? defaultField(vertices[0]) : undefined!
    }

    sample(location: TextureLocation): VertexSample {
        const collision = this.collider!.collision_first(location.uv)

        if (collision === undefined)
            return field_point_identity(this.vertices[0])
        
        const { tri, w1, w2 } = collision
        return this.interpolator!.interpolate(tri, w1, w2)
    }

    init(): void {
        const mesh = Triangles2DMesh.build(this.uv, this.triangles)
        this.collider = new Triangles2DMeshCollider(mesh)
        this.interpolator = new Triangles2DMeshInterpolator(this.vertices, this.triangles)
    }
}