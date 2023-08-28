import { MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { SampleDomain, SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { FieldPoint } from "../point.js";
import { FieldPointType } from "../type.js"
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorFunction } from "../vectorized/index.js";

export const VectorSampleFunction = Symbol("vector-sample()")

export function makeVectorSamplingContext<
        Location extends FieldPoint = FieldPoint,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
        LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
        SampleVector extends FieldPointVector<Sample, SampleContainer> = FieldPointVector<Sample, SampleContainer>,
        Context extends
            VectorSamplingContext<
                Location,
                LocationContainer,
                Sample,
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
                LocationContainer,
                Sample,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                SampleVector
            >
    >(
        domain: SampleDomain<Location, Sample, SingularContext>,
        context: Context
    ) {
    const vectorSampleFunction = new FieldPointVectorFunction <
            SampleDomain<Location, Sample, Context>,
            "sample",
            SampleDomain<Location, Sample, Context>["sample"],
            [FieldPointType<Location>, undefined],
            [LocationContainer, undefined],
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer
        >(
            "sample",
            [context[SampleDomainLocationFieldKey].elementType, undefined],
            <Sample extends FieldPoint ? FieldPointType<Sample> : undefined>domain.field.elementType,
            [1, MultiObjectsIDsKey]
        )
    
    context[VectorSampleFunction] = <any>vectorSampleFunction.call.bind(vectorSampleFunction)
}

export type VectorSamplingContext<
        Location extends FieldPoint = FieldPoint,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
        LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
        SampleVector extends FieldPointVector<Sample, SampleContainer> = FieldPointVector<Sample, SampleContainer>,
    > =
    SingularContext &
    WithMultiObjectsIDs<Objects, ObjIDsT> & {
    [VectorSampleFunction](
        domain: SampleDomain<Location, Sample, SingularContext>,
        locations: FieldPointVector<Location, LocationContainer>,
        context: VectorSamplingContext<
                Location,
                LocationContainer,
                Sample,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                SampleVector
            >
    ): FieldPointVector<Sample, SampleContainer>
        
    // [VectorSampleFunction]: FieldPointVectorFunction<
    //     SampleDomain<Location, Sample, SingularContext>,
    //     "sample",
    //     SampleDomain<Location, Sample, SingularContext>["sample"],
    //     [FieldPointType<Location>, undefined],
    //     LocationContainer,
    //     SampleContainer,
    //     Objects,
    //     ObjIDsT,
    //     ObjIDsContainer
    // >["call"]
}

export interface VectorSampleDomain<
        Location extends FieldPoint = FieldPoint,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
        LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
        SampleVector extends FieldPointVector<Sample, SampleContainer> = FieldPointVector<Sample, SampleContainer>,
        VectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationContainer,
                    Sample,
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
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
    > extends
    SampleDomain<Location, Sample, SingularContext> {
}