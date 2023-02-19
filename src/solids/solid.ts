import { VolumeSample } from "../volumes";
import { Surface } from "../surfaces";

export interface Solid<
        Sample extends VolumeSample = VolumeSample,
        SurfaceT extends Surface<Sample> = Surface<Sample>
    > {
    surface: SurfaceT
}