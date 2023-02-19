import { FieldsPoint } from "../fields"
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer, Processor } from "../processor"
import { Surface, SurfaceProcessingContext, SurfaceProcessor, SurfaceSample, VolumeSurfaceProcessingContext, VolumeSurfaceProcessor, VolumeSurfacesProcessing, VolumeSurfacesProcessingContext } from "../surfaces"
import { VolumeProcessing, VolumeProcessingContext, VolumeSample } from "../volumes"
import { Solid } from "./solid"

export interface SolidProcessingContext<
        SampleContextTemplate = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
    > {
    sample: SampleContextTemplate
    surface: SurfaceProcessingContextT
}

export interface SolidProcessor<
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidT extends
            Solid<Sample, SurfaceT> =
            Solid<Sample, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<SampleContextTemplate, SurfaceProcessingContextT> = 
            SolidProcessingContext<SampleContextTemplate, SurfaceProcessingContextT>
    > extends
    Processor<SolidT, SolidProcessingContextT> {
}

export class SolidSurfaceProcessor<
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidT extends
            Solid<Sample, SurfaceT> =
            Solid<Sample, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<SampleContextTemplate, SurfaceProcessingContextT> = 
            SolidProcessingContext<SampleContextTemplate, SurfaceProcessingContextT>
    > implements
    SolidProcessor<
        Sample,
        SampleContextTemplate,
        SurfaceT,
        SurfaceProcessingContextT,
        SolidT,
        SolidProcessingContextT
    > {
    get dependencies(): Function[] {
        return this.processor.dependencies
    }

    constructor(public processor: SurfaceProcessor<
            Sample,
            SampleContextTemplate,
            SurfaceT,
            SurfaceProcessingContextT
        >) { }

    process(item: SolidT, context: SolidProcessingContextT): void {
        this.processor.process(item.surface, context.surface)
    }
}

export interface VolumeSolidsProcessing<
        Sample extends VolumeSample = VolumeSample,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SolidT extends Solid<Sample, SurfaceT> = Solid<Sample, SurfaceT>
    > extends
    VolumeProcessing<Sample> {
    solids: SolidT[]
}

export interface VolumeSolidsProcessingContext<
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidProcessingContextT extends
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            >
    > extends
    VolumeProcessingContext<
        Parameters,
        Sample,
        SampleContextTemplate
    > {
    solids: SolidProcessingContextT
}

export type VolumeSolidProcessingContext<
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidProcessingContextT extends
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            >,
        VolumeProcessingT extends
            VolumeSolidsProcessing<Sample> =
            VolumeSolidsProcessing<Sample>,
        VolumeProcessingContextT extends
            VolumeSolidsProcessingContext<
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeSolidsProcessingContext<
                Parameters,
                Sample,
                SampleContextTemplate,
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
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidT extends Solid<Sample, SurfaceT> = Solid<Sample, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            >,
        VolumeProcessingT extends
            VolumeSolidsProcessing<Sample, SurfaceT, SolidT> =
            VolumeSolidsProcessing<Sample, SurfaceT, SolidT>,
        VolumeProcessingContextT extends
            VolumeSolidsProcessingContext<
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeSolidsProcessingContext<
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            >
    > extends
    ParallelizedProcessor<
        VolumeProcessingT,
        VolumeProcessingContextT,
        SolidT,
        VolumeSolidProcessingContext<
            Parameters,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            SolidProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > { }

export class VolumeSolidsParallelizer<
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidT extends Solid<Sample, SurfaceT> = Solid<Sample, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            > =
            SolidProcessingContext<
                SampleContextTemplate,
                SurfaceProcessingContextT
            >,
        VolumeProcessingT extends
            VolumeSolidsProcessing<Sample, SurfaceT, SolidT> =
            VolumeSolidsProcessing<Sample, SurfaceT, SolidT>,
        VolumeProcessingContextT extends
            VolumeSolidsProcessingContext<
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeSolidsProcessingContext<
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            >
    > implements
    Parallelizer<
        VolumeProcessingT,
        VolumeProcessingContextT,
        SolidT,
        VolumeSolidProcessingContext<
            Parameters,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            SolidProcessingContextT,
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
                SolidT,
                VolumeSolidProcessingContext<
                    Parameters,
                    Sample,
                    SampleContextTemplate,
                    SurfaceProcessingContextT,
                    SolidProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingContextT
                >
            >
        ): void {
        type SampleContext = VolumeSolidProcessingContext<
            Parameters,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            SolidProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
        
        const parallelizedContext: SampleContext = {
            ...context.solids,
            [ParallelizedContextParallelInfo]: { item, context }
        }

        for (const solid of item.solids)
            itemProcessor.process(solid, parallelizedContext)
    }
}

export class VolumeSurfacesSolidifyingProcessor<
        Parameters extends FieldsPoint = FieldsPoint,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleContextTemplate> =
            SurfaceProcessingContext<SampleContextTemplate>,
        SolidProcessingContextT extends
            SolidProcessingContext<SampleContextTemplate, SurfaceProcessingContextT> =
            SolidProcessingContext<SampleContextTemplate, SurfaceProcessingContextT>,
        VolumeProcessingT extends
            VolumeSurfacesProcessing<Sample, SurfaceT> & VolumeSolidsProcessing<Sample, SurfaceT> =
            VolumeSurfacesProcessing<Sample, SurfaceT> & VolumeSolidsProcessing<Sample, SurfaceT>,
        VolumeProcessingContextT extends
            VolumeSurfacesProcessingContext<
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            > &
            VolumeSolidsProcessingContext<
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeSurfacesProcessingContext<
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            > &
            VolumeSolidsProcessingContext<
                Parameters,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            >
    > implements
    VolumeSurfaceProcessor<
        Parameters,
        Sample,
        SampleContextTemplate,
        SurfaceT,
        SurfaceProcessingContextT,
        VolumeProcessingT,
        VolumeProcessingContextT
    > {
    dependencies: Function[]
    process(
        surface: SurfaceT,
        context: VolumeSurfaceProcessingContext<
            Parameters,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    ): void {
        const volumeProcessing = context[ParallelizedContextParallelInfo].item
        volumeProcessing.solids.push({ surface })
    }
}