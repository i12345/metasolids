import { Vec2 } from "playcanvas-extended";
import { Field, FieldPoint, Triangles2DMesh, Triangles2DMeshCollider, Triangles2DMeshInterpolator } from "../fields";
import { Texture, TextureLocation } from "./texture";

export class VertexInterpolatingTexture
    <VertexSample extends FieldPoint = FieldPoint>
    implements
    Texture<
        TextureLocation,
        VertexSample
    > {
    field: Field<VertexSample>
    
    private collider: Triangles2DMeshCollider
    private interpolator: Triangles2DMeshInterpolator<VertexSample>
    

    constructor(
        public vertices: VertexSample[],
        public uv: Vec2[],
        public triangles: number[],
    ) {
    }

    sample(location: TextureLocation): VertexSample {
        let interpolated = { sample: undefined as VertexSample }

        this.collider.collide(
            location.uv,
            (tri, w1, w2) =>
                this.interpolator.interpolate_add(
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