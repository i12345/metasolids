import { Vec2 } from "playcanvas-extended"
import { FieldPoint, field_point_subtract, fields_point_add_inplace_weighted, FieldsPoint, fields_point_add_inplace } from "./point.js"
import { FieldPointType } from "./type.js"
import { IndicesArray, IndicesTypedArray } from "../utils/indices-array.js"
import { NumberArrayLike } from "../utils/typed-array.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorWithMultiObjects, IsDynamicVector, ItemObjIDsKey, field_point_vectorized_multi_objects_new } from "./vectorized/index.js"
import { vectorIterator } from "./vectorized/iterators/factory.js"
import { MultiObjectsIDs, MultiObjectsTemplate } from "../paradigm/trees/multi-objects.js"

export class Triangles2DMeshInterpolator<
        VertexPoint extends FieldPoint = FieldPoint,
        VertexContainer extends FieldPointVectorContainer = FieldPointVectorContainer,
        VertexVector extends FieldPointVector<VertexPoint, VertexContainer> = FieldPointVector<VertexPoint, VertexContainer>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainer<ObjIDsT>
    > {
    private readonly v0:  VertexVector
    private readonly v01: VertexVector
    private readonly v02: VertexVector

    private readonly get_v0: (index: number) => VertexPoint
    private readonly get_v01: (index: number) => VertexPoint
    private readonly get_v02: (index: number) => VertexPoint

    constructor(
        public readonly vertexType: FieldPointType<VertexPoint>,
        public readonly vertices: VertexVector,
        public readonly triangles: IndicesArray,
        public readonly multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ) {
        const iterator = vectorIterator(vertexType, <IsDynamicVector<VertexPoint, VertexContainer>>false, multiObjectIDs)
        
        this.v0 = <VertexVector><unknown>field_point_vectorized_multi_objects_new<VertexPoint, VertexContainer, ObjIDsT, ObjIDsContainer>(
            vertexType,
            triangles.length / 3,
            undefined,
            multiObjectIDs?.IDsType,
            <any>(<FieldPointVectorWithMultiObjects>vertices)[ItemObjIDsKey]?.length
        )

        this.v01 = <VertexVector><unknown>field_point_vectorized_multi_objects_new<VertexPoint, VertexContainer, ObjIDsT, ObjIDsContainer>(
            vertexType,
            triangles.length / 3,
            undefined,
            multiObjectIDs?.IDsType,
            <any>(<FieldPointVectorWithMultiObjects>vertices)[ItemObjIDsKey]?.length
        )

        this.v02 = <VertexVector><unknown>field_point_vectorized_multi_objects_new<VertexPoint, VertexContainer, ObjIDsT, ObjIDsContainer>(
            vertexType,
            triangles.length / 3,
            undefined,
            multiObjectIDs?.IDsType,
            <any>(<FieldPointVectorWithMultiObjects>vertices)[ItemObjIDsKey]?.length
        )

        this.get_v0 = iterator.get_returnValue.bind(iterator, this.v0, this.v0)
        this.get_v01 = iterator.get_returnValue.bind(iterator, this.v01, this.v01)
        this.get_v02 = iterator.get_returnValue.bind(iterator, this.v02, this.v02)

        const get_vertex = iterator.get_returnValue.bind(iterator, vertices, vertices)
        const set_v0 = iterator.set.bind(iterator, this.v0, this.v0)
        const set_v01 = iterator.set.bind(iterator, this.v0, this.v01)
        const set_v02 = iterator.set.bind(iterator, this.v0, this.v02)
        
        //TODO: use non-reduced arithmetic fuse mode
        for (let i = 0, tri = 0; i < triangles.length; i += 3, tri++) {
            const v0 = get_vertex(triangles[i + 0])
            const v1 = get_vertex(triangles[i + 1])
            const v2 = get_vertex(triangles[i + 2])

            set_v0(v0, tri)
            set_v01(field_point_subtract(v1, v0), tri)
            set_v02(field_point_subtract(v2, v0), tri)
        }
    }

    interpolate(
            tri: number,
            w1: number,
            w2: number
        ): VertexPoint {
        let result = { value: this.get_v0(tri) }

        fields_point_add_inplace_weighted(
            result,
            'value',
            this.get_v01(tri),
            w1
        )

        fields_point_add_inplace_weighted(
            result,
            'value',
            this.get_v02(tri),
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
            this.get_v0(tri)
        )

        fields_point_add_inplace_weighted(
            result,
            key,
            this.get_v01(tri),
            w1
        )

        fields_point_add_inplace_weighted(
            result,
            key,
            this.get_v02(tri),
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
        public readonly vertices: NumberArrayLike,
        public readonly triangles: NumberArrayLike,
        public readonly v0: Float64Array,
        public readonly tri_vec_inv: Float64Array,
        public readonly bounds: { readonly origin: Vec2, readonly size: Vec2 }
    ) {
    }

    static build(
            vertices: NumberArrayLike,
            triangles: NumberArrayLike,
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
            if (v_max_x < v0_x) v_max_x < v0_x
            if (v_min_x > v1_x) v_min_x = v1_x
            if (v_max_x < v1_x) v_max_x < v1_x
            if (v_min_x > v2_x) v_min_x = v1_x
            if (v_max_x < v2_x) v_max_x < v1_x

            if (v_min_y > v0_y) v_min_y = v0_y
            if (v_max_y < v0_y) v_max_y < v0_y
            if (v_min_y > v1_y) v_min_y = v1_y
            if (v_max_y < v1_y) v_max_y < v1_y
            if (v_min_y > v2_y) v_min_y = v1_y
            if (v_max_y < v2_y) v_max_y < v1_y

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
        const { vertices, triangles } = mesh

        let i0: number, i1: number, i2: number
        let v0_x: number, v0_y: number,
            v1_x: number, v1_y: number,
            v2_x: number, v2_y: number
        let min_x: number, min_y: number,
            max_x: number, max_y: number
        
        for (let i = 0, tri = 0; i < this.mesh.triangles.length; i += 3) {
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
            max: 1 + margin
            // max: 1 + (2 * margin)
        }
    }

    collide(point: Vec2, collisionHandler: TriangleCollisionHandler) {
        const { v0, tri_vec_inv } = this.mesh
        const { min: margin_min, max: margin_max } = this.margins

        const p_x = point.x, p_y = point.y
        let v0_x: number, v0_y: number
        let x: number, y: number
        let tri_vec_inv_a: number,
            tri_vec_inv_b: number,
            tri_vec_inv_c: number,
            tri_vec_inv_d: number
        let w1: number, w2: number

        for (let tri of this.filtered_triangles) {
            v0_x = v0[(2 * tri) + 0]
            v0_y = v0[(2 * tri) + 1]

            x = p_x - v0_x
            y = p_y - v0_y

            tri_vec_inv_a = tri_vec_inv[(4 * tri) + 0]
            tri_vec_inv_b = tri_vec_inv[(4 * tri) + 1]
            tri_vec_inv_c = tri_vec_inv[(4 * tri) + 2]
            tri_vec_inv_d = tri_vec_inv[(4 * tri) + 3]

            w1 = (tri_vec_inv_a * x) + (tri_vec_inv_b * y)
            w2 = (tri_vec_inv_c * x) + (tri_vec_inv_d * y)

            if (w1 < margin_min || w2 < margin_min ||
                w1 + w2 >= margin_max)
                continue
            
            collisionHandler(tri, w1, w2)
        }
    }

    collision_first(point: Vec2): TriangleCollision | undefined {
        const { v0, tri_vec_inv } = this.mesh
        const { min: margin_min, max: margin_max } = this.margins

        const p_x = point.x, p_y = point.y
        let v0_x: number, v0_y: number
        let x: number, y: number
        let tri_vec_inv_a: number,
            tri_vec_inv_b: number,
            tri_vec_inv_c: number,
            tri_vec_inv_d: number
        let w1: number, w2: number

        for (let tri of this.filtered_triangles) {
            v0_x = v0[(2 * tri) + 0]
            v0_y = v0[(2 * tri) + 1]

            x = p_x - v0_x
            y = p_y - v0_y

            tri_vec_inv_a = tri_vec_inv[(4 * tri) + 0]
            tri_vec_inv_b = tri_vec_inv[(4 * tri) + 1]
            tri_vec_inv_c = tri_vec_inv[(4 * tri) + 2]
            tri_vec_inv_d = tri_vec_inv[(4 * tri) + 3]

            w1 = (tri_vec_inv_a * x) + (tri_vec_inv_b * y)
            w2 = (tri_vec_inv_c * x) + (tri_vec_inv_d * y)

            if (w1 < margin_min || w2 < margin_min ||
                w1 + w2 >= margin_max)
                continue
            
            return { tri, w1, w2 }
        }

        return undefined
    }
}