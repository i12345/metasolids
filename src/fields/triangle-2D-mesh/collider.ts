import { Vec2 } from "playcanvas-extended"
import { IndicesTypedArray, indicesArrayType, invalidIndex } from "../../utils/indices-array.js"
import { NumberTypedArray } from "../../utils/typed-array.js"
import { FieldPointVector, FieldPointVectorContainerStatic } from "../vectorized/point.js"
import { Triangles2DMesh } from "./mesh.js"

export type TriangleCollisionHandler = (tri: number, w1: number, w2: number) => void
export type TriangleCollision = { tri: number, w1: number, w2: number }
export type TriangleCollisionVector = {
    tri: IndicesTypedArray
    w1: Float64Array
    w2: Float64Array
}

export type TriangleCollisionVectorTF = {
    invalid: Uint8Array
    tri: Int32Array
    w1: Float32Array
    w2: Float32Array
}

export class Triangles2DMeshCollider {
    private cells: Triangles2DMeshColliderQuad[]

    constructor(
        public mesh: Triangles2DMesh,
        public resolution = 5
    ) {
        this.cells = new Array(resolution ** 2)
        const cell_size = this.mesh.bounds.size.clone().divScalar(this.resolution)
        for (let x = 0; x < resolution; x++) {
            for (let y = 0; y < resolution; y++) {
                const min = new Vec2(x, y)
                    .divScalar(resolution)
                    .mul(this.mesh.bounds.size)
                    .add(this.mesh.bounds.origin)

                const max = new Vec2().add2(min, cell_size)

                this.cells[x + (y * resolution)] = new Triangles2DMeshColliderQuad(
                    this.mesh,
                    { min, max }
                )
            }
        }

        // const overlapResolution = 512
        // console.log(`Tri2D mesh has ${this.overlapCount(overlapResolution)} overlapping vertices out of ${overlapResolution**2} sampled locations`)
    }

    ensureNoOverlap(resolution = 256) {
        if (this.overlapCount(resolution) > 1)
            console.error()
    }

    overlapCount(resolution = 256) {
        const uv = new Vec2()
        let collidedOnce: boolean
        let collidedTwice: boolean
        let overlapCount = 0

        for (let x = 0; x < resolution; x++) {
            for (let y = 0; y < resolution; y++) {
                uv.x = x / resolution
                uv.y = y / resolution

                collidedOnce = false
                collidedTwice = false
                this.collide(uv, () => {
                    if (!collidedOnce)
                        collidedOnce = true
                    else if (!collidedTwice)
                        collidedTwice = true
                })

                if (collidedTwice)
                    overlapCount++
            }
        }

        return overlapCount
    }

    collide(p: Vec2, collisionHandler: TriangleCollisionHandler) {
        const cell = new Vec2()
            .sub2(p, this.mesh.bounds.origin)
            .div(this.mesh.bounds.size)
            .mulScalar(this.resolution)
            .floor()

        if (cell.x < 0 || cell.x >= this.resolution ||
            cell.y < 0 || cell.y >= this.resolution)
            return

        this.cells[cell.x + (cell.y * this.resolution)].collide(p, collisionHandler)
    }

    collision_first(p: Vec2): TriangleCollision | undefined {
        const cell = new Vec2()
            .sub2(p, this.mesh.bounds.origin)
            .div(this.mesh.bounds.size)
            .mulScalar(this.resolution)
            .floor()

        if (cell.x < 0 || cell.x >= this.resolution ||
            cell.y < 0 || cell.y >= this.resolution)
            return undefined

        return this.cells[cell.x + (cell.y * this.resolution)].collision_first(p)
    }

