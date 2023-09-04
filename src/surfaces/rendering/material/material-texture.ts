import { MultiObjectsGroupsMapped, MultiObjectsGroupsMappedOptional, extract, mapGroups } from "../../../paradigm/trees/index.js";
import { FieldPoint, ExtraFields, GroupWithField, Field, GroupFieldKey, FieldPointType, SampleDomainLocationFieldKey } from "../../../fields/index.js"
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated, defaultTextureLocationField } from "../../../textures/texture.js"
import { VolumeLocation } from "../../../volumes/volume.js"
import { Material_Groups, Material_Groups_Template, Material_Groups_Textures_TexelTypes, Material_Groups_Textures_TexelTypes_Template } from "./groups.js"
import { defaultField } from "../../../fields/fields/default.js";
import { Color } from "playcanvas-extended";

export type Material_Texture_Location<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > =
    TextureLocation &
    ExtraFields<VolumeLocationT, VolumeLocation>

export type Material_Texture_Context<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
    > =
    GroupWithField<Field<TextureSampleT, TextureSampleElementType, TextureSampleFuseMode>> &
    TextureSamplingContext<
        Material_Texture_Location<VolumeLocationT>
    >

export type Material_Groups_Textures<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > =
    MultiObjectsGroupsMappedOptional<
        Material_Groups,
        Texture,
        TexturesTemplated<
            Material_Groups,
            FieldPoint,
            FieldPoint,
            FieldPoint,
            Material_Groups_Textures_TexelTypes,
            Material_Groups_Textures_TexelTypes,
            Material_Groups_Textures_TexelTypes,
            Material_Texture_Location<VolumeLocationT>,
            Material_Texture_Location<VolumeLocationT>,
            Material_Texture_Location<VolumeLocationT>,
            Material_Texture_Context<VolumeLocationT>
        >
    >

export type Material_Groups_TextureContexts<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > =
    MultiObjectsGroupsMapped<
            Material_Groups,
            Material_Texture_Context<VolumeLocationT>
        >
        
export const Material_Groups_TextureContexts_Template =
    mapGroups<Material_Groups, Material_Texture_Context>(Material_Groups_Template, path => ({
        [SampleDomainLocationFieldKey]: <any>defaultTextureLocationField,
        [GroupFieldKey]: defaultField<Color | number>(extract<FieldPointType<Color | number>>(Material_Groups_Textures_TexelTypes_Template, path))
    }))