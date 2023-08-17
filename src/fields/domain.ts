import { ArrayVectorFunction, VectorFunction } from "vectorized-functions"
import { Field } from "./field.js"
import { FieldPoint, FieldPointVectorized } from "./point.js"

export const SampleDomainLocationFieldKey = Symbol('location')

export interface SamplingContext<Location extends FieldPoint = FieldPoint> {
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

// const SampleDomain_vectorized_impl = {
//     sample: new VectorFunction<
//             SampleDomain<FieldPoint, FieldPoint>,
//             "sample",
//             (location: FieldPoint, context: SamplingContext<FieldPoint>) => FieldPoint,
//             (locations: FieldPointVectorized<FieldPoint>, context: SamplingContext<FieldPoint>) => FieldPointVectorized<FieldPoint>
//         >("sample", [0])
// }

const SampleDomain_vectorized_impl = {
    sample: new ArrayVectorFunction<
            SampleDomain<FieldPoint, FieldPoint>,
            "sample",
            (location: FieldPoint, context: SamplingContext<FieldPoint>) => FieldPoint,
            [true, false],
            (locations: FieldPoint[], context: SamplingContext<FieldPoint>) => FieldPoint[]
        >("sample", [true, false])
}

export const SampleDomain_vectorized = {
    sample: <
            Location extends FieldPoint,
            Sample extends FieldPoint,
            Context extends SamplingContext<Location> = SamplingContext<Location>
        >(
            domain: SampleDomain<Location, Sample, Context>,
            // locations: FieldPointVectorized<Location>,
            locations: Location[],
            context: Context
        ) => SampleDomain_vectorized_impl.sample.call(domain, locations, context) as Sample[]
}