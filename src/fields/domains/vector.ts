import { MultiObjectsIDs, MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { SampleDomain, SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldPoint } from "../point.js";
import { FieldPointType } from "../type.js"
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorFunction, VectorizedTypes } from "../vectorized/index.js";

export const VectorSampleFunction = Symbol("vector-sample()")

export function makeVectorSamplingContext<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> =
            SamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends FieldPointVector<SampleElementType, SampleContainer> = FieldPointVector<SampleElementType, SampleContainer>,
        Context extends
            VectorSamplingContext<
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
                SingularContext,
                LocationVector,
                SampleVector
            > =
            VectorSamplingContext<
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
                SingularContext,
                LocationVector,
                SampleVector
            >
    >(
        field: Field<Sample, SampleElementType, SampleFuseMode>,
        context: Context,
        multiObjectsIDs?: MultiObjectsIDs<Objects, ObjIDsT>
    ) {
    const vectorSampleFunction = new FieldPointVectorFunction<
            VectorSampleDomain<
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
            "sample",
            VectorSampleDomain<
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
                >["sample"],
            [LocationElementType, undefined],
            SampleElementType,
            [LocationContainer, undefined],
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer
        >(
            "sample",
            [<LocationElementType extends FieldPoint ? FieldPointType<LocationElementType> : LocationElementType>context[SampleDomainLocationFieldKey].elementType, undefined],
            <SampleElementType extends FieldPoint ? (FieldPointType<SampleElementType> | undefined) : undefined>field.elementType,
            [1, MultiObjectsIDsKey]
        )

    context[VectorSampleFunction] = <any>vectorSampleFunction.call.bind(vectorSampleFunction)
    if (multiObjectsIDs)
        context[MultiObjectsIDsKey] = multiObjectsIDs
}

export type VectorSamplingContext<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> =
            SamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends FieldPointVector<SampleElementType, SampleContainer> = FieldPointVector<SampleElementType, SampleContainer>,
    > =
    SingularContext &
    WithMultiObjectsIDs<Objects, ObjIDsT> & {
    [VectorSampleFunction](
        domain: SampleDomain<
            Location,
            Sample,
            LocationElementType,
            LocationFuseMode,
            SampleElementType,
            SampleFuseMode,
            SingularContext
        >,
        locations: LocationVector,
        context: VectorSamplingContext<
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
                SingularContext,
                LocationVector,
                SampleVector
            >
    ): SampleVector
}

export interface VectorSampleDomain<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> =
            SamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends FieldPointVector<SampleElementType, SampleContainer> = FieldPointVector<SampleElementType, SampleContainer>,
        VectorContext extends
            VectorSamplingContext<
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
                    SingularContext,
                    LocationVector,
                    SampleVector
                > =
            VectorSamplingContext<
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
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
    > extends
    SampleDomain<
        Location,
        Sample,
        LocationElementType,
        LocationFuseMode,
        SampleElementType,
        SampleFuseMode,
        SingularContext
    > {
}