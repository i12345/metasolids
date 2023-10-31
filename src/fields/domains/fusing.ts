import { vectorized } from "vectorized-functions";
import { MultiObjectsIDsKey, MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js";
import { IndicesTypedArray } from "../../paradigm/arrays/indices-array.js";
import { NumberTypedArray, sum } from "../../paradigm/arrays/typed-array.js";
import { SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { FieldPoint } from "../point.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorStatic, FieldPointVectorWithMultiObjects, FuseMode, FusingFieldPointVectorWithMultiObjects, IsDynamicVector, ItemNextObjectIndexKey, ItemObjValuesOffsetsKey, field_point_vectorized_multi_objects_new, isDynamicVector } from "../vectorized/index.js";
import { VectorSampleDomain, VectorSamplingContext } from "./vector.js";
import { vectorIterator } from "../vectorized/iterators/factory.js";
import { FieldPointType } from "../type.js";
import { Cloneable, clone, makeClone } from "../../utils/cloneable.js";
import { SkipConfig } from "../../paradigm/arrays/skip.js";

export const FusedVectorSamplingKey = Symbol("fused-vector-sampling")

export type FusedVectorSamplingContext<
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
        > & {
    // [FusedVectorSamplingKey]: typeof FusedVectorSamplingKey
    // [FusedVectorSamplingContextFuseModeKey]: FuseMode<Sample>
}

export interface FusingVectorSampleDomain<
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
                    SingularContext,
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
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
    > extends
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
        SingularContext,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    can_fuse(
        sampleType: FieldPointType<SampleElementType>,
        fuseMode: FuseMode<SampleFuseMode>,
        context: VectorContext
    ): boolean

    sample_fused_objectCounts(
        objCounts: ObjIDsT,
        locations: LocationVector,
        context: VectorContext,
        sampleType: FieldPointType<SampleElementType>,
        fuseMode: FuseMode<SampleFuseMode>,
        skip?: SkipConfig,
    ): void

    sample_fused_results(
        samples: FusingFieldPointVectorWithMultiObjects<SampleElementType, ObjIDsT, SampleContainer, ObjIDsContainer>,
        locations: LocationVector,
        context: VectorContext,
        sampleType: FieldPointType<SampleElementType>,
        fuseMode: FuseMode<SampleFuseMode>,
        skip?: SkipConfig,
    ): void
}

export class FusingVectorSampleDomainFacade<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
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
        Context extends
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
                    SingularContext,
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
                    SingularContext,
                    LocationVector,
                    SampleVector
                >,
        Inner extends
            FusingVectorSampleDomain<
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
                    Context
                > =
            FusingVectorSampleDomain<
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
                    Context
                >
    > implements
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
            SingularContext,
            LocationVector,
            SampleVector,
            Context
        >,
    Cloneable<FusingVectorSampleDomainFacade<
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
        Context,
        Inner
    >> {
    get field() { return this.inner.field }

    constructor(public readonly inner: Inner) {}

    [clone]() {
        return new FusingVectorSampleDomainFacade<
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
                Context,
                Inner
            >(
                makeClone(this.inner),
            )
    }

    init(context: Context): void {
        this.inner.init(context)
    }

    @vectorized(FusingVectorSampleDomainFacade.sample_vectorized)
    sample(location: Location, context: Context): Sample {
        return this.inner.sample(location, context)
    }

    private static sample_vectorized<
            Location extends FieldPoint = FieldPoint,
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            Sample extends FieldPoint = FieldPoint,
            SampleElementType extends FieldPoint = Sample,
            SampleFuseMode extends FieldPoint = Sample,
            SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = Uint32Array,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
            SingularContext extends
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
            Context extends
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
                        SingularContext,
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
                        SingularContext,
                        LocationVector,
                        SampleVector
                    >,
            Inner extends
                FusingVectorSampleDomain<
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
                        Context
                    > =
                FusingVectorSampleDomain<
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
                        Context
                    >
            >(
                this: FusingVectorSampleDomainFacade<
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
                        Context,
                        Inner
                    >,
                location: LocationVector,
                context: Context,
                skip?: SkipConfig
            ) {
        return fusingVectorSampling.sample(this.inner, location, context, skip)
    }
}

export const fusingVectorSampling = {
    sample<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        Sample extends FieldPoint = FieldPoint,
        SampleElementType extends FieldPoint = Sample,
        SampleFuseMode extends FieldPoint = Sample,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
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
        Context extends
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
                    SingularContext,
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
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
        >(
            domain: FusingVectorSampleDomain<
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
                    Context
                >,
            locations: LocationVector,
            context: Context,
            fuseMode?: FuseMode<SampleFuseMode>,
            skip?: SkipConfig
        ): FusingFieldPointVectorWithMultiObjects<SampleElementType, ObjIDsT, SampleContainer, ObjIDsContainer> {
        const multiObjectIDs = context[MultiObjectsIDsKey]
        const location_type = context[SampleDomainLocationFieldKey].elementType
        const n_location = vectorIterator(location_type, isDynamicVector<LocationElementType, LocationContainer>(location_type, locations), multiObjectIDs).length(locations, locations)

        const sampleType = domain.field.elementType
        fuseMode ??= domain.field.fuseMode

        if (!domain.can_fuse(sampleType, fuseMode, context))
            throw new Error()

        const objCounts = <ObjIDsT>new multiObjectIDs.IDsType(n_location)
        domain.sample_fused_objectCounts(objCounts, locations, context, sampleType, fuseMode, skip)

        const samples = <FusingFieldPointVectorWithMultiObjects<SampleElementType, ObjIDsT, SampleContainer, ObjIDsContainer>>field_point_vectorized_multi_objects_new<SampleElementType, SampleContainer, ObjIDsT, ObjIDsContainer>(
            sampleType,
            skip?.n_elements ?? n_location,
            <IsDynamicVector<SampleElementType, SampleContainer>>false,
            multiObjectIDs.IDsType,
            <any>sum(objCounts)
        )

        samples[ItemNextObjectIndexKey] = <ObjIDsT>new multiObjectIDs.IDsType(n_location).fill(0)
        const objOffsets = samples[ItemObjValuesOffsetsKey]
        if (n_location > 0)
            objOffsets[0] = objCounts[0]
        for (let i_sample = 1; i_sample < n_location; i_sample++)
            objOffsets[i_sample] = objOffsets[i_sample - 1] + objCounts[i_sample]

        domain.sample_fused_results(samples, locations, context, sampleType, fuseMode, skip)

        delete (<Partial<FusingFieldPointVectorWithMultiObjects>>samples)[ItemNextObjectIndexKey]

        return samples
    }
}