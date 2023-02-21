import { MeshingAlgorithm, MeshingSettings } from "../meshing/meshing-algorithm.js";
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer, Processor } from "../processor/index.js";
import { VolumeLocation, VolumeSample } from "../volumes/volume.js";
import { VolumeProcessing, VolumeProcessingContext, VolumeProcessor, VolumeSamplingProcessor } from "../volumes/processor.js";
import { Surface, SurfaceSample } from "./surface.js";
import { Vec3 } from "playcanvas-extended";

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

export const VolumeSurfaceMeshingProcessing_Settings = Symbol("surface-meshing:settings")

export interface VolumeSurfaceMeshingProcessing<
        Sample extends VolumeSample
    > extends VolumeSurfacesProcessing<Sample> {
    [VolumeSurfaceMeshingProcessing_Settings]: MeshingSettings
}

export interface VolumeSurfaceMeshingProcessingContext<
        Location extends VolumeLocation = VolumeLocation,
        Sample extends VolumeSample = VolumeSample,
        SampleContextTemplate = any,
    > extends
    VolumeSurfacesProcessingContext<
        Location,
        Sample,
        SampleContextTemplate
    > {
    [VolumeSurfaceMeshingProcessing_Settings]: {
        algorithm: MeshingAlgorithm
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
        VolumeSurfaceMeshingProcessing<Sample>,
        VolumeSurfaceMeshingProcessingContext<Location, Sample, SampleContextTemplate>
    > {
    dependencies = [VolumeSamplingProcessor]

    constructor() { }

    init(): void {
    }

    process(
        volume: VolumeSurfaceMeshingProcessing<Sample>,
        context: VolumeSurfaceMeshingProcessingContext<
            Location,
            Sample,
            SampleContextTemplate
        >
    ): void {
        const algorithm = context[VolumeSurfaceMeshingProcessing_Settings].algorithm
        const mesh = algorithm.mesh(
            volume.sampling,
            volume[VolumeSurfaceMeshingProcessing_Settings]
        )

        const box_min = volume.sampling.boundingBox.getMin()
        const box_size = volume.sampling.boundingBox.halfExtents.clone().mulScalar(2)
        const voxels = volume.sampling.voxels
        const voxels_size = volume.sampling.size

        function interpolateSample(p: Vec3) {
            const voxel_p = p.clone().sub(box_min).mul(voxels_size).div(box_size)
            const voxel_000 = voxel_p.clone().floor()
            // if (((voxel_p.x - voxel_000.x) +
            //     (voxel_p.x - voxel_000.x) +
            //     (voxel_p.x - voxel_000.x)) < 0.01)

            //TODO: implement interpolation

            return voxels[voxel_000.x][voxel_000.y][voxel_000.z]
        }

        const samples = mesh.vertices.map(v => interpolateSample(v))
        volume.surfaces = [{ mesh, samples }]
    }
}