import { MultiObjectsGroup, MultiObjectsGrouped, MultiObjectsGroupedObjectsKey, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsMappedGrouped, MultiObjectsTypeGrouped, groupKinds } from "../../../paradigm/trees/multi-objects-groups.js";
import { FieldPoint, FieldPointPrimitive, FieldsPoint } from "../../point.js";
import { Field } from "../../field.js";
import { MultiObjectsGroupsWithFieldsProcessingContext, MultiObjectsWithGroupFieldsProcessingContext, groupKindsWithFields } from "../../processing.js";
import { Processor, ProcessorInitialization } from "../../../paradigm/processing/processor.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjRoot, FieldPointVectorWithMultiObjects, ItemObjIDsKey, ItemObjValuesOffsetsKey, field_point_vectorized_new, isDynamicVector } from "../point.js";
import { NumberTypedArray } from "../../../utils/typed-array.js";
import { vectorIterator } from "../iterators/factory.js";
import { IndicesTypedArray } from "../../../utils/indices-array.js";
import { ObjectsCombiningTexture } from "../../../textures/index.js";
import { MultiObjectsIDsKey, MultiObjectsMapped, MultiObjectsTemplate, WithMultiObjectsIDs } from "../../../paradigm/trees/index.js";
import { FieldPointType, field_point_type_size } from "../../type.js";
import { ArithmeticPrimitiveFuseMode } from "../fuse-modes/arithmetic.js";
import { FuseMode, FusingFieldPointVectorWithMultiObjects, fuseVectors } from "../fusing.js";

