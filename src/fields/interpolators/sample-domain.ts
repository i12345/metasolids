import { SampleDomain, SamplingContext } from "../domain";
import { Field } from "../field";
import { FieldsField } from "../fields";
import { FieldInterpolationType, InterpolationManager, InterpolationType, Interpolator, makeInterpolator } from "../interpolation";
import { FieldPoint } from "../point";

export class SampleDomainInterpolationType implements InterpolationType<SampleDomain<FieldPoint, FieldPoint>> {
    [makeInterpolator]<Location extends FieldPoint>(
            keypoints: [Location, SampleDomain<FieldPoint, FieldPoint, SamplingContext<FieldPoint>>][]
        ): Interpolator<Location, SampleDomain<FieldPoint, FieldPoint, SamplingContext<FieldPoint>>> {
        if (keypoints.some(([_, domain]) => !(domain?.field?.interpolationType && domain.field.interpolationType[makeInterpolator])))
            return undefined
        
        const field = FieldsField.merge(...keypoints.map(([_, keypoint]) => keypoint.field as FieldsField))
        const fieldInterpolationType = field.interpolationType

        return location => new InterpolatingSampleDomain(keypoints, location, field, fieldInterpolationType)
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
        public keypoints: [T, SampleDomain<Location, Sample, Context>][],
        public location_interpolation: T,
        public field: Field<Sample>,
        public fieldInterpolationType: FieldInterpolationType<Sample>
    ) {
    }

    sample(location_space: Location, context: Context): Sample {
        const samples = this.keypoints.map(([t, keypoint]) => [t, keypoint.sample(location_space, context)] as [T, Sample])
        const interpolator = this.fieldInterpolationType[makeInterpolator](samples)
        return interpolator(this.location_interpolation)
    }

    init(context: Context): void {
        for (const [_, keypoint] of this.keypoints)
            keypoint.init(context)
    }
}