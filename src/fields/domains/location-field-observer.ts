import { MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { SampleDomain, SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldPoint } from "../point.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "../vectorized/index.js";
import { FusedVectorSamplingContext } from "./fusing.js";
import { TransformingSampleDomain } from "./transforming.js";

export class LocationFieldObserverSampleDomain<
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
    private _locationField?: Field<Location>

    get locationField() {
        return this._locationField
    }

    protected readonly transformsLocation = false
    protected readonly transformsSample = false
    
    constructor(inner: SampleDomain<Location, Sample, Context>) {
        super(inner)
    }

    protected override init_location_field(context: Context): Field<Location> {
        this._locationField = context[SampleDomainLocationFieldKey]
        return context[SampleDomainLocationFieldKey]
    }
}