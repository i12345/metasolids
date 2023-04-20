import { SampleDomain, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldsField } from "../fields/fields.js";
import { InterpolationKeypoint, InterpolationManager, InterpolationType, Interpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class SampleDomainInterpolationType implements InterpolationType<SampleDomain<FieldPoint, FieldPoint>> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: InterpolationKeypoint<Location, SampleDomain<FieldPoint, FieldPoint, SamplingContext<FieldPoint>>>[],
            locationField: Field<Location>
        ): Interpolator<Location, SampleDomain<FieldPoint, FieldPoint, SamplingContext<FieldPoint>>> {
        if (keypoints.some(({ value: domain }) => !(domain?.field?.interpolationType && domain.field.interpolationType[makeInterpolator])))
            return undefined
        
        const field = FieldsField.merge(...keypoints.map(({ value: domain }) => domain.field as FieldsField))

        return location => new InterpolatingSampleDomain(
            keypoints,
            location,
            locationField,
            field
        )
    }

    static {
        InterpolationManager.register(new this())
    }
}

export class InterpolatingSampleDomain<
        T extends FieldPoint = FieldPoint,
        Location extends FieldPoint = FieldPoint,
        Sample extends FieldPoint = FieldPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>
    > implements
    SampleDomain<Location, Sample, Context> {
    constructor(
        public keypoints: InterpolationKeypoint<T, SampleDomain<Location, Sample, Context>>[],
        public location_interpolation: T,
        public location_field: Field<T>,
        public field: Field<Sample>
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