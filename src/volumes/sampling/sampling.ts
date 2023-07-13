import { BoundingBox, Vec3 } from "playcanvas-extended";
import { ExtraFields } from "../../fields/index.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from "../volume.js";
import { SpaceTransformation } from "../space-transformation.js";
import { OctTree } from "../../utils/index.js";

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
    //TODO: implement
    // spaceTransformations?: SpaceTransformation[]
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
    resolution: 5
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
        
        /**
         * Adaptive sampling:
         * Start with a single cell
         * Compute surfaces from voxels
         * Collide surfaces with voxels
         *   Any voxels intersected by the surface are candidates for further subdivision
         *     (The surface sample positions are made from midpoints of the voxels)
         *     Possibly their neighbor voxels should also be subdivided
         *   If round > 0:
         *     Compare difference between old surfaces collision and current surfaces collision
         *     Penalty increases for each voxel that has no difference
         * For each volume hint point (metashapes will generate these):
         *   Ensure hint is in a voxel with presence. If not, then it is a subdivision candidate
         * For each voxel that is a subdivision candidate:
         *   If its penalty >= penalty_limit: do not subdivide
         *   Else: subdivide and sample (penalty is inherited)
         *     TODO: consider how surface meshing algorithm can be integrated,
         *       since only some voxels were subdivided.
         *       There is no need to have high quality mesh where there are low-quality voxels
         *       However, actually for soft bodies, don't we want evenly sampled meshes?
         *       A decimation algorithm can reduce this for rendering and rigid bodies
         * Repeat until subdivision_limit reached
         * 
         * Paper-thin sampling:
         * Filter metashapes: select those with at least one volume hint point
         *   that does not have presence in its corresponding voxel
         * Gather their surface hint points, aggregate by approximate intersection
         * Sample surface points to make surfaces with no volume
         */

        const boundingBox = new BoundingBox()
        boundingBox.setMinMax(offset, new Vec3().add2(offset, chunkSize))

        const size = chunkSize.clone().mulScalar(settings.resolution).ceil()

        const samples: Sample[] = []
        const octtree = new OctTree()

        return undefined!
    }
}