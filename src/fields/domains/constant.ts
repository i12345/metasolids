import { FieldPoint } from '../point.js'
import { SampleDomain, SamplingContext } from '../domain.js'
import { Field } from '../field.js'

export class ConstantSampleDomain<
        Location extends FieldPoint,
        Sample extends FieldPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>,
    > implements
    SampleDomain<Location, Sample, Context> {
    constructor(
        public value: Sample,
        public field: Field<Sample>
    ) { }
    
    init(context: Context): void {}
    
    sample(location: Location, context: Context): Sample {
        return this.value
    }
}