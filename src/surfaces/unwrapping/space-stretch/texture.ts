import { FieldPointVectorContainerStatic, FieldPointVectorStatic } from "../../../fields/vectorized/index.js"
import { NumberTypedArray, typedArrayClone } from "../../../paradigm/arrays/typed-array.js"
import * as tf from "@tensorflow/tfjs"
import { Texture, TextureLocation, TextureSamplingContext } from "../../../textures/index.js"
import { Vec2 } from "playcanvas-extended"
import { ScalarN } from "../../../utils/tf-rank.js"
import { MeshData } from "../../mesh-data.js"
import { SurfaceUVUnwrapping } from "../uv/index.js"
import { Triangles2DMesh, Triangles2DMeshCollider } from "../../../fields/triangle-2D-mesh/index.js"
import { FieldPointTensor2D } from "../../../fields/tensor/tensor.js"
import { vectorized } from "vectorized-functions"
import { FieldsField } from "../../../fields/fields/fields.js"
import { ScalarField } from "../../../fields/fields/scalar.js"
import { Field } from "../../../fields/index.js"

export type SpaceStretch = ScalarN<tf.Rank.R2>

export const SpaceStretchField = new FieldsField<SpaceStretch>({
    [0]: ScalarField.instance,
    [1]: ScalarField.instance,
})

