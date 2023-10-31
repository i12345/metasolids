import { Field } from "./field.js"
import { FieldPoint } from "./point.js"

export const SampleDomainLocationFieldKey = Symbol('location')

export interface SamplingContext<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
    > {
    [SampleDomainLocationFieldKey]: Field<Location, LocationElementType, LocationFuseMode>
}

export interface SampleDomain<
        Location extends FieldPoint,
        Sample extends FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        Context extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> =
            SamplingContext<Location, LocationElementType, LocationFuseMode>
    > {
    field: Field<Sample, SampleElementType, SampleFuseMode>

    //TODO: consider if field should be returned from init method
    // how would the initialization be kept track of?
    // it would be easier to just store this information in the context

    init(context: Context): void
    sample(location: Location, context: Context): Sample | undefined
}