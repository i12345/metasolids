import { SampleDomain, SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldInterpolationKeypoint, FieldInterpolator, InterpolationManager, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";

export class KeypointsSampleDomain<
        Location extends FieldPoint = FieldPoint,
        Sample extends FieldPoint = FieldPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>
    > implements
    SampleDomain<Location, Sample, Context> {
    private interpolator!: FieldInterpolator<Location, Sample>

    constructor(
        public keypoints: FieldInterpolationKeypoint<Location, Sample>[],
        public field: Field<Sample>
    ) {}

    init(context: Context): void {
        this.interpolator = InterpolationManager[makeInterpolator](this.keypoints, context[SampleDomainLocationFieldKey])
    }
    
    sample(location: Location, context: Context): Sample {
        return this.interpolator(location)
    }
}