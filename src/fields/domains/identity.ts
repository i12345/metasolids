import { vectorized } from "vectorized-functions";
import { SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldPoint } from "../point.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, IsDynamicVector, ItemObjIDsKey, ItemObjValuesOffsetsKey, field_point_vector_filter } from "../vectorized/point.js";
import { MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs } from "../../paradigm/trees/index.js";
import { IndicesTypedArray, NumberTypedArray, addDeltas, SkipConfig } from "../../paradigm/arrays/index.js";
import { FusedVectorSamplingContext, FusingVectorSampleDomain } from "./fusing.js";
import { FuseMode, FusingFieldPointVectorWithMultiObjects, fuseVectors } from "../vectorized/fusing.js";
import { FieldPointType } from "../type.js";
import { vectorIterator } from "../vectorized/iterators/factory.js";
import { Cloneable, clone } from "../../utils/cloneable.js";

export class IdentitySampleDomain<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationSample extends FieldPoint = FieldPoint,
        LocationSampleElementType extends FieldPoint = LocationSample,
        LocationSampleFuseMode extends FieldPoint = LocationSample,
        LocationSampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Context extends
            SamplingContext<LocationSample, LocationSampleElementType, LocationSampleFuseMode> =
            SamplingContext<LocationSample, LocationSampleElementType, LocationSampleFuseMode>,
        LocationSampleVector extends
            FieldPointVectorWithMultiObjects<
                    LocationSampleElementType,
                    LocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    LocationSampleElementType,
                    LocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationSampleVector,
                    LocationSampleVector
                > =
            FusedVectorSamplingContext<
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationSampleVector,
                    LocationSampleVector
                >,
    > implements
    FusingVectorSampleDomain<
        LocationSample,
        LocationSampleElementType,
        LocationSampleFuseMode,
        LocationSampleContainer,
        LocationSample,
        LocationSampleElementType,
        LocationSampleFuseMode,
        LocationSampleContainer,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        Context,
        LocationSampleVector,
        LocationSampleVector,
        VectorContext
    >,
    Cloneable<IdentitySampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        LocationSample,
        LocationSampleElementType,
        LocationSampleFuseMode,
        LocationSampleContainer,
        Context,
        LocationSampleVector,
        VectorContext
    >> {
    private _field!: Field<LocationSample, LocationSampleElementType, LocationSampleFuseMode>

    get field() {
        return this._field
    }

    constructor() { }

    [clone]() {
        return new IdentitySampleDomain<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LocationSample,
                LocationSampleElementType,
                LocationSampleFuseMode,
                LocationSampleContainer,
                Context,
                LocationSampleVector,
                VectorContext
            >()
    }

    init(context: Context): void {
        this._field = context[SampleDomainLocationFieldKey]
    }

    @vectorized(IdentitySampleDomain.sample_vectorized)
    sample(location: LocationSample, context: Context): LocationSample {
        return location
    }

    can_fuse(sampleType: FieldPointType<LocationSampleElementType>, fuseMode: FuseMode<LocationSampleFuseMode>, context: VectorContext): boolean {
        return true
    }

    sample_fused_objectCounts(
            objCounts: ObjIDsT,
            locations: FieldPointVector<LocationSampleElementType, LocationSampleContainer>,
            context: VectorContext,
            skip?: SkipConfig,
        ): void {
        const locations_multiObj = <FieldPointVectorWithMultiObjects<LocationSampleElementType, LocationSampleContainer, ObjIDsT, ObjIDsContainer>>locations

        addDeltas(objCounts, locations_multiObj[ItemObjValuesOffsetsKey] ?? 1)
    }

    sample_fused_results(
            samples: FusingFieldPointVectorWithMultiObjects<
                    LocationSampleElementType,
                    ObjIDsT,
                    LocationSampleContainer,
                    ObjIDsContainer
                >,
            locations: FieldPointVector<
                    LocationSampleElementType,
                    LocationSampleContainer
                >,
            context: VectorContext,
            sampleType: FieldPointType<LocationSampleElementType>,
            fuseMode: FuseMode<LocationSampleFuseMode>,
            skip?: SkipConfig,
        ): void {
        const locations_multiObj = <FieldPointVectorWithMultiObjects<LocationSampleElementType, LocationSampleContainer, ObjIDsT, ObjIDsContainer>>locations

        const multiObjectIDs = context[MultiObjectsIDsKey]
        const singleID = <number|undefined>multiObjectIDs?.IDs
        const isAddingID = (!locations_multiObj[ItemObjValuesOffsetsKey]) && (typeof singleID === 'number')

        if (isAddingID) {
            const location_length = vectorIterator(context[SampleDomainLocationFieldKey].elementType, <IsDynamicVector<LocationSampleElementType, LocationSampleContainer>>false, multiObjectIDs).length(locations, locations)

            const objIDs = locations_multiObj[ItemObjIDsKey] = <FieldPointVector<ObjIDsT, ObjIDsContainer>>new (multiObjectIDs.IDsType)(location_length)
            const objOffsets = locations_multiObj[ItemObjValuesOffsetsKey] = new Uint32Array(location_length)

            objIDs.fill(singleID!)
            for (let i = 0; i < location_length; i++)
                objOffsets[i] = i
        }

        fuseVectors(
            sampleType,
            this.field.elementType,
            fuseMode,
            [locations],
            context[MultiObjectsIDsKey],
            samples,
            true
        )

        if (isAddingID) {
            delete (<Partial<typeof locations_multiObj>>locations_multiObj)[ItemObjIDsKey]
            delete (<Partial<typeof locations_multiObj>>locations_multiObj)[ItemObjValuesOffsetsKey]
        }
    }

    private static sample_vectorized<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationSample extends FieldPoint = FieldPoint,
        LocationSampleElementType extends FieldPoint = LocationSample,
        LocationSampleFuseMode extends FieldPoint = LocationSample,
        LocationSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Context extends
            SamplingContext<LocationSample, LocationSampleElementType, LocationSampleFuseMode> =
            SamplingContext<LocationSample, LocationSampleElementType, LocationSampleFuseMode>,
        LocationSampleVector extends
            FieldPointVectorWithMultiObjects<
                    LocationSampleElementType,
                    LocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    LocationSampleElementType,
                    LocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationSampleVector,
                    LocationSampleVector
                > =
            FusedVectorSamplingContext<
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationSampleVector,
                    LocationSampleVector
                >,
        >(
            this: IdentitySampleDomain<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    Context,
                    LocationSampleVector,
                    VectorContext
                >,
            locations: LocationSampleVector,
            context: Context,
            skip?: SkipConfig
        ): LocationSampleVector {
        return field_point_vector_filter(context[SampleDomainLocationFieldKey].elementType, locations, skip, (<Partial<WithMultiObjectsIDs>>context)[MultiObjectsIDsKey])
    }
}