    collide_first_vectorized_tensor(p: FieldPointVector<Vec2, FieldPointVectorContainerStatic<NumberTypedArray>>): TriangleCollisionVectorTF {
        const { v0, tri_vec_inv, margin } = this.mesh
        const margin_min = -margin, margin_max = 1 + margin
        const resolution = this.resolution

        const bounds_origin_x = this.mesh.bounds.origin.x
        const bounds_origin_y = this.mesh.bounds.origin.y
        const resolution_div_bounds_size_y = resolution / this.mesh.bounds.size.y
        const resolution_div_bounds_size_x = resolution / this.mesh.bounds.size.x

        let p_x: number, p_y: number
        let cell_x: number, cell_y: number
        const cells_filtered_triangles = this.cells.map(cell => cell.filtered_triangles)

        let collided: boolean
        
        let v0_x: number, v0_y: number
        let x: number, y: number
        let tri_vec_inv_i: number
        let tri_vec_inv_a: number,
            tri_vec_inv_b: number,
            tri_vec_inv_c: number,
            tri_vec_inv_d: number
        
        let tri: number, w1: number, w2: number
        let tri_indices: IndicesTypedArray
        let tri_n: number

        const length = p.length / 2

        const result: TriangleCollisionVectorTF = {
            invalid: new Uint8Array(length),
            tri: new Int32Array(length),
            w1: new Float32Array(length),
            w2: new Float32Array(length),
        }
        const result_invalid = result.invalid
        const result_tri = result.tri
        const result_tri_invalid = 0
        const result_w1 = result.w1
        const result_w2 = result.w2
        
        for (let p_i = 0; p_i < length; p_i++) {
            p_x = p[(2 * p_i) + 0]
            p_y = p[(2 * p_i) + 1]

            cell_x = Math.floor((p_x - bounds_origin_x) * resolution_div_bounds_size_x)
            cell_y = Math.floor((p_y - bounds_origin_y) * resolution_div_bounds_size_y)

            if (cell_x < 0 || cell_x >= resolution ||
                cell_y < 0 || cell_y >= resolution ||
                isNaN(cell_x) || isNaN(cell_y)) {
                result_invalid[p_i] = 0xFF
                result_tri[p_i] = result_tri_invalid
                result_w1[p_i] = NaN
                result_w2[p_i] = NaN
                
                continue
            }

            tri_indices = cells_filtered_triangles[cell_x + (resolution * cell_y)]
            tri_n = tri_indices.length
            tri_vec_inv_i = 0

            collided = false

            for (let tri_i = 0; tri_i < tri_n; tri_i++) {
                tri = tri_indices[tri_i]

                v0_x = v0[(2 * tri) + 0]
                v0_y = v0[(2 * tri) + 1]

                x = p_x - v0_x
                y = p_y - v0_y

                tri_vec_inv_a = tri_vec_inv[tri_vec_inv_i++]
                tri_vec_inv_b = tri_vec_inv[tri_vec_inv_i++]
                tri_vec_inv_c = tri_vec_inv[tri_vec_inv_i++]
                tri_vec_inv_d = tri_vec_inv[tri_vec_inv_i++]

                w1 = (tri_vec_inv_a * x) + (tri_vec_inv_b * y)
                w2 = (tri_vec_inv_c * x) + (tri_vec_inv_d * y)

                if (w1 < margin_min || w2 < margin_min ||
                    w1 + w2 > margin_max)
                    continue
                
                if (w1 < 0) w1 = 0
                else if (w1 + w2 >= 1) w1 = 1 - w2

                if (w2 < 0) w2 = 0

                result_tri[p_i] = tri
                result_w1[p_i] = w1
                result_w2[p_i] = w2
                collided = true
                break
            }

            if (!collided) {
                result_invalid[p_i] = 0xFF
                result_tri[p_i] = result_tri_invalid
                result_w1[p_i] = NaN
                result_w2[p_i] = NaN
            }
        }

        return result
    }

