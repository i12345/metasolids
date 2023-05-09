import { SampleDomain, SamplingContext } from "../domain.js"
import { FieldPoint, field_point_multiply_hadamard } from "../point.js"
import { CompositeSampleDomain } from "./composite.js"

export class CompositeHadamardProductSampleDomain<
        Location extends FieldPoint = FieldPoint,
        Sample extends FieldPoint = FieldPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>
    > extends
    CompositeSampleDomain<Location, Sample, Context> {
    constructor(children: SampleDomain<Location, Sample, Context>[]) {
        super(children)
    }

    /**
     * Mutates the accumulator to composite the addition into it.
     * @param accumulator the accumulating sample
     * @param addition the new sample to composite onto the accumulator
     * @returns the accumulator mutated in place
     */
    protected composite(
        accumulator: Sample,
        addition: Sample
    ): Sample {
        return field_point_multiply_hadamard(accumulator, addition)
    }
}