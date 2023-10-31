import { Mat3, Mat4, Quat, Vec3 } from "playcanvas-extended";
import { FieldInterpolationKeypoint, FieldInterpolationType, FieldInterpolator, InterpolationKeypoint, InterpolationManager, VectorFieldInterpolationType, VectorInterpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";
import { Field } from "../field.js";
import { TypedArrayList } from "../../paradigm/arrays/typed-array-list.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic, IsDynamicVectorContainer } from "../vectorized/index.js";
import { MultiObjectsIDs, MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { NumberTypedArray } from "../../paradigm/arrays/typed-array.js";
import { mat4_from_mat3 } from "../../utils/matrix.js";
import { vectorized } from "vectorized-functions";

export class Mat3InterpolationType <
        PointContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>
    >
    implements VectorFieldInterpolationType<
        Mat3,
        Mat3,
        Mat3,
        PointContainer
    > {
    @vectorized(Mat3InterpolationType.prototype.makeInterpolator_vectorized)
    [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
        >(
            keypoints: FieldInterpolationKeypoint<Location, Mat3>[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): FieldInterpolator<Location, Mat3> | undefined {
        if (typeof keypoints[0].location !== 'number')
            return undefined

        if (!(keypoints[0].value instanceof Mat3))
            return undefined

        const m4 = keypoints.map(({ value: m }) => new Mat4().set([
            m.data[0], m.data[1], m.data[2], 0,
            m.data[3], m.data[4], m.data[5], 0,
            m.data[6], m.data[7], m.data[8], 0,
            0, 0, 0, 1
        ]))

        const r = keypoints.map(({ location }, i) => ({ location, value: new Quat().setFromMat4(m4[i]) }))
        const s = keypoints.map(({ location }, i) => ({ location, value: m4[i].getScale() }))

        const r_interpolator = InterpolationManager[makeInterpolator](r, locationField)
        const s_interpolator = InterpolationManager[makeInterpolator](s, locationField)

        return location => {
            const m4 = new Mat4().setTRS(
                Vec3.ZERO,
                r_interpolator(location),
                s_interpolator(location)
            )

            return new Mat3().set([
                m4.data[0], m4.data[1], m4.data[2],
                m4.data[4], m4.data[5], m4.data[6],
                m4.data[8], m4.data[9], m4.data[10],
            ])
        }
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
        keypoints: InterpolationKeypoint<Location, Mat3>[],
        locationField: Field<Location, LocationElementType, LocationFuseMode>,
        resultType: typeof Mat3,
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

        if (!(keypoints[0].value instanceof Mat3))
            return undefined

        const keypoints_mat4 = keypoints.map(({ location, value }) => ({ location, value: mat4_from_mat3(value) }))
        
        const r = keypoints_mat4.map(({ location, value: m }) => ({ location, value: new Quat().setFromMat4(m) }))
        const s = keypoints_mat4.map(({ location, value: m }) => ({ location, value: m.getScale() }))

        const r_interpolator = InterpolationManager.makeInterpolatorVectorized<Location, LocationElementType, LocationFuseMode, LocationContainer, Quat, Quat, Quat, FieldPointVectorContainerStatic<NumberTypedArray>, LocationVector>(r, locationField, Quat, isDynamicLocation, false)
        const s_interpolator = InterpolationManager.makeInterpolatorVectorized<Location, LocationElementType, LocationFuseMode, LocationContainer, Vec3, Vec3, Vec3, FieldPointVectorContainerStatic<NumberTypedArray>, LocationVector>(s, locationField, Vec3, isDynamicLocation, false)

        return (locations, results) => {
            const t = Vec3.ZERO

            const r_i = new Quat()
            const s_i = new Vec3()
            const m_i = new Mat4()
            const m_i_data = m_i.data

            const r = r_interpolator(locations)
            const s = s_interpolator(locations)

            const n = (<FieldPointVector<number>>locations).length

            const m = <FieldPointVectorContainerStatic<NumberTypedArray>>(!isDynamicResult ? results : undefined) ?? new Float64Array(n * 9)

            let r_offset = 0
            let s_offset = 0
            let m_offset = 0

            for (let i = 0; i < n; i++) {
                r_i.x = r[r_offset++]
                r_i.y = r[r_offset++]
                r_i.z = r[r_offset++]
                r_i.w = r[r_offset++]

                s_i.x = s[s_offset++]
                s_i.y = s[s_offset++]
                s_i.z = s[s_offset++]

                m_i.setTRS(t, r_i, s_i)

                m[m_offset++] = m_i_data[0x0]
                m[m_offset++] = m_i_data[0x1]
                m[m_offset++] = m_i_data[0x2]
                // m[m_offset++] = m_i_data[0x3]

                m[m_offset++] = m_i_data[0x4]
                m[m_offset++] = m_i_data[0x5]
                m[m_offset++] = m_i_data[0x6]
                // m[m_offset++] = m_i_data[0x7]

                m[m_offset++] = m_i_data[0x8]
                m[m_offset++] = m_i_data[0x9]
                m[m_offset++] = m_i_data[0xA]
                // m[m_offset++] = m_i_data[0xB]

                // m[m_offset++] = m_i_data[0xC]
                // m[m_offset++] = m_i_data[0xD]
                // m[m_offset++] = m_i_data[0xE]
                // m[m_offset++] = m_i_data[0xF]
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