import { Entity } from "playcanvas-extended"
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../paradigm/multi-objects.js"
import { ParallelizedContext, ParallelizedProcessor } from "../processing/processors/parallel.js"
import { IterableParallelizer } from "../processing/processors/parallelizer-iterable.js"
import { GraphNodeWorldSpaceTransformation, VolumeProcessingInstance, VolumeProcessingInstancer } from "../volumes/index.js"
import { VolumeProcessing, VolumeProcessingContext } from "../volumes/processor.js"
import { VolumeLocation, VolumeSample } from "../volumes/volume.js"
import { SurfaceProcessingContext } from "./surface-samples.js"
import { SurfaceSample, Surface, SurfaceInstance } from "./surface.js"
import { Instancer } from "../processing/instance.js"

export const VolumeSurfacesKey = Symbol('volume.surfaces')

export type VolumeSurfacesGroup = {
    [VolumeSurfacesKey]: MultiObjectsGroupsTemplateLeaf
}

export const VolumeSurfacesGroupTemplate: VolumeSurfacesGroup = {
    [VolumeSurfacesKey]: MultiObjectsGroupsTemplate_Leaf
}

export interface VolumeProcessingWithSurfaces<
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends Surface<SampleT> = Surface<SampleT>
    > extends
    VolumeProcessing<SampleT> {
    [VolumeSurfacesKey]: SurfaceT[]
}

export interface VolumeProcessingWithSurfacesInstance<
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends Surface<SampleT> = Surface<SampleT>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<SampleT, SurfaceT> =
            VolumeProcessingWithSurfaces<SampleT, SurfaceT>
    > extends
    VolumeProcessingInstance<SampleT, VolumeProcessingT> {
    [VolumeSurfacesKey]: SurfaceInstanceT[]
}

export class VolumeProcessingWithSurfacesInstancer<
        SampleT extends SurfaceSample = SurfaceSample,
        SurfaceT extends Surface<SampleT> = Surface<SampleT>,
        SurfaceInstanceT extends SurfaceInstance<SurfaceT> = SurfaceInstance<SurfaceT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<SampleT, SurfaceT> =
            VolumeProcessingWithSurfaces<SampleT, SurfaceT>
    > implements
    VolumeProcessingInstancer<
        SampleT,
        VolumeProcessingT,
        VolumeProcessingWithSurfacesInstance<SampleT, SurfaceT, SurfaceInstanceT, VolumeProcessingT>
    > {
    constructor(public readonly instancer: Instancer<SurfaceT, SurfaceInstanceT>) { }
    
    instantiate(
            shared: VolumeProcessingT,
            entity: Entity
        ): VolumeProcessingWithSurfacesInstance<
            SampleT,
            SurfaceT,
            SurfaceInstanceT,
            VolumeProcessingT
        > {
        return {
            shared,
            entity,
            spaceTransformations: [
                new GraphNodeWorldSpaceTransformation(entity)
            ],
            [VolumeSurfacesKey]: shared[VolumeSurfacesKey].map(surface => this.instancer.instantiate(surface, entity))
        }
    }

    set_enabled(
        instance: VolumeProcessingWithSurfacesInstance<
            SampleT,
            SurfaceT,
            SurfaceInstanceT,
            VolumeProcessingT
        >,
        enabled: boolean
    ): void {
        throw new Error("Method not implemented.")
    }
    
}

export interface VolumeProcessingWithSurfacesContext<
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
            VolumeProcessingWithSurfaces<Sample> =
            VolumeProcessingWithSurfaces<Sample>,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            > =
            VolumeProcessingWithSurfacesContext<
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
            VolumeProcessingWithSurfaces<Sample, SurfaceT> =
            VolumeProcessingWithSurfaces<Sample, SurfaceT>,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                Location,
                Sample,
                SampleProcessingContextT,
                SurfaceProcessingContextT
            > =
            VolumeProcessingWithSurfacesContext<
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