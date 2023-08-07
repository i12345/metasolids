import { Vec2 } from "playcanvas-extended"
import { FieldPoint, field_point_subtract, fields_point_add_inplace_weighted, FieldsPoint, fields_point_add_inplace, field_point_clone } from "./point.js"
import { IndicesArray } from "../utils/indices-array.js"

export class Triangles2DMeshInterpolator<Point extends FieldPoint = FieldPoint> {
    private v0:  Point[]
    private v01: Point[]
    private v02: Point[]

    constructor(
        public vertices: Point[],
        public triangles: IndicesArray
    ) {
        this.v0 = new Array(triangles.length / 3)
        this.v01 = new Array(triangles.length / 3)
        this.v02 = new Array(triangles.length / 3)
        
        for (let i = 0, tri = 0; i < triangles.length; i += 3, tri++) {
            const v0 = this.vertices[triangles[i + 0]]
            const v1 = this.vertices[triangles[i + 1]]
            const v2 = this.vertices[triangles[i + 2]]

            this.v0[tri] = v0
            this.v01[tri] = field_point_subtract(v1, v0)
            this.v02[tri] = field_point_subtract(v2, v0)
        }
    }

    interpolate(
            tri: number,
            w1: number,
            w2: number
        ): Point {
        let result = { value: field_point_clone(this.v0[tri]) }

        fields_point_add_inplace_weighted(
            result,
            'value',
            this.v01[tri],
            w1
        )

        fields_point_add_inplace_weighted(
            result,
            'value',
            this.v02[tri],
            w2
        )

        return result.value
    }
    
    interpolate_add<ContainingFieldsPoint extends FieldsPoint>(
            result: ContainingFieldsPoint,
            key: keyof ContainingFieldsPoint,
            tri: number,
            w1: number,
            w2: number
        ): void {
        fields_point_add_inplace(
            result,
            key,
            this.v0[tri]
        )

        fields_point_add_inplace_weighted(
            result,
            key,
            this.v01[tri],
            w1
        )

        fields_point_add_inplace_weighted(
            result,
            key,
            this.v02[tri],
            w2
        )
    }
}

export type TriangleCollisionHandler = (tri: number, w1: number, w2: number) => void
export type TriangleCollision = { tri: number, w1: number, w2: number }

export class Triangles2DMeshCollider {
    private cells: Triangles2DMeshQuad[]

    constructor(
        public mesh: Triangles2DMesh,
        public resolution = 5
    ) {
        this.cells = new Array(resolution ** 2)
        for (let x = 0; x < resolution; x++) {
            for (let y = 0; y < resolution; y++) {
                const min = new Vec2(x, y)
                    .mul(this.mesh.bounds.size)
                    .divScalar(resolution)
                    .add(this.mesh.bounds.origin)

                const max = new Vec2(resolution, resolution).add(min)
                
                this.cells[x + (y * resolution)] = new Triangles2DMeshQuad(
                    this.mesh,
                    { min, max }
                )
            }
        }
    }

    collide(p: Vec2, collisionHandler: TriangleCollisionHandler) {
        const cell = new Vec2()
            .sub2(p, this.mesh.bounds.origin)
            .div(this.mesh.bounds.size).floor()
        
        if (cell.x < 0 || cell.x >= this.resolution ||
            cell.y < 0 || cell.y >= this.resolution)
            return
        
        this.cells[cell.x + (cell.y * this.resolution)].collide(p, collisionHandler)
    }

    collision_first(p: Vec2): TriangleCollision | undefined {
        const cell = new Vec2()
            .sub2(p, this.mesh.bounds.origin)
            .div(this.mesh.bounds.size).floor()
        
        if (cell.x < 0 || cell.x >= this.resolution ||
            cell.y < 0 || cell.y >= this.resolution)
            return undefined
        
        return this.cells[cell.x + (cell.y * this.resolution)].collision_first(p)
    }
}

export class Triangles2DMesh {
    private constructor(
        public readonly vertices: Vec2[],
        public readonly triangles: ArrayLike<number>,
        public readonly v0: Float64Array,
        public readonly tri_vec_inv: Float64Array,
        public readonly bounds: { readonly origin: Vec2, readonly size: Vec2 }
    ) {
    }

