import { CompositeSampleDomain, FusedVectorSamplingContext, LocationFieldObserverSampleDomain, MultiObjectsSampleDomain, TransformingSampleDomain } from "../../fields/domains/index.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "../../fields/vectorized/index.js";
import { MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { Reflect_entries } from "../../utils/reflect-entries.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";

export class StagedTexture<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        Location extends TextureLocation = TextureLocation,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Context extends
            TextureSamplingContext<Location> =
            TextureSamplingContext<Location>,
        LocationVector extends
            FieldPointVector<Location, LocationContainer> =
            FieldPointVector<Location, LocationContainer>,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    Location,
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                > =
            FusedVectorSamplingContext<
                    Location,
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationVector,
                    SampleVector
                >,
    > extends
    TransformingSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,

        Location,
        LocationContainer,
        Sample,
        SampleContainer,
        Context,
        LocationVector,
        SampleVector,
        VectorContext,

        Location,
        LocationContainer,
        Sample,
        SampleContainer,
        Context,
        LocationVector,
        SampleVector,
        VectorContext
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
    else if (texture instanceof MultiObjectsSampleDomain)
        return [
            Math.max(...Reflect_entries(texture.children).map(([key, child]) => opaqueStagedTexture(child)[0])),
            texture
        ]
    
    return [0, texture]
}