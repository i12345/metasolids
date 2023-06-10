import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../paradigm/multi-objects.js"
import { ParallelizedContext, ParallelizedProcessor } from "../processing/processors/parallel.js"
import { IterableParallelizer } from "../processing/processors/parallelizer-iterable.js"
import { VolumeProcessing, VolumeProcessingContext } from "../volumes/processor.js"
import { VolumeLocation, VolumeSample } from "../volumes/volume.js"
import { SurfaceProcessingContext } from "./surface-samples.js"
import { SurfaceSample, Surface } from "./surface.js"

export const VolumeSurfacesKey = Symbol('volume.surfaces')

export type VolumeSurfacesGroup = {
    [VolumeSurfacesKey]: MultiObjectsGroupsTemplateLeaf
}

export const VolumeSurfacesGroupTemplate: VolumeSurfacesGroup = {
    [VolumeSurfacesKey]: MultiObjectsGroupsTemplate_Leaf
}

export interface VolumeSurfacesProcessing<
        Sample extends SurfaceSample = SurfaceSample,
        SurfaceT extends Surface<Sample> = Surface<Sample>
    > extends
    VolumeProcessing<Sample> {
    [VolumeSurfacesKey]: SurfaceT[]
}

export interface VolumeSurfacesProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
    > extends
    VolumeProcessingContext<
        Location,
        Sample,
        SampleProcessingContextT
    > {
    [VolumeSurfacesKey]: SurfaceProcessingContextT
}

export type VolumeSurfaceProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeSurfacesProcessing<Sample> =
            VolumeSurfacesProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            > =
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >
    > =
    SurfaceProcessingContextT &
    ParallelizedContext<
            VolumeProcessingT,
            VolumeProcessingContextT
        >

export interface VolumeSurfaceProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        VolumeProcessingT extends
            VolumeSurfacesProcessing<Sample, SurfaceT> =
            VolumeSurfacesProcessing<Sample, SurfaceT>,
        VolumeProcessingContextT extends
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            > =
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >
    > extends
    ParallelizedProcessor<
        VolumeProcessingT,
        VolumeProcessingContextT,
        SurfaceT,
        VolumeSurfaceProcessingContext<
            Location,
            Sample,
            SampleProcessingContextT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > { }

export const VolumeSurfacesParallelizer = new IterableParallelizer(VolumeSurfacesGroupTemplate)