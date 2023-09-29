import { Mat4, Quat, Vec3 } from "playcanvas-extended";
import { FieldInterpolationKeypoint, FieldInterpolationType, FieldInterpolator, InterpolationKeypoint, InterpolationManager, Interpolator, VectorFieldInterpolationType, VectorInterpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint, FieldPointMappedObjectsGroupedRemoved } from "../point.js";
import { Field } from "../index.js";
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, IsDynamicVectorContainer } from "../vectorized/point.js";
import { TypedArrayList } from "../../utils/typed-array-list.js";
import { vectorized } from "vectorized-functions";

export class Mat4InterpolationType<
        PointContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>
    >
    implements VectorFieldInterpolationType<
        Mat4,
        Mat4,
        Mat4,
        PointContainer
    > {
    @vectorized(Mat4InterpolationType.prototype.makeInterpolator_vectorized)
    [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
        >(
            keypoints: FieldInterpolationKeypoint<Location, Mat4>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): FieldInterpolator<Location, Mat4> | undefined {
        if (typeof keypoints[0].location !== 'number')
            return undefined

        if (!(keypoints[0].value instanceof Mat4))
            return undefined

        const t = keypoints.map(({ location, value: m }) => ({ location, value: m.getTranslation() }))
        const r = keypoints.map(({ location, value: m }) => ({ location, value: new Quat().setFromMat4(m) }))
        const s = keypoints.map(({ location, value: m }) => ({ location, value: m.getScale() }))

        const t_interpolator = InterpolationManager[makeInterpolator](t, locationField)
        const r_interpolator = InterpolationManager[makeInterpolator](r, locationField)
        const s_interpolator = InterpolationManager[makeInterpolator](s, locationField)

        return location => new Mat4().setTRS(
            t_interpolator(location),
            r_interpolator(location),
            s_interpolator(location)
        )
    }

    makeInterpolator_vectorized<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
            LocationVector extends
                FieldPointVector<LocationElementType, LocationContainer> =
                FieldPointVector<LocationElementType, LocationContainer>
        >(
            keypoints: InterpolationKeypoint<Location, Mat4>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>,
            resultType: typeof Mat4,
            isDynamicLocation: IsDynamicVectorContainer<LocationContainer>,
            isDynamicResult: IsDynamicVectorContainer<PointContainer>,
            multiObjectIDs?: MultiObjectsIDs<MultiObjectsTemplate, Uint32Array>
        ): VectorInterpolator<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Mat4,
            Mat4,
            Mat4,
            PointContainer,
            LocationVector,
            PointContainer
        > | undefined {
        if (typeof keypoints[0].location !== 'number')
            return undefined

        if (!(keypoints[0].value instanceof Mat4))
            return undefined

        const t = keypoints.map(({ location, value: m }) => ({ location, value: m.getTranslation() }))
        const r = keypoints.map(({ location, value: m }) => ({ location, value: new Quat().setFromMat4(m) }))
        const s = keypoints.map(({ location, value: m }) => ({ location, value: m.getScale() }))

        const t_interpolator = InterpolationManager.makeInterpolatorVectorized<Location, LocationElementType, LocationFuseMode, LocationContainer, Vec3, Vec3, Vec3, FieldPointVectorContainerStatic<NumberTypedArray>, LocationVector>(t, locationField, Vec3, isDynamicLocation, false)
        const r_interpolator = InterpolationManager.makeInterpolatorVectorized<Location, LocationElementType, LocationFuseMode, LocationContainer, Quat, Quat, Quat, FieldPointVectorContainerStatic<NumberTypedArray>, LocationVector>(r, locationField, Quat, isDynamicLocation, false)
        const s_interpolator = InterpolationManager.makeInterpolatorVectorized<Location, LocationElementType, LocationFuseMode, LocationContainer, Vec3, Vec3, Vec3, FieldPointVectorContainerStatic<NumberTypedArray>, LocationVector>(s, locationField, Vec3, isDynamicLocation, false)

        return (locations, results) => {
            const t_i = new Vec3()
            const r_i = new Quat()
            const s_i = new Vec3()
            const m_i = new Mat4()
            const m_i_data = m_i.data

            const t = t_interpolator(locations)
            const r = r_interpolator(locations)
            const s = s_interpolator(locations)

            const n = (<FieldPointVector<number>>locations).length

            const m = <FieldPointVectorContainerStatic<NumberTypedArray>>(!isDynamicResult ? results : undefined) ?? new Float64Array(n * 16)

            let t_offset = 0
            let r_offset = 0
            let s_offset = 0
            let m_offset = 0

            for (let i = 0; i < n; i++) {
                t_i.x = t[t_offset++]
                t_i.y = t[t_offset++]
                t_i.z = t[t_offset++]

                r_i.x = r[r_offset++]
                r_i.y = r[r_offset++]
                r_i.z = r[r_offset++]
                r_i.w = r[r_offset++]

                s_i.x = s[s_offset++]
                s_i.y = s[s_offset++]
                s_i.z = s[s_offset++]

                m_i.setTRS(t_i, r_i, s_i)

                m[m_offset++] = m_i_data[0x0]
                m[m_offset++] = m_i_data[0x1]
                m[m_offset++] = m_i_data[0x2]
                m[m_offset++] = m_i_data[0x3]

                m[m_offset++] = m_i_data[0x4]
                m[m_offset++] = m_i_data[0x5]
                m[m_offset++] = m_i_data[0x6]
                m[m_offset++] = m_i_data[0x7]

                m[m_offset++] = m_i_data[0x8]
                m[m_offset++] = m_i_data[0x9]
                m[m_offset++] = m_i_data[0xA]
                m[m_offset++] = m_i_data[0xB]

                m[m_offset++] = m_i_data[0xC]
                m[m_offset++] = m_i_data[0xD]
                m[m_offset++] = m_i_data[0xE]
                m[m_offset++] = m_i_data[0xF]
            }

            if (isDynamicResult) {
                if (results) {
                    const results_typed = <TypedArrayList<number, NumberTypedArray>>results
                    for (let i = 0; i < n; i++)
                        results_typed.set(i, m[i])
                }
                else results = <PointContainer>TypedArrayList.from(m)
            }

            return <PointContainer>results
        }
    }

    static {
        InterpolationManager.register(new this())
    }
}