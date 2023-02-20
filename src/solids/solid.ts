import { VolumeSample } from "../volumes/index.js";
import { Surface } from "../surfaces/index.js";

export interface Solid<
        Sample extends VolumeSample = VolumeSample,
        SurfaceT extends Surface<Sample> = Surface<Sample>
    > {
    surface: SurfaceT
}