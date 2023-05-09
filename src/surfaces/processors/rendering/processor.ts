import { SurfaceProcessor, VolumeSurfaceProcessingContext } from "../../processor.js";
import { SurfaceSample } from "../../surface.js";
import { PropertyPath } from "../../../utils/property-path.js";
import { Material_Groups_Template } from "./material/groups.js";
import { VolumeLocation } from "../../../volumes/volume.js";
import { Field, FieldsField, FieldsPointMapped, FieldsPoint_Omit_Leaf, SampleDomainLocationField, Vec2Field, groups } from "../../../fields/index.js";
import { SurfaceSampleProcessingContextWithIndividualTextureLocations } from "../texturing/index.js";
import { SurfaceProcessingContextWithRendering, SurfaceWithRendering } from "./surface.js";
import { SurfaceRendererShared } from "./renderer.js";
import { Material_Texture_Context, Material_Texture_Location } from "./material/material-texture.js";
import { ParallelizedContextParallelInfo } from "../../../processor/index.js";

export class SurfaceWithRenderingProcessor<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        Sample extends SurfaceSample = SurfaceSample,
        SampleContextTemplate extends
            SurfaceSampleProcessingContextWithIndividualTextureLocations =
            SurfaceSampleProcessingContextWithIndividualTextureLocations
    > implements
    SurfaceProcessor<
        Sample,
        SampleContextTemplate,
        SurfaceWithRendering<
                Sample
            >,
        SurfaceProcessingContextWithRendering<
                VolumeLocationT,
                SampleContextTemplate
            >
    > {
    readonly dependencies: PropertyPath[]

    process(
            surface: SurfaceWithRendering<
                Sample
            >,
            context: SurfaceProcessingContextWithRendering<
                VolumeLocationT,
                SampleContextTemplate
            >
        ): void {
        surface.renderer = new SurfaceRendererShared(surface, context)
    }

    init(context: SurfaceProcessingContextWithRendering<
            VolumeLocationT,
            SampleContextTemplate
        >): void {
        type TextureLocationT = Material_Texture_Location<VolumeLocationT>
        
        const parallelizedContext = (context as unknown as VolumeSurfaceProcessingContext)[ParallelizedContextParallelInfo]?.context
        
        const sharedContext = {
            [SampleDomainLocationField]: FieldsField.merge(
                ((parallelizedContext ?
                    parallelizedContext[SampleDomainLocationField] :
                    FieldsField.empty) as FieldsField<VolumeLocationT>)
                    .omit({
                        p: FieldsPoint_Omit_Leaf
                    } as FieldsPointMapped<VolumeLocation, typeof FieldsPoint_Omit_Leaf>
                ) as FieldsField<TextureLocationT>,
                new FieldsField<TextureLocationT>({
                    uv: new Vec2Field()
                } as FieldsPointMapped<TextureLocationT, Field>)
            ),
            sample: context.sample
        } as Material_Texture_Context<VolumeLocationT>
        
        context.textures = {} as typeof context.textures
        for (const group of groups(Material_Groups_Template))
            group.set(context.textures, { ...sharedContext })
    }    
}

