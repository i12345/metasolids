import { MeshDataWithNormals } from "./mesh-data.js";
import { VolumeSample } from "../volumes/volume.js";
import { Instance } from "../paradigm/processing/instance.js";
import { IndicesTypedArray } from "../utils/indices-array.js";

export type SurfaceSample = VolumeSample

export interface Surface<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceSampleT extends SurfaceSample = SurfaceSample
    > {
    readonly mesh: MeshDataWithNormals<IndicesT>

    /**
     * These might not be directly from the volume samples, but derived
     * from them.
     */
    readonly samples: SurfaceSampleT[]

    /**
     * whether this surface encloses a space or not
     */
    readonly isClosed: boolean
}

export interface SurfaceInstance<SurfaceT extends Surface = Surface>
    extends Instance<SurfaceT> {
}