import { Processor } from "../processor/processor.js";
import { defaultVolumeLocationField, VolumeLocation, VolumeSample, VolumeSamplingContext } from "./volume.js";
import { VolumeSampler, VolumeSamplerSettings, VolumeSamplingRequest, VolumeSamplingResult } from "./sampling.js";
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer } from "../processor/index.js";
import { defaultField, FieldPoint, FieldsField, FieldsPoint, FieldsPointMapped, fields_point_map, field_point_isPrimitive, SampleDomainLocationField } from "../fields/index.js";

//TODO: make VolumeSamplingProcessor and corresponding processing context
// also, search for other "TODO"'s and implement them

export interface VolumeProcessing<
        Sample extends VolumeSample = VolumeSample
    > {
    sampling: VolumeSamplingResult<Sample>
}

export interface VolumeProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
    > {
    sampling: Omit<VolumeSamplingRequest<Location, Sample>, "context">
    
    samples: SampleContextTemplate
}

export interface VolumeProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        VolumeProcessingT extends
            VolumeProcessing<Sample> =
            VolumeProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Location, Sample, SampleContextTemplate> =
            VolumeProcessingContext<Location, Sample, SampleContextTemplate>,
    > extends
    Processor<VolumeProcessingT, VolumeProcessingContextT> {
}

export const VolumeSamplingProcessing_SamplerSettings = Symbol("sampler-settings")
export interface VolumeSamplingProcessing<
        Sample extends VolumeSample = VolumeSample,
    > extends
    VolumeProcessing<Sample> {
    [VolumeSamplingProcessing_SamplerSettings]: VolumeSamplerSettings
}

export interface VolumeSamplingProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any
    > extends
    VolumeProcessingContext<
        Location,
        Sample,
        SampleContextTemplate
    >,
    VolumeSamplingContext<Location> {
}

export class VolumeSamplingProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        VolumeProcessingT extends
            VolumeSamplingProcessing<Sample> =
            VolumeSamplingProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeSamplingProcessingContext<Location, Sample, SampleContextTemplate> =
            VolumeSamplingProcessingContext<Location, Sample, SampleContextTemplate>,
    > implements
    VolumeProcessor<
            Location,
            Sample,
            SampleContextTemplate,
            VolumeProcessingT,
            VolumeProcessingContextT
        > {
    dependencies: Function[];

    init(context: VolumeProcessingContextT): void {
    }
    
    process(item: VolumeProcessingT, context: VolumeProcessingContextT): void {
        context[SampleDomainLocationField] = FieldsField.merge<Location>(
            defaultVolumeLocationField as FieldsField<Location>,
            new FieldsField(fields_point_map(
                context.sampling.extraLocationParameters as any as FieldsPointMapped<FieldsPoint, FieldPoint>,
                field_point_isPrimitive,
                value => defaultField(value)
            )) as FieldsField<Location>
        )

        item.sampling = new VolumeSampler(item[VolumeSamplingProcessing_SamplerSettings]).sample({ context, ...(context.sampling) })
    }
}

export type VolumeSampleProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        VolumeProcessingT extends
            VolumeProcessing<Sample> =
            VolumeProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Location, Sample, SampleContextTemplate> =
            VolumeProcessingContext<Location, Sample, SampleContextTemplate>,
    > =
    SampleContextTemplate &
    ParallelizedContext<
            VolumeProcessingT,
            VolumeProcessingContextT
        >

export interface VolumeSampleProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        VolumeProcessingT extends
            VolumeProcessing<Sample> =
            VolumeProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Location, Sample, SampleContextTemplate> =
            VolumeProcessingContext<Location, Sample, SampleContextTemplate>,
    >
    extends ParallelizedProcessor<
        VolumeProcessingT,
        VolumeProcessingContextT,
        Sample,
        VolumeSampleProcessingContext<
            Location,
            Sample,
            SampleContextTemplate,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > {
}

export class VolumeSampleParallelizer<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        VolumeProcessingT extends VolumeProcessing<Sample> = VolumeProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Location, Sample, SampleContextTemplate> =
            VolumeProcessingContext<Location, Sample, SampleContextTemplate>,
        SampleProcessor extends
            VolumeSampleProcessor<Location, Sample, SampleContextTemplate, VolumeProcessingT, VolumeProcessingContextT> =
            VolumeSampleProcessor<Location, Sample, SampleContextTemplate, VolumeProcessingT, VolumeProcessingContextT>,
    > implements
    Parallelizer<
            VolumeProcessingT,
            VolumeProcessingContextT,
            Sample,
            VolumeSampleProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
                VolumeProcessingT,
                VolumeProcessingContextT
            >,
            SampleProcessor
        > {
    init(
            context: VolumeProcessingContextT,
            parallelizedItemProcessor: SampleProcessor
        ): void {
        type SampleContext = VolumeSampleProcessingContext<
            Location,
            Sample,
            SampleContextTemplate,
            VolumeProcessingT,
            VolumeProcessingContextT
        >

        const parallelizedContext: SampleContext = {
            ...context.samples,
            [ParallelizedContextParallelInfo]: { item: undefined, context }
        }
        
        parallelizedItemProcessor.init(parallelizedContext)
    }

    parallelize(
            item: VolumeProcessingT,
            context: VolumeProcessingContextT,
            itemProcessor: SampleProcessor
        ): void {
        type SampleContext = VolumeSampleProcessingContext<
            Location,
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