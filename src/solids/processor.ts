import { Processor } from "../processing/index.js"
import { Surface } from "../surfaces/surface.js"
import { SurfaceProcessingContext, SurfaceProcessor } from "../surfaces/surface-samples.js"
import { VolumeSample } from "../volumes/volume.js"
import { Solid } from "./solid.js"

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
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        SolidT extends
            Solid<Sample, SurfaceT> =
            Solid<Sample, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<SampleProcessingContextT, SurfaceProcessingContextT> = 
            SolidProcessingContext<SampleProcessingContextT, SurfaceProcessingContextT>
    > extends
    Processor<SolidT, SolidProcessingContextT> {
}

export class SolidSurfaceProcessor<
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        SolidT extends
            Solid<Sample, SurfaceT> =
            Solid<Sample, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<SampleProcessingContextT, SurfaceProcessingContextT> = 
            SolidProcessingContext<SampleProcessingContextT, SurfaceProcessingContextT>
    > implements
    SolidProcessor<
        Sample,
        SampleProcessingContextT,
        SurfaceT,
        SurfaceProcessingContextT,
        SolidT,
        SolidProcessingContextT
    > {
    constructor(public processor: SurfaceProcessor<
            Sample,
            SampleProcessingContextT,
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