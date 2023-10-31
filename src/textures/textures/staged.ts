import { FusedVectorSamplingContext, LocationFieldObserverSampleDomain, MultiObjectsSampleDomain, TransformingSampleDomain } from "../../fields/domains/index.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "../../fields/vectorized/index.js";
import { MultiObjectsTemplate } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../paradigm/arrays/indices-array.js";
import { Reflect_entries } from "../../utils/reflect-entries.js";
import { NumberTypedArray } from "../../paradigm/arrays/typed-array.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";

export class StagedTexture<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Context extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    SampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    SampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
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
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
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
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Context,
        LocationVector,
        SampleVector,
        VectorContext,

        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Context,
        LocationVector,
        SampleVector,
        VectorContext
    > {
    protected readonly transformsLocation = false
    protected readonly transformsSample = false

    constructor(
            inner: Texture<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Sample,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    Context,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    LocationVector,
                    SampleVector,
                    VectorContext
                >,
            public stage = 0
        ) {
        super(inner)
    }
}

export type StageAndTexture<
        LocationT extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = LocationT,
        LocationFuseMode extends TextureLocation = LocationT,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        SampleT extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = SampleT,
        SampleFuseMode extends TextureSample = SampleT,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        ContextT extends
            TextureSamplingContext<LocationT, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<LocationT, LocationElementType, LocationFuseMode>,
        TextureT extends
            Texture<
                    LocationT,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleT,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    ContextT
                > =
            Texture<
                    LocationT,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleT,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    ContextT
                >
    > = [stage: number, opaqueTexture: TextureT]

export function opaqueStagedTexture<
        LocationT extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = LocationT,
        LocationFuseMode extends TextureLocation = LocationT,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        SampleT extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = SampleT,
        SampleFuseMode extends TextureSample = SampleT,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        ContextT extends
            TextureSamplingContext<LocationT, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<LocationT, LocationElementType, LocationFuseMode>,
        TextureT extends
            Texture<
                    LocationT,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleT,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    ContextT
                > =
            Texture<
                    LocationT,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleT,
                    SampleElementType,
                    SampleFuseMode,
                    SampleContainer,
                    ContextT
                >
    >(texture: TextureT): StageAndTexture<
        LocationT,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        SampleT,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        ContextT,
        TextureT
    > {
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