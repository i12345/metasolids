import { FieldPoint } from '../point.js'
import { SampleDomain, SamplingContext } from '../domain.js'
import { Field } from '../field.js'
import { vectorized } from 'vectorized-functions'

export class ConstantSampleDomain<
        Location extends FieldPoint = FieldPoint,
        Sample extends FieldPoint = FieldPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>,
    > implements
    SampleDomain<Location, Sample, Context> {
    constructor(
        public value: Sample,
        public field: Field<Sample>
    ) { }
    
    init(context: Context): void {}
    
    @vectorized(ConstantSampleDomain.sample_vectorized)
    sample(location: Location, context: Context): Sample {
        return this.value
    }

    private static sample_vectorized<
            Location extends FieldPoint = FieldPoint,
            Sample extends FieldPoint = FieldPoint,
            Context extends SamplingContext<Location> = SamplingContext<Location>,
        >(
            this: ConstantSampleDomain<Location, Sample, Context>,
            locations: Location[],
            context: Context
        ): Sample[] {
        return new Array<Sample>(locations.length).fill(this.value)
    }
}