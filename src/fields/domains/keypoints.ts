import { vectorized } from "vectorized-functions";
import { MultiObjectsIDsKey, MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { SampleDomain, SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldInterpolationKeypoint, FieldInterpolator, InterpolationManager, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorFunction, IsDynamicVector } from "../vectorized/index.js";
import { VectorSampleDomain, VectorSamplingContext } from "./vector.js";

export class KeypointsSampleDomain<
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
            VectorContext
        > {
    private interpolator!: FieldInterpolator<Location, Sample>

    constructor(
        public keypoints: FieldInterpolationKeypoint<Location, Sample>[],
        public field: Field<Sample, SampleElementType, SampleFuseMode>
    ) {}

    init(context: SingularContext): void {
        this.interpolator = InterpolationManager[makeInterpolator](this.keypoints, context[SampleDomainLocationFieldKey])
    }

    @vectorized(KeypointsSampleDomain.sample_vectorized)
    sample(location: Location, context: SingularContext): Sample {
        return this.interpolator(location)
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
            this: KeypointsSampleDomain<
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
        const interpolator = InterpolationManager.makeInterpolatorVectorized <
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                Sample,
                SampleElementType,
                SampleFuseMode,
                SampleContainer,
                LocationVector,
                SampleVector,
                Objects,
                ObjIDsT
            >(
            this.keypoints,
            context[SampleDomainLocationFieldKey],
            this.field.elementType,
            <IsDynamicVector<LocationElementType, LocationContainer>>false,
            <IsDynamicVector<SampleElementType, SampleContainer>>false,
            context[MultiObjectsIDsKey]
        )

        return <SampleVector>interpolator(locations)
    }
}