import { vectorized } from "vectorized-functions";
import { MultiObjectsGroupedObjectsKey, MultiObjectsIDsKey, MultiObjectsTemplate, PropertyMapping, PropertyPath, WithMultiObjectsIDs, object_mapped } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../paradigm/arrays/indices-array.js";
import { NumberTypedArray } from "../../paradigm/arrays/typed-array.js";
import { SampleDomain, SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { FieldPoint, FieldPointMapped, FieldsPoint, fields_point_map } from "../point.js";
import { FieldPointVector, FieldPointVectorContainerStatic, ItemObjIDsKey, ItemObjValuesOffsetsKey } from "../vectorized/index.js";
import { VectorSampleDomain, VectorSamplingContext } from "./vector.js";
import { Field } from "../field.js";
import { makeInterpolator } from "../interpolation.js";
import { MultiObjectsField, FieldsField } from "../fields/index.js";
import { TransformingSampleDomain } from "./transforming.js";

export class RemappedSampleDomain<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Intermediate extends FieldPoint = FieldPoint,
        IntermediateElementType extends FieldPoint = Intermediate,
        IntermediateFuseMode extends FieldPoint = Intermediate,
        IntermediateContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> &
            SamplingContext<Location, LocationElementType, LocationFuseMode> =
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> &
            SamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        IntermediateVector extends FieldPointVector<IntermediateElementType, IntermediateContainer> = FieldPointVector<IntermediateElementType, IntermediateContainer>,
        SampleVector extends FieldPointVector<SampleElementType, SampleContainer> = FieldPointVector<SampleElementType, SampleContainer>,
        IntermediateVectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                >,
        SampleVectorContext extends
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
    extends TransformingSampleDomain<
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
        SingularContext,
        LocationVector,
        SampleVector,
        SampleVectorContext,

        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Intermediate,
        IntermediateElementType,
        IntermediateFuseMode,
        IntermediateContainer,
        SingularContext,
        LocationVector,
        IntermediateVector,
        IntermediateVectorContext
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
        SampleVectorContext
    > {
    protected readonly transformsSample = true
    protected readonly transformsLocation = false

    constructor(
        inner: SampleDomain<
                Location,
                Intermediate,
                LocationElementType,
                LocationFuseMode,
                IntermediateElementType,
                IntermediateFuseMode,
                SingularContext
            >,
        public mappings: PropertyMapping[] = [{
            from: [],
            to: []
        }]
    ) {
        super(inner)
    }

    @vectorized(RemappedSampleDomain.transformSample_vectorized)
    protected transformSample(
            sample: Intermediate,
            innerLocation: Location,
            outerLocation: Location,
            context: { outer: SingularContext; inner: SingularContext; }
        ): Sample {
        return object_mapped(
            sample,
            this.mappings,
            context.outer[MultiObjectsIDsKey]
        )
    }

    private static transformSample_vectorized<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Intermediate extends FieldPoint = FieldPoint,
        IntermediateElementType extends FieldPoint = Intermediate,
        IntermediateFuseMode extends FieldPoint = Intermediate,
        IntermediateContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> &
            SamplingContext<Location, LocationElementType, LocationFuseMode> =
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> &
            SamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        IntermediateVector extends FieldPointVector<IntermediateElementType, IntermediateContainer> = FieldPointVector<IntermediateElementType, IntermediateContainer>,
        SampleVector extends FieldPointVector<SampleElementType, SampleContainer> = FieldPointVector<SampleElementType, SampleContainer>,
        IntermediateVectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                >,
        SampleVectorContext extends
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
            this: RemappedSampleDomain<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector,
                    SampleVector,
                    IntermediateVectorContext,
                    SampleVectorContext
                >,
            samples: IntermediateVector,
            innerLocations: LocationVector,
            outerLocations: LocationVector,
            context: { inner: SingularContext; outer: SingularContext; }
        ): SampleVector {
        return object_mapped(
            samples,
            this.mappings,
            context.outer[MultiObjectsIDsKey]
        )
    }

    protected init_make_field(innerField: Field<Intermediate, IntermediateElementType, IntermediateFuseMode>, context: { inner: SingularContext; outer: SingularContext; }): Field<Sample, SampleElementType, SampleFuseMode> {
        function fields(field: Field): FieldPointMapped<FieldPoint, Field> {
            if (field instanceof FieldsField)
                return fields_point_map(
                    field.fields,
                    leaf => leaf.interpolationType && (makeInterpolator in leaf.interpolationType),
                    leaf => fields(leaf)
                )
            else if (field instanceof MultiObjectsField)
                return { [MultiObjectsGroupedObjectsKey]: fields(field.inner) }
            else return field
        }

        const mappedFields = <FieldPointMapped<Sample, Field>>object_mapped(
            fields(innerField),
            this.mappings,
            (<Partial<WithMultiObjectsIDs<Objects, ObjIDsT>>>context)[MultiObjectsIDsKey]
        )

        return <Field<Sample, SampleElementType, SampleFuseMode>>(
            ((<Field>mappedFields).interpolationType && (makeInterpolator in (<Field>mappedFields).interpolationType)) ?
                mappedFields :
                new FieldsField(<FieldPointMapped<FieldsPoint, Field>>mappedFields)
        )
    }
}