import { vectorized } from "vectorized-functions";
import { MultiObjectsIDsKey, MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { SampleDomain, SampleDomainLocationFieldKey, SamplingContext } from "../domain.js";
import { Field } from "../field.js";
import { FieldInterpolationKeypoint, FieldInterpolator, InterpolationManager, makeInterpolator } from "../interpolation.js";
import { FieldPoint } from "../point.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorFunction } from "../vectorized/index.js";
import { VectorSampleDomain, VectorSamplingContext } from "./vector.js";

export class KeypointsSampleDomain<
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
            VectorContext
        > {
    private interpolator!: FieldInterpolator<Location, Sample>

    constructor(
        public keypoints: FieldInterpolationKeypoint<Location, Sample>[],
        public field: Field<Sample>
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
        >(
            this: KeypointsSampleDomain<
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
                >,
            locations: LocationVector,
            context: VectorContext
        ): SampleVector {
        const interpolator = InterpolationManager.makeInterpolatorVectorized(
            this.keypoints,
            context[SampleDomainLocationFieldKey],
            this.field.elementType,
            context[MultiObjectsIDsKey]
        )
        
        return <SampleVector>interpolator(locations)
    }
}