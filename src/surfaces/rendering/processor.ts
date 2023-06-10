import { SurfaceProcessor, VolumeSurfaceProcessingContext } from "../processor.js";
import { SurfaceSample } from "../surface.js";
import { Material_Groups_Template } from "./material/groups.js";
import { VolumeLocation } from "../../volumes/volume.js";
import { MultiObjectsGroupsTemplate, groups } from "../../paradigm/index.js";
import { Field, FieldsField, FieldsPointMapped, FieldsPoint_Omit_Leaf, SampleDomainLocationField, Vec2Field } from "../../fields/index.js";
import { SurfaceProcessingContextWithRendering, SurfaceWithRendering } from "./surface.js";
import { SurfaceRendererShared } from "./renderer.js";
import { Material_Texture_Context, Material_Texture_Location } from "./material/material-texture.js";
import { ParallelizedContextParallelInfo } from "../../processing/processors/parallel.js";
import { AppBase } from "playcanvas-extended";

export class SurfaceWithRenderingProcessor<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > implements
    SurfaceProcessor<
        SurfaceSample,
        any,
        SurfaceWithRendering<
                VolumeLocationT,
                SurfaceUVUnwrappingGroup
            >,
        SurfaceProcessingContextWithRendering<
                VolumeLocationT,
                SurfaceUVUnwrappingGroup
            >
    > {
    readonly connections = {
        inputs: [
            ['material', 'textures']
        ],
        outputs: [
            ['renderer']
        ]
    }

    process(
            surface: SurfaceWithRendering<
                VolumeLocationT,
                SurfaceUVUnwrappingGroup
            >,
            context: SurfaceProcessingContextWithRendering<
                VolumeLocationT,
                SurfaceUVUnwrappingGroup
            >
        ): void {
        ///@ts-ignore
        surface.renderer = new SurfaceRendererShared<VolumeLocationT, SurfaceUVUnwrappingGroup>(
            surface,
            context,
            this.app,
            context.material.surfaceUVUnwrappingGroup
        )
    }

    init(context: SurfaceProcessingContextWithRendering<
                VolumeLocationT,
                SurfaceUVUnwrappingGroup
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
        
        context.material.textures = {} as typeof context.material.textures
        for (const group of groups(Material_Groups_Template))
            group.set(context.material.textures, { ...sharedContext })
    }

    private constructor() { }

    static readonly instance = new this()
}

