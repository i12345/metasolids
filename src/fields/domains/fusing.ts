import { vectorized } from "vectorized-functions";
import { MultiObjectsIDsKey, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { sum } from "../../utils/typed-array.js";
import { SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { FieldPoint } from "../point.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorStatic, FieldPointVectorWithMultiObjects, FuseMode, FusingFieldPointVectorWithMultiObjects, IsDynamicVector, ItemNextObjectIndexKey, ItemObjValuesOffsetsKey, field_point_vectorized_multi_objects_new, isDynamicVector } from "../vectorized/index.js";
import { VectorSampleDomain, VectorSamplingContext } from "./vector.js";
import { vectorIterator } from "../vectorized/iterators/factory.js";
import { FieldPointType } from "../type.js";

export const FusedVectorSamplingKey = Symbol("fused-vector-sampling")

export type FusedVectorSamplingContext<
        Location extends FieldPoint = FieldPoint,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
        LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
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
        > & {
    // [FusedVectorSamplingKey]: typeof FusedVectorSamplingKey
    // [FusedVectorSamplingContextFuseModeKey]: FuseMode<Sample>
}

export interface FusingVectorSampleDomain<
        Location extends FieldPoint = FieldPoint,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
        LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
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
                    SingularContext,
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
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
    > extends
    VectorSampleDomain<
        Location,
        LocationContainer,
        Sample,
        SampleContainer,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SingularContext,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    can_fuse(
        sampleType: FieldPointType<Sample>,
        fuseMode: FuseMode<Sample>,
        context: VectorContext
    ): boolean
    
    sample_fused_objectCounts(
        objCounts: ObjIDsT,
        locations: FieldPointVector<Location, LocationContainer>,
        context: VectorContext,
        sampleType: FieldPointType<Sample>,
        fuseMode: FuseMode<Sample>,
    ): void

    sample_fused_results(
        samples: FusingFieldPointVectorWithMultiObjects<Sample, ObjIDsT, SampleContainer, ObjIDsContainer>,
        locations: FieldPointVector<Location, LocationContainer>,
        context: VectorContext,
        sampleType: FieldPointType<Sample>,
        fuseMode: FuseMode<Sample>,
    ): void
}

export class FusingVectorSampleDomainFacade<
        Location extends FieldPoint = FieldPoint,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
        LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
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
        Context extends
            FusedVectorSamplingContext<
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
            FusedVectorSamplingContext<
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
                >,
        Inner extends
            FusingVectorSampleDomain<
                    Location,
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector,
                    Context
                > =
            FusingVectorSampleDomain<
                    Location,
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector,
                    Context
                >
    > implements
    VectorSampleDomain<
            Location,
            LocationContainer,
            Sample,
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            SingularContext,
            LocationVector,
            SampleVector,
            Context
        > {
    get field() { return this.inner.field }

    constructor(public readonly inner: Inner) {}

    init(context: Context): void {
        this.inner.init(context)
    }
    
    @vectorized(FusingVectorSampleDomainFacade.sample_vectorized)
    sample(location: Location, context: Context): Sample {
        return this.inner.sample(location, context)
    }

    private static sample_vectorized<
            Location extends FieldPoint = FieldPoint,
            LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            Sample extends FieldPoint = FieldPoint,
            SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
            ObjIDsT extends IndicesTypedArray = Uint32Array,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
            SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
            LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
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
            Context extends
                FusedVectorSamplingContext<
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
                FusedVectorSamplingContext<
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
                    >,
            Inner extends
                FusingVectorSampleDomain<
                        Location,
                        LocationContainer,
                        Sample,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        SingularContext,
                        LocationVector,
                        SampleVector,
                        Context
                    > =
                FusingVectorSampleDomain<
                        Location,
                        LocationContainer,
                        Sample,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        SingularContext,
                        LocationVector,
                        SampleVector,
                        Context
                    >
            >(
                this: FusingVectorSampleDomainFacade<
                        Location,
                        LocationContainer,
                        Sample,
                        SampleContainer,
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        SingularContext,
                        LocationVector,
                        SampleVector,
                        Context,
                        Inner
                    >,
                location: FieldPointVectorStatic<Location, LocationContainer>,
                context: Context
            ) {
        return fusingVectorSampling.sample(this.inner, location, context)
    }
}

export const fusingVectorSampling = {
    sample<
        Location extends FieldPoint = FieldPoint,
        Sample extends FieldPoint = FieldPoint,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
        LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
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
        Context extends
            FusedVectorSamplingContext<
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
            FusedVectorSamplingContext<
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
            domain: FusingVectorSampleDomain<
                    Location,
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector,
                    Context
                >,
            locations: FieldPointVector<Location, LocationContainer>,
            context: Context,
            fuseMode?: FuseMode<Sample>
        ): FusingFieldPointVectorWithMultiObjects<Sample, ObjIDsT, SampleContainer, ObjIDsContainer> {
        const multiObjectIDs = context[MultiObjectsIDsKey]
        const n_sample = vectorIterator(context[SampleDomainLocationFieldKey].elementType, isDynamicVector(locations), multiObjectIDs).length(locations, locations)
        
        const sampleType = domain.field.elementType
        fuseMode ??= domain.field.fuseMode

        if (!domain.can_fuse(sampleType, fuseMode, context))
            throw new Error()

        const objCounts = <ObjIDsT>new multiObjectIDs.IDsType(n_sample)
        domain.sample_fused_objectCounts(objCounts, locations, context, sampleType, fuseMode)

        const samples = <FusingFieldPointVectorWithMultiObjects<Sample, ObjIDsT, SampleContainer, ObjIDsContainer>>field_point_vectorized_multi_objects_new<Sample, SampleContainer, ObjIDsT, ObjIDsContainer>(
            sampleType,
            n_sample,
            <IsDynamicVector<Sample, SampleContainer>>false,
            multiObjectIDs.IDsType,
            <any>sum(objCounts)
        )
        
        samples[ItemNextObjectIndexKey] = <ObjIDsT>new multiObjectIDs.IDsType(n_sample).fill(0)
        const objOffsets = samples[ItemObjValuesOffsetsKey]
        for (let i_sample = 0; i_sample < n_sample; i_sample++)
            objOffsets[i_sample] = (i_sample > 0 ? objOffsets[i_sample - 1] : 0) + objCounts[i_sample]

        domain.sample_fused_results(samples, locations, context, sampleType, fuseMode)

        return samples
    }
}