    collide_first_vectorized(p: FieldPointVector<Vec2, FieldPointVectorContainerStatic<NumberTypedArray>>): TriangleCollisionVector {
        const { v0, tri_vec_inv, margin } = this.mesh
        const margin_min = -margin, margin_max = 1 + margin
        const resolution = this.resolution

        const bounds_origin_x = this.mesh.bounds.origin.x
        const bounds_origin_y = this.mesh.bounds.origin.y
        const resolution_div_bounds_size_y = resolution / this.mesh.bounds.size.y
        const resolution_div_bounds_size_x = resolution / this.mesh.bounds.size.x

        let p_x: number, p_y: number
        let cell_x: number, cell_y: number
        const cells_filtered_triangles = this.cells.map(cell => cell.filtered_triangles)

        let collided: boolean
        
        let v0_x: number, v0_y: number
        let x: number, y: number
        let tri_vec_inv_i: number
        let tri_vec_inv_a: number,
            tri_vec_inv_b: number,
            tri_vec_inv_c: number,
            tri_vec_inv_d: number
        
        let tri: number, w1: number, w2: number
        let tri_indices: IndicesTypedArray
        let tri_n: number

        const length = p.length / 2

        const result: TriangleCollisionVector = {
            tri: new (indicesArrayType(this.mesh.triangles.length / 3))(length),
            w1: new Float64Array(length),
            w2: new Float64Array(length),
        }
        const result_tri = result.tri
        const result_tri_invalid = invalidIndex(<IndicesTypedArray>result_tri)
        const result_w1 = result.w1
        const result_w2 = result.w2
        
        for (let p_i = 0; p_i < length; p_i++) {
            p_x = p[(2 * p_i) + 0]
            p_y = p[(2 * p_i) + 1]

            cell_x = Math.floor((p_x - bounds_origin_x) * resolution_div_bounds_size_x)
            cell_y = Math.floor((p_y - bounds_origin_y) * resolution_div_bounds_size_y)

            if (cell_x < 0 || cell_x >= resolution ||
                cell_y < 0 || cell_y >= resolution ||
                isNaN(cell_x) || isNaN(cell_y)) {
                result_tri[p_i] = result_tri_invalid
                result_w1[p_i] = NaN
                result_w2[p_i] = NaN
                
                continue
            }
            
            tri_indices = cells_filtered_triangles[cell_x + (resolution * cell_y)]
            tri_n = tri_indices.length
            tri_vec_inv_i = 0

            collided = false

            for (let tri_i = 0; tri_i < tri_n; tri_i++) {
                tri = tri_indices[tri_i]

                v0_x = v0[(2 * tri) + 0]
                v0_y = v0[(2 * tri) + 1]

                x = p_x - v0_x
                y = p_y - v0_y

                tri_vec_inv_a = tri_vec_inv[tri_vec_inv_i++]
                tri_vec_inv_b = tri_vec_inv[tri_vec_inv_i++]
                tri_vec_inv_c = tri_vec_inv[tri_vec_inv_i++]
                tri_vec_inv_d = tri_vec_inv[tri_vec_inv_i++]

                w1 = (tri_vec_inv_a * x) + (tri_vec_inv_b * y)
                w2 = (tri_vec_inv_c * x) + (tri_vec_inv_d * y)

                if (w1 < margin_min || w2 < margin_min ||
                    w1 + w2 > margin_max)
                    continue
                
                if (w1 < 0) w1 = 0
                else if (w1 + w2 >= 1) w1 = 1 - w2

                if (w2 < 0) w2 = 0

                result_tri[p_i] = tri
                result_w1[p_i] = w1
                result_w2[p_i] = w2
                collided = true
                break
            }

            if (!collided) {
                result_tri[p_i] = result_tri_invalid
                result_w1[p_i] = NaN
                result_w2[p_i] = NaN
            }
        }

        return result
    }

