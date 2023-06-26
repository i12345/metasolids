import { SurfaceProcessor } from "../surface-samples.js";
import { VolumeProcessingWithSurfaces, VolumeSurfaceProcessingContext } from "../volume-surfaces.js"
import { SurfaceSample } from "../surface.js";
import { Material_Groups, Material_Groups_Template } from "./material/groups.js";
import { VolumeLocation } from "../../volumes/volume.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, groupKinds, groups } from "../../paradigm/index.js";
import { ExtraFields, Field, FieldsField, FieldsPointMapped, FieldsPoint_Omit_Leaf, SampleDomainLocationField, Vec2Field } from "../../fields/index.js";
import { SurfaceProcessingContextWithRendering, SurfaceWithRendering } from "./surface.js";
import { SurfaceRendererShared } from "./renderer.js";
import { Material_Groups_TextureContexts, Material_Texture_Context, Material_Texture_Location } from "./material/material-texture.js";
import { ParallelizedContext, ParallelizedContextParallelInfo } from "../../processing/processors/parallel.js";
import { VolumeProcessingContext, VolumeSamplingKey } from "../../volumes/processor.js";
import { onlyOne } from "../../utils/only-one.js";
import { SurfaceUVUnwrappingGroupKindsTemplate } from "../uv-unwrapping/surface.js";
import { SurfaceUVUnwrapping } from "../uv-unwrapping/algorithm.js";

export class SurfaceWithRenderingProcessor<
        SampleT extends SurfaceSample = SurfaceSample,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > implements
    SurfaceProcessor<
        SurfaceSample,
        any,
        SurfaceWithRendering<
                SampleT,
                VolumeLocationT,
                SurfaceUVUnwrappingGroup
            >,
        SurfaceProcessingContextWithRendering<
                VolumeLocationT,
                SurfaceUVUnwrappingGroup
            >
    > {
    process(
            surface: SurfaceWithRendering<
                    SampleT,
                    VolumeLocationT,
                    SurfaceUVUnwrappingGroup
                >,
            context: SurfaceProcessingContextWithRendering<
                    VolumeLocationT,
                    SurfaceUVUnwrappingGroup
                >
        ): void {
        const paralellizedContext = context as unknown as ParallelizedContext<
            VolumeProcessingWithSurfaces,
            VolumeProcessingContext<VolumeLocationT>
        >
        
        const extraLocationParameters = (
            paralellizedContext[ParallelizedContextParallelInfo] ?
                paralellizedContext
                    [ParallelizedContextParallelInfo]
                    .context
                    [VolumeSamplingKey]
                    .extraLocationParameters :
                undefined
        )

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

    init(context: SurfaceProcessingContextWithRendering<
                VolumeLocationT,
                SurfaceUVUnwrappingGroup
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

