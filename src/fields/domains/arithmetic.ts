import { vectorized } from "vectorized-functions";
import { MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { SampleDomain, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldPoint, FieldPointMapped, field_point_map } from "../point.js";
import { ArithmeticPrimitiveFuseMode, ArithmeticPrimitiveFuseModeOp } from "../vectorized/fuse-modes/arithmetic.js";
import { FuseMode, PrimitiveFuseMode, fusePoints, fuseVectors } from "../vectorized/fusing.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../vectorized/point.js";
import { VectorSampleDomain, VectorSampleFunction, VectorSamplingContext } from "./vector.js";

export class ArithmeticSampleDomain<
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
    >
    implements VectorSampleDomain<
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
        SampleVector,
        VectorContext
    > {
    field!: Field<Sample, SampleElementType, SampleFuseMode>

    constructor(
        public readonly op: ArithmeticPrimitiveFuseModeOp,
        public readonly children: SampleDomain<
            Location,
            Sample,
            LocationElementType,
            LocationFuseMode,
            SampleElementType,
            SampleFuseMode,
            SingularContext
        >[]
    ) { }

    init(context: SingularContext): void {
        for (const child of this.children)
            child.init(context)

        //TODO: use merged field
        this.field = this.children[0].field
    }

    @vectorized(ArithmeticSampleDomain.sample_vectorized)
    sample(location: Location, context: SingularContext): Sample {
        const values = this.children.map(child => child.sample(location, context))

        return fusePoints(
            this.field.elementType,
            this.field.elementType,
            <FuseMode<SampleFuseMode>><unknown>field_point_map(
                <FieldPointMapped<SampleFuseMode, PrimitiveFuseMode>>this.field.fuseMode,
                leaf => leaf instanceof Function,
                () => new ArithmeticPrimitiveFuseMode(this.op)
            ),
            values.map(value => ({ value })),
            (<Partial<WithMultiObjectsIDs<Objects, ObjIDsT>>>context)[MultiObjectsIDsKey]
        )
    }

    private static sample_vectorized<
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
        >(
            this: ArithmeticSampleDomain<
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
                    SampleVector,
                    VectorContext
                >,
            locations: LocationVector,
            context: VectorContext
        ): SampleVector {
        const values = this.children.map(child => context[VectorSampleFunction](child, locations, context))

        return fuseVectors<
                Sample,
                SampleElementType,
                SampleElementType,
                SampleFuseMode,
                SampleContainer,
                SampleVector,
                SampleVector,
                Objects,
                ObjIDsT,
                ObjIDsContainer
            >(
            this.field.elementType,
            this.field.elementType,
            <FuseMode<SampleFuseMode>><unknown>field_point_map(
                <FieldPointMapped<SampleFuseMode, PrimitiveFuseMode>>this.field.fuseMode,
                leaf => leaf instanceof Function,
                () => new ArithmeticPrimitiveFuseMode(this.op)
            ),
            values,
            (<Partial<WithMultiObjectsIDs<Objects, ObjIDsT>>>context)[MultiObjectsIDsKey]
        )
    }
}