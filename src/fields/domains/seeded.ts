import { SampleDomain, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldPoint } from "../point.js";

export const SeedKey = Symbol("seed")

export interface SeededSamplingContext<
        Location extends FieldPoint
    > extends SamplingContext<Location> {
    [SeedKey]: number
}

//TODO: consider how seed can be made to deterministically vary
// interface SeededSamplingContextPrivate<
//         Location extends FieldPoint
//     > extends SeededSamplingContext<Location> {
//     seed_private: number
// }

export abstract class SeededSampleDomain<
        Location extends FieldPoint,
        Sample extends FieldPoint,
        Context extends SeededSamplingContext<Location> = SeededSamplingContext<Location>
    > implements SampleDomain<Location, Sample, Context> {
    abstract get field(): Field<Sample>

    init(context: Context): void {
        if (context[SeedKey] === undefined)
            context[SeedKey] = 0
    }

    abstract sample(location: Location, context: Context): Sample
}