    static build(vertices: Vec2[], triangles: ArrayLike<number>) {
        const n = triangles.length / 3

        /**
         * Each two elements means a triangle origin (x, y)
         */
        const v0 = new Float64Array(2 * n)

        /**
         * Each four elements means a matrix T^-1, where
         * 
         * T = [xy01.x  xy02.x; xy01.y  xy02.y]
         * T (u v) = (x y [relative to v0])
         * 
         * T^-1 = (1 / ((xy01.x)(xy02.y) - (xy02.x)(xy01.y))) *
         * [xy02.y  -xy02.x;  -xy01.y  xy01.x]
         */
        const tri_vec_inv = new Float64Array(4 * n)

        for (let i = 0, tri = 0; i < triangles.length; i += 3, tri++) {
            const v0_i = vertices[triangles[i + 0]]
            const v1_i = vertices[triangles[i + 1]]
            const v2_i = vertices[triangles[i + 2]]

            v0[(2 * tri) + 0] = v0_i.x
            v0[(2 * tri) + 1] = v0_i.y

            const xy01_x = v1_i.x - v0_i.x
            const xy01_y = v1_i.y - v0_i.y
            const xy02_x = v2_i.x - v0_i.x
            const xy02_y = v2_i.y - v0_i.y

            const det = (xy01_x * xy02_y) - (xy02_x * xy01_y)
            tri_vec_inv[(4 * tri) + 0] =  xy02_y / det
            tri_vec_inv[(4 * tri) + 1] = -xy02_x / det
            tri_vec_inv[(4 * tri) + 2] = -xy01_y / det
            tri_vec_inv[(4 * tri) + 3] =  xy01_x / det
        }

        const verts_min_x = Math.min(...vertices.map(v => v.x))
        const verts_max_x = Math.max(...vertices.map(v => v.x))
        const verts_min_y = Math.min(...vertices.map(v => v.y))
        const verts_max_y = Math.max(...vertices.map(v => v.y))

        const origin = new Vec2(verts_min_x, verts_min_y)
        const size = new Vec2(verts_max_x, verts_max_y).sub(origin)

        return new Triangles2DMesh(vertices, triangles, v0, tri_vec_inv, { origin, size })
    }
}

class Triangles2DMeshQuad {
    private filtered_triangles: number[] = []

    private readonly margins: {
        readonly min: number
        readonly max: number
    }

    constructor(
        public mesh: Triangles2DMesh,
        public bounds: { min: Vec2, max: Vec2 }
    ) {
        for (let i = 0, tri = 0; i < this.mesh.triangles.length; i += 3) {
            let v0 = this.mesh.vertices[this.mesh.triangles[i + 0]]
            let v1 = this.mesh.vertices[this.mesh.triangles[i + 1]]
            let v2 = this.mesh.vertices[this.mesh.triangles[i + 2]]

            const min_x = Math.min(v0.x, v1.x, v2.x)
            const max_x = Math.max(v0.x, v1.x, v2.x)
            const min_y = Math.min(v0.y, v1.y, v2.y)
            const max_y = Math.max(v0.y, v1.y, v2.y)

            if (min_x >= bounds.max.x ||
                max_x <= bounds.min.x ||
                min_y >= bounds.max.y ||
                max_y <= bounds.min.y)
                continue
            
            this.filtered_triangles.push(tri++)
        }

        const size = new Vec2().sub2(this.bounds.max, this.bounds.min)
        const margin = size.length() / (4 * 1024)
        this.margins = {
            min: -margin,
            max: 1 + (2 * margin)
        }
    }

    collide(point: Vec2, collisionHandler: TriangleCollisionHandler) {
        const { v0, tri_vec_inv } = this.mesh
        const { min: margin_min, max: margin_max } = this.margins

        for (let tri of this.filtered_triangles) {
            const v0_x = v0[(2 * tri) + 0]
            const v0_y = v0[(2 * tri) + 1]

            const x = point.x - v0_x
            const y = point.y - v0_y

            const tri_vec_inv_a = tri_vec_inv[(4 * tri) + 0]
            const tri_vec_inv_b = tri_vec_inv[(4 * tri) + 1]
            const tri_vec_inv_c = tri_vec_inv[(4 * tri) + 2]
            const tri_vec_inv_d = tri_vec_inv[(4 * tri) + 3]

            const w1 = (tri_vec_inv_a * x) + (tri_vec_inv_b * y)
            const w2 = (tri_vec_inv_c * x) + (tri_vec_inv_d * y)

            if (w1 < margin_min || w2 < margin_min ||
                w1 + w2 >= margin_max)
                continue
            
            collisionHandler(tri, w1, w2)
        }
    }

    collision_first(point: Vec2): TriangleCollision | undefined {
        const { v0, tri_vec_inv } = this.mesh
        const { min: margin_min, max: margin_max } = this.margins

        for (let tri of this.filtered_triangles) {
            const v0_x = v0[(2 * tri) + 0]
            const v0_y = v0[(2 * tri) + 1]

            const x = point.x - v0_x
            const y = point.y - v0_y

            const tri_vec_inv_a = tri_vec_inv[(4 * tri) + 0]
            const tri_vec_inv_b = tri_vec_inv[(4 * tri) + 1]
            const tri_vec_inv_c = tri_vec_inv[(4 * tri) + 2]
            const tri_vec_inv_d = tri_vec_inv[(4 * tri) + 3]

            const w1 = (tri_vec_inv_a * x) + (tri_vec_inv_b * y)
            const w2 = (tri_vec_inv_c * x) + (tri_vec_inv_d * y)

            if (w1 < margin_min || w2 < margin_min ||
                w1 + w2 >= margin_max)
                continue
            
            return { tri, w1, w2 }
        }

        return undefined
    }
}