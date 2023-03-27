import { SampleDomain, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldInterpolationKeypoint, FieldInterpolationType, FieldInterpolator, makeInterpolator } from "../interpolation.js";
import { FieldPoint, FieldsPoint } from "../point.js";

export class KeypointsSampleDomain<
        Location extends FieldPoint = FieldPoint,
        Sample extends FieldPoint = FieldPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>
    > implements
    SampleDomain<Location, Sample, Context> {
    private interpolator: FieldInterpolator<Location, Sample>

    constructor(
        public keypoints: FieldInterpolationKeypoint<Location, Sample>[],
        public field: Field<Sample>,
        public interpolationType?: FieldInterpolationType<Sample>
    ) {}

    init(context: Context): void {
        this.interpolator = (this.interpolationType ?? this.field.interpolationType)[makeInterpolator](this.keypoints)
    }

    sample(location: Location, context: Context): Sample {
        return this.interpolator(location)
    }
}