import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, WithEncapsulating } from "../paradigm/trees/index.js"
import { ParallelizedProcessor, IterableParallelizer } from "../paradigm/processing/processors/index.js"
import { SurfaceProcessingContext } from "../surfaces/processing.js"
import { Surface } from "../surfaces/surface.js"
import { VolumeProcessing, VolumeProcessingContext } from "../volumes/processor.js"
import { VolumeSample, VolumeLocation, Volume, VolumeSamplingContext } from "../volumes/volume.js"
import { SolidProcessingContext } from "./processor.js"
import { Solid } from "./solid.js"
import { IndicesTypedArray } from "../paradigm/arrays/indices-array.js"
import { FieldPointVector, FieldPointVectorContainer } from "../fields/vectorized/index.js"
import { NumberTypedArray } from "../paradigm/arrays/typed-array.js"

export const VolumeSolidsKey = Symbol('volume.solids')

export type VolumeSolidsGroup = {
    [VolumeSolidsKey]: MultiObjectsGroupsTemplateLeaf
}

export const VolumeSolidsGroupTemplate: VolumeSolidsGroup = {
    [VolumeSolidsKey]: MultiObjectsGroupsTemplate_Leaf
}

export interface VolumeProcessingWithSolids<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                > =
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                >,
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
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        SolidT extends
            Solid<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector, SurfaceT> =
            Solid<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector, SurfaceT>
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
    [VolumeSolidsKey]: SolidT[]
}

export type VolumeSolidProcessing<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                > =
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                >,
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
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        SolidT extends
            Solid<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector, SurfaceT> =
            Solid<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector, SurfaceT>,
        VolumeProcessingT extends
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                > =
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                >
    > =
    SolidT &
    WithEncapsulating<VolumeProcessingT>

export interface VolumeProcessingWithSolidsContext<
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
        SampleProcessingContextT
    > {
    [VolumeSolidsKey]: SolidProcessingContextT
}

export type VolumeSolidProcessingContext<
        VolumeSampleProcessingContextT = any,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            > =
            SurfaceProcessingContext<
                VolumeSampleProcessingContextT
            >,
        SolidProcessingContextT extends
            SolidProcessingContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            SolidProcessingContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSolidsContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeProcessingWithSolidsContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            >
    > =
    SolidProcessingContextT &
    WithEncapsulating<VolumeProcessingContextT>

export interface VolumeSolidProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                > =
            VolumeSamplingContext<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                >,
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
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContext<VolumeSampleProcessingContextT> =
            SurfaceProcessingContext<VolumeSampleProcessingContextT>,
        SolidT extends
            Solid<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector, SurfaceT> =
            Solid<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector, SurfaceT>,
        SolidProcessingContextT extends
            SolidProcessingContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            SolidProcessingContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                > =
            VolumeProcessingWithSolids<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SolidT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSolidsContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            > =
            VolumeProcessingWithSolidsContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT
            >
    > extends
    ParallelizedProcessor<
        VolumeProcessingT,
        VolumeProcessingContextT,
        VolumeSolidProcessing<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleContainer,
                VolumeSampleVector,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
                SurfaceT,
                SolidT,
                VolumeProcessingT
            >,
        VolumeSolidProcessingContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT,
                SolidProcessingContextT,
                VolumeProcessingContextT
            >
    > { }

export const VolumeSolidsParallelizer = new IterableParallelizer(VolumeSolidsGroupTemplate)