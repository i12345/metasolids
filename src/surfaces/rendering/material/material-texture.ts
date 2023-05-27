import { FieldPoint, ExtraFields, MultiObjectsGroupsMappedOptional } from "../../../fields/index.js"
import { Texture, TextureLocation, TextureSamplingContext, TexturesTemplated } from "../../../textures/texture.js"
import { VolumeLocation } from "../../../volumes/volume.js"
import { Material_Groups, Material_Groups_Textures_TexelTypes } from "./groups.js"

export type Material_Texture_Location<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > =
    TextureLocation &
    ExtraFields<VolumeLocationT, VolumeLocation>

export type Material_Texture_Context<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > =
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
                Material_Groups_Textures_TexelTypes,
                Material_Texture_Location<VolumeLocationT>,
                Material_Texture_Context<VolumeLocationT>
        >
    >
