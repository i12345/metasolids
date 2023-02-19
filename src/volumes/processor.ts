import { Processor } from "../processor/processor";
import { VolumeSample } from "./volume";
import { VolumeSamplingContext, VolumeSamplingResult } from "./sampling";
import { FieldsPoint } from "../fields";
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer } from "../processor";

export interface VolumeProcessing<
        Sample extends VolumeSample = VolumeSample
    > {
    sampling: VolumeSamplingResult<Sample>
}

export interface VolumeProcessingContext<
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any
    > {
    sampling: VolumeSamplingContext<Parameters, Sample>
    samples: SampleContextTemplate
}

export interface VolumeProcessor<
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        VolumeProcessingT extends
            VolumeProcessing<Sample> =
            VolumeProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Parameters, Sample, SampleContextTemplate> =
            VolumeProcessingContext<Parameters, Sample, SampleContextTemplate>,
    > extends
    Processor<VolumeProcessingT, VolumeProcessingContextT> {
}

export type VolumeSampleProcessingContext<
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        VolumeProcessingT extends
            VolumeProcessing<Sample> =
            VolumeProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Parameters, Sample, SampleContextTemplate> =
            VolumeProcessingContext<Parameters, Sample, SampleContextTemplate>,
    > =
    SampleContextTemplate &
    ParallelizedContext<
            VolumeProcessingT,
            VolumeProcessingContextT
        >

export interface VolumeSampleProcessor<
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        VolumeProcessingT extends
            VolumeProcessing<Sample> =
            VolumeProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Parameters, Sample, SampleContextTemplate> =
            VolumeProcessingContext<Parameters, Sample, SampleContextTemplate>,
    >
    extends ParallelizedProcessor<
        VolumeProcessingT,
        VolumeProcessingContextT,
        Sample,
        VolumeSampleProcessingContext<
            Parameters,
            Sample,
            SampleContextTemplate,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > {
}

export class VolumeSampleParallelizer<
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        VolumeProcessingT extends VolumeProcessing<Sample> = VolumeProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Parameters, Sample, SampleContextTemplate> =
            VolumeProcessingContext<Parameters, Sample, SampleContextTemplate>,
        SampleProcessor extends
            VolumeSampleProcessor<Parameters, Sample, SampleContextTemplate, VolumeProcessingT, VolumeProcessingContextT> =
            VolumeSampleProcessor<Parameters, Sample, SampleContextTemplate, VolumeProcessingT, VolumeProcessingContextT>,
    > implements
    Parallelizer<
            VolumeProcessingT,
            VolumeProcessingContextT,
            Sample,
            VolumeSampleProcessingContext<
                Parameters,
                Sample,
                SampleContextTemplate,
                VolumeProcessingT,
                VolumeProcessingContextT
            >,
            SampleProcessor
        > {
    parallelize(
            item: VolumeProcessingT,
            context: VolumeProcessingContextT,
            itemProcessor: SampleProcessor
        ): void {
        type SampleContext = VolumeSampleProcessingContext<
            Parameters,
            Sample,
            SampleContextTemplate,
            VolumeProcessingT,
            VolumeProcessingContextT
        >

        const parallelizedContext: SampleContext = {
            ...context.samples,
            [ParallelizedContextParallelInfo]: { item, context }
        }

        for (let x = item.sampling.size.x - 1; x >= 0; x--)
            for (let y = item.sampling.size.y - 1; y >= 0; y--)
                for (let z = item.sampling.size.z - 1; z >= 0; z--)
                    itemProcessor.process(
                            item.sampling.voxels[x][y][z],
                            parallelizedContext
                        )
    }
}