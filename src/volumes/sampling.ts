import { BoundingBox, Vec3 } from "playcanvas-extended";
import { ExtraFields } from "../fields/index.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from "./volume.js";

export interface VolumeSamplingRequest<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        Context extends
            VolumeSamplingContext<Location> =
            VolumeSamplingContext<Location>
    > {
    volume: Volume<Location, Sample, Context>
    context: Context
    extraLocationParameters?: ExtraFields<Location, VolumeLocation>
    settings: VolumeSamplerSettings
}

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

export interface VolumeSamplerSettings {
    /**
     * marginal units surrounding estimated bounding box
     */
    margin: number

    /**
     * samples per unit length
     */
    resolution: number
}

export const defaultVolumeSamplerSettings: VolumeSamplerSettings = {
    margin: 1,
    resolution: 8
}

export class VolumeSampler {
    static sample<
            Location extends VolumeLocation = VolumeLocation,
            Sample extends VolumeSample = VolumeSample,
            Context extends
                VolumeSamplingContext<Location> =
                VolumeSamplingContext<Location>
        >({
            volume,
            context,
            extraLocationParameters,
            settings
        }: VolumeSamplingRequest<
            Location,
            Sample,
            Context
        >): VolumeSamplingResult<Sample> {
        volume.init(context)

        const box = volume.boundingBox
        const margin = new Vec3(settings.margin, settings.margin, settings.margin)
        const offset = new Vec3().sub2(box.getMin(), margin)
        const chunkSize = new Vec3().sub2(box.getMax(), box.getMin()).add(margin.mulScalar(2))
        
        const boundingBox = new BoundingBox()
        boundingBox.setMinMax(offset, new Vec3().add2(offset, chunkSize))

        const size = chunkSize.clone().mulScalar(settings.resolution).ceil()

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