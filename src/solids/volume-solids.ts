import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../paradigm/multi-objects.js"
import { PROPERTYKEY_ALL } from "../paradigm/property-path.js"
import { ParallelizedContext, ParallelizedProcessor } from "../processing/processors/parallel.js"
import { IterableParallelizer } from "../processing/processors/parallelizer-iterable.js"
import { VolumeSurfacesKey, VolumeSurfacesProcessing, VolumeSurfacesProcessingContext } from "../surfaces/index.js"
import { SurfaceProcessingContext } from "../surfaces/surface-samples.js"
import { Surface } from "../surfaces/surface.js"
import { VolumeProcessing, VolumeProcessingContext, VolumeProcessor } from "../volumes/processor.js"
import { VolumeSample, VolumeLocation } from "../volumes/volume.js"
import { SolidProcessingContext } from "./processor.js"
import { Solid } from "./solid.js"

export const VolumeSolidsKey = Symbol('volume.solids')

export type VolumeSolidsGroup = {
    [VolumeSolidsKey]: MultiObjectsGroupsTemplateLeaf
}

export const VolumeSolidsGroupTemplate: VolumeSolidsGroup = {
    [VolumeSolidsKey]: MultiObjectsGroupsTemplate_Leaf
}

export interface VolumeSolidsProcessing<
        Sample extends VolumeSample = VolumeSample,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SolidT extends Solid<Sample, SurfaceT> = Solid<Sample, SurfaceT>
    > extends
    VolumeProcessing<Sample> {
    [VolumeSolidsKey]: SolidT[]
}

export interface VolumeSolidsProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        SolidProcessingContextT extends
            SolidProcessingContext<
                SampleProcessingContextT,
                SurfaceProcessingContextT
            > =
            SolidProcessingContext<
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >
    > extends
    VolumeProcessingContext<
        Location,
        Sample,
        SampleProcessingContextT
    > {
    [VolumeSolidsKey]: SolidProcessingContextT
}

export type VolumeSolidProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        SolidProcessingContextT extends
            SolidProcessingContext<
                SampleProcessingContextT,
                SurfaceProcessingContextT
            > =
            SolidProcessingContext<
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >,
        VolumeProcessingT extends
            VolumeSolidsProcessing<Sample> =
            VolumeSolidsProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeSolidsProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeSolidsProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            >
    > =
    SolidProcessingContextT &
    ParallelizedContext<
            VolumeProcessingT,
            VolumeProcessingContextT
        >

export interface VolumeSolidProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        SolidT extends Solid<Sample, SurfaceT> = Solid<Sample, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<
                SampleProcessingContextT,
                SurfaceProcessingContextT
            > =
            SolidProcessingContext<
                SampleProcessingContextT,
                SurfaceProcessingContextT
            >,
        VolumeProcessingT extends
            VolumeSolidsProcessing<Sample, SurfaceT, SolidT> =
            VolumeSolidsProcessing<Sample, SurfaceT, SolidT>,
        VolumeProcessingContextT extends
            VolumeSolidsProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeSolidsProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            >
    > extends
    ParallelizedProcessor<
        VolumeProcessingT,
        VolumeProcessingContextT,
        SolidT,
        VolumeSolidProcessingContext<
            Location,
            Sample,
            SampleProcessingContextT,
            SurfaceProcessingContextT,
            SolidProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > { }

export const VolumeSolidsParallelizer = new IterableParallelizer(VolumeSolidsGroupTemplate)

export class VolumeSurfaceSolidifyingProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleProcessingContextT = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
        SolidProcessingContextT extends
            SolidProcessingContext<SampleProcessingContextT, SurfaceProcessingContextT> =
            SolidProcessingContext<SampleProcessingContextT, SurfaceProcessingContextT>,
        VolumeProcessingT extends
            VolumeSurfacesProcessing<Sample, SurfaceT> & VolumeSolidsProcessing<Sample, SurfaceT> =
            VolumeSurfacesProcessing<Sample, SurfaceT> & VolumeSolidsProcessing<Sample, SurfaceT>,
        VolumeProcessingContextT extends
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            > &
            VolumeSolidsProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            > &
            VolumeSolidsProcessingContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            >
    > implements
    VolumeProcessor<
        Location,
        Sample,
        SampleProcessingContextT,
        VolumeProcessingT,
        VolumeProcessingContextT
    > {
    init() {
        const connections = {
            inputs: [[VolumeSurfacesKey, PROPERTYKEY_ALL]],
            outputs: [[VolumeSolidsKey, PROPERTYKEY_ALL, 'surface']]
        }

        return { connections }
    }

    process(volume: VolumeProcessingT): void {
        volume[VolumeSolidsKey] = volume[VolumeSurfacesKey].map(surface => ({ surface }))
    }

    private constructor() { }

    static readonly instance = new this()
}