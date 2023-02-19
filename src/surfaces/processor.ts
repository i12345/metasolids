import { FieldsPoint } from "../fields";
import { MeshingAlgorithm, VolumeSample } from "../meshing";
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer, Processor } from "../processor";
import { VolumeProcessing, VolumeProcessingContext, VolumeProcessor } from "../volumes";
import { Surface, SurfaceSample } from "./surface";

export interface SurfaceProcessingContext<
        SampleContextTemplate = any
    > {
    sample: SampleContextTemplate
}

export interface SurfaceProcessor<
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>
    > extends
    Processor<SurfaceT, SurfaceProcessingContextT> { }

export type SurfaceSampleProcessingContext<
        Sample extends VolumeSample = VolumeSample,
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
        Sample extends VolumeSample = VolumeSample,
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
        Sample extends VolumeSample = VolumeSample,
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

        for (const sample of surface.mesh.vertecies_samples)
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
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
    > extends
    VolumeProcessingContext<
        Parameters,
        Sample,
        SampleContextTemplate
    > {
    surfaces: SurfaceProcessingContextT
}

export type VolumeSurfaceProcessingContext<
        Parameters extends FieldsPoint = FieldsPoint,
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
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            VolumeSurfacesProcessingContext<
                Parameters,
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
        Parameters extends FieldsPoint = FieldsPoint,
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
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            VolumeSurfacesProcessingContext<
                Parameters,
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
            Parameters,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > { }

export class VolumeSurfacesParallelizer<
        Parameters extends FieldsPoint = FieldsPoint,
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
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            VolumeSurfacesProcessingContext<
                Parameters,
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
            Parameters,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > {
    parallelize(
            item: VolumeProcessingT,
            context: VolumeProcessingContextT,
            itemProcessor: ParallelizedProcessor<
                VolumeProcessingT,
                VolumeProcessingContextT,
                SurfaceT,
                VolumeSurfaceProcessingContext<
                    Parameters,
                    Sample,
                    SampleContextTemplate,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingContextT
                >
            >
        ): void {
        type SampleContext = VolumeSurfaceProcessingContext<
            Parameters,
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
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
    > implements
    VolumeProcessor<
        Parameters,
        Sample,
        SampleContextTemplate,
        VolumeSurfacesProcessing<Sample>,
        VolumeSurfacesProcessingContext<
            Parameters,
            Sample,
            SampleContextTemplate
        >
    > {
    dependencies: Function[];

    constructor(public mesher: MeshingAlgorithm) { }

    process(
        volume: VolumeSurfacesProcessing<Sample, Surface<Sample>>,
        context: VolumeSurfacesProcessingContext<
            Parameters,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContext<SampleContextTemplate>
        >
    ): void {
        const mesh = this.mesher.mesh(volume.sampling)
        //TODO: examine real data to see how multiple island surfaces would be processed
        volume.surfaces.push({ mesh })
    }
}