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

export class SurfaceWithRenderingProcessor<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeSampleProcessingContextT>,
        VolumeT extends
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT> =
            VolumeWithBoundingBox<VolumeLocationT, VolumeSampleT, VolumeSampleProcessingContextT, VolumeSamplingContextT>,
        SurfaceT extends
            SurfaceWithRendering<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    SurfaceUVUnwrappingGroup
                > =
            SurfaceWithRendering<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    SurfaceUVUnwrappingGroup
                >,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithRendering<
                    SurfaceUVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    VolumeLocationT
                > =
            SurfaceProcessingContextWithRendering<
                    SurfaceUVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    VolumeLocationT
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    any,
                    {},
                    any,
                    {},
                    {},
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeSampleT,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > &
            VolumeProcessingWithSampling<
                    IndicesT,
                    {},
                    any,
                    {},
                    any,
                    {},
                    {},
                    VolumeLocationT,
                    VolumeSampleT,
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
        VolumeSampleT,
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
                    VolumeSampleT,
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

