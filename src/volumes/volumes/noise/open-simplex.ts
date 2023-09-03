import { BoundingBox, Vec3 } from "playcanvas-extended";
import { Field } from "../../../fields/field.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext, defaultVolumeLocationField, defaultVolumeSampleField } from "../../volume.js";
import { openSimplex } from "../../../fields/domains/noise/open-simplex.js";
import { FusedVectorSamplingContext, SeededSamplingContext, TransformingSampleDomain } from "../../../fields/domains/index.js";
import { Vec3Field } from "../../../fields/fields/vec3.js";
import { MultiObjectsTemplate } from "../../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../../utils/indices-array.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "../../../fields/vectorized/index.js";

export class OpenSimplexNoiseVolume<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeLocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        VolumeSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleProcessingContextT = any,
        ContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, SampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, SampleProcessingContextT>,
        LocationVector extends
            FieldPointVector<VolumeLocationElementType, VolumeLocationContainer> =
            FieldPointVector<VolumeLocationElementType, VolumeLocationContainer>,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    VolumeSample,
                    VolumeSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    VolumeSample,
                    VolumeSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeLocationContainer,
                    VolumeSample,
                    VolumeSample,
                    VolumeSample,
                    VolumeSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    ContextT,
                    LocationVector,
                    SampleVector
                > =
            FusedVectorSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeLocationContainer,
                    VolumeSample,
                    VolumeSample,
                    VolumeSample,
                    VolumeSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    ContextT,
                    LocationVector,
                    SampleVector
                >,
    >
    extends TransformingSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,

        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeLocationContainer,
        VolumeSample,
        VolumeSample,
        VolumeSample,
        VolumeSampleContainer,
        ContextT,
        LocationVector,
        SampleVector,
        VectorContext,

        Vec3,
        Vec3,
        Vec3,
        VolumeLocationContainer,
        number,
        number,
        number,
        VolumeSampleContainer,
        SeededSamplingContext<Vec3>
    >
    implements Volume {
    private _version!: keyof typeof openSimplex[3]

    protected readonly transformsLocation = true
    protected readonly transformsSample = true

    get version() {
        return this._version
    }

    set version(version) {
        this._version = version
        this.inner = openSimplex[3][version]
    }

    constructor(
        version: keyof typeof openSimplex[3] = "fallback",
    ) {
        super(undefined!)
        this.version = version
    }

    readonly field = defaultVolumeSampleField

    protected init_location_field(context: VolumeSamplingContext<VolumeLocation>): Field<Vec3> {
        return Vec3Field.instance
    }

    protected init_make_field(innerField: Field<number>, context: { inner: SeededSamplingContext<Vec3>; outer: VolumeSamplingContext<VolumeLocation>; }): Field<VolumeSample> {
        return defaultVolumeSampleField
    }

    //TODO: implement vectorized
    protected transformLocation(location: VolumeLocation, context: { outer: VolumeSamplingContext<VolumeLocation>; inner: SeededSamplingContext<Vec3>; }): Vec3 {
        return location.p
    }

    //TODO: implement vectorized
    protected transformSample(
            sample: number,
            innerLocation: Vec3,
            outerLocation: VolumeLocationT,
            context: { outer: ContextT; inner: SeededSamplingContext<Vec3>; }
        ): VolumeSample {
        return { alpha: sample, gradient: Vec3.ZERO }
    }
}