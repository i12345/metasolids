import { MeshingAlgorithm, MeshingSettings } from "./meshing/meshing-algorithm.js";
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer, Processor } from "../processor/index.js";
import { VolumeLocation, VolumeSample } from "../volumes/volume.js";
import { VolumeProcessing, VolumeProcessingContext, VolumeProcessor, VolumeSamplingKey, VolumeSamplingProcessor } from "../volumes/processor.js";
import { MeshDataWithNormals, Surface, SurfaceSample } from "./surface.js";
import { Vec3, calculateNormals } from "playcanvas-extended";
import { PROPERTYKEY_ALL } from "../utils/property-path.js";

export interface SurfaceProcessingContext<
        SampleContextTemplate = any
    > {
    sample: SampleContextTemplate
}

export interface SurfaceProcessor<
        Sample extends SurfaceSample = SurfaceSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>
    > extends
    Processor<SurfaceT, SurfaceProcessingContextT> { }

export type SurfaceSampleProcessingContext<
        Sample extends SurfaceSample = SurfaceSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>
    > =
    SampleContextTemplate &
    ParallelizedContext<
            SurfaceT,
            SurfaceProcessingContextT
        >

export interface SurfaceSampleProcessor<
        Sample extends SurfaceSample = SurfaceSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>
    > extends
        ParallelizedProcessor<
            SurfaceT,
            SurfaceProcessingContextT,
            Sample,
            SurfaceSampleProcessingContext<
                Sample,
                SampleContextTemplate,
                SurfaceT,
                SurfaceProcessingContextT
            >
    > { }
    
export class SurfaceSampleParallelizer<
        Sample extends SurfaceSample = SurfaceSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>
    > implements
    Parallelizer<
            SurfaceT,
            SurfaceProcessingContextT,
            Sample,
            SurfaceSampleProcessingContext<
                Sample,
                SampleContextTemplate,
                SurfaceT,
                SurfaceProcessingContextT
            >
        > {
    readonly parallelizedPath = ['samples', PROPERTYKEY_ALL]
    
    init(
            context: SurfaceProcessingContextT,
            sampleProcessor: ParallelizedProcessor<SurfaceT, SurfaceProcessingContextT, Sample, SurfaceSampleProcessingContext<Sample, SampleContextTemplate, SurfaceT, SurfaceProcessingContextT>>
        ): void {
        type SampleContext = SurfaceSampleProcessingContext<
            Sample,
            SampleContextTemplate,
            SurfaceT,
            SurfaceProcessingContextT
        >
        
        const parallelizedContext: SampleContext = {
            ...context.sample,
            [ParallelizedContextParallelInfo]: { item: undefined, context }
        }
    
        sampleProcessor.init(parallelizedContext)
    }

    parallelize(
            surface: SurfaceT,
            context: SurfaceProcessingContextT,
            sampleProcessor: ParallelizedProcessor<SurfaceT, SurfaceProcessingContextT, Sample, SurfaceSampleProcessingContext<Sample, SampleContextTemplate, SurfaceT, SurfaceProcessingContextT>>
        ): void {
        type SampleContext = SurfaceSampleProcessingContext<
            Sample,
            SampleContextTemplate,
            SurfaceT,
            SurfaceProcessingContextT
        >
        
        const parallelizedContext: SampleContext = {
            ...context.sample,
            [ParallelizedContextParallelInfo]: { item: surface, context }
        }

        for (const sample of surface.samples)
            sampleProcessor.process(sample, parallelizedContext)
    }
}


export const VolumeSurfacesKey = Symbol('volume.surfaces')
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
        SampleContextTemplate = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
    > extends
    VolumeProcessingContext<
        Location,
        Sample,
        SampleContextTemplate
    > {
    [VolumeSurfacesKey]: SurfaceProcessingContextT
}

export type VolumeSurfaceProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        VolumeProcessingT extends
            VolumeSurfacesProcessing<Sample> =
            VolumeSurfacesProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
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
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        VolumeProcessingT extends
            VolumeSurfacesProcessing<Sample, SurfaceT> =
            VolumeSurfacesProcessing<Sample, SurfaceT>,
        VolumeProcessingContextT extends
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
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
            SampleContextTemplate,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > { }

export class VolumeSurfacesParallelizer<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        VolumeProcessingT extends
            VolumeSurfacesProcessing<Sample, SurfaceT> =
            VolumeSurfacesProcessing<Sample, SurfaceT>,
        VolumeProcessingContextT extends
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            >
    > implements
    Parallelizer<
        VolumeProcessingT,
        VolumeProcessingContextT,
        SurfaceT,
        VolumeSurfaceProcessingContext<
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > {
    readonly parallelizedPath = [VolumeSurfacesKey, PROPERTYKEY_ALL]
    
    init(
            context: VolumeProcessingContextT,
            parallelizedItemProcessor: ParallelizedProcessor<
                VolumeProcessingT,
                VolumeProcessingContextT,
                SurfaceT,
                VolumeSurfaceProcessingContext<
                    Location,
                    Sample,
                    SampleContextTemplate,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingContextT
                >
            >
        ): void {
        type SampleContext = VolumeSurfaceProcessingContext<
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
        
        const parallelizedContext: SampleContext = {
            ...context[VolumeSurfacesKey],
            [ParallelizedContextParallelInfo]: { item: undefined, context }
        }

        parallelizedItemProcessor.init(parallelizedContext)
    }

    parallelize(
            item: VolumeProcessingT,
            context: VolumeProcessingContextT,
            itemProcessor: ParallelizedProcessor<
                VolumeProcessingT,
                VolumeProcessingContextT,
                SurfaceT,
                VolumeSurfaceProcessingContext<
                    Location,
                    Sample,
                    SampleContextTemplate,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingContextT
                >
            >
        ): void {
        type SampleContext = VolumeSurfaceProcessingContext<
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
        
        const parallelizedContext: SampleContext = {
            ...context[VolumeSurfacesKey],
            [ParallelizedContextParallelInfo]: { item, context }
        }

        for (const surface of item[VolumeSurfacesKey])
            itemProcessor.process(surface, parallelizedContext)
    }

    static readonly instance = new this()
}