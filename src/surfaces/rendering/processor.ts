import { SurfaceProcessor } from "../surface-samples.js";
import { VolumeSurfaceProcessingContext } from "../volume-surfaces.js"
import { SurfaceSample } from "../surface.js";
import { Material_Groups, Material_Groups_Template } from "./material/groups.js";
import { VolumeLocation } from "../../volumes/volume.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, groupKinds, groups } from "../../paradigm/index.js";
import { Field, FieldsField, FieldsPointMapped, FieldsPoint_Omit_Leaf, SampleDomainLocationField, Vec2Field } from "../../fields/index.js";
import { SurfaceProcessingContextWithRendering, SurfaceWithRendering } from "./surface.js";
import { SurfaceRendererShared } from "./renderer.js";
import { Material_Groups_TextureContexts, Material_Texture_Context, Material_Texture_Location } from "./material/material-texture.js";
import { ParallelizedContextParallelInfo } from "../../processing/processors/parallel.js";
import { VolumeProcessingContext } from "../../volumes/processor.js";
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
        type TextureLocationT = Material_Texture_Location<VolumeLocationT>
        type TextureContextT = Material_Texture_Context<VolumeLocationT>
        
        const parallelizedContext = (context as unknown as VolumeSurfaceProcessingContext)[ParallelizedContextParallelInfo]?.context as VolumeProcessingContext
        
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
            )
        } as TextureContextT
        
        const combineTexureContexts = (
                shared: TextureContextT,
                specialized?: TextureContextT
            ) =>
            specialized ? {
                ...shared,
                ...specialized,
                [SampleDomainLocationField]: specialized[SampleDomainLocationField] ?
                    FieldsField.merge(
                        specialized[SampleDomainLocationField] as FieldsField<TextureLocationT>,
                        shared[SampleDomainLocationField] as FieldsField<TextureLocationT>
                    ) :
                    shared[SampleDomainLocationField]
            } : shared

        const textureContexts = {} as Material_Groups_TextureContexts<VolumeLocationT>
        for (const group of groups(Material_Groups_Template)) {
            const context_specialized = group.get<TextureContextT>(context.material.textures)
            const surface_specialized = group.get<TextureContextT>(surface.rendering?.textureContexts)
            const combined = combineTexureContexts(combineTexureContexts(sharedContext, context_specialized), surface_specialized)

            group.set(textureContexts, combined)
        }

        const surfaceUVunwrapping = onlyOne(groupKinds(
            context,
            SurfaceUVUnwrappingGroupKindsTemplate,
            context.material.surfaceUVUnwrappingGroup
        )).group.get<SurfaceUVUnwrapping>(surface)
        
        surface.renderer = new SurfaceRendererShared<VolumeLocationT>(
            surface.mesh,
            surface.material.textures,
            textureContexts,
            surfaceUVunwrapping
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

