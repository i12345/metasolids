import { SampleDomain, SamplingContext } from "../domain";
import { FieldPoint, field_point_modulo } from "../point";
import { TransformingSampleDomain } from "./transforming";

export class RepeatingSampleDomain<
        Location extends FieldPoint = FieldPoint,
        Sample extends FieldPoint = FieldPoint,
        Context extends SamplingContext<Location> = SamplingContext<Location>
    > extends
    TransformingSampleDomain<
        Location,
        Sample,
        Context,
        Location,
        Sample,
        Context
    > {
    constructor(
        inner: SampleDomain<Location, Sample, Context>,
        public size: Location
    ) {
        super(inner);
    }
    
    protected override transformLocation(location: Location): Location {
        return field_point_modulo(location, this.size)
    }
}