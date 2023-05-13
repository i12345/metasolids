import { SampleDomain, SamplingContext } from "../domain.js"
import { Field } from "../field.js"
import { FieldsField } from "../fields/fields.js"
import { FieldPoint, field_point_add_inplace } from "../point.js"

export class CompositeSampleDomain<
        Location extends FieldPoint = FieldPoint,
        Sample extends FieldPoint = FieldPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>
    > implements
    SampleDomain<Location, Sample, Context> {
    private _field!: Field<Sample>
    
    get field() {
        return this._field
    }

    constructor(public children: SampleDomain<Location, Sample, Context>[]) { }

    init(context: Context): void {
        for (const child of this.children)
            child.init(context)
        
        this.init_field()
    }
    
    private init_field() {
        if (this.children[0].field instanceof FieldsField) {
            const fields = this.children.map(child => child.field as any as FieldsField)
            this._field = FieldsField.merge(...fields) as Field<FieldPoint> as Field<Sample>
        }
        else {
            //TODO: enforce all to be of same kind of field
            this._field = this.children[0].field
        }
    }

    /**
     * Mutates the accumulator to composite the addition into it.
     * @param accumulator the accumulating sample
     * @param addition the new sample to composite onto the accumulator
     * @returns the accumulator mutated in place
     */
    protected composite(
            accumulator: Sample | undefined,
            addition: Sample
        ): Sample {
        if (accumulator === undefined)
            return addition
        return field_point_add_inplace(accumulator, addition)
    }

    sample(location: Location, context: Context): Sample {
        let sample: Sample | undefined = undefined
        for (const child of this.children)
            sample = this.composite(sample, child.sample(location, context))
        
        return sample!
    }
}