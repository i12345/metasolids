import { Mat4, BoundingBox, Vec3 } from 'playcanvas-extended'
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from '../volume.js'
import { TransformingDefaultInnerSamplingContext, TransformingSampleDomain } from '../../fields/domains/transforming.js'
import { VolumeWithBoundingBox } from './bounded.js'

export class TransformVolume<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        Context extends
            VolumeSamplingContext<Location, SampleProcessingContextT> =
            VolumeSamplingContext<Location, SampleProcessingContextT>,
        VolumeT extends
            Volume<
                    Location,
                    Sample,
                    SampleProcessingContextT,
                    TransformingDefaultInnerSamplingContext<
                            Location,
                            Location,
                            Sample,
                            Context
                        >
                > =
            Volume<
                    Location,
                    Sample,
                    SampleProcessingContextT,
                    TransformingDefaultInnerSamplingContext<
                            Location,
                            Location,
                            Sample,
                            Context
                        
                    >>,
    > extends
    TransformingSampleDomain<Location, Sample, Context> {
    private transformInverse = new Mat4()
    
    constructor(
        public inner: VolumeT,
        public transform: Mat4
    ) {
        super(inner)
    }
    
    init(context: Context) {
        this.transformInverse.copy(this.transform).invert()

        super.init(context)
    }

    protected transformLocation(location: Location) {
        return {
            ...location,
            p: this.transformInverse.transformPoint(location.p)
        }
    }

    protected transformSample(sample: Sample) {
        return {
            ...sample,
            gradient: this.transform.transformVector(sample.gradient)
        }
    }
}

export class TransformVolumeWithBoundingBox<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        Context extends
            VolumeSamplingContext<Location, SampleProcessingContextT> =
            VolumeSamplingContext<Location, SampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<
                    Location,
                    Sample,
                    SampleProcessingContextT,
                    TransformingDefaultInnerSamplingContext<
                            Location,
                            Location,
                            Sample,
                            Context
                        >
                > =
            VolumeWithBoundingBox<
                    Location,
                    Sample,
                    SampleProcessingContextT,
                    TransformingDefaultInnerSamplingContext<
                            Location,
                            Location,
                            Sample,
                            Context
                        
                    >>,
    >
    extends TransformVolume<Location, Sample, SampleProcessingContextT, Context, VolumeT>
    implements VolumeWithBoundingBox<Location, Sample, SampleProcessingContextT, Context> {
    readonly boundingBox = new BoundingBox(new Vec3(NaN, NaN, NaN), new Vec3(NaN, NaN, NaN))
    
    constructor(
        inner: VolumeT,
        transform: Mat4
    ) {
        super(inner, transform)
    }
    
    override init(context: Context): void {
        super.init(context)

        if (this.inner.boundingBox)
            this.boundingBox.setFromTransformedAabb(this.inner.boundingBox, this.transform)
    }
}