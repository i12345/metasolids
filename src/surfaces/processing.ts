import { FieldPointVector, FieldPointVectorContainer } from "../fields/vectorized/index.js";
import { Processor } from "../paradigm/processing/index.js";
import { IndicesTypedArray } from "../paradigm/arrays/indices-array.js";
import { NumberTypedArray } from "../paradigm/arrays/typed-array.js";
import { Surface, SurfaceSample } from "./surface.js";

export interface SurfaceProcessingContext<
        SampleProcessingContextT = any
    > {
    samples: SampleProcessingContextT
    surfaceLevel: number
}

export interface SurfaceProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
        VolumeSampleProcessingContextT = any,
        SurfaceT extends
            Surface<IndicesT, SurfaceSampleElementType, SurfaceSampleContainer, SurfaceSampleVector> =
            Surface<IndicesT, SurfaceSampleElementType, SurfaceSampleContainer, SurfaceSampleVector>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>
    > extends
    Processor<SurfaceT, SurfaceProcessingContextT> { }