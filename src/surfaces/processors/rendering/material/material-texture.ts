import { ExtraFields } from "../../../../fields/point.js"
import { TextureLocation, TextureSamplingContext, TexturesTemplated } from "../../../../textures/texture.js"
import { VolumeLocation } from "../../../../volumes/volume.js"
import { Material_Groups_Textures_TexelTypes } from "./groups.js"

export type Material_Texture_Location<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > =
    TextureLocation &
    ExtraFields<VolumeLocationT, VolumeLocation>

export type Material_Texture_Context<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > =
    TextureSamplingContext<
        Material_Texture_Location<
            VolumeLocationT
        >
    >

export type Material_Groups_Textures = TexturesTemplated<Material_Groups_Textures_TexelTypes>
