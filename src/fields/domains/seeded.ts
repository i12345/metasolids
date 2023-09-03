import { SampleDomain, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldPoint } from "../point.js";

export const SeedKey = Symbol("seed")

export interface SeededSamplingContext<
        Location extends FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
    > extends SamplingContext<Location, LocationElementType, LocationFuseMode> {
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
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        Context extends
            SeededSamplingContext<Location, LocationElementType, LocationFuseMode> =
            SeededSamplingContext<Location, LocationElementType, LocationFuseMode>
    > implements
    SampleDomain<
        Location,
        Sample,
        LocationElementType,
        LocationFuseMode,
        SampleElementType,
        SampleFuseMode,
        Context
    > {
    abstract get field(): Field<Sample, SampleElementType, SampleFuseMode>

    init(context: Context): void {
        if (context[SeedKey] === undefined)
            context[SeedKey] = 0
    }

    abstract sample(location: Location, context: Context): Sample
}