import { Processor } from "../paradigm/processing/index.js";
import { IndicesTypedArray } from "../utils/indices-array.js";
import { Surface, SurfaceSample } from "./surface.js";

export interface SurfaceProcessingContext<
        SampleProcessingContextT = any
    > {
    samples: SampleProcessingContextT
    surfaceLevel: number
}

export interface SurfaceProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceSampleT extends SurfaceSample = SurfaceSample,
        VolumeSampleProcessingContextT = any,
        SurfaceT extends
            Surface<IndicesT, SurfaceSampleT> =
            Surface<IndicesT, SurfaceSampleT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>
    > extends
    Processor<SurfaceT, SurfaceProcessingContextT> { }