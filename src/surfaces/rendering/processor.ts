import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeSurfaceProcessing, VolumeSurfaceProcessingContext, VolumeSurfaceProcessor } from "../volume-surfaces.js"
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/volume.js";
import { EncapsulatingKey, MultiObjectsGroupsTemplate, MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs, groupKinds } from "../../paradigm/trees/index.js";
import { ExtraFields } from "../../fields/index.js";
import { SurfaceProcessingContextWithRendering, SurfaceWithRendering } from "./surface.js";
import { SurfaceRendererShared } from "./renderer.js";
import { SamplingKey, VolumeProcessingWithSampling } from "../../volumes/sampling/index.js"
import { onlyOne } from "../../utils/only-one.js";
import { SurfaceUVUnwrapping, SurfaceUVUnwrappingGroupKindsTemplate } from "../unwrapping/uv/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { FieldPointVector, FieldPointVectorContainer } from "../../fields/vectorized/index.js";
import { NumberTypedArray } from "../../utils/typed-array.js";

export class SurfaceWithRenderingProcessor<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocation,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSample,
        VolumeSampleFuseMode extends VolumeSample = VolumeSample,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
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
        SurfaceT extends
            SurfaceWithRendering<
                    Objects,
                    ObjIDsT,
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    VolumeLocationT,
                    VolumeSampleElementType,
                    VolumeSampleContainer,
                    VolumeSampleVector
                > =
            SurfaceWithRendering<
                    Objects,
                    ObjIDsT,
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    VolumeLocationT,
                    VolumeSampleElementType,
                    VolumeSampleContainer,
                    VolumeSampleVector
                >,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithRendering<
                    Objects,
                    ObjIDsT,
                    SurfaceUVUnwrappingGroup,
                    VolumeLocationT,
                    VolumeSampleProcessingContextT
                > =
            SurfaceProcessingContextWithRendering<
                    Objects,
                    ObjIDsT,
                    SurfaceUVUnwrappingGroup,
                    VolumeLocationT,
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
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > &
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
            VolumeProcessingWithSurfaces<
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
                    SurfaceT
                > &
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
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            VolumeProcessingWithSurfacesContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT
            > =
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            VolumeProcessingWithSurfacesContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT
            >
    > implements
    VolumeSurfaceProcessor<
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
        SurfaceProcessingContextT,
        VolumeProcessingT,
        VolumeProcessingContextT
    > {

    process(
            surface: VolumeSurfaceProcessing<
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
                    VolumeProcessingT
                >,
            context:
                WithMultiObjectsIDs<Objects, ObjIDsT> &
                VolumeSurfaceProcessingContext<
                        VolumeSampleProcessingContextT,
                        SurfaceProcessingContextT,
                        VolumeProcessingContextT
                    >
        ): void {
        const extraLocationParameters = surface[EncapsulatingKey][SamplingKey].extraLocationParameters

        const surfaceUVunwrapping = onlyOne(groupKinds(
            context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            context.material.surfaceUVUnwrappingGroup
        )).group.get<SurfaceUVUnwrapping>(surface)

        surface.renderer = new SurfaceRendererShared<Objects, ObjIDsT, VolumeLocationT>(
            surface.mesh,
            surface.material.textures,
            surfaceUVunwrapping,
            extraLocationParameters ?? ({} as ExtraFields<VolumeLocationT, VolumeLocation>),
            context[MultiObjectsIDsKey]
        )
    }

    init(context: VolumeSurfaceProcessingContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT,
                VolumeProcessingContextT
            >) {
        const connections = {
            inputs: [
                ['material', 'textures']
            ],
            outputs: [
                ['renderer']
            ]
        }

        return { connections }
    }

    private constructor() { }

    static readonly instance = new this()
}

