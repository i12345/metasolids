import { VectorFunction } from "vectorized-functions"
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

const SampleDomain_vectorized_impl = {
    sample: new VectorFunction<
        SampleDomain<FieldPoint, FieldPoint>,
        "sample",
        (location: FieldPoint, context: SamplingContext<FieldPoint>) => FieldPoint,
        (locations: FieldPoint[], context: SamplingContext<FieldPoint>) => FieldPoint[]
        >("sample", [0])
}

export const SampleDomain_vectorized = {
    sample: <
            Location extends FieldPoint,
            Sample extends FieldPoint,
            Context extends SamplingContext<Location> = SamplingContext<Location>
        >(
            domain: SampleDomain<Location, Sample, Context>,
            locations: Location[],
            context: Context
        ) => SampleDomain_vectorized_impl.sample.call(domain, locations, context) as Sample[]
}