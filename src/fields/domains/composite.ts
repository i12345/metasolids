import { ArrayVectorFunction, VectorFunction, vectorized } from "vectorized-functions"
import { SampleDomain, SampleDomain_vectorized, SamplingContext } from "../domain.js"
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

    @vectorized(CompositeSampleDomain.sample_vectorized)
    sample(location: Location, context: Context): Sample {
        let sample: Sample | undefined = undefined
        for (const child of this.children)
            sample = this.composite(sample, child.sample(location, context))
        
        return sample!
    }

    private static sample_vectorized<
            Location extends FieldPoint = FieldPoint,
            Sample extends FieldPoint = FieldPoint,
            Context extends SamplingContext<Location> = SamplingContext<Location>
        >(
            this: CompositeSampleDomain<Location, Sample, Context>,
            locations: Location[],
            context: Context
        ): Sample[] {
        let samples: (Sample | undefined)[] = new Array(locations.length).fill(undefined)
        for (const child of this.children) {
            samples = CompositeSampleDomain.vectorized.composite.call(
                this as any,
                samples,
                SampleDomain_vectorized.sample(child, locations, context)
            ) as Sample[]
        }
        
        return samples as Sample[]
    }

    protected static readonly vectorized = {
        composite: new ArrayVectorFunction<
            { composite(accumulator: FieldPoint | undefined, addition: FieldPoint): FieldPoint },
            // CompositeSampleDomain,
            "composite",
            (accumulator: FieldPoint | undefined, addition: FieldPoint) => FieldPoint,
            [true, true],
            (accumulator: (FieldPoint | undefined)[], addition: FieldPoint[]) => FieldPoint[]
        >("composite", [true, true])
    }
}