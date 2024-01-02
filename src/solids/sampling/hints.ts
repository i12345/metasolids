import { Vec3 } from "playcanvas-physics-advanced";
import { ProcessorInitialization } from "../../paradigm/processing/processor.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { SpaceKey, VolumeProcessingContextWithSampling, VolumeProcessingWithSampling, VolumeSamplingContextKey, VolumeSamplingSubdivisionProcessing, VolumeSamplingSubdivisionProcessingContext, VolumeSamplingSubdivisionProcessor, VolumeSamplingSubdivisionSamplesGroupsTemplate } from "../../volumes/sampling/index.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext, defaultVolumeSampleField } from "../../volumes/volume.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { OctTreeSpace } from "../../paradigm/octtree/space.js";
import { SubdivisionKey } from "../../paradigm/octtree/processor.js";
import { VolumeSolidsKey } from "../volume-solids.js";
import { VolumeProcessingWithSurfacesContext } from "../../surfaces/volume-surfaces.js";
import { groupPaths } from "../../paradigm/trees/multi-objects-groups.js";
import { FieldsField } from "../../fields/fields/fields.js";
import { FieldsPointMapped } from "../../fields/point.js";
import { Field } from "../../fields/field.js";

export interface VolumeSamplingContextWithSolidHints<
        LocationT extends VolumeLocation = VolumeLocation,
        LocationElementType extends VolumeLocation = LocationT,
        LocationFuseMode extends VolumeLocation = LocationT,
        SampleProcessingContextT = any
    >
    extends VolumeSamplingContext<
        LocationT,
        LocationElementType,
        LocationFuseMode,
        SampleProcessingContextT
    > {
    [VolumeSolidsKey]: {
        /**
         * packed xyz arrays of hint points, for each object that gives solid hints
         *
         * The solid hint volume sampling subdivision processor will recommend
         * subdivision so that all solid hint points are inside of cells with
         * alpha of 1.
         *
         * TODO: how will subtraction be handled? should this be for influence groups
         * instead of [just] alpha?
         */
        hints: Float32Array[]
    }
}

export class SolidHintVolumeSamplingSubdivisionProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContextWithSolidHints<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                > =
            VolumeSamplingContextWithSolidHints<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleProcessingContextT
                >,
        VolumeT extends
            VolumeWithBoundingBox<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            VolumeWithBoundingBox<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT//,
                    // SurfaceProcessingContextT
                > &
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT//,
                    // SurfaceProcessingContextT
                > &
            VolumeProcessingContextWithSampling<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT //,
                    // VolumeProcessingContextT
                >
    > implements
    VolumeSamplingSubdivisionProcessor<
            IndicesT,
            {},
            {},
            {},
            {},
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
            VolumeProcessingContextT
    > {
    init(context: VolumeSamplingSubdivisionProcessingContext<
                IndicesT,
                {},
                {},
                {},
                {},
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeProcessingContextT
            >): ProcessorInitialization {
        context[VolumeSamplingContextKey][VolumeSolidsKey] = {
            hints: []
        }

        return {
            connections: {
                inputs: [...groupPaths(
                    VolumeSamplingSubdivisionSamplesGroupsTemplate(
                        new FieldsField<VolumeSampleT, VolumeSampleElementType, VolumeSampleFuseMode>({
                            alpha: defaultVolumeSampleField.fields.alpha
                        } as FieldsPointMapped<VolumeSampleT, Field>)
                    )
                )],
                outputs: []
            }
        }
    }

    process(
            item: VolumeSamplingSubdivisionProcessing<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
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
                >,
            context: VolumeSamplingSubdivisionProcessingContext<
                    IndicesT,
                    {},
                    {},
                    {},
                    {},
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeProcessingContextT
                >
        ): void {
        const subdivision = context[SubdivisionKey]
        const layer = subdivision.depth

        const recommendation_pre = new Uint8Array(subdivision.layer_sizes[layer])

        for (const hint_array of context[VolumeSamplingContextKey][VolumeSolidsKey].hints) {
            //TODO: support different parameter & return types for vectorized functions

            const { layer: layers, local_index: local_indices } = OctTreeSpace.vectorized.indexOfPosition.call(context[SpaceKey], hint_array)

            for (let i = 0; i < layers.length; i++) {
                if (layers[i] === layer) {
                    const localIndex = local_indices[i]

                    const is_interior = item.samples.alpha[localIndex] === 1

                    if (!is_interior)
                        recommendation_pre[localIndex]++
                }
            }
        }

        const recommendation = item[SubdivisionKey].recommendation.layers[layer]
        for (let localIndex = 0; localIndex < recommendation_pre.length; localIndex++)
            if (recommendation_pre[localIndex] > 0)
                recommendation[localIndex]++
    }

    private constructor() { }
    public static readonly instance = new this()
}