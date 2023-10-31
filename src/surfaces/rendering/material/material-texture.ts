import { MultiObjectsGroupsMapped, MultiObjectsGroupsMappedOptional, MultiObjectsIDs, MultiObjectsIDsKey, MultiObjectsTemplate, WithMultiObjectsIDs, extract, mapGroups } from "../../../paradigm/trees/index.js";
import { FieldPoint, ExtraFields, GroupWithField, Field, GroupFieldKey, FieldPointType, SampleDomainLocationFieldKey } from "../../../fields/index.js"
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated, defaultTextureLocationField } from "../../../textures/texture.js"
import { VolumeLocation } from "../../../volumes/volume.js"
import { Material_Groups, Material_Groups_Template, Material_Groups_Textures_TexelTypes, Material_Groups_Textures_TexelTypes_Template } from "./groups.js"
import { defaultField } from "../../../fields/fields/default.js";
import { Color } from "playcanvas-extended";
import { IndicesTypedArray } from "../../../paradigm/arrays/indices-array.js";
import { FieldPointVectorContainerStatic } from "../../../fields/vectorized/point.js";
import { NumberTypedArray } from "../../../paradigm/arrays/typed-array.js";

export type Material_Texture_Location<
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > =
    TextureLocation &
    ExtraFields<VolumeLocationT, VolumeLocation>

export type Material_Texture_Context<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
    > =
    WithMultiObjectsIDs<Objects, ObjIDsT> &
    GroupWithField<Field<TextureSampleT, TextureSampleElementType, TextureSampleFuseMode>> &
    TextureSamplingContext<
        Material_Texture_Location<VolumeLocationT>
    >

export type Material_Groups_Textures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > =
    MultiObjectsGroupsMappedOptional<
        Material_Groups,
        Texture<
                Material_Texture_Location<VolumeLocationT>,
                Material_Texture_Location<VolumeLocationT>,
                Material_Texture_Location<VolumeLocationT>,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                FieldPoint,
                FieldPoint,
                FieldPoint,
                FieldPointVectorContainerStatic<NumberTypedArray>,
                Material_Texture_Context<
                    Objects,
                    ObjIDsT,
                    VolumeLocationT
                >
            >,
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
            Material_Texture_Context<
                Objects,
                ObjIDsT,
                VolumeLocationT
            >
        >
    >

export type Material_Groups_TextureContexts<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation
    > =
    MultiObjectsGroupsMapped<
            Material_Groups,
            Material_Texture_Context<
                Objects,
                ObjIDsT,
                VolumeLocationT
            >
        >
        
export const Material_Groups_TextureContexts_Template = <
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
    >(
        multiObjectsIDs: MultiObjectsIDs<Objects, ObjIDsT>,
    ) =>
    mapGroups<
            Material_Groups,
            Material_Texture_Context<
                Objects,
                ObjIDsT,
                VolumeLocationT,
                Color | number,
                Color | number,
                Color | number
            >
        >(Material_Groups_Template, path => ({
            [MultiObjectsIDsKey]: multiObjectsIDs,
            [SampleDomainLocationFieldKey]: <any>defaultTextureLocationField,
            [GroupFieldKey]: defaultField<Color | number>(extract<FieldPointType<Color | number>>(Material_Groups_Textures_TexelTypes_Template, path))
        }))