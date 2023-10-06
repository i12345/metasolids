import { vectorized } from "vectorized-functions";
import { MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsIDsKey, MultiObjectsTemplate, PropertyPath, WithMultiObjectsIDs, groupKinds, groups } from "../../paradigm/trees/index.js";
import { Cloneable, clone, makeClone } from "../../utils/cloneable.js";
import { GeneratorType } from "../../utils/generator-type.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { SampleDomain, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { MultiObjectsField } from "../fields/multi-objects.js";
import { FieldPoint } from "../point.js";
import { field_point_multiObj_extract, field_point_type_singleObj } from "../type.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, FuseMode, field_point_vector_multi_objs_extract, fusePoints, fuseVectors } from "../vectorized/index.js";
import { MultiObjectsDomainInternalPreservedGroupsKinds, MultiObjectsDomainInternalPreservedGroupsKindsTemplate } from "./multi-objects.js";
import { TransformingSampleDomain } from "./transforming.js";
import { VectorSamplingContext } from "./vector.js";

export class ObjectsFilteredFusingSampleDomain<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        LocationT extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = LocationT,
        LocationFuseMode extends FieldPoint = LocationT,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        SampleFuseMode extends FieldPoint = FieldPoint,
        ResultSampleT extends FieldPoint = SampleFuseMode,
        ResultSampleElementType extends FieldPoint = ResultSampleT,
        InnerSampleT extends FieldPoint = SampleFuseMode,
        InnerSampleElementType extends FieldPoint = InnerSampleT,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        SingularContext extends
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            SamplingContext<LocationT, LocationElementType, LocationFuseMode> =
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            SamplingContext<LocationT, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        ResultSampleVector extends
            FieldPointVectorWithMultiObjects<
                    ResultSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    ResultSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        InnerSampleVector extends
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        ResultVectorContext extends
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                ResultSampleT,
                ResultSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                ResultSampleVector
            > =
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                ResultSampleT,
                ResultSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                ResultSampleVector
            >,
        InnerVectorContext extends
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                InnerSampleT,
                InnerSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                InnerSampleVector
            > =
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                InnerSampleT,
                InnerSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                InnerSampleVector
            >
    >
    extends
    TransformingSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,

        LocationT,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        ResultSampleT,
        ResultSampleElementType,
        SampleFuseMode,
        SampleContainer,

        SingularContext,
        LocationVector,
        ResultSampleVector,
        ResultVectorContext,

        LocationT,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        InnerSampleT,
        InnerSampleElementType,
        SampleFuseMode,
        SampleContainer,

        SingularContext,
        LocationVector,
        InnerSampleVector,
        InnerVectorContext
    >
    implements Cloneable<ObjectsFilteredFusingSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SampleGroups,
        SampleGroupKinds,
        LocationT,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        SampleFuseMode,
        ResultSampleT,
        ResultSampleElementType,
        InnerSampleT,
        InnerSampleElementType,
        SampleContainer,
        SingularContext,
        LocationVector,
        ResultSampleVector,
        InnerSampleVector,
        ResultVectorContext,
        InnerVectorContext
    >> {
    protected readonly transformsSample = true
    protected readonly transformsLocation = false
    
    private groupsMemoized_sample!: GeneratorType<ReturnType<typeof groups>>[]

    constructor(
        inner: SampleDomain<LocationT, InnerSampleT, LocationElementType, LocationFuseMode, InnerSampleElementType, SampleFuseMode, SingularContext>,
        public objectsFilter?: ObjIDsT,
        public multiObj: {
                sample?: {
                    groupKindsTemplate: SampleGroupKinds,
                    groupsTemplate?: SampleGroups
                }
            } = {
                sample: {
                    groupKindsTemplate: MultiObjectsDomainInternalPreservedGroupsKindsTemplate as SampleGroupKinds
                }
            },
        public fuseMode?: FuseMode<SampleFuseMode>
    ) {
        super(inner)
    }

    [clone]() {
        return new ObjectsFilteredFusingSampleDomain<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                SampleFuseMode,
                ResultSampleT,
                ResultSampleElementType,
                InnerSampleT,
                InnerSampleElementType,
                SampleContainer,
                SingularContext,
                LocationVector,
                ResultSampleVector,
                InnerSampleVector,
                ResultVectorContext,
                InnerVectorContext
            >(
                makeClone(this.inner),
                makeClone(this.objectsFilter),
                makeClone(this.multiObj),
                makeClone(this.fuseMode)
            )
    }

    protected init_make_field(innerField: Field<InnerSampleT, InnerSampleElementType, SampleFuseMode>, context: { inner: SingularContext; outer: SingularContext; }): Field<ResultSampleT, ResultSampleElementType, SampleFuseMode> {
        type ResultFieldT = Field<ResultSampleT, ResultSampleElementType, SampleFuseMode>

        this.groupsMemoized_sample = this.multiObj.sample ? [...groupKinds(context.outer, this.multiObj.sample.groupKindsTemplate, this.multiObj.sample.groupsTemplate)].map(({ group }) => group) : []
        return <ResultFieldT>MultiObjectsField.unMultiObj(innerField, this.groupsMemoized_sample.map(({ path }) => path))
    }

    @vectorized(ObjectsFilteredFusingSampleDomain.transformSample_vectorized)
    protected transformSample(
            sample: InnerSampleT,
            innerLocation: LocationT,
            outerLocation: LocationT,
            context: { outer: SingularContext; inner: SingularContext; }
        ): ResultSampleT {
        const objValues = field_point_multiObj_extract(
            this.inner.field.elementType,
            sample,
            context.outer[MultiObjectsIDsKey],
            this.objectsFilter
        )

        return fusePoints(
            this.field.elementType,
            this.inner.field.elementType,
            this.fuseMode ?? this.field.fuseMode,
            objValues.map(([, value]) => ({ value: value! })),
            context.outer[MultiObjectsIDsKey]
        )
    }

    private static transformSample_vectorized<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        LocationT extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = LocationT,
        LocationFuseMode extends FieldPoint = LocationT,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        SampleFuseMode extends FieldPoint = FieldPoint,
        ResultSampleT extends FieldPoint = SampleFuseMode,
        ResultSampleElementType extends FieldPoint = ResultSampleT,
        InnerSampleT extends FieldPoint = SampleFuseMode,
        InnerSampleElementType extends FieldPoint = InnerSampleT,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        SingularContext extends
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            SamplingContext<LocationT, LocationElementType, LocationFuseMode> =
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            SamplingContext<LocationT, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        ResultSampleVector extends
            FieldPointVectorWithMultiObjects<
                    ResultSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    ResultSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        InnerSampleVector extends
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        ResultVectorContext extends
            SingularContext &
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                ResultSampleT,
                ResultSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                ResultSampleVector
            > =
            SingularContext &
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                ResultSampleT,
                ResultSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                ResultSampleVector
            >,
        InnerVectorContext extends
            SingularContext &
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                InnerSampleT,
                InnerSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                InnerSampleVector
            > =
            SingularContext &
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                InnerSampleT,
                InnerSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                InnerSampleVector
            >
        >(
            this: ObjectsFilteredFusingSampleDomain<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SampleGroups,
                    SampleGroupKinds,
                    LocationT,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleFuseMode,
                    ResultSampleT,
                    ResultSampleElementType,
                    InnerSampleT,
                    InnerSampleElementType,
                    SampleContainer,
                    SingularContext,
                    LocationVector,
                    ResultSampleVector,
                    InnerSampleVector,
                    ResultVectorContext,
                    InnerVectorContext
                >,
            samples: InnerSampleVector,
            innerLocations: LocationVector,
            outerLocations: LocationVector,
            context: { outer: ResultVectorContext, inner: InnerVectorContext }
        ): ResultSampleVector {
        const objVectors = field_point_vector_multi_objs_extract <
                InnerSampleElementType,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                InnerSampleVector
            >(
                samples,
                this.inner.field.elementType,
                context.outer[MultiObjectsIDsKey],
                this.objectsFilter
            )
        
        return fuseVectors<
                ResultSampleT,
                FieldPoint,
                ResultSampleElementType,
                SampleFuseMode,
                SampleContainer,
                InnerSampleVector,
                ResultSampleVector,
                Objects,
                ObjIDsT,
                ObjIDsContainer
            >(
            this.field.elementType,
            field_point_type_singleObj(this.inner.field.elementType),
            this.fuseMode ?? this.field.fuseMode,
            objVectors.map(([, objVector]) => objVector),
            context.outer[MultiObjectsIDsKey]
        )
    }
}