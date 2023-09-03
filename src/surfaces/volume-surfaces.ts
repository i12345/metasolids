import { Entity } from "playcanvas-extended"
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf } from "../paradigm/trees/multi-objects-groups.js"
import { ParallelizedProcessor } from "../paradigm/processing/processors/parallel.js"
import { IterableParallelizer } from "../paradigm/processing/processors/parallelizer-iterable.js"
import { GraphNodeWorldSpaceTransformation, VolumeProcessingInstance, VolumeProcessingInstancer } from "../volumes/index.js"
import { VolumeProcessing, VolumeProcessingContext } from "../volumes/processor.js"
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from "../volumes/volume.js"
import { SurfaceProcessingContext } from "./processing.js"
import { SurfaceSample, Surface, SurfaceInstance } from "./surface.js"
import { Instancer } from "../paradigm/processing/instance.js"
import { WithEncapsulating } from "../paradigm/trees/encapsulating.js"
import { IndicesTypedArray } from "../utils/indices-array.js"

export const VolumeSurfacesKey = Symbol('volume.surfaces')

export type VolumeSurfacesGroup = {
    [VolumeSurfacesKey]: MultiObjectsGroupsTemplateLeaf
}

export const VolumeSurfacesGroupTemplate: VolumeSurfacesGroup = {
    [VolumeSurfacesKey]: MultiObjectsGroupsTemplate_Leaf
}

export interface VolumeProcessingWithSurfaces<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType> =
            Surface<IndicesT, VolumeSampleElementType>
    > extends
    VolumeProcessing<
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT
        > {
    [VolumeSurfacesKey]: SurfaceT[]
}

export type VolumeSurfaceProcessing<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType> =
            Surface<IndicesT, VolumeSampleElementType>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >
    > =
    SurfaceT &
    WithEncapsulating<VolumeProcessingT>

export interface VolumeProcessingWithSurfacesInstance<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType> =
            Surface<IndicesT, VolumeSampleElementType>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >
    > extends
    VolumeProcessingInstance<
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        VolumeProcessingT
    > {
    [VolumeSurfacesKey]: SurfaceInstanceT[]
}

export class VolumeProcessingWithSurfacesInstancer<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType> =
            Surface<IndicesT, VolumeSampleElementType>,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >
    > implements
    VolumeProcessingInstancer<
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        VolumeProcessingT,
        VolumeProcessingWithSurfacesInstance<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
                SurfaceT,
                SurfaceInstanceT,
                VolumeProcessingT
            >
    > {
    constructor(public readonly instancer: Instancer<SurfaceT, SurfaceInstanceT>) { }

    instantiate(
            shared: VolumeProcessingT,
            entity: Entity
        ): VolumeProcessingWithSurfacesInstance<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
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
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
                SurfaceT,
                SurfaceInstanceT,
                VolumeProcessingT
            >,
        enabled: boolean
    ): void {
        for (const surface of instance[VolumeSurfacesKey])
            this.instancer.set_enabled(surface, enabled)
    }
}

export interface VolumeProcessingWithSurfacesContext<
        SampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<SampleProcessingContextT> =
            SurfaceProcessingContext<SampleProcessingContextT>,
    > extends
    VolumeProcessingContext<
        SampleProcessingContextT
    > {
    [VolumeSurfacesKey]: SurfaceProcessingContextT
}

export type VolumeSurfaceProcessingContext<
        VolumeSampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            > =
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT
            > =
            VolumeProcessingWithSurfacesContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT
            >
    > =
    SurfaceProcessingContextT &
    WithEncapsulating<VolumeProcessingContextT>

export interface VolumeSurfaceProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType> =
            Surface<IndicesT, VolumeSampleElementType>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            > =
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            >,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT
            > =
            VolumeProcessingWithSurfacesContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT
            >
    > extends
    ParallelizedProcessor<
        VolumeProcessingT,
        VolumeProcessingContextT,
        VolumeSurfaceProcessing<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
                SurfaceT,
                VolumeProcessingT
            >,
        VolumeSurfaceProcessingContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT,
                VolumeProcessingContextT
            >
    > { }

export const VolumeSurfacesParallelizer = new IterableParallelizer(VolumeSurfacesGroupTemplate)