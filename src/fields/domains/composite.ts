import { SampleDomain, SamplingContext } from "../domain"
import { Field } from "../field"
import { FieldsField } from "../fields"
import { FieldPoint, FieldsPoint, field_point_add_inplace } from "../point"

export class CompositeSampleDomain<
        Location extends FieldPoint = FieldPoint,
        Sample extends FieldsPoint = FieldsPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>
    > implements
    SampleDomain<Location, Sample, Context> {
    constructor(public children: SampleDomain<Location, Sample, Context>[]) { }

    get field(): Field<Sample> {
        const fields = this.children.map(child => child.field as any as FieldsField<Sample>)
        return FieldsField.merge(...fields)
    }

    init(context: Context): void {
        for (const child of this.children)
            child.init(context)
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
        return field_point_add_inplace(accumulator, addition)
    }

    sample(location: Location, context: Context): Sample {
        let sample: Sample = undefined
        for (const child of this.children)
            sample = this.composite(sample, child.sample(location, context))
        
        return sample
    }
}