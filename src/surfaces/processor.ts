import { MeshingAlgorithm } from "../meshing/meshing-algorithm.js";
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer, Processor } from "../processor/index.js";
import { VolumeLocation, VolumeSample } from "../volumes/volume.js";
import { VolumeProcessing, VolumeProcessingContext, VolumeProcessor } from "../volumes/processor.js";
import { Surface, SurfaceSample } from "./surface.js";

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


export interface VolumeSurfacesProcessing<
        Sample extends SurfaceSample = SurfaceSample,
        SurfaceT extends Surface<Sample> = Surface<Sample>
    > extends
    VolumeProcessing<Sample> {
    surfaces: SurfaceT[]
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
    surfaces: SurfaceProcessingContextT
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
            ...context.surfaces,
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
            ...context.surfaces,
            [ParallelizedContextParallelInfo]: { item, context }
        }

        for (const solid of item.surfaces)
            itemProcessor.process(solid, parallelizedContext)
    }
}

export class VolumeSurfaceMeshingProcessor<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
    > implements
    VolumeProcessor<
        Location,
        Sample,
        SampleContextTemplate,
        VolumeSurfacesProcessing<Sample>,
        VolumeSurfacesProcessingContext<
            Location,
            Sample,
            SampleContextTemplate
        >
    > {
    dependencies: Function[];

    constructor(public mesher: MeshingAlgorithm) { }
    init(context: VolumeSurfacesProcessingContext<
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContext<SampleContextTemplate>
        >): void {
        //TODO: choose mesher from context
    }

    process(
        volume: VolumeSurfacesProcessing<Sample, Surface<Sample>>,
        context: VolumeSurfacesProcessingContext<
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContext<SampleContextTemplate>
        >
    ): void {
        const mesh = this.mesher.mesh(volume.sampling)
        const samples = undefined //TODO
        //TODO: examine real data to see how multiple island surfaces would be processed
        volume.surfaces.push({ mesh, samples })
    }
}