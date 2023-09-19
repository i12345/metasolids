import { vectorized } from "vectorized-functions";
import { MultiObjectsIDsKey, MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { SampleDomain, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldPoint } from "../point.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../vectorized/point.js";
import { TransformingSampleDomain } from "./transforming.js";
import { VectorSampleFunction, VectorSamplingContext, makeVectorSamplingContext } from "./vector.js";

/**
 * This sample domain applies a projecting sample domain ($f_1$) to input
 * before sampling the inner sample domain ($f_2$).
 * 
 * $f(x) = f_2(f_1(x))$
 */
export class ComposingSampleDomain<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationT extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = FieldPoint,
        LocationFuseMode extends FieldPoint = FieldPoint,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        IntermediateT extends FieldPoint = FieldPoint,
        IntermediateElementType extends FieldPoint = IntermediateT,
        IntermediateFuseMode extends FieldPoint = IntermediateT,
        IntermediateContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        SampleT extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = SampleT,
        SampleFuseMode extends FieldPoint = SampleT,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        Context1 extends
            SamplingContext<LocationT, LocationElementType, LocationFuseMode> =
            SamplingContext<LocationT, LocationElementType, LocationFuseMode>,
        Context2 extends
            SamplingContext<IntermediateT, IntermediateElementType, IntermediateFuseMode> =
            SamplingContext<IntermediateT, IntermediateElementType, IntermediateFuseMode>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        IntermediateVector extends
            FieldPointVector<IntermediateElementType, IntermediateContainer> =
            FieldPointVector<IntermediateElementType, IntermediateContainer>,
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        VectorContext1 extends
            VectorSamplingContext<
                    LocationT,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleT,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context1,
                    LocationVector,
                    SampleVector
                > =
            VectorSamplingContext<
                    LocationT,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleT,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context1,
                    LocationVector,
                    SampleVector
                >,
        VectorContext2 extends
            VectorSamplingContext<
                    IntermediateT,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    SampleT,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context2,
                    IntermediateVector,
                    SampleVector
                > =
            VectorSamplingContext<
                    IntermediateT,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    SampleT,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context2,
                    IntermediateVector,
                    SampleVector
                >
    > extends
    TransformingSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,

        LocationT,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,

        SampleT,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,

        Context1,
        LocationVector,
        SampleVector,
        VectorContext1,

        IntermediateT,
        IntermediateElementType,
        IntermediateFuseMode,
        IntermediateContainer,

        SampleT,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,

        Context2,
        IntermediateVector,
        SampleVector,
        VectorContext2
    > {
    protected readonly transformsLocation = true
    protected readonly transformsSample = false
    
    get f2() {
        return this.inner
    }

    set f2(f2) {
        this.inner = f2
    }

    constructor(
            public f1: SampleDomain<
                LocationT, IntermediateT,
                LocationElementType,
                LocationFuseMode,
                IntermediateElementType,
                IntermediateFuseMode,
                Context1
            >,
            f2: SampleDomain<
                IntermediateT, SampleT,
                IntermediateElementType,
                IntermediateFuseMode,
                SampleElementType,
                SampleFuseMode,
                Context2
            >,
        ) {
        super(f2)
    }

    protected init_location_field(context: Context1): Field<IntermediateT, IntermediateElementType, IntermediateFuseMode> {
        this.f1.init(context)
        return this.f1.field
    }

    @vectorized(ComposingSampleDomain.transformLocation_vectorized)
    protected transformLocation(location: LocationT, context: { outer: Context1; inner: Context2; }): IntermediateT {
        return this.f1.sample(location, context.outer)
    }

    private static transformLocation_vectorized<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
            LocationT extends FieldPoint = FieldPoint,
            LocationElementType extends FieldPoint = FieldPoint,
            LocationFuseMode extends FieldPoint = FieldPoint,
            LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
            IntermediateT extends FieldPoint = FieldPoint,
            IntermediateElementType extends FieldPoint = IntermediateT,
            IntermediateFuseMode extends FieldPoint = IntermediateT,
            IntermediateContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
            SampleT extends FieldPoint = FieldPoint,
            SampleElementType extends FieldPoint = SampleT,
            SampleFuseMode extends FieldPoint = SampleT,
            SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
            Context1 extends
                SamplingContext<LocationT, LocationElementType, LocationFuseMode> =
                SamplingContext<LocationT, LocationElementType, LocationFuseMode>,
            Context2 extends
                SamplingContext<IntermediateT, IntermediateElementType, IntermediateFuseMode> =
                SamplingContext<IntermediateT, IntermediateElementType, IntermediateFuseMode>,
            LocationVector extends
                FieldPointVector<LocationElementType, LocationContainer> =
                FieldPointVector<LocationElementType, LocationContainer>,
            IntermediateVector extends
                FieldPointVector<IntermediateElementType, IntermediateContainer> =
                FieldPointVector<IntermediateElementType, IntermediateContainer>,
            SampleVector extends
                FieldPointVector<SampleElementType, SampleContainer> =
                FieldPointVector<SampleElementType, SampleContainer>,
            VectorContext1 extends
                VectorSamplingContext<
                        LocationT,
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        SampleT,
                        SampleElementType,
                        SampleFuseMode,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        Context1,
                        LocationVector,
                        SampleVector
                    > =
                VectorSamplingContext<
                        LocationT,
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        SampleT,
                        SampleElementType,
                        SampleFuseMode,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        Context1,
                        LocationVector,
                        SampleVector
                    >,
            VectorContext2 extends
                VectorSamplingContext<
                        IntermediateT,
                        IntermediateElementType,
                        IntermediateFuseMode,
                        IntermediateContainer,
                        SampleT,
                        SampleElementType,
                        SampleFuseMode,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        Context2,
                        IntermediateVector,
                        SampleVector
                    > =
                VectorSamplingContext<
                        IntermediateT,
                        IntermediateElementType,
                        IntermediateFuseMode,
                        IntermediateContainer,
                        SampleT,
                        SampleElementType,
                        SampleFuseMode,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        Context2,
                        IntermediateVector,
                        SampleVector
                    >
        >(
            this: ComposingSampleDomain<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    LocationT,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    IntermediateT,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    SampleT,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Context1,
                    Context2,
                    LocationVector,
                    IntermediateVector,
                    SampleVector,
                    VectorContext1,
                    VectorContext2
                >,
            locations: LocationVector,
            context: { outer: VectorContext1, inner: VectorContext2 }
        ): IntermediateVector {
        type VectorContextF1 = VectorSamplingContext<
            LocationT,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            IntermediateT,
            IntermediateElementType,
            IntermediateFuseMode,
            IntermediateContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            Context1,
            LocationVector,
            IntermediateVector
        >
        const context_f1 = <VectorContextF1><unknown>{ ...context.outer }
        makeVectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                IntermediateT,
                IntermediateElementType,
                IntermediateFuseMode,
                IntermediateContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                Context1,
                LocationVector,
                IntermediateVector
            >(this.f1.field, context_f1, context.outer[MultiObjectsIDsKey])

        return context_f1[VectorSampleFunction](this.f1, locations, context_f1)
    }

    // protected transformContext(context: Context1): Context2 {
    //     return <Context2>groupsProxyOverwritten(
    //         { [SampleDomainLocationFieldKey]: MultiObjectsGroupsTemplate_Leaf },
    //         context,
    //         { [SampleDomainLocationFieldKey]: this.projector.field }
    //     )
    // }
}