import { SampleDomain, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldPoint } from "../point.js";

export class IdentityDomain<
        LocationSample extends FieldPoint = FieldPoint,
        Context extends SamplingContext<LocationSample> = SamplingContext<LocationSample>
    > implements
    SampleDomain<
        LocationSample,
        LocationSample,
        Context
    > {
    constructor(public readonly field: Field<LocationSample>) { }
    
    init(context: Context): void {
    }

    sample(location: LocationSample, context: Context): LocationSample {
        return location
    }
}