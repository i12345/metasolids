import { Field } from "./field.js"
import { FieldPoint } from "./point.js"

export const SampleDomainLocationField = Symbol('location')

export interface SamplingContext<Location extends FieldPoint = FieldPoint> {
    [SampleDomainLocationField]: Field<Location>
}

export interface SampleDomain<
        Location extends FieldPoint,
        Sample extends FieldPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>
    > {
    field: Field<Sample>

    //TODO: consider if field should be returned from init method
    init(context: Context): void
    sample(location: Location, context: Context): Sample
}