import { MultiObjectsGroupsMapped, MultiObjectsGroupsMappedOptional } from "../../../paradigm/trees/index.js";
import { FieldPoint, ExtraFields, GroupWithField, Field } from "../../../fields/index.js"
import { Texture, TextureLocation, TextureSamplingContext, TexturesTemplated } from "../../../textures/texture.js"
import { VolumeLocation } from "../../../volumes/volume.js"
import { Material_Groups, Material_Groups_Textures_TexelTypes } from "./groups.js"

export type Material_Texture_Location<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > =
    TextureLocation &
    ExtraFields<VolumeLocationT, VolumeLocation>

export type Material_Texture_Context<
        VolumeLocationT extends VolumeLocation = VolumeLocation,
    > =
    GroupWithField<Field<Material_Texture_Location<VolumeLocationT>>> &
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