    render<OutputTF extends boolean = true>(render_resolution: Vec2, outputTFtypes: OutputTF = <OutputTF>true): OutputTF extends true ? TriangleCollisionVectorTF : TriangleCollisionVector {
        const { v0, tri_vec_inv, margin } = this.mesh
        const margin_min = -margin, margin_max = 1 + margin
        const resolution = this.resolution

        const bounds_origin_x = this.mesh.bounds.origin.x
        const bounds_origin_y = this.mesh.bounds.origin.y
        const bounds_size_y = this.mesh.bounds.size.y
        const bounds_size_x = this.mesh.bounds.size.x

        let p_x: number, p_y: number
        let cell_x: number, cell_y: number
        const cells_filtered_triangles = this.cells.map(cell => cell.filtered_triangles)

        let collided: boolean
        
        let v0_x: number, v0_y: number
        let x: number, y: number
        let tri_vec_inv_i: number
        let tri_vec_inv_a: number,
            tri_vec_inv_b: number,
            tri_vec_inv_c: number,
            tri_vec_inv_d: number
        
        let tri: number, w1: number, w2: number
        let tri_indices: IndicesTypedArray
        let tri_n: number

        const render_resolution_x = render_resolution.x
        const render_resolution_y = render_resolution.y
        const length = render_resolution_x * render_resolution_y

        const result_invalid = new Uint8Array(length)

        const result = <OutputTF extends true ? TriangleCollisionVectorTF : TriangleCollisionVector>(outputTFtypes ?
            {
                invalid: result_invalid,
                tri: new Int32Array(length),
                w1: new Float32Array(length),
                w2: new Float32Array(length),
            } : {
                tri: new (indicesArrayType(this.mesh.triangles.length / 3))(length),
                w1: new Float64Array(length),
                w2: new Float64Array(length),
            }
        )
        const result_tri = result.tri
        const result_tri_invalid = outputTFtypes ? 0 : invalidIndex(<IndicesTypedArray>result_tri)
        const result_w1 = result.w1
        const result_w2 = result.w2
        
        const bounds_size_x_div_render_resolution_x = bounds_size_x / render_resolution_x
        const bounds_size_y_div_render_resolution_y = bounds_size_y / render_resolution_y

        const resolution_div_render_resolution_x = resolution / render_resolution_x
        const resolution_div_render_resolution_y = resolution / render_resolution_y

        for (let p_i = 0; p_i < length; p_i++) {
            p_x = ((p_i % render_resolution_x) * bounds_size_x_div_render_resolution_x) + bounds_origin_x
            p_y = (Math.floor(p_i / render_resolution_x) * bounds_size_y_div_render_resolution_y) + bounds_origin_y

            cell_x = Math.floor((p_i % render_resolution_x) * resolution_div_render_resolution_x)
            cell_y = Math.floor(Math.floor(p_i / render_resolution_x) * resolution_div_render_resolution_y)

            if (cell_x < 0 || cell_x >= resolution ||
                cell_y < 0 || cell_y >= resolution ||
                isNaN(cell_x) || isNaN(cell_y)) {
                result_invalid[p_i] = 1
                result_tri[p_i] = result_tri_invalid
                result_w1[p_i] = NaN
                result_w2[p_i] = NaN
                
                continue
            }
            
            tri_indices = cells_filtered_triangles[cell_x + (resolution * cell_y)]
            tri_n = tri_indices.length
            tri_vec_inv_i = 0

            collided = false

            for (let tri_i = 0; tri_i < tri_n; tri_i++) {
                tri = tri_indices[tri_i]

                v0_x = v0[(2 * tri) + 0]
                v0_y = v0[(2 * tri) + 1]

                x = p_x - v0_x
                y = p_y - v0_y

                tri_vec_inv_a = tri_vec_inv[tri_vec_inv_i++]
                tri_vec_inv_b = tri_vec_inv[tri_vec_inv_i++]
                tri_vec_inv_c = tri_vec_inv[tri_vec_inv_i++]
                tri_vec_inv_d = tri_vec_inv[tri_vec_inv_i++]

                w1 = (tri_vec_inv_a * x) + (tri_vec_inv_b * y)
                w2 = (tri_vec_inv_c * x) + (tri_vec_inv_d * y)

                if (w1 < margin_min || w2 < margin_min ||
                    w1 + w2 > margin_max)
                    continue
                
                if (w1 < 0) w1 = 0
                else if (w1 + w2 >= 1) w1 = 1 - w2

                if (w2 < 0) w2 = 0

                result_tri[p_i] = tri
                result_w1[p_i] = w1
                result_w2[p_i] = w2
                collided = true
                break
            }

            if (!collided) {
                result_invalid[p_i] = 1
                result_tri[p_i] = result_tri_invalid
                result_w1[p_i] = NaN
                result_w2[p_i] = NaN
            }
        }

        return result
    }
}

export class Triangles2DMeshColliderQuad {
    readonly filtered_triangles: IndicesTypedArray

