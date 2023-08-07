import { BoundingBox, Vec3 } from "playcanvas-extended";
import { Field } from "../../../fields/field.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext, defaultVolumeLocationField, defaultVolumeSampleField } from "../../volume.js";
import { openSimplex } from "../../../fields/domains/noise/open-simplex.js";
import { SeededSamplingContext, TransformingSampleDomain } from "../../../fields/domains/index.js";
import { Vec3Field } from "../../../fields/fields/vec3.js";

export class OpenSimlpexNoiseVolume
    extends TransformingSampleDomain<
        VolumeLocation, VolumeSample, VolumeSamplingContext,
        Vec3, number, SeededSamplingContext<Vec3>
    >
    implements Volume {
    private _version!: keyof typeof openSimplex[3]
    
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

    protected transformLocation(location: VolumeLocation, context: { outer: VolumeSamplingContext<VolumeLocation>; inner: SeededSamplingContext<Vec3>; }): Vec3 {
        return location.p
    }

    protected transformSample(sample: number, location: { outer: VolumeLocation; inner: Vec3; }, context: { outer: VolumeSamplingContext<VolumeLocation>; inner: SeededSamplingContext<Vec3>; }): VolumeSample {
        return { alpha: sample, gradient: Vec3.ZERO }
    }
}