import { Vec2 } from "playcanvas-physics-advanced"
import { NumberArrayLike } from "../../utils/typed-array.js"

export class Triangles2DMesh {
    private constructor(
        public readonly vertices: NumberArrayLike,
        public readonly triangles: NumberArrayLike,
        public readonly v0: Float64Array,
        public readonly tri_vec_inv: Float64Array,
        public readonly bounds: { readonly origin: Vec2, readonly size: Vec2 },
        public margin = 0.001
    ) {
    }

    addToDocument() {
        const cvs = document.createElement('canvas')
        const scale = 512
        cvs.width = cvs.height = scale
        document.body.appendChild(cvs)
        cvs.style.position = 'absolute'
        cvs.style.right = '10px'
        cvs.style.top = '10px'
        const ctx = cvs.getContext('2d')!
        
        ctx.lineWidth = 1

        for (let tri_i = 0; tri_i < this.triangles.length;) {            
            const v0_i = this.triangles[tri_i++]
            const v1_i = this.triangles[tri_i++]
            const v2_i = this.triangles[tri_i++]

            const v0_x = scale * this.vertices[(2 * v0_i) + 0]
            const v0_y = scale * this.vertices[(2 * v0_i) + 1]
            const v1_x = scale * this.vertices[(2 * v1_i) + 0]
            const v1_y = scale * this.vertices[(2 * v1_i) + 1]
            const v2_x = scale * this.vertices[(2 * v2_i) + 0]
            const v2_y = scale * this.vertices[(2 * v2_i) + 1]
            
            ctx.beginPath()
            ctx.moveTo(v0_x, v0_y)
            ctx.lineTo(v1_x, v1_y)
            ctx.lineTo(v2_x, v2_y)
            ctx.closePath()
            ctx.fillStyle = `#${Math.floor(0xFF * Math.random()).toString(16)}${Math.floor(0xFF * Math.random()).toString(16)}${Math.floor(0xFF * Math.random()).toString(16)}20`
            ctx.fill()
            ctx.stroke()
        }

        return cvs
    }

    static build(
            vertices: NumberArrayLike,
            triangles: NumberArrayLike,
            presetBounds?: {
                origin: Vec2,
                size: Vec2
            }
        ) {
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

        let i0: number, i1: number, i2: number
        let v0_x: number, v0_y: number,
            v1_x: number, v1_y: number,
            v2_x: number, v2_y: number

        let v_min_x = Number.POSITIVE_INFINITY, v_min_y = Number.POSITIVE_INFINITY,
            v_max_x = Number.NEGATIVE_INFINITY, v_max_y = Number.NEGATIVE_INFINITY

        for (let i = 0, tri = 0; i < triangles.length; i += 3, tri++) {
            i0 = triangles[i + 0]
            i1 = triangles[i + 1]
            i2 = triangles[i + 2]

            v0_x = vertices[(2 * i0) + 0]
            v0_y = vertices[(2 * i0) + 1]
            v1_x = vertices[(2 * i1) + 0]
            v1_y = vertices[(2 * i1) + 1]
            v2_x = vertices[(2 * i2) + 0]
            v2_y = vertices[(2 * i2) + 1]

            if (v_min_x > v0_x) v_min_x = v0_x
            if (v_max_x < v0_x) v_max_x = v0_x
            if (v_min_x > v1_x) v_min_x = v1_x
            if (v_max_x < v1_x) v_max_x = v1_x
            if (v_min_x > v2_x) v_min_x = v2_x
            if (v_max_x < v2_x) v_max_x = v2_x

            if (v_min_y > v0_y) v_min_y = v0_y
            if (v_max_y < v0_y) v_max_y = v0_y
            if (v_min_y > v1_y) v_min_y = v1_y
            if (v_max_y < v1_y) v_max_y = v1_y
            if (v_min_y > v2_y) v_min_y = v2_y
            if (v_max_y < v2_y) v_max_y = v2_y

            v0[(2 * tri) + 0] = v0_x
            v0[(2 * tri) + 1] = v0_y

            const xy01_x = v1_x - v0_x
            const xy01_y = v1_y - v0_y
            const xy02_x = v2_x - v0_x
            const xy02_y = v2_y - v0_y

            const det = (xy01_x * xy02_y) - (xy02_x * xy01_y)
            tri_vec_inv[(4 * tri) + 0] =  xy02_y / det
            tri_vec_inv[(4 * tri) + 1] = -xy02_x / det
            tri_vec_inv[(4 * tri) + 2] = -xy01_y / det
            tri_vec_inv[(4 * tri) + 3] =  xy01_x / det
        }

        const origin = new Vec2(v_min_x, v_min_y)
        const size = new Vec2(v_max_x, v_max_y).sub(origin)

        return new Triangles2DMesh(vertices, triangles, v0, tri_vec_inv, presetBounds ?? { origin, size })
    }
}