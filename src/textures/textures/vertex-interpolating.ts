import { Vec2 } from "playcanvas-extended";
import { Field, FieldPoint, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, Triangles2DMesh, Triangles2DMeshCollider, Triangles2DMeshInterpolator, defaultField } from "../../fields/index.js";
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
        let interpolated = { sample: undefined! as VertexSample }

        this.collider!.collide(
            location.uv,
            (tri, w1, w2) =>
                this.interpolator!.interpolate_add(
                    interpolated,
                    'sample',
                    tri, w1, w2
                )
        )

        return interpolated.sample
    }

    init(): void {
        const mesh = Triangles2DMesh.build(this.uv, this.triangles)
        this.collider = new Triangles2DMeshCollider(mesh)
        this.interpolator = new Triangles2DMeshInterpolator(this.vertices, this.triangles)
    }
}