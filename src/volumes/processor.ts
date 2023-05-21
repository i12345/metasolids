import { Processor } from "../processor/processor.js";
import { defaultVolumeLocationField, VolumeLocation, VolumeSample, VolumeSamplingContext } from "./volume.js";
import { VolumeSampler, VolumeSamplingRequest, VolumeSamplingResult } from "./sampling.js";
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer } from "../processor/index.js";
import { defaultField, FieldPoint, FieldsField, FieldsPoint, FieldsPointMapped, fields_point_map, field_point_isPrimitive, SampleDomainLocationField } from "../fields/index.js";
import { PROPERTYKEY_ALL, PropertyPath } from "../utils/property-path.js";

export const VolumeSampleKey = Symbol('volume.sample')
export const VolumeSamplingKey = Symbol("volume-sampling")

export interface VolumeProcessing<
        Sample extends VolumeSample = VolumeSample
    > {
    [VolumeSamplingKey]: VolumeSamplingResult<Sample>
}

export interface VolumeProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
    > extends
    VolumeSamplingContext<Location> {
    [VolumeSamplingKey]: Omit<VolumeSamplingRequest<Location, Sample>, "context">
    [VolumeSampleKey]: SampleContextTemplate
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

export class VolumeSamplingProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any
    > implements
    VolumeProcessor<
            Location,
            Sample,
            SampleContextTemplate,
            VolumeProcessing<Sample>,
            VolumeProcessingContext<Location, Sample, SampleContextTemplate>
        > {
    readonly connections = {
        inputs: [],
        outputs: [[VolumeSamplingKey]]
    }

    init(): void {
    }
    
    process(
            item: VolumeProcessing<Sample>,
            context: VolumeProcessingContext<Location, Sample, SampleContextTemplate>
        ): void {
        context[SampleDomainLocationField] = FieldsField.merge<Location>(
            defaultVolumeLocationField as FieldsField<Location>,
            new FieldsField(fields_point_map(
                (context[VolumeSamplingKey].extraLocationParameters ?? {}) as any as FieldsPointMapped<FieldsPoint, FieldPoint>,
                field_point_isPrimitive,
                value => defaultField(value)
            )) as FieldsField<Location>
        )

        item[VolumeSamplingKey] = VolumeSampler.sample({ context, ...context[VolumeSamplingKey] })
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
    readonly parallelizedPath = [VolumeSamplingKey, 'voxels', PROPERTYKEY_ALL, PROPERTYKEY_ALL, PROPERTYKEY_ALL]
    
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
            ...context[VolumeSampleKey],
            [ParallelizedContextParallelInfo]: { context }
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