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
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Context extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> =
            SamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    SampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    SampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
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
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
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
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Context,
        LocationVector,
        SampleVector,
        VectorContext,
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Context,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    private _locationField?: Field<Location, LocationElementType, LocationFuseMode>

    get locationField() {
        return this._locationField
    }

    protected readonly transformsLocation = false
    protected readonly transformsSample = false

    constructor(inner: SampleDomain<
            Location,
            Sample,
            LocationElementType,
            LocationFuseMode,
            SampleElementType,
            SampleFuseMode,
            Context
        >) {
        super(inner)
    }

    protected override init_location_field(context: Context): Field<Location, LocationElementType, LocationFuseMode> {
        return this._locationField = context[SampleDomainLocationFieldKey]
    }
}