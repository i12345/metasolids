import { vectorized } from "vectorized-functions";
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { keypoint_index } from "../../utils/keypoints_index.js";
import { Field } from "../field.js";
import { InterpolationKeypoint, Interpolator, VectorFieldInterpolationType, VectorInterpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";
import { FieldPointType } from "../type.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerDynamic, FieldPointVectorContainerStatic, FieldPointVectorIterator, IsDynamicVector, field_point_vector_multi_objs_static_length, field_point_vectorized_multi_objects_new } from "../vectorized/index.js";
import { vectorIterator } from "../vectorized/iterators/factory.js";
import { NumberTypedArray } from "../../utils/typed-array.js";

export class ConstantInterpolationType<
        Point extends FieldPoint = FieldPoint,
        PointElementType extends FieldPoint = Point,
        PointFuseMode extends FieldPoint = Point,
        PointContainer extends FieldPointVectorContainer = FieldPointVectorContainer,
        PointVector extends FieldPointVector<PointElementType, PointContainer> = FieldPointVector<PointElementType, PointContainer>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array
    > implements
    VectorFieldInterpolationType<
            Point,
            PointElementType,
            PointFuseMode,
            PointContainer,
            PointVector,
            Objects,
            ObjIDsT
        > {
    makeInterpolator_vectorized<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic,
            LocationVector extends
                FieldPointVector<LocationElementType, LocationContainer> =
                FieldPointVector<LocationElementType, LocationContainer>
        >(
            keypoints: InterpolationKeypoint<Location, Point>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>,
            resultType: FieldPointType<PointElementType>,
            isDynamicLocation: IsDynamicVector<LocationElementType, LocationContainer>,
            isDynamicResult: IsDynamicVector<PointElementType, PointContainer>,
            multiObjectIDs?: MultiObjectsIDs<Objects, ObjIDsT>
        ): VectorInterpolator<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Point,
            PointElementType,
            PointFuseMode,
            PointContainer,
            LocationVector,
            PointVector
        > | undefined {
        if (locationField.elementType !== Number)
            return undefined

        const t_keypoints = keypoints.map(({ location }) => <number>location)

        const result_iterator_static = vectorIterator<Point, FieldPointVectorContainerStatic, Objects, ObjIDsT, PointElementType>(resultType, <IsDynamicVector<PointElementType, FieldPointVectorContainerStatic>>false, multiObjectIDs)
        const result_iterator_dynamic = vectorIterator<Point, FieldPointVectorContainerDynamic, Objects, ObjIDsT, PointElementType>(resultType, <IsDynamicVector<PointElementType, FieldPointVectorContainerDynamic>>true, multiObjectIDs)
        const result_iterator = <FieldPointVectorIterator<Point, PointContainer, PointVector, PointElementType>>(isDynamicResult ? result_iterator_dynamic : result_iterator_static)

        const results_keypoints_dynamic = field_point_vectorized_multi_objects_new<PointElementType, FieldPointVectorContainerDynamic, ObjIDsT>(resultType, t_keypoints.length, <IsDynamicVector<PointElementType, FieldPointVectorContainerDynamic>>true, multiObjectIDs?.IDsType)
        for (let i = 0; i < keypoints.length; i++)
            result_iterator_dynamic.set(results_keypoints_dynamic, results_keypoints_dynamic, keypoints[i].value, i)
        const results_keypoints_static = result_iterator_dynamic.copyStatic(results_keypoints_dynamic, results_keypoints_dynamic)
        const results_keypoints = <PointVector>(isDynamicResult ? results_keypoints_dynamic : results_keypoints_static)

        return Ts => {
            const length = <number>Ts.length
            const keypoint_indices = new Uint32Array(length)

            if (isDynamicLocation) {
                for (let i = 0; i < length; i++) {
                    const t = (<FieldPointVector<number, FieldPointVectorContainerDynamic>>Ts).get(i)
                    const index = keypoint_index(t as number, t_keypoints)
                    keypoint_indices[i] = index < 0 ? 0 : index >= length ? (length - 1) : index
                }
            }
            else {
                for (let i = 0; i < length; i++) {
                    const t = (<FieldPointVector<number, FieldPointVectorContainerStatic>>Ts)[i]
                    const index = keypoint_index(t as number, t_keypoints)
                    keypoint_indices[i] = index < 0 ? 0 : index >= length ? (length - 1) : index
                }
            }

            const objStaticLength = !isDynamicResult ? field_point_vector_multi_objs_static_length(results_keypoints_static, keypoint_indices) : undefined
            const results = <PointVector><unknown>field_point_vectorized_multi_objects_new(resultType, length, isDynamicResult, multiObjectIDs?.IDsType, objStaticLength)
            result_iterator.scatter(results, results, results_keypoints, results_keypoints, keypoint_indices)
            return <PointVector><any>results
        }
    }

    @vectorized(ConstantInterpolationType.prototype.makeInterpolator_vectorized)
    [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
        >(
            keypoints: InterpolationKeypoint<Location, Point>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): Interpolator<Location, Point> | undefined {
        if (locationField.elementType !== Number)
            return undefined

        const t_keypoints = keypoints.map(({ location }) => <number>location)

        return t => {
            const index = keypoint_index(t as number, t_keypoints)
            if (index < 0) return keypoints[0].value
            else if (index >= keypoints.length) return keypoints[keypoints.length - 1].value
            else return keypoints[index].value
        }
    }
}