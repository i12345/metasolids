import { Vec2 } from "playcanvas-extended";
import { FieldPoint, FieldsPoint, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsMappedGrouped, MultiObjectsTemplate, SampleDomain, SamplingContext } from "../fields/index.js";

export type TextureUV = Vec2

export interface TextureLocation extends FieldsPoint {
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