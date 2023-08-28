import { vectorized } from "vectorized-functions";
import { SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldPoint, FieldPointMapped } from "../point.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, IsDynamicVector, ItemObjIDsKey, ItemObjValuesOffsetsKey } from "../vectorized/point.js";
import { MultiObjectsIDsKey, MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { FusedVectorSamplingContext, FusingVectorSampleDomain } from "./fusing.js";
import { addDeltas } from "../../utils/typed-array.js";
import { FuseMode, FusingFieldPointVectorWithMultiObjects, fuseVectors } from "../vectorized/fusing.js";
import { FieldPointType } from "../type.js";
import { vectorIterator } from "../vectorized/iterators/factory.js";

export class IdentityDomain<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationSample extends FieldPoint = FieldPoint,
        LocationSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Context extends SamplingContext<LocationSample> = SamplingContext<LocationSample>,
        LocationSampleVector extends
            FieldPointVectorWithMultiObjects<
                    LocationSample,
                    LocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    LocationSample,
                    LocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    LocationSample,
                    LocationSampleContainer,
                    LocationSample,
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
                    LocationSampleContainer,
                    LocationSample,
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
        LocationSampleContainer,
        LocationSample,
        LocationSampleContainer,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        Context,
        LocationSampleVector,
        LocationSampleVector,
        VectorContext
    > {
    private _field!: Field<LocationSample>

    get field() {
        return this._field
    }
    
    constructor() { }
    
    init(context: Context): void {
        this._field = context[SampleDomainLocationFieldKey]
    }

    @vectorized(IdentityDomain.sample_vectorized)
    sample(location: LocationSample, context: Context): LocationSample {
        return location
    }

    can_fuse(sampleType: FieldPointType<LocationSample>, fuseMode: FuseMode<LocationSample>, context: VectorContext): boolean {
        return true
    }

    sample_fused_objectCounts(objCounts: ObjIDsT, locations: FieldPointMapped<LocationSample, LocationSampleContainer>, context: VectorContext): void {
        const locations_multiObj = <FieldPointVectorWithMultiObjects<LocationSample, LocationSampleContainer, ObjIDsT, ObjIDsContainer>>locations

        addDeltas(objCounts, locations_multiObj[ItemObjValuesOffsetsKey] ?? 1)
    }

    sample_fused_results(
            samples: FusingFieldPointVectorWithMultiObjects<
                    LocationSample,
                    ObjIDsT,
                    LocationSampleContainer,
                    ObjIDsContainer
                >,
            locations: FieldPointMapped<
                    LocationSample,
                    LocationSampleContainer
                >,
            context: VectorContext,
            sampleType: FieldPointType<LocationSample>,
            fuseMode: FuseMode<LocationSample>,
        ): void {
        const locations_multiObj = <FieldPointVectorWithMultiObjects<LocationSample, LocationSampleContainer, ObjIDsT, ObjIDsContainer>>locations

        const multiObjectIDs = context[MultiObjectsIDsKey]
        const singleID = <number|undefined>multiObjectIDs?.IDs
        const isAddingID = (!locations_multiObj[ItemObjValuesOffsetsKey]) && (typeof singleID === 'number')
        
        if (isAddingID) {
            const location_length = vectorIterator(context[SampleDomainLocationFieldKey].elementType, <IsDynamicVector<LocationSample, LocationSampleContainer>>false, multiObjectIDs).length(locations, locations)

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
        LocationSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Context extends SamplingContext<LocationSample> = SamplingContext<LocationSample>,
        LocationSampleVector extends
            FieldPointVectorWithMultiObjects<
                    LocationSample,
                    LocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    LocationSample,
                    LocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    LocationSample,
                    LocationSampleContainer,
                    LocationSample,
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
                    LocationSampleContainer,
                    LocationSample,
                    LocationSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationSampleVector,
                    LocationSampleVector
                >,
        >(
            this: IdentityDomain<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    LocationSample,
                    LocationSampleContainer,
                    Context,
                    LocationSampleVector,
                    VectorContext
                >,
            locations: LocationSampleVector,
            context: Context
        ): LocationSampleVector {
        return locations
    }
}