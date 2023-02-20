import { Vec2 } from "playcanvas-extended"
import { FieldPoint, field_point_subtract, fields_point_add_inplace_weighted, FieldsPoint, fields_point_add_inplace } from "./point.js"

export class Triangles2DMeshInterpolator<Point extends FieldPoint = FieldPoint> {
    private v0:  Point[]
    private v01: Point[]
    private v02: Point[]

    constructor(
        public vertices: Point[],
        public triangles: number[]
    ) {
        this.v0 = new Array(triangles.length / 3),
            this.v01 = new Array(triangles.length / 3),
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
        let result = { value: this.v0[tri] }

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

    collide(p: Vec2, collisionHandler: (tri: number, w1: number, w2: number) => void) {
        const cell = new Vec2()
            .sub2(p, this.mesh.bounds.origin)
            .div(this.mesh.bounds.size).floor()
        
        if (cell.x < 0 || cell.x >= this.resolution ||
            cell.y < 0 || cell.y >= this.resolution)
            return
        
        this.cells[cell.x + (cell.y * this.resolution)].collide(p, collisionHandler)
    }
}

export class Triangles2DMesh {
    xy01_length: Float64Array
    xy02_length: Float64Array

    private constructor(
        public vertices: Vec2[],
        public triangles: number[],
        public v0: Vec2[],
        public xy01: Vec2[],
        public xy02: Vec2[],
        public bounds: { origin: Vec2, size: Vec2 }
    ) {
        this.xy01_length = new Float64Array(this.xy01.length)
        this.xy02_length = new Float64Array(this.xy02.length)

        for (let i = 0; i < this.xy01.length; i++)
            this.xy01_length[i] = this.xy01[i].length()
        for (let i = 0; i < this.xy02.length; i++)
            this.xy02_length[i] = this.xy02[i].length()
    }

    static build(vertices: Vec2[], triangles: number[]) {
        const n = triangles.length / 3
        const v0 = new Array(n)
        const xy01 = new Array(n)
        const xy02 = new Array(n)

        for (let i = 0, tri = 0; i < triangles.length; i += 3, tri++) {
            const v0_i = vertices[triangles[i + 0]]
            const v1_i = vertices[triangles[i + 1]]
            const v2_i = vertices[triangles[i + 2]]

            v0[tri] = v0_i
            xy01[tri] = new Vec2().sub2(v1_i, v0_i)
            xy02[tri] = new Vec2().sub2(v2_i, v0_i)
        }

        const verts_min_x = Math.min(...vertices.map(v => v.x))
        const verts_max_x = Math.max(...vertices.map(v => v.x))
        const verts_min_y = Math.min(...vertices.map(v => v.y))
        const verts_max_y = Math.max(...vertices.map(v => v.y))

        const origin = new Vec2(verts_min_x, verts_min_y)
        const size = new Vec2(verts_max_x, verts_max_y).sub(origin)

        return new Triangles2DMesh(vertices, triangles, v0, xy01, xy02, { origin, size })
    }
}

class Triangles2DMeshQuad {
    private filtered_triangles: number[] = []

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
    }

    collide(point: Vec2, collisionHandler: (tri: number, w1: number, w2: number) => void) {
        for(let tri of this.filtered_triangles) {
            const v0 = this.mesh.v0[tri]
            const xy01 = this.mesh.xy01[tri]
            const xy02 = this.mesh.xy02[tri]

            const w = new Vec2().sub2(point, v0)
            const w2d = new Vec2(w.x, w.y)
            
            // w projected onto xy01 and xy02
            const w1 = xy01.dot(w2d) / this.mesh.xy01_length[tri]
            const w2 = xy02.dot(w2d) / this.mesh.xy02_length[tri]

            if (w1 < 0 || w2 < 0 || w1 + w2 > 1)
                continue
            
            collisionHandler(tri, w1, w2)
        }
    }
}