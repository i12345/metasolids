import { ContextWorker } from "../processor"
import { Field } from "./field"
import { FieldPoint } from "./point"

export const SampleDomainLocationField = Symbol('location')

export interface SamplingContext<Location extends FieldPoint = FieldPoint> {
    [SampleDomainLocationField]: Field<Location>
}

export interface SampleDomain<
        Location extends FieldPoint,
        Sample extends FieldPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>
    >
    extends ContextWorker<Context> {
    field: Field<Sample>
    sample(location: Location, context: Context): Sample
}