export class FieldPointVectorMultiObjectsNormalizingProcessor<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends MultiObjectsGrouped<Objects, Groups> = MultiObjectsGrouped<Objects, Groups>,
        GroupsKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        SubPoint extends FieldPoint = FieldPoint,
        Point extends
            FieldPoint & MultiObjectsMappedGrouped<Objects, Groups, SubPoint> =
            FieldPoint & MultiObjectsMappedGrouped<Objects, Groups, SubPoint>,
        PointElementType extends
            FieldPoint & MultiObjectsTypeGrouped<Objects, Groups, SubPoint> =
            FieldPoint & MultiObjectsTypeGrouped<Objects, Groups, SubPoint>,
        PointFuseMode extends
            FieldPoint & MultiObjectsGroupsMapped<Groups, SubPoint> =
            FieldPoint & MultiObjectsGroupsMapped<Groups, SubPoint>,
        Container extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SubVector extends
            FieldPointVector<SubPoint, Container> =
            FieldPointVector<SubPoint, Container>,
        Vector extends
            FieldPointVectorWithMultiObjects<PointElementType, Container, ObjIDsT, ObjIDsContainer> =
            FieldPointVectorWithMultiObjects<PointElementType, Container, ObjIDsT, ObjIDsContainer>,
        Context extends
            WithMultiObjectsIDs<Objects, ObjIDsT> & MultiObjectsWithGroupFieldsProcessingContext<Objects, Groups, ObjectsGrouped, GroupsKinds, SubPoint> =
            WithMultiObjectsIDs<Objects, ObjIDsT> & MultiObjectsWithGroupFieldsProcessingContext<Objects, Groups, ObjectsGrouped, GroupsKinds, SubPoint>
    > implements Processor<Vector, Context> {
    constructor(
        public readonly groupsKinds: GroupsKinds,
        public readonly groups?: Groups,
    ) { }

    init(context: Context): ProcessorInitialization {
        const groupPaths = [...groupKinds(context, this.groupsKinds, this.groups)].map(({ group }) => group.path)
        
        return {
            connections: {
                inputs: groupPaths,
                outputs: groupPaths
            }
        }
    }

    process(vector: Vector, context: Context): void {
        for (const { group } of groupKindsWithFields(context, this.groupsKinds, this.groups)) {
            const type = <FieldPointType<SubPoint>>(<FieldPointType<MultiObjectsGroup<SubPoint>>>group.field.elementType)[MultiObjectsGroupedObjectsKey]
            const subvector = group.get<SubVector>(vector)
            const isDynamic = isDynamicVector<SubPoint, Container>(type, subvector, vector)
            const iterator = vectorIterator(type, isDynamic, context[MultiObjectsIDsKey])
            const length = iterator.length(subvector, vector)

            const subvector_multiObj = <FieldPointVectorWithMultiObjects<SubPoint, Container, ObjIDsT, ObjIDsContainer>><unknown>subvector
            let subvector_multiObj_prev = ItemObjIDsKey in subvector_multiObj
            if (!subvector_multiObj_prev) {
                subvector_multiObj[ItemObjIDsKey] = vector[ItemObjIDsKey]
                subvector_multiObj[ItemObjValuesOffsetsKey] = vector[ItemObjValuesOffsetsKey]
            }

            const objSums = <FusingFieldPointVectorWithMultiObjects<SubPoint, ObjIDsT, Container, ObjIDsContainer>>field_point_vectorized_new(type, length, isDynamic)

            fuseVectors<SubPoint, MultiObjectsGroup<SubPoint>, SubPoint, SubPoint, Container>(
                type,
                { [MultiObjectsGroupedObjectsKey]: type },
                <FuseMode<SubPoint>>group.field.fuseMode,
                [<FieldPointVector<MultiObjectsGroup<SubPoint>, Container>><unknown>subvector_multiObj],
                context[MultiObjectsIDsKey],
                objSums
            )

            if (!subvector_multiObj_prev) {
                delete (<any>subvector_multiObj)[ItemObjIDsKey]
                delete (<any>subvector_multiObj)[ItemObjValuesOffsetsKey]
            }

            function field_point_vector_divide_influences<PointElementType extends FieldPoint>(
                    type: FieldPointType<PointElementType>,
                    dividend: FieldPointVectorWithMultiObjRoot<PointElementType, Container>,
                    divisor: FieldPointVector<PointElementType>,
                    isMultiObjMapped?: boolean
                ) {
                if (MultiObjectsGroupedObjectsKey in type) {
                    if (isMultiObjMapped)
                        throw new Error()
                    
                    field_point_vector_divide_influences(
                        <FieldPointType<PointElementType>>(<FieldPointType<MultiObjectsGroup<FieldPoint>>>type)[MultiObjectsGroupedObjectsKey],
                        dividend,
                        divisor,
                        true
                    )
                }
                else if (type instanceof Function) {
                    const elementSize = field_point_type_size(type)
                    const dividend_typed = <FieldPointVectorContainerStatic>dividend.vector
                    const divisor_typed = <FieldPointVectorContainerStatic>divisor
                    const divisor_length = divisor_typed.length / elementSize
                    
                    let divisor_element_i = 0

                    const dividend_objOffsets = dividend.vectorizedRoot[ItemObjValuesOffsetsKey]
                    let dividend_objOffset_prev = 0,
                        dividend_objOffset_next: number

                    let divisor_offset = 0,
                        dividend_offset = 0,
                        divisor_value: number
                    
                    for (let divisor_i = 0; divisor_i < length; divisor_i++) {
                        dividend_objOffset_next = dividend_objOffsets[divisor_i]
                    
                        if (dividend_objOffset_prev !== dividend_objOffset_next) {
                            do {
                                for (divisor_element_i = 0; divisor_element_i < elementSize; divisor_element_i++) {
                                    divisor_value = divisor_typed[divisor_offset + divisor_element_i]
                                    if (divisor_value > 1)
                                        dividend_typed[dividend_offset] /= divisor_value
                                
                                    dividend_offset++
                                }
                            } while (++dividend_objOffset_prev < dividend_objOffset_next)
                        }

                        divisor_offset += elementSize

                        dividend_objOffset_prev = dividend_objOffset_next
                    }
                }
                else {
                    for (const key of Reflect.ownKeys(type)) {
                        const subtype = (<FieldPointType<FieldsPoint>>type)[key]
                        const subdividend = (<FieldPointVector<FieldsPoint, Container>>dividend.vector)[key]
                        const subdivisor = (<FieldPointVector<FieldsPoint, Container>>divisor)[key]
                        
                        field_point_vector_divide_influences<FieldPoint>(
                            subtype,
                            {
                                vector: subdividend,
                                vectorizedRoot: dividend.vectorizedRoot
                            },
                            subdivisor,
                            isMultiObjMapped
                        )
                    }
                }
            }

            field_point_vector_divide_influences(type, { vector: subvector, vectorizedRoot: <any>vector }, objSums, false)
        }
    }
}