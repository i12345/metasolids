import { Vec2 } from "playcanvas-extended"
import { FieldPoint, field_point_subtract, fields_point_add_inplace_weighted, FieldsPoint, fields_point_add_inplace } from "./point.js"
import { FieldPointType, field_point_multiObj_IDs, field_point_multiObj_count } from "./type.js"
import { IndicesArray, IndicesTypedArray, indicesArrayType, invalidIndex, sumIndexed } from "../utils/indices-array.js"
import { NumberArrayLike, NumberTypedArray, TypedArrayConstructor, isTypedArray, sum } from "../utils/typed-array.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorStatic, FieldPointVectorWithMultiObjects, IsDynamicVector, IsDynamicVectorContainer, ItemObjIDsKey, ItemObjValuesOffsetsKey, field_point_vector_static, field_point_vectorized_multi_objects_new, field_point_vectorized_new, isDynamicVector } from "./vectorized/index.js"
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
    private readonly objOffsets?: Uint32Array
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
        const v0 = field_point_vectorized_multi_objects_new(
            vertexType,
            triangles.length / 3,
            <IsDynamicVector<VertexPointElementType, VertexContainer>>false,
            multiObjectIDs?.IDsType
        )

        const v01 = field_point_vectorized_multi_objects_new(
            vertexType,
            triangles.length / 3,
            <IsDynamicVector<VertexPointElementType, VertexContainer>>false,
            multiObjectIDs?.IDsType
        )

        const v02 = field_point_vectorized_multi_objects_new(
            vertexType,
            triangles.length / 3,
            <IsDynamicVector<VertexPointElementType, VertexContainer>>false,
            multiObjectIDs?.IDsType
        )

        const tmp_iterator = vectorIterator<VertexPoint, VertexContainer, Objects, ObjIDsT, VertexPointElementType>(
            vertexType,
            isDynamicVector<VertexPointElementType, VertexContainer>(vertexType, v0, v0),
            multiObjectIDs,
            v0
        )

        const static_iterator = vectorIterator<
                VertexPoint, VertexContainer, Objects, ObjIDsT, VertexPointElementType, VertexVector
            >(
                vertexType,
                <IsDynamicVector<VertexPointElementType, VertexContainer>>false,
                multiObjectIDs
            )

        const get_vertex = static_iterator.get_returnValue.bind(static_iterator, vertices, vertices)
        const set_v0 = tmp_iterator.set.bind(tmp_iterator, v0, v0)
        const set_v01 = tmp_iterator.set.bind(tmp_iterator, v01, v01)
        const set_v02 = tmp_iterator.set.bind(tmp_iterator, v02, v02)

        const hasObjIDs = ItemObjIDsKey in v0
        const objIDs = hasObjIDs ? new TypedArrayList<number, ObjIDsT>(<any>multiObjectIDs!.IDsType) : undefined
        const objCounts = this.objCounts = hasObjIDs ? <ObjIDsT>new multiObjectIDs!.IDsType(triangles.length / 3) : undefined
        const objOffsets = this.objOffsets = hasObjIDs ? new Uint32Array(triangles.length / 3) : undefined
        let objOffset_next = 0
        const tmp_IDs = hasObjIDs ? new multiObjectIDs!.IDsType(multiObjectIDs!.paths.length) : undefined
        let tmp_IDs_i: number
        let objCount: number

        //TODO: use non-reduced arithmetic fuse mode

        if (hasObjIDs) {
            for (let i = 0, tri = 0; i < triangles.length; i += 3, tri++) {
                const v0 = get_vertex(triangles[i + 0])
                const v1 = get_vertex(triangles[i + 1])
                const v2 = get_vertex(triangles[i + 2])

                objCount = 0
                objCount = field_point_multiObj_IDs(vertexType, v0, multiObjectIDs!, tmp_IDs!, objCount)
                objCount = field_point_multiObj_IDs(vertexType, v1, multiObjectIDs!, tmp_IDs!, objCount)
                objCount = field_point_multiObj_IDs(vertexType, v2, multiObjectIDs!, tmp_IDs!, objCount)

                objCounts![tri] = objCount
                
                objOffset_next += objCount
                objOffsets![tri] = objOffset_next

                for (tmp_IDs_i = 0; tmp_IDs_i < objCount; tmp_IDs_i++)
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
        
        this.v0 = <VertexVector><unknown>field_point_vector_static(vertexType, v0, multiObjectIDs)
        this.v01 = <VertexVector><unknown>field_point_vector_static(vertexType, v01, multiObjectIDs)
        this.v02 = <VertexVector><unknown>field_point_vector_static(vertexType, v02, multiObjectIDs)

        this.get_v0 = static_iterator.get_returnValue.bind(static_iterator, this.v0, this.v0)
        this.get_v01 = static_iterator.get_returnValue.bind(static_iterator, this.v01, this.v01)
        this.get_v02 = static_iterator.get_returnValue.bind(static_iterator, this.v02, this.v02)
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

    interpolate_vectorized<
            TrisContainer extends FieldPointVectorContainerStatic<IndicesTypedArray> = FieldPointVectorContainerStatic<IndicesTypedArray>,
            WeightsContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>
        >(
            tris: FieldPointVector<number, TrisContainer>,
            w1: FieldPointVector<number, WeightsContainer>,
            w2: FieldPointVector<number, WeightsContainer>,
        ): VertexVector {
        const iterator = vectorIterator<VertexPoint, VertexContainer, Objects, ObjIDsT, VertexPointElementType, VertexVector>(
            this.vertexType,
            <IsDynamicVector<VertexPointElementType, VertexContainer>>false,
            this.multiObjectIDs
        )

        const interpolated = <VertexVector><unknown>field_point_vectorized_multi_objects_new<
                VertexPointElementType,
                VertexContainer,
                ObjIDsT,
                FieldPointVectorContainerStatic<ObjIDsT>
            >(
            this.vertexType,
            tris.length,
            <IsDynamicVector<VertexPointElementType, VertexContainer>>false,
            this.objCounts ? this.multiObjectIDs?.IDsType : undefined,
            <IsDynamicVectorContainer<VertexContainer> extends false ? IsDynamicVectorContainer<ObjIDsT> extends false ? number : never : never>(this.objCounts ? sumIndexed(this.objCounts, tris) : undefined)
        )

        if (this.objIDs) {
            const interpolated_multiObj = <FieldPointVectorWithMultiObjects<VertexPointElementType, VertexContainer, ObjIDsT, FieldPointVectorContainerStatic<ObjIDsT>>><unknown>interpolated

            const interpolated_objOffsets = interpolated_multiObj[ItemObjValuesOffsetsKey]
            const interpolated_objIDs = interpolated_multiObj[ItemObjIDsKey]
            let interpolated_objIDs_offset = 0

            const tri_objIDs = this.objIDs!
            const tri_objCounts = this.objCounts!
            const tri_objOffsets = this.objOffsets!
            let tri_objCount: number
            let tri_objOffset: number
            let tri_objOffset_next: number
            let tri: number
            const tri_invalid = invalidIndex(tris)

            for (let tri_i = 0; tri_i < tris.length; tri_i++) {
                tri = tris[tri_i]
                if (tri !== tri_invalid) {
                    tri_objCount = tri_objCounts[tri]
                    tri_objOffset_next = tri_objOffsets[tri]
                    
                    for (tri_objOffset = tri_objOffset_next - tri_objCount; tri_objOffset < tri_objOffset_next; tri_objOffset++)
                        interpolated_objIDs[interpolated_objIDs_offset++] = tri_objIDs[tri_objOffset]
                }

                interpolated_objOffsets[tri_i] = interpolated_objIDs_offset
            }
        }

        iterator.scatter(
            interpolated, interpolated,
            this.v0, this.v0,
            tris
        )

        iterator.scatter_add_weighted(
            interpolated, interpolated,
            this.v01, this.v01,
            tris,
            w1
        )

        iterator.scatter_add_weighted(
            interpolated, interpolated,
            this.v02, this.v02,
            tris,
            w2
        )

        return interpolated
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

    addToDocument() {
        const cvs = document.createElement('canvas')
        const scale = 250
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
    readonly filtered_triangles: IndicesTypedArray

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
        let tri_vec_inv_i = 0
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