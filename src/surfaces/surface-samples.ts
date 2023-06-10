import { Processor } from "../processing/index.js";
import { ParallelizedContext, ParallelizedProcessor } from "../processing/processors/parallel.js";
import { Surface, SurfaceSample } from "./surface.js";
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../paradigm/multi-objects.js";
import { IterableParallelizer } from "../processing/processors/parallelizer-iterable.js";

export type SurfaceSamplesGroup = {
    samples: MultiObjectsGroupsTemplateLeaf
}

export const SurfaceSampleGroupTemplate: SurfaceSamplesGroup = {
    samples: MultiObjectsGroupsTemplate_Leaf
}

export interface SurfaceProcessingContext<
        SampleProcessingContextT = any
    > {
    samples: SampleProcessingContextT
}

export interface SurfaceProcessor<
        Sample extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    > extends
    Processor<SurfaceT, SurfaceProcessingContextT> { }

export type SurfaceSampleProcessingContext<
        Sample extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    > =
    SampleProcessingContextT &
    ParallelizedContext<
            SurfaceT,
            SurfaceProcessingContextT
        >

export interface SurfaceSampleProcessor<
        Sample extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any,
        SurfaceT extends Surface<Sample> = Surface<Sample>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>
    > extends
        ParallelizedProcessor<
            SurfaceT,
            SurfaceProcessingContextT,
            Sample,
            SurfaceSampleProcessingContext<
                Sample,
                SampleProcessingContextT,
                SurfaceT,
                SurfaceProcessingContextT
            >
    > { }

export const SurfaceSampleParallelizer = new IterableParallelizer(SurfaceSampleGroupTemplate)