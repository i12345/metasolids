import { MultiObjectsTemplate, extract, intract } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { SampleDomain, SamplingContext } from "../domain.js";
import { FieldPoint, FieldPointMapped, FieldPointNumbers, FieldPointPrimitive, FieldsPoint, FieldsPointMapped, fields_point_map, field_point_equal, field_point_map, field_point_modulo, field_point_multiply } from "../point.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "../vectorized/index.js";
import { FusedVectorSamplingContext } from "./fusing.js";
import { TransformingSampleDomain } from "./transforming.js";

export class RepeatingSampleDomain<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        Location extends FieldPoint = FieldPoint,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Context extends SamplingContext<Location> = SamplingContext<Location>,
        LocationVector extends
            FieldPointVector<Location, LocationContainer> =
            FieldPointVector<Location, LocationContainer>,
        SampleVector extends 
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    Location,
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                > =
            FusedVectorSamplingContext<
                    Location,
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                >,
    > extends
    TransformingSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        Location,
        LocationContainer,
        Sample,
        SampleContainer,
        Context,
        LocationVector,
        SampleVector,
        VectorContext,
        Location,
        LocationContainer,
        Sample,
        SampleContainer,
        Context,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    private size_double!: Location

    protected readonly transformsLocation = true
    protected readonly transformsSample = false

    constructor(
        inner: SampleDomain<Location, Sample, Context>,
        public size: Location,
        public mirror: FieldPointMapped<FieldPointNumbers<Location>, boolean>
    ) {
        super(inner)
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