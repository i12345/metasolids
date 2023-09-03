import { SampleDomain, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldsField } from "../fields/fields.js";
import { InterpolationKeypoint, InterpolationManager, InterpolationType, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class SampleDomainInterpolationType<
        Sample extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
    > implements
    InterpolationType<
        SampleDomain<
            FieldPoint,
            Sample,
            FieldPoint,
            FieldPoint,
            SampleElementType,
            SampleFuseMode
        >
    > {
    [makeInterpolator]<
            Location extends FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
        >(
            keypoints: InterpolationKeypoint<
                Location,
                SampleDomain<
                    Location, Sample,
                    LocationElementType, LocationFuseMode,
                    SampleElementType, SampleFuseMode,
                    SamplingContext<Location, LocationElementType, LocationFuseMode>
                >
            >[],
            locationField: Field<Location, LocationElementType, LocationFuseMode>
        ): Interpolator<
            Location,
            SampleDomain<
                Location, Sample,
                LocationElementType, LocationFuseMode,
                SampleElementType, SampleFuseMode,
                SamplingContext<Location, LocationElementType, LocationFuseMode>
            >
        > | undefined {
        if (keypoints.some(({ value: domain }) => !(domain?.field?.interpolationType && domain.field.interpolationType[makeInterpolator])))
            return undefined

        const sampleField = FieldsField.merge(...keypoints.map(({ value: domain }) => <FieldsField><Field>domain.field))

        return location => new InterpolatingSampleDomain(
            keypoints,
            location,
            locationField,
            <Field<Sample, SampleElementType, SampleFuseMode>><Field>sampleField
        )
    }

    static {
        InterpolationManager.register(new this())
    }
}

export class InterpolatingSampleDomain<
        T extends FieldPoint = FieldPoint,
        TElementType extends FieldPoint = FieldPoint,
        TFuseMode extends FieldPoint = FieldPoint,
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        Sample extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        Context extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> =
            SamplingContext<Location, LocationElementType, LocationFuseMode>
    > implements
    SampleDomain<
        Location, Sample,
        LocationElementType, LocationFuseMode,
        SampleElementType, SampleFuseMode,
        Context
    > {
    constructor(
        public keypoints: InterpolationKeypoint<T, SampleDomain<Location, Sample, LocationElementType, LocationFuseMode, SampleElementType, SampleFuseMode, Context>>[],
        public location_interpolation: T,
        public location_field: Field<T, TElementType, TFuseMode>,
        public field: Field<Sample, SampleElementType, SampleFuseMode>
    ) {
    }

    sample(location_space: Location, context: Context): Sample {
        const samples = this.keypoints.map(
            ({ location, value: domain }) =>
                ({ location, value: domain.sample(location_space, context) })
        )
        const interpolator = InterpolationManager[makeInterpolator](samples, this.location_field)
        return interpolator(this.location_interpolation)
    }

    init(context: Context): void {
        for (const { value: domain } of this.keypoints)
            domain.init(context)
    }
}