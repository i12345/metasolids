import { BoundingBox, Vec3 } from "playcanvas-extended";
import { ExtraFields, FieldsPoint } from "../fields";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from "./volume";

export interface VolumeSamplingResult<
        Sample extends VolumeSample = VolumeSample
    > {
    /**
     * The bounding box for the space of the sampled voxels
     */
    boundingBox: BoundingBox

    /**
     * The dimensions of the {@link voxels} array (not the size of the bounding box)
     */
    size: Vec3

    /**
     * The voxels sampled for this volume
     *
     * These are indexed `[x][y][z]`
     */
    voxels: Sample[][][]
}

export class VolumeSampler {
    constructor(
        /**
         * marginal units surrounding estimated bounding box
         */
        public margin: number = 5,

        /**
         * samples per unit length
         */
        public resolution: number
    ) { }

    sample<
            Location extends VolumeLocation = VolumeLocation,
            Sample extends VolumeSample = VolumeSample,
            Context extends
                VolumeSamplingContext<Location> =
                VolumeSamplingContext<Location>
        >(
            volume: Volume<Location, Sample, Context>,
            context: Context,
            extraLocationParameters?: ExtraFields<Location, VolumeLocation>
        ): VolumeSamplingResult<Sample> {
        volume.init(context)
        const box = volume.boundingBox
        const margin = new Vec3(this.margin, this.margin, this.margin)
        const offset = new Vec3().sub2(box.getMin(), margin)
        const chunkSize = new Vec3().sub2(box.getMax(), box.getMin()).add(margin.mulScalar(2))
        
        const boundingBox = new BoundingBox()
        boundingBox.setMinMax(offset, new Vec3().add2(offset, chunkSize))

        const size = chunkSize.clone().mulScalar(this.resolution).ceil()

        const voxels = new Array(size.x)

        for (let x = size.x - 1; x >= 0; x--) {
            voxels[x] = new Array(size.y)
            for (let y = size.y - 1; y >= 0; y--) {
                voxels[x][y] = new Array(size.z)
                for (let z = size.z - 1; z >= 0; z--) {
                    const location = {
                        ...(extraLocationParameters ?? {} as ExtraFields<Location, VolumeLocation>),
                        p: new Vec3(x, y, z)
                            .mul(boundingBox.halfExtents)
                            .mulScalar(2)
                            .div(size)
                            .add(offset)
                    } as Location

                    voxels[x][y][z] = volume.sample(location, context)
                }
            }
        }

        return {
            boundingBox,
            size,
            voxels
        }
    }
}