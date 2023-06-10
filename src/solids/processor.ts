import { Processor } from "../processing/index.js"
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer } from "../processing/processors/parallel.js";
import { Surface } from "../surfaces/surface.js"
import { SurfaceProcessingContext, SurfaceProcessor, VolumeSurfaceProcessingContext, VolumeSurfaceProcessor, VolumeSurfacesKey, VolumeSurfacesProcessing, VolumeSurfacesProcessingContext } from "../surfaces/processor.js"
import { VolumeLocation, VolumeSample } from "../volumes/volume.js"
import { VolumeProcessing, VolumeProcessingContext } from "../volumes/processor.js"
import { Solid } from "./solid.js"
import { PROPERTYKEY_ALL, PropertyPath } from "../paradigm/property-path.js"

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
    connections!: {
        readonly inputs: PropertyPath[]
        readonly outputs: PropertyPath[]
    }

    constructor(public processor: SurfaceProcessor<
            Sample,
            SampleContextTemplate,
            SurfaceT,
            SurfaceProcessingContextT
        >) { }
    
    init(context: SolidProcessingContextT): void {
        this.processor.init(context.surface)
        
        this.connections = {
            inputs: this.processor.connections.inputs.map(input => ['surface', ...input]),
            outputs: this.processor.connections.outputs.map(output => ['surface', ...output])
        }
    }

    process(item: SolidT, context: SolidProcessingContextT): void {
        this.processor.process(item.surface, context.surface)
    }
}

export const VolumeSolidsKey = Symbol('volume.solids')
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
        Location,
        Sample,
        SampleContextTemplate
    > {
    [VolumeSolidsKey]: SolidProcessingContextT
}

export type VolumeSolidProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
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
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeSolidsProcessingContext<
                Location,
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
        Location extends VolumeLocation = VolumeLocation,
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
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeSolidsProcessingContext<
                Location,
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
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            SolidProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > { }

export class VolumeSolidsParallelizer<
        Location extends VolumeLocation = VolumeLocation,
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
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeSolidsProcessingContext<
                Location,
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
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            SolidProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
    > {
    readonly parallelizedPath = [VolumeSolidsKey, PROPERTYKEY_ALL]
    
    init(
            context: VolumeProcessingContextT,
            itemProcessor: ParallelizedProcessor<
                VolumeProcessingT,
                VolumeProcessingContextT,
                SolidT,
                VolumeSolidProcessingContext<
                    Location,
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
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            SolidProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
        
        const parallelizedContext: SampleContext = {
            ...context[VolumeSolidsKey],
            [ParallelizedContextParallelInfo]: { item: undefined, context }
        }

        itemProcessor.init(parallelizedContext)
    }

    parallelize(
            item: VolumeProcessingT,
            context: VolumeProcessingContextT,
            itemProcessor: ParallelizedProcessor<
                VolumeProcessingT,
                VolumeProcessingContextT,
                SolidT,
                VolumeSolidProcessingContext<
                    Location,
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
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            SolidProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >
        
        const parallelizedContext: SampleContext = {
            ...context[VolumeSolidsKey],
            [ParallelizedContextParallelInfo]: { item, context }
        }

        for (const solid of item[VolumeSolidsKey])
            itemProcessor.process(solid, parallelizedContext)
    }

    static readonly instance = new this()
}

export class VolumeSurfaceSolidifyingProcessor<
        Location extends VolumeLocation = VolumeLocation,
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
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            > &
            VolumeSolidsProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeSurfacesProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT
            > &
            VolumeSolidsProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            >
    > implements
    VolumeSurfaceProcessor<
        Location,
        Sample,
        SampleContextTemplate,
        SurfaceT,
        SurfaceProcessingContextT,
        VolumeProcessingT,
        VolumeProcessingContextT
    > {
    readonly connections = {
        inputs: [
            []
        ],
        outputs: [
            // [VolumeSolidsKey, PROPERTYKEY_ALL, "surface" as keyof Solid]
        ],
    }
    
    init(context: VolumeSurfaceProcessingContext<
            Location,
            Sample,
            SampleContextTemplate,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingContextT
        >): void {
    }

    process(
            surface: SurfaceT,
            context: VolumeSurfaceProcessingContext<
                Location,
                Sample,
                SampleContextTemplate,
                SurfaceProcessingContextT,
                VolumeProcessingT,
                VolumeProcessingContextT
            >
        ): void {
        const volumeProcessing = context[ParallelizedContextParallelInfo].item!
        volumeProcessing[VolumeSolidsKey].push({ surface })
    }

    private constructor() { }

    static readonly instance = new this()
}