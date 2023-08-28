import { Field } from "./field.js"
import { FieldPoint } from "./point.js"

export const SampleDomainLocationFieldKey = Symbol('location')

export interface SamplingContext<
        Location extends FieldPoint = FieldPoint,
    > {
    [SampleDomainLocationFieldKey]: Field<Location>
}

export interface SampleDomain<
        Location extends FieldPoint,
        Sample extends FieldPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>
    > {
    field: Field<Sample>

    //TODO: consider if field should be returned from init method
    // how would the initialization be kept track of?
    // it would be easier to just store this information in the context

    init(context: Context): void
    sample(location: Location, context: Context): Sample
}