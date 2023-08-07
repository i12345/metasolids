import { Processor } from "../paradigm/processing/index.js"
import { Surface } from "../surfaces/surface.js"
import { SurfaceProcessingContext, SurfaceProcessor } from "../surfaces/processing.js"
import { VolumeSample } from "../volumes/volume.js"
import { Solid } from "./solid.js"
import { IndicesTypedArray } from "../utils/indices-array.js"

export interface SolidProcessingContext<
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
    > {
    samples: SampleProcessingContextT
    surface: SurfaceProcessingContextT
}

export interface SolidProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        SurfaceT extends Surface<IndicesT, VolumeSampleT> = Surface<IndicesT, VolumeSampleT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        SolidT extends
            Solid<IndicesT, VolumeSampleT, SurfaceT> =
            Solid<IndicesT, VolumeSampleT, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<VolumeSampleProcessingContextT, SurfaceProcessingContextT> = 
            SolidProcessingContext<VolumeSampleProcessingContextT, SurfaceProcessingContextT>
    > extends
    Processor<SolidT, SolidProcessingContextT> {
}

export class SolidSurfaceProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        SurfaceT extends Surface<IndicesT, VolumeSampleT> = Surface<IndicesT, VolumeSampleT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        SolidT extends
            Solid<IndicesT, VolumeSampleT, SurfaceT> =
            Solid<IndicesT, VolumeSampleT, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<VolumeSampleProcessingContextT, SurfaceProcessingContextT> = 
            SolidProcessingContext<VolumeSampleProcessingContextT, SurfaceProcessingContextT>
    > implements
    SolidProcessor<
        IndicesT,
        VolumeSampleT,
        VolumeSampleProcessingContextT,
        SurfaceT,
        SurfaceProcessingContextT,
        SolidT,
        SolidProcessingContextT
    > {
    constructor(public processor: SurfaceProcessor<
            IndicesT,
            VolumeSampleT,
            VolumeSampleProcessingContextT,
            SurfaceT,
            SurfaceProcessingContextT
        >) { }
    
    init(context: SolidProcessingContextT) {
        const initialization = this.processor.init(context.surface)
        
        const connections = {
            inputs: initialization.connections.inputs.map(input => ['surface', ...input]),
            outputs: initialization.connections.outputs.map(output => ['surface', ...output])
        }

        return { connections }
    }

    process(item: SolidT, context: SolidProcessingContextT): void {
        this.processor.process(item.surface, context.surface)
    }
}