    constructor(
        public mesh: Triangles2DMesh,
        public bounds: { min: Vec2; max: Vec2} 
    ) {
        const { vertices, triangles } = mesh

        let i0: number, i1: number, i2: number
        let v0_x: number, v0_y: number, v1_x: number, v1_y: number, v2_x: number, v2_y: number
        let min_x: number, min_y: number, max_x: number, max_y: number

        const filtered_triangles: number[] = []

        for (let i = 0, tri = 0; i < this.mesh.triangles.length; i += 3, tri++) {
            i0 = triangles[i + 0]
            i1 = triangles[i + 1]
            i2 = triangles[i + 2]

            v0_x = vertices[(2 * i0) + 0]
            v0_y = vertices[(2 * i0) + 1]
            v1_x = vertices[(2 * i1) + 0]
            v1_y = vertices[(2 * i1) + 1]
            v2_x = vertices[(2 * i2) + 0]
            v2_y = vertices[(2 * i2) + 1]

            max_x = Math.max(v0_x, v1_x, v2_x)
            min_x = Math.min(v0_x, v1_x, v2_x)
            min_y = Math.min(v0_y, v1_y, v2_y)
            max_y = Math.max(v0_y, v1_y, v2_y)

            if (min_x > bounds.max.x ||
                max_x < bounds.min.x ||
                min_y > bounds.max.y ||
                max_y < bounds.min.y)
                continue

            filtered_triangles.push(tri)
        }

        this.filtered_triangles = new (indicesArrayType(this.mesh.triangles.length / 3))(filtered_triangles)
    }

    collide(point: Vec2, collisionHandler: TriangleCollisionHandler) {
        const { v0, tri_vec_inv, margin } = this.mesh
        const margin_min = -margin, margin_max = 1 + margin

        const p_x = point.x, p_y = point.y
        let v0_x: number, v0_y: number
        let x: number, y: number
        let tri_vec_inv_i = 0
        let tri_vec_inv_a: number, tri_vec_inv_b: number, tri_vec_inv_c: number, tri_vec_inv_d: number

        let tri: number, w1: number, w2: number
        const tri_indices = this.filtered_triangles
        const tri_n = tri_indices.length

        for (let tri_i = 0; tri_i < tri_n; tri_i++) {
            tri = tri_indices[tri_i]

            v0_x = v0[(2 * tri) + 0]
            v0_y = v0[(2 * tri) + 1]

            x = p_x - v0_x
            y = p_y - v0_y

            tri_vec_inv_a = tri_vec_inv[tri_vec_inv_i++]
            tri_vec_inv_b = tri_vec_inv[tri_vec_inv_i++]
            tri_vec_inv_c = tri_vec_inv[tri_vec_inv_i++]
            tri_vec_inv_d = tri_vec_inv[tri_vec_inv_i++]

            w1 = (tri_vec_inv_a * x) + (tri_vec_inv_b * y)
            w2 = (tri_vec_inv_c * x) + (tri_vec_inv_d * y)

            if (w1 < margin_min || w2 < margin_min ||
                w1 + w2 > margin_max)
                continue

            if (w1 < 0) w1 = 0
            else if (w1 + w2 >= 1) w1 = 1 - w2

            if (w2 < 0) w2 = 0

            collisionHandler(tri, w1, w2)
        }
    }

    collision_first(point: Vec2): TriangleCollision | undefined {
        const { v0, tri_vec_inv, margin } = this.mesh
        const margin_min = -margin, margin_max = 1 + margin

        const p_x = point.x, p_y = point.y
        let v0_x: number, v0_y: number
        let x: number, y: number
        let tri_vec_inv_i = 0
        let tri_vec_inv_a: number, tri_vec_inv_b: number, tri_vec_inv_c: number, tri_vec_inv_d: number

        let tri: number, w1: number, w2: number
        const tri_indices = this.filtered_triangles
        const tri_n = tri_indices.length

        for (let tri_i = 0; tri_i < tri_n; tri_i++) {
            tri = tri_indices[tri_i]

            v0_x = v0[(2 * tri) + 0]
            v0_y = v0[(2 * tri) + 1]

            x = p_x - v0_x
            y = p_y - v0_y

            tri_vec_inv_a = tri_vec_inv[tri_vec_inv_i++]
            tri_vec_inv_b = tri_vec_inv[tri_vec_inv_i++]
            tri_vec_inv_c = tri_vec_inv[tri_vec_inv_i++]
            tri_vec_inv_d = tri_vec_inv[tri_vec_inv_i++]

            w1 = (tri_vec_inv_a * x) + (tri_vec_inv_b * y)
            w2 = (tri_vec_inv_c * x) + (tri_vec_inv_d * y)

            if (w1 < margin_min || w2 < margin_min ||
                w1 + w2 > margin_max)
                continue

            if (w1 < 0) w1 = 0
            else if (w1 + w2 >= 1) w1 = 1 - w2

            if (w2 < 0) w2 = 0

            return { tri, w1, w2 }
        }

        return undefined
    }
}
