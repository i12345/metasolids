import { Color, Vec2, Vec3 } from "playcanvas-extended";
import { FieldPoint, FieldPointPrimitive, FieldsPoint, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsMappedGrouped, MultiObjectsTemplate, SampleDomain, SamplingContext } from "../fields/index.js";

export type TextureUV = Vec2

export type TextureLocation = {
    /**
     * UV coordinates to sample at
     */
    uv: TextureUV
}

export type TextureSample = FieldPoint

export interface TextureSamplingContext
    <Location extends TextureLocation = TextureLocation> extends
    SamplingContext<Location> {
}

export interface Texture<
        Location extends TextureLocation = TextureLocation,
        Sample extends TextureSample = TextureSample,
        Context extends
            TextureSamplingContext<Location> =
            TextureSamplingContext<Location>
    > extends
    SampleDomain<Location, Sample, Context> {
}

export type ObjectsTextures<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Location extends TextureLocation = TextureLocation,
        Sample extends TextureSample = TextureSample,
        TextureT extends Texture<Location, Sample> = Texture<Location, Sample>
    > =
    MultiObjectsMapped<Objects, TextureT>

export type ObjectsTexturesGrouped<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Location extends TextureLocation = TextureLocation,
        Sample extends TextureSample = TextureSample,
        TextureT extends Texture<Location, Sample> = Texture<Location, Sample>
    > =
    MultiObjectsMappedGrouped<Objects, Groups, TextureT>

export type TexturesTemplated<
        Sample extends FieldPoint = FieldsPoint,
        FinalSample extends FieldPoint = FieldPointPrimitive,
        Location extends TextureLocation = TextureLocation,
        Context extends
            TextureSamplingContext<Location> =
            TextureSamplingContext<Location>,
    > =
    Sample extends FinalSample ?
        Texture<Location, Sample, Context> :
        Sample extends FieldsPoint ?
            {
                [K in keyof Sample]:
                    TexturesTemplated<Sample[K], FinalSample, Location, Context>
            } :
            never

// type ABC = {
//     a: number
//     b: Color
//     c: {
//         field1: number
//         field2: number
//     }
//     d: {
//         uv: Vec2
//         xyz: Vec3
//     }
// }

// type ABC_textures = TexturesTemplated<ABC, FieldPointPrimitive | ABC["c"]>
// let x: ABC_textures = {
//     c: undefined as Texture<TextureLocation, ABC['c']>,
//     d: {
//         uv: undefined as Texture<TextureLocation, Vec2>,
//         xyz: undefined as Texture<TextureLocation, Vec3>
//     }
// }