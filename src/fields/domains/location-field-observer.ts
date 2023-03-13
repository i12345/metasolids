import { SampleDomain, SampleDomainLocationField, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldPoint } from "../point.js";
import { TransformingDefaultInnerSamplingContext, TransformingSampleDomain } from "./transforming.js";

export class LocationFieldObserverSampleDomain<
        Location extends FieldPoint,
        Sample extends FieldPoint,
        Context extends SamplingContext<Location>
    > extends
    TransformingSampleDomain<Location, Sample, Context> {
    private _locationField: Field<Location>

    get locationField() {
        return this._locationField
    }
    
    constructor(inner: SampleDomain<Location, Sample, Context>) {
        super(inner as any as SampleDomain<Location, Sample, TransformingDefaultInnerSamplingContext<Location, Location, Sample, Context>>)
    }

    protected override init_location_field(context: Context): Field<Location> {
        this._locationField = context[SampleDomainLocationField]
        return context[SampleDomainLocationField]
    }
}