import { Mat4, BoundingBox } from 'playcanvas-extended'
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from '../volume.js'
import { TransformingDefaultInnerSamplingContext, TransformingSampleDomain } from '../../fields/domains/transforming.js'

export class TransformVolume<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        Context extends
            VolumeSamplingContext<Location> =
            VolumeSamplingContext<Location>
    > extends
    TransformingSampleDomain<Location, Sample, Context>
    implements Volume<Location, Sample, Context> {
    boundingBox: BoundingBox
    private transformInverse: Mat4
    
    constructor(
        public inner: Volume<
            Location,
            Sample,
            TransformingDefaultInnerSamplingContext<
                    Location,
                    Location,
                    Sample,
                    Context
            >
        >,
        public transform: Mat4
    ) {
        super(inner)
    }
    
    init(context: Context) {
        this.transformInverse = this.transform.clone().invert()

        super.init(context)

        this.boundingBox = new BoundingBox()
        this.boundingBox.setFromTransformedAabb(this.inner.boundingBox, this.transform)
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