import { Vec2 } from "playcanvas-extended"
import { FieldPoint, field_point_subtract, fields_point_add_inplace_weighted, FieldsPoint, fields_point_add_inplace } from "./point.js"
import { FieldPointType, field_point_multiObj_IDs, field_point_multiObj_count } from "./type.js"
import { IndicesArray, IndicesTypedArray, indicesArrayType } from "../utils/indices-array.js"
import { NumberArrayLike, NumberTypedArray, TypedArrayConstructor } from "../utils/typed-array.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, IsDynamicVector, ItemObjIDsKey, field_point_vectorized_multi_objects_new } from "./vectorized/index.js"
import { vectorIterator } from "./vectorized/iterators/factory.js"
import { MultiObjectsIDs, MultiObjectsTemplate } from "../paradigm/trees/multi-objects.js"
import { TypedArrayList } from "../utils/typed-array-list.js"

export class Triangles2DMeshInterpolator<
        VertexPoint extends FieldPoint = FieldPoint,
        VertexPointElementType extends FieldPoint = VertexPoint,
        VertexContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        VertexVector extends FieldPointVector<VertexPointElementType, VertexContainer> = FieldPointVector<VertexPointElementType, VertexContainer>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
        ObjIDsContainer extends FieldPointVectorContainer<ObjIDsT> = FieldPointVectorContainer<ObjIDsT>
    > {
    private readonly v0:  VertexVector
    private readonly v01: VertexVector
    private readonly v02: VertexVector

    private readonly objIDs?: ObjIDsT
    private readonly objCounts?: ObjIDsT

    private readonly get_v0: (index: number) => VertexPoint
    private readonly get_v01: (index: number) => VertexPoint
    private readonly get_v02: (index: number) => VertexPoint

    constructor(
        public readonly vertexType: FieldPointType<VertexPointElementType>,
        public readonly vertices: VertexVector,
        public readonly triangles: IndicesArray,
        public readonly multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ) {
        const iterator = vectorIterator<VertexPoint, VertexContainer, Objects, ObjIDsT, VertexPointElementType, VertexVector>(vertexType, <IsDynamicVector<VertexPointElementType, VertexContainer>>false, multiObjectIDs)

        this.v0 = <VertexVector><unknown>field_point_vectorized_multi_objects_new(
            vertexType,
            triangles.length / 3,
            <IsDynamicVector<VertexPointElementType, VertexContainer>>false,
            multiObjectIDs?.IDsType
        )

        this.v01 = <VertexVector><unknown>field_point_vectorized_multi_objects_new(
            vertexType,
            triangles.length / 3,
            <IsDynamicVector<VertexPointElementType, VertexContainer>>false,
            multiObjectIDs?.IDsType
        )

        this.v02 = <VertexVector><unknown>field_point_vectorized_multi_objects_new(
            vertexType,
            triangles.length / 3,
            <IsDynamicVector<VertexPointElementType, VertexContainer>>false,
            multiObjectIDs?.IDsType
        )
        
        this.get_v0 = iterator.get_returnValue.bind(iterator, this.v0, this.v0)
        this.get_v01 = iterator.get_returnValue.bind(iterator, this.v01, this.v01)
        this.get_v02 = iterator.get_returnValue.bind(iterator, this.v02, this.v02)

        const get_vertex = iterator.get_returnValue.bind(iterator, vertices, vertices)
        const set_v0 = iterator.set.bind(iterator, this.v0, this.v0)
        const set_v01 = iterator.set.bind(iterator, this.v01, this.v01)
        const set_v02 = iterator.set.bind(iterator, this.v02, this.v02)

        const hasObjIDs = ItemObjIDsKey in this.v0
        const objIDs = hasObjIDs ? new TypedArrayList<number, ObjIDsT>(<any>multiObjectIDs!.IDsType) : undefined
        const objCounts = this.objCounts = hasObjIDs ? <ObjIDsT>new multiObjectIDs!.IDsType(triangles.length / 3) : undefined
        const tmp_IDs = hasObjIDs ? new multiObjectIDs!.IDsType(multiObjectIDs!.paths.length) : undefined
        let tmp_IDs_i: number
        let tmp_IDs_length: number

        //TODO: use non-reduced arithmetic fuse mode

        if (hasObjIDs) {
            for (let i = 0, tri = 0; i < triangles.length; i += 3, tri++) {
                const v0 = get_vertex(triangles[i + 0])
                const v1 = get_vertex(triangles[i + 1])
                const v2 = get_vertex(triangles[i + 2])

                tmp_IDs_length = 0
                tmp_IDs_length = field_point_multiObj_IDs(vertexType, v0, multiObjectIDs!, tmp_IDs!, tmp_IDs_length)
                tmp_IDs_length = field_point_multiObj_IDs(vertexType, v1, multiObjectIDs!, tmp_IDs!, tmp_IDs_length)
                tmp_IDs_length = field_point_multiObj_IDs(vertexType, v2, multiObjectIDs!, tmp_IDs!, tmp_IDs_length)

                objCounts![tri] += tmp_IDs_length
                for (tmp_IDs_i = 0; tmp_IDs_i < tmp_IDs_length; tmp_IDs_i++)
                    objIDs!.set(objIDs!.length, tmp_IDs![tmp_IDs_i])
                
                set_v0(v0, tri)
                set_v01(field_point_subtract(v1, v0), tri)
                set_v02(field_point_subtract(v2, v0), tri)
            }
            
            this.objIDs = objIDs!.arrayView()
        }
        else {
            for (let i = 0, tri = 0; i < triangles.length; i += 3, tri++) {
                const v0 = get_vertex(triangles[i + 0])
                const v1 = get_vertex(triangles[i + 1])
                const v2 = get_vertex(triangles[i + 2])
        
                set_v0(v0, tri)
                set_v01(field_point_subtract(v1, v0), tri)
                set_v02(field_point_subtract(v2, v0), tri)
            }
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

    // interpolate_vectorized<
    //         TrisContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<IndicesTypedArray>,
    //         WeightsContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>
    //     >(
    //         tris: FieldPointVector<number, TrisContainer>,
    //         w1: FieldPointVector<number, WeightsContainer>,
    //         w2: FieldPointVector<number, WeightsContainer>,
    //     ): VertexVector {
    //     //TODO: implement scatter_add_weighted()
    // }

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
        const cell_size = this.mesh.bounds.size.clone().divScalar(this.resolution)
        for (let x = 0; x < resolution; x++) {
            for (let y = 0; y < resolution; y++) {
                const min = new Vec2(x, y)
                    .divScalar(resolution)
                    .mul(this.mesh.bounds.size)
                    .add(this.mesh.bounds.origin)

                const max = new Vec2().add2(min, cell_size)

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
}

export class Triangles2DMesh {
    private constructor(
        public readonly vertices: NumberArrayLike,
        public readonly triangles: NumberArrayLike,
        public readonly v0: Float64Array,
        public readonly tri_vec_inv: Float64Array,
        public readonly bounds: { readonly origin: Vec2, readonly size: Vec2 },
        public margin = 0.05
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

        return new Triangles2DMesh(vertices, triangles, v0, tri_vec_inv, { origin, size })
    }
}

class Triangles2DMeshQuad {
    private filtered_triangles: IndicesTypedArray

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
        let tri_vec_inv_a: number,
            tri_vec_inv_b: number,
            tri_vec_inv_c: number,
            tri_vec_inv_d: number

        let tri: number, w1: number, w2: number
        const tri_indices = this.filtered_triangles
        const tri_n = tri_indices.length

        for (let tri_i = 0; tri_i < tri_n; tri_i++) {
            tri = tri_indices[tri_i]
            
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
                w1 + w2 > margin_max)
                continue

            collisionHandler(tri, w1, w2)
        }
    }

    collision_first(point: Vec2): TriangleCollision | undefined {
        const { v0, tri_vec_inv, margin } = this.mesh
        const margin_min = -margin, margin_max = 1 + margin

        const p_x = point.x, p_y = point.y
        let v0_x: number, v0_y: number
        let x: number, y: number
        let tri_vec_inv_a: number,
            tri_vec_inv_b: number,
            tri_vec_inv_c: number,
            tri_vec_inv_d: number
        
        let tri: number, w1: number, w2: number
        const tri_indices = this.filtered_triangles
        const tri_n = tri_indices.length

        for (let tri_i = 0; tri_i < tri_n; tri_i++) {
            tri = tri_indices[tri_i]

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
                w1 + w2 > margin_max)
                continue

            return { tri, w1, w2 }
        }

        return undefined
    }
}