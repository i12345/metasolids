import { extract, intract } from "../../utils/tree.js";
import { SampleDomain, SamplingContext } from "../domain.js";
import { FieldPoint, FieldPointMapped, FieldPointNumbers, FieldPointPrimitive, FieldsPoint, FieldsPointMapped, fields_point_map, field_point_equal, field_point_map, field_point_modulo, field_point_multiply } from "../point.js";
import { TransformingSampleDomain } from "./transforming.js";

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
    private size_double: Location

    constructor(
        inner: SampleDomain<Location, Sample, Context>,
        public size: Location,
        public mirror: FieldPointMapped<FieldPointNumbers<Location>, boolean>
    ) {
        super(inner);
    }

    override init(context: Context): void {
        this.size_double = field_point_multiply(this.size, 2)
        super.init(context)
    }
    
    protected override transformLocation(location: Location): Location {
        const modulo = { values: field_point_modulo(location, this.size) }

        field_point_map(
            this.mirror,
            leaf => typeof leaf === 'boolean',
            (mirror, path) => {
                const value: number = extract(modulo.values, path)
                
                if (mirror) {
                    const size: number = extract(this.size, path)
                    const size_double: number = extract(this.size_double, path)
                    const location_value: number = extract(location, path)
                    const modulo_double = location_value % size_double

                    if (modulo_double > size) {
                        const reflected_location_value = size - value
                        intract(modulo, ['values', ...path], reflected_location_value)
                    }
                }

                return value
            }
        )

        return modulo.values
    }
}