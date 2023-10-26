import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/index.js"
import { IndicesArray, IndicesTypedArray, invalidIndex, sumIndexed } from "../../utils/indices-array.js"
import { TypedArrayList } from "../../utils/typed-array-list.js"
import { NumberTypedArray } from "../../utils/typed-array.js"
import { FieldPoint, FieldsPoint, field_point_subtract, fields_point_add_inplace, fields_point_add_inplace_weighted } from "../point.js"
import { FieldPointType, field_point_multiObj_IDs } from "../type.js"
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, IsDynamicVector, IsDynamicVectorContainer, ItemObjIDsKey, ItemObjValuesOffsetsKey, field_point_vector_static, field_point_vectorized_multi_objects_new, isDynamicVector } from "../vectorized/index.js"
import { vectorIterator } from "../vectorized/iterators/factory.js"

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
            //TODO: let scatter() support invalid
            invalid?: never & FieldPointVector<number, FieldPointVectorContainerStatic<Uint8Array>>
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

            if (invalid) {
                for (let tri_i = 0; tri_i < tris.length; tri_i++) {
                    if (invalid[tri_i]) continue
                    tri = tris[tri_i]
                    
                    tri_objCount = tri_objCounts[tri]
                    tri_objOffset_next = tri_objOffsets[tri]
                
                    for (tri_objOffset = tri_objOffset_next - tri_objCount; tri_objOffset < tri_objOffset_next; tri_objOffset++)
                        interpolated_objIDs[interpolated_objIDs_offset++] = tri_objIDs[tri_objOffset]
                    
                    interpolated_objOffsets[tri_i] = interpolated_objIDs_offset
                }
            }
            else {
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