import { Processor } from "../processing/processor.js";
import { defaultVolumeLocationField, VolumeLocation, VolumeSample, VolumeSamplingContext } from "./volume.js";
import { VolumeSampler, VolumeSamplingRequest, VolumeSamplingResult } from "./sampling.js";
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer } from "../processing/processors/parallel.js";
import { defaultField, FieldPoint, FieldsField, FieldsPoint, FieldsPointMapped, fields_point_map, field_point_isPrimitive, SampleDomainLocationField } from "../fields/index.js";
import { PROPERTYKEY_ALL } from "../paradigm/property-path.js";
import { GroupsParallelizer, IterableParallelizer } from "../processing/processors/index.js";
import { MultiObjectsGroupsTemplate_Leaf, MultiObjectsGroupsTemplateLeaf } from "../paradigm/multi-objects.js";

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
        SampleProcessingContextT = any,
    > extends
    VolumeSamplingContext<Location> {
    [VolumeSamplingKey]: Omit<VolumeSamplingRequest<Location, Sample>, "context">
    [VolumeSampleKey]: SampleProcessingContextT
}

export interface VolumeProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        VolumeProcessingT extends
            VolumeProcessing<Sample> =
            VolumeProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingContext<Location, Sample, SampleProcessingContextT> =
            VolumeProcessingContext<Location, Sample, SampleProcessingContextT>,
    > extends
    Processor<VolumeProcessingT, VolumeProcessingContextT> {
}

export class VolumeSamplingProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any
    > implements
    VolumeProcessor<
            Location,
            Sample,
            SampleProcessingContextT,
            VolumeProcessing<Sample>,
            VolumeProcessingContext<Location, Sample, SampleProcessingContextT>
        > {
    init() {
        return {
            connections: {
                inputs: [],
                outputs: [[VolumeSamplingKey]]
            }
        }
    }
    
    process(
            item: VolumeProcessing<Sample>,
            context: VolumeProcessingContext<Location, Sample, SampleProcessingContextT>
        ): void {
        context[SampleDomainLocationField] = FieldsField.merge<Location>(
            defaultVolumeLocationField as FieldsField<Location>,
            new FieldsField(fields_point_map(
                (context[VolumeSamplingKey].extraLocationParameters ?? {}) as any as FieldsPointMapped<FieldsPoint, FieldPoint>,
                field_point_isPrimitive,
                value => defaultField(value)
            )) as FieldsField<Location>
        )

        item[VolumeSamplingKey] = VolumeSampler.sample({
            context,
            ...context[VolumeSamplingKey]
        })
    }

    private constructor() { }

    static readonly instance = new this()
}