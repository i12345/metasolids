import { MeshData } from "./meshing/types.js";
import { VolumeSample } from "../volumes/volume.js";
import { Instance } from "../processing/instance.js";
import { Mat4 } from "playcanvas-extended";

export type SurfaceSample = VolumeSample

export interface MeshDataWithNormals extends MeshData {
    normals: Float32Array
}

export interface Surface<
        Sample extends SurfaceSample = SurfaceSample
    > {
    readonly mesh: MeshDataWithNormals

    /**
     * These might not be directly from the volume samples, but derived
     * from them.
     */
    readonly samples: Sample[]
}

export interface SurfaceInstance<
        Sample extends SurfaceSample = SurfaceSample,
        SurfaceT extends Surface<Sample> = Surface<Sample>
    > extends
    Instance<SurfaceT> {
    /**
     * World transform
     */
    transform: Mat4
}