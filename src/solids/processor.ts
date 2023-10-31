import { Processor } from "../paradigm/processing/index.js"
import { Surface, SurfaceSample } from "../surfaces/surface.js"
import { SurfaceProcessingContext, SurfaceProcessor } from "../surfaces/processing.js"
import { VolumeSample } from "../volumes/volume.js"
import { Solid } from "./solid.js"
import { IndicesTypedArray } from "../paradigm/arrays/indices-array.js"
import { FieldPointVector, FieldPointVectorContainer } from "../fields/vectorized/index.js"
import { NumberTypedArray } from "../paradigm/arrays/typed-array.js"

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
        VolumeSampleElementType extends VolumeSample = VolumeSample,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        VolumeSampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        SolidT extends
            Solid<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector, SurfaceT> =
            Solid<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<VolumeSampleProcessingContextT, SurfaceProcessingContextT> =
            SolidProcessingContext<VolumeSampleProcessingContextT, SurfaceProcessingContextT>
    > extends
    Processor<SolidT, SolidProcessingContextT> {
}

export class SolidSurfaceProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeSampleElementType extends SurfaceSample = SurfaceSample,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        SolidT extends
            Solid<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector, SurfaceT> =
            Solid<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<VolumeSampleProcessingContextT, SurfaceProcessingContextT> =
            SolidProcessingContext<VolumeSampleProcessingContextT, SurfaceProcessingContextT>
    > implements
    SolidProcessor<
        IndicesT,
        VolumeSampleElementType,
        VolumeSampleContainer,
        VolumeSampleVector,
        SurfaceT,
        VolumeSampleProcessingContextT,
        SurfaceProcessingContextT,
        SolidT,
        SolidProcessingContextT
    > {
    constructor(public processor: SurfaceProcessor<
            IndicesT,
            VolumeSampleElementType,
            VolumeSampleContainer,
            VolumeSampleVector,
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