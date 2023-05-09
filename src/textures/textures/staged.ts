import { CompositeSampleDomain, LocationFieldObserverSampleDomain, TransformingSampleDomain } from "../../fields/index.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";

export class StagedTexture<
        Location extends TextureLocation = TextureLocation,
        Sample extends TextureSample = TextureSample,
        Context extends
            TextureSamplingContext<Location> =
            TextureSamplingContext<Location>
    > extends
    TransformingSampleDomain<
        Location, Sample, Context,
        Location, Sample, Context
    > {
    constructor(
            inner: Texture<Location, Sample, Context>,
            public stage = 0
        ) {
        super(inner)
    }
}

export type StageAndTexture<
        LocationT extends TextureLocation = TextureLocation,
        SampleT extends TextureSample = TextureSample,
        ContextT extends
            TextureSamplingContext<LocationT> =
            TextureSamplingContext<LocationT>,
        TextureT extends
            Texture<LocationT, SampleT, ContextT> =
            Texture<LocationT, SampleT, ContextT>
    > = [stage: number, opaqueTexture: TextureT]

export function opaqueStagedTexture<
        LocationT extends TextureLocation = TextureLocation,
        SampleT extends TextureSample = TextureSample,
        ContextT extends
            TextureSamplingContext<LocationT> =
            TextureSamplingContext<LocationT>,
        TextureT extends
            Texture<LocationT, SampleT, ContextT> =
            Texture<LocationT, SampleT, ContextT>
    >(texture: TextureT): StageAndTexture<LocationT, SampleT, ContextT, TextureT> {
    if (texture instanceof LocationFieldObserverSampleDomain)
        return opaqueStagedTexture(texture.inner as TextureT)
    else if (texture instanceof StagedTexture)
        return [texture.stage, opaqueStagedTexture(texture.inner as TextureT)[1]]
    else if (texture instanceof CompositeSampleDomain)
        return [
            Math.max(...texture.children.map(child => opaqueStagedTexture(child)[0])),
            texture
        ]
    
    return [0, texture]
}