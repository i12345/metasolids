import { SurfaceProcessingContext, SurfaceProcessor } from "../processing.js";
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeSurfaceProcessing, VolumeSurfaceProcessingContext, VolumeSurfaceProcessor } from "../volume-surfaces.js"
import { Surface, SurfaceSample } from "../surface.js";
import { Material_Groups, Material_Groups_Template } from "./material/groups.js";
import { VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../volumes/volume.js";
import { EncapsulatingKey, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, groupKinds, groups } from "../../paradigm/trees/index.js";
import { ExtraFields, Field, FieldsPointMapped, FieldsPoint_Omit_Leaf, SampleDomainLocationFieldKey, domains } from "../../fields/index.js";
import { FieldsField, Vec2Field } from "../../fields/fields/index.js"
import { SurfaceProcessingContextWithRendering, SurfaceWithRendering } from "./surface.js";
import { SurfaceRendererShared } from "./renderer.js";
import { Material_Groups_TextureContexts, Material_Texture_Context, Material_Texture_Location } from "./material/material-texture.js";
import { VolumeProcessingContext } from "../../volumes/processor.js";
import { SamplingKey, VolumeProcessingWithSampling } from "../../volumes/sampling/index.js"
import { onlyOne } from "../../utils/only-one.js";
import { SurfaceUVUnwrappingGroupKindsTemplate } from "../uv-unwrapping/surface.js";
import { SurfaceUVUnwrapping } from "../uv-unwrapping/algorithm.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { VolumeWithBoundingBox } from "../../volumes/volumes/bounded.js";
import { FieldPointVector, FieldPointVectorContainer } from "../../fields/vectorized/index.js";
import { NumberTypedArray } from "../../utils/typed-array.js";

export class SurfaceWithRenderingProcessor<
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
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    VolumeLocationT,
                    VolumeSampleElementType,
                    VolumeSampleContainer,
                    VolumeSampleVector
                > =
            SurfaceWithRendering<
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    VolumeLocationT,
                    VolumeSampleElementType,
                    VolumeSampleContainer,
                    VolumeSampleVector
                >,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithRendering<
                    SurfaceUVUnwrappingGroup,
                    VolumeLocationT,
                    VolumeSampleProcessingContextT
                > =
            SurfaceProcessingContextWithRendering<
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
            VolumeProcessingWithSurfacesContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT
            > =
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
            context: VolumeSurfaceProcessingContext<
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

        surface.renderer = new SurfaceRendererShared<VolumeLocationT>(
            surface.mesh,
            surface.material.textures,
            surfaceUVunwrapping,
            extraLocationParameters ?? ({} as ExtraFields<VolumeLocationT, VolumeLocation>)
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

