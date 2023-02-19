import { MeshData } from "../meshing";
import { VolumeSample } from "../volumes";

export type SurfaceSample = VolumeSample

export interface Surface<
        Sample extends SurfaceSample = SurfaceSample
    > {
    mesh: MeshData<Sample>
}