import { MultiObjectsTemplate, MultiObjectsIDs } from "../../../paradigm/trees/multi-objects.js"
import { IndicesTypedArray } from "../../../utils/indices-array.js"
import { typedArrayClone } from "../../../utils/typed-array.js"
import { FieldPointPrimitive, FieldPoint } from "../../point.js"
import { FieldPointType, field_point_type_size } from "../../type.js"
import { PrimitiveFuseMode, FusingFieldPointVectorWithMultiObjects, ItemNextObjectIndexKey, FieldPointWithMultiObjectPath } from "../fusing.js"
import { FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjRoot, ItemObjValuesOffsetsKey, FieldPointVectorContainerDynamic, FieldPointVectorContainer, IsDynamicVector, FieldPointVectorStatic, FieldPointVectorDynamic, isDynamicVector } from "../point.js"

export class ConcatPrimitiveFuseMode<Point extends FieldPointPrimitive> implements PrimitiveFuseMode<Point> {
    fuseSingle<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate
        >(
            type: FieldPointType<Point>,
            points: FieldPointWithMultiObjectPath<Point>[],
            multiObjectIDs?: MultiObjectsIDs<Objects>,
            isMultiObjMappedResult?: boolean
        ): {
            reducedValue: Point
            objectValues?: FieldPointWithMultiObjectPath<Point>[]
        } | {
            reducedValue?: Point
            objectValues: FieldPointWithMultiObjectPath<Point>[]
        } {
        if (!isMultiObjMappedResult)
            throw new Error()
        
        return {
            objectValues: points
        }
    }

    fuseVector<
            Container extends FieldPointVectorContainer,
            ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>
        >(
            elementType: FieldPointType<Point>,
            results: FieldPointVectorWithMultiObjRoot<
                    Point,
                    Container,
                    ObjIDsT,
                    ObjIDsContainer,
                    FusingFieldPointVectorWithMultiObjects<FieldPoint, ObjIDsT, FieldPointVectorContainerStatic, ObjIDsContainer>
                >,
            points: FieldPointVectorWithMultiObjRoot<Point, Container>[],
            isMultiObjMapped?: {
                points: boolean,
                result: boolean
            }
        ): void {
        if (!(isMultiObjMapped?.points && isMultiObjMapped?.result))
            throw new Error("must fused from multi objects")

        const elementSize: number = field_point_type_size(elementType)
        
        const n_items = results.vectorizedRoot[ItemObjValuesOffsetsKey].length
        const resultElementOffsets = results.vectorizedRoot[ItemObjValuesOffsetsKey]
        const resultElementIndexNext = typedArrayClone(results.vectorizedRoot[ItemNextObjectIndexKey])

        if (isDynamicVector(points[0].vectorized)) {
            const resultVectorized = <FieldPointVectorDynamic<Point>>results.vectorized
    
            for (const { vectorized, vectorizedRoot } of points) {
                const pointVector = <FieldPointVectorDynamic<Point>>vectorized
                const objOffsets = vectorizedRoot[ItemObjValuesOffsetsKey]
                let objOffset_prev = 0
                let objOffset_next: number
                let elementOffset_prev = 0
                let resultElementOffsetBase = 0
                let resultElementOffsetNext: number
                for (let i_item = 0; i_item < n_items; i_item++) {
                    objOffset_next = objOffsets[i_item]
                    if (objOffset_next !== objOffset_prev) {
                        resultElementOffsetNext = resultElementOffsetBase + resultElementIndexNext[i_item]
                        const elementOffset_next = objOffset_next * elementSize
                        do resultVectorized.set(resultElementOffsetNext++, pointVector.get(elementOffset_prev++))
                        while (elementOffset_prev < elementOffset_next)
                        objOffset_prev = objOffset_next
                        resultElementIndexNext[i_item] = resultElementOffsetNext - resultElementOffsetBase
                    }
                    resultElementOffsetBase = resultElementOffsets[i_item]
                }
            }
        }
        else {
            const resultVectorized = <FieldPointVectorStatic<Point>><any>results.vectorized
    
            for (const { vectorized, vectorizedRoot } of points) {
                const pointVector = <FieldPointVectorStatic<Point>>vectorized
                const objOffsets = vectorizedRoot[ItemObjValuesOffsetsKey]
                let objOffset_prev = 0
                let objOffset_next: number
                let elementOffset_prev = 0
                let resultElementOffsetBase = 0
                let resultElementOffsetNext: number
                for (let i_item = 0; i_item < n_items; i_item++) {
                    objOffset_next = objOffsets[i_item]
                    if (objOffset_next !== objOffset_prev) {
                        resultElementOffsetNext = resultElementOffsetBase + resultElementIndexNext[i_item]
                        const elementOffset_next = objOffset_next * elementSize
                        do resultVectorized[resultElementOffsetNext++] = pointVector[elementOffset_prev++]
                        while (elementOffset_prev < elementOffset_next)
                        objOffset_prev = objOffset_next
                        resultElementIndexNext[i_item] = resultElementOffsetNext - resultElementOffsetBase
                    }
                    resultElementOffsetBase = resultElementOffsets[i_item]
                }
            }
        }
    }

    private constructor() { }
    static readonly instance = new this()
}