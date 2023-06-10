import { PROPERTYKEY_ALL } from "../paradigm/property-path.js"
import { ParallelizedContext, ParallelizedProcessor, Parallelizer, ParallelizedContextParallelInfo } from "../processing/processors/parallel.js"
import { VolumeProcessing, VolumeProcessingContext, VolumeSampleKey, VolumeSamplingKey } from "./processor.js"
import { VolumeLocation, VolumeSample } from "./volume.js"

export type VolumeSampleProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        VolumeProcessingT extends
            VolumeProcessing<Sample> =
            VolumeProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Location, Sample, SampleProcessingContextT> =
            VolumeProcessingContext<Location, Sample, SampleProcessingContextT>,
    > =
    SampleProcessingContextT &
    ParallelizedContext<
            VolumeProcessingT,
            VolumeProcessingContextT
        >

export interface VolumeSampleProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        VolumeProcessingT extends
            VolumeProcessing<Sample> =
            VolumeProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Location, Sample, SampleProcessingContextT> =
            VolumeProcessingContext<Location, Sample, SampleProcessingContextT>,
    >
    extends ParallelizedProcessor<
        VolumeProcessingT,
        VolumeProcessingContextT,
        Sample,
        VolumeSampleProcessingContext<
            Location,
            Sample,
            SampleProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > {
}

export class VolumeSampleParallelizer<
        Location extends VolumeLocation = VolumeLocation,
        SampleT extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        VolumeProcessingT extends VolumeProcessing<SampleT> = VolumeProcessing<SampleT>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Location, SampleT, SampleProcessingContextT> =
            VolumeProcessingContext<Location, SampleT, SampleProcessingContextT>,
        SampleProcessor extends
            VolumeSampleProcessor<Location, SampleT, SampleProcessingContextT, VolumeProcessingT, VolumeProcessingContextT> =
            VolumeSampleProcessor<Location, SampleT, SampleProcessingContextT, VolumeProcessingT, VolumeProcessingContextT>,
    > implements
    Parallelizer<
            VolumeProcessingT,
            VolumeProcessingContextT,
            SampleT,
            VolumeSampleProcessingContext<
                    Location,
                    SampleT,
                    SampleProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingContextT
                >,
            SampleProcessor
        > {
    init(
            context: VolumeProcessingContextT,
            parallelizedItemProcessor: SampleProcessor
        ) {
        type SampleContext = VolumeSampleProcessingContext<
            Location,
            SampleT,
            SampleProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >

        const parallelizedContext: SampleContext = {
            ...context[VolumeSampleKey],
            [ParallelizedContextParallelInfo]: { context }
        }
        
        const parallelizedInitialization = parallelizedItemProcessor.init(parallelizedContext)
        const parallelizedConnections = parallelizedInitialization.connections
        const parallelizedPath = [VolumeSamplingKey, 'voxels', PROPERTYKEY_ALL, PROPERTYKEY_ALL, PROPERTYKEY_ALL]
        
        const connections = {
            inputs: parallelizedConnections.inputs.map(path => [...parallelizedPath, ...path]),
            outputs: parallelizedConnections.outputs.map(path => [...parallelizedPath, ...path])
        }

        return { connections }
    }

    process(
            item: VolumeProcessingT,
            context: VolumeProcessingContextT,
            itemProcessor: SampleProcessor
        ): void {
        type SampleContext = VolumeSampleProcessingContext<
            Location,
            SampleT,
            SampleProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >

        const parallelizedContext: SampleContext = {
            ...context[VolumeSampleKey],
            [ParallelizedContextParallelInfo]: { item, context }
        }

        const sampling = item[VolumeSamplingKey]

        for (let x = sampling.size.x - 1; x >= 0; x--)
            for (let y = sampling.size.y - 1; y >= 0; y--)
                for (let z = sampling.size.z - 1; z >= 0; z--)
                    itemProcessor.process(
                            sampling.voxels[x][y][z],
                            parallelizedContext
                        )
    }
}