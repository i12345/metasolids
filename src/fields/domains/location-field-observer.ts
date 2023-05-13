import { SampleDomain, SampleDomainLocationField, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldPoint } from "../point.js";
import { TransformingSampleDomain } from "./transforming.js";

export class LocationFieldObserverSampleDomain<
        Location extends FieldPoint,
        Sample extends FieldPoint,
        Context extends SamplingContext<Location>
    > extends
    TransformingSampleDomain<
            Location, Sample, Context,
            Location, Sample, Context
        > {
    private _locationField?: Field<Location>

    get locationField() {
        return this._locationField
    }
    
    constructor(inner: SampleDomain<Location, Sample, Context>) {
        super(inner)
    }

    protected override init_location_field(context: Context): Field<Location> {
        this._locationField = context[SampleDomainLocationField]
        return context[SampleDomainLocationField]
    }
}