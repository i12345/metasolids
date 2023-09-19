import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { FieldPoint, field_point_add_inplace, field_point_clone, field_point_divide, field_point_map, field_point_sqrt, field_point_square, field_point_subtract } from "../point.js";
import { FieldPointType, field_point_new } from "../type.js";
import { vectorizedIteratorGetSetLengthCurried } from "./iterators/factory.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "./point.js";

export function field_point_vector_mean<
        Point extends FieldPoint,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
    >(
        type: FieldPointType<Point>,
        vector: FieldPointVector<Point, Container> | FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer>,
        multiObjectsIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ): Point {
    const item = { item: field_point_new(type) }
    const { get, length } = vectorizedIteratorGetSetLengthCurried(type, <any>vector, { obj: item, property: "item" }, multiObjectsIDs)
    if (length === 0)
        return item.item

    get(0)
    let sum = field_point_clone(item.item)
    for (let i = 1; i < length; i++) {
        get(i)
        sum = field_point_add_inplace(sum, item.item)
    }

    return field_point_divide(sum, length)
}

export function field_point_vector_stdDev<
        Point extends FieldPoint,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
    >(
        type: FieldPointType<Point>,
        vector: FieldPointVector<Point, Container> | FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer>,
        multiObjectsIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ): Point {
    const mean = field_point_vector_mean(type, vector, multiObjectsIDs)

    const item = { item: field_point_new(type) }
    const { get, length } = vectorizedIteratorGetSetLengthCurried(type, <any>vector, { obj: item, property: "item" }, multiObjectsIDs)
    if (length === 0)
        return item.item

    let residuals = field_point_new(type)
    for (let i = 0; i < length; i++) {
        get(i)
        const residual = field_point_subtract(item.item, mean)
        residuals = field_point_add_inplace(residuals, field_point_square(residual))
    }

    return field_point_sqrt(field_point_divide(residuals, length - 1))
}

export function field_point_vector_stdDev_aggregate<
        Point extends FieldPoint,
        Container extends FieldPointVectorContainer = FieldPointVectorContainer,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
    >(
        type: FieldPointType<Point>,
        vector: FieldPointVector<Point, Container> | FieldPointVectorWithMultiObjects<Point, Container, ObjIDsT, ObjIDsContainer>,
        multiObjectsIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ): number {
    const stdDevs = field_point_vector_stdDev(type, vector, multiObjectsIDs)
    let sum = 0
    let count = 0

    field_point_map(
        stdDevs,
        leaf => typeof leaf === 'number',
        leaf => {
            sum += <number>leaf
            count++
        }
    )

    return sum / count
}