export class SpaceStretchTexture<
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>
    >
    implements Texture<
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        FieldPointVectorContainerStatic<NumberTypedArray>,
        SpaceStretch,
        SpaceStretch,
        SpaceStretch,
        FieldPointVectorContainerStatic<NumberTypedArray>,
        TextureSamplingContextT
    > {
    /**
     * Let x = a point in triangle space
     * Let (u, v)  = f(x)    = F((u,v)) + \vec{f}_0 = transform from triangle space to UV space
     * Let \vec{y} = g(x)    = G(x) + \vec{g}_0     = transform from triangle space to real position
     * Let \vec{t} = t(u, v) = G(F^{-1})((u, v))
     *                       = G(F^{-1})((u, v) - \vec{f}_0) + \vec{g}_0
     *                       = transform from UV space to real position
     *
     * F = [\vec{f}_01, \vec{f}_02]
     *   = [{\vec{f}_01}_x, {\vec{f}_02}_x; {\vec{f}_01}_y, {\vec{f}_02}_y]
     *   = [f_a, f_b ; f_c, f_d]
     * F^{-1} = (1/( (f_a)(f_d) - (f_b)(f_c) ))[f_d, -f_b ; -f_c, f_a]
     * G = [\vec{g}_01, \vec{g}_02]
     *   = [g_a, g_b ; g_c, g_d ; g_e, g_f]
     *
     * \vec{t}(u, v) = G(F^{-1})((u, v) - \vec{f}_0) + \vec{g}_0
     *               = G(F^{-1})((u, v)) - G(F^{-1})(\vec{f}_0) + \vec{g}_0
     *
     * G(F^{-1}) = (1/( (f_a)(f_d) - (f_b)(f_c) )) [
     *   (g_a)(f_d) + (g_b)(-f_c), (g_a)(-f_b) + (g_b)(f_a) ;
     *   (g_c)(f_d) + (g_d)(-f_c), (g_c)(-f_b) + (g_d)(f_a) ;
     *   (g_e)(f_d) + (g_f)(-f_c), (g_e)(-f_b) + (g_f)(f_a) ;
     * ]
     *
     * For each pixel, we want to know |\frac{\delta t}{\delta u}| and |\frac{\delta t}{\delta v}|
     *
     * Let T = G(F^{-1}) = [\vec{t_u}, \vec{t_v}]
     *
     * |\frac{\delta t}{\delta u}| = |t_u|
     * |\frac{\delta t}{\delta v}| = |t_v|
     */
    private t!: {
        u: tf.Tensor1D
        v: tf.Tensor1D
    }

    private readonly collider: Triangles2DMeshCollider

    readonly field: Field<SpaceStretch> = SpaceStretchField

    constructor(
        public readonly mesh: MeshData,
        public readonly UVunwrapping: SurfaceUVUnwrapping
    ) {
        this.collider = new Triangles2DMeshCollider(Triangles2DMesh.build(UVunwrapping.UVs, UVunwrapping.finalIndices, { origin: Vec2.ZERO, size: Vec2.ONE }))
    }

    init(context: TextureSamplingContextT): void {
        this.t = tf.tidy(() => {
            function triangle_transform_matrix(vertices: Float32Array, indices: Int32Array, dimensionality: number): tf.Tensor3D {
                const vertices_tensor = tf.tensor2d(vertices, [vertices.length / dimensionality, dimensionality])
                const indices_tensor = tf.tensor2d(indices, [indices.length / 3, 3])
                const [indices_tensor_0, indices_tensor_1, indices_tensor_2] = indices_tensor.unstack(1)

                const vertices_0 = vertices_tensor.gather(indices_tensor_0)
                const vertices_1 = vertices_tensor.gather(indices_tensor_1)
                const vertices_2 = vertices_tensor.gather(indices_tensor_2)

                const t_01 = vertices_1.sub(vertices_0)
                const t_02 = vertices_2.sub(vertices_0)

                return <tf.Tensor3D>tf.stack([t_01, t_02], -1)
            }

            function matInv2x2(mat: tf.Tensor3D): tf.Tensor3D {
                const [ab, cd] = mat.unstack(1)
                const [a, b] = ab.unstack(1)
                const [c, d] = cd.unstack(1)

                const det_inv = tf.sub(tf.mul(a, d), tf.mul(b, c))

                const a1 = d
                const b1 = b.neg()
                const c1 = c.neg()
                const d1 = a

                const ab1 = tf.stack([a1, b1], 1)
                const cd1 = tf.stack([c1, d1], 1)
                const mat1 = tf.stack([ab1, cd1], 1)

                return mat1.div(det_inv.expandDims(-1).expandDims(-1))
            }

            const F = triangle_transform_matrix(this.mesh.vertices, typedArrayClone(this.mesh.triangles, Int32Array), 3)
            const G = triangle_transform_matrix(this.UVunwrapping.UVs, typedArrayClone(this.UVunwrapping.finalIndices, Int32Array), 2)

            const F_inv = matInv2x2(F)

            const GF_inv = <tf.Tensor3D>G.matMul(F_inv)

            const T = GF_inv

            const [t_u, t_v] = <[tf.Tensor2D, tf.Tensor2D]>T.unstack(-1)

            return {
                u: <tf.Tensor1D>t_u.square().sum(-1).sqrt(),
                v: <tf.Tensor1D>t_v.square().sum(-1).sqrt(),
            }
        })
    }

    @vectorized(SpaceStretchTexture.sample_vectorized)
    sample(location: TextureLocationT, context: TextureSamplingContextT): ScalarN<tf.Rank.R2> {
        const collision = this.collider.collision_first(location.uv)
        if (!collision) {
            return {
                [0]: 0,
                [1]: 0,
            }
        }

        const tri = collision.tri

        return {
            [0]: this.t.v.gather([tri]).dataSync()[0],
            [1]: this.t.u.gather([tri]).dataSync()[0],
        }
    }

    private static sample_vectorized<
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>
    >(
        this: SpaceStretchTexture<
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSamplingContextT
        >,
        locations: FieldPointVectorStatic<TextureLocationT>
    ): FieldPointVectorStatic<ScalarN<tf.Rank.R2>> {
        const collision = this.collider.collide_first_vectorized_tensor(locations.uv)
        const tri = tf.tensor1d(<tf.TypedArray>collision.tri, 'int32')
        const tri_invalid = tf.tensor1d(collision.invalid, 'bool')
        const invalid = tf.scalar(1)

        return {
            [0]: invalid.where(tri_invalid, this.t.v.gather(tri)).dataSync(),
            [1]: invalid.where(tri_invalid, this.t.u.gather(tri)).dataSync(),
        }
    }

    render(resolution: Vec2): FieldPointTensor2D<ScalarN<tf.Rank.R2>> {
        const collision = this.collider.render(resolution, true)
        const tri = tf.tensor2d(<tf.TypedArray>collision.tri, [resolution.y, resolution.x], 'int32')
        const tri_invalid = tf.tensor2d(collision.invalid, [resolution.y, resolution.x], 'bool')
        const invalid = tf.scalar(0)

        return {
            [0]: <tf.Tensor2D><unknown>invalid.where(tri_invalid, this.t.v.gather(tri)),
            [1]: <tf.Tensor2D><unknown>invalid.where(tri_invalid, this.t.u.gather(tri)),
        }
    }
}
