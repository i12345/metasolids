import { MeshData } from "../meshing/types.js";
import { VolumeSample } from "../volumes/volume.js";

export type SurfaceSample = VolumeSample

export interface Surface<
        Sample extends SurfaceSample = SurfaceSample
    > {
    mesh: MeshData

    /**
     * These might not be directly from the volume samples, but derived
     * from them.
     */
    samples: Sample[]
}