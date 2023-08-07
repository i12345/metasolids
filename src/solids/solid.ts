import { VolumeSample } from "../volumes/index.js";
import { Surface } from "../surfaces/index.js";
import { IndicesTypedArray } from "../utils/indices-array.js";

export interface Solid<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,    
        VolumeSampleT extends VolumeSample = VolumeSample,
        SurfaceT extends Surface<IndicesT, VolumeSampleT> = Surface<IndicesT, VolumeSampleT>
    > {
    surface: SurfaceT
}