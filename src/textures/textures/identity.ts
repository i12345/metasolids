import { Vec2 } from "playcanvas-physics-advanced";
import { FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "../../fields/vectorized/point.js";
import { MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureRenderContext, TextureSample } from "../texture.js";
import { FieldPointTensor2D } from "../../fields/tensor/tensor.js";
import { IdentitySampleDomain } from "../../fields/domains/identity.js";
import { SamplingContext } from "../../fields/index.js";
import { FusedVectorSamplingContext } from "../../fields/domains/fusing.js";
import * as tf from "@tensorflow/tfjs"
import { UVColorTexture } from "./uv-color.js";

export class IdentityTexture<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationSample extends TextureLocation & TextureSample = TextureLocation & TextureSample,
        LocationSampleElementType extends TextureLocation & TextureSample = LocationSample,
        LocationSampleFuseMode extends TextureLocation & TextureSample = LocationSample,
        LocationSampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Context extends
            SamplingContext<LocationSample, LocationSampleElementType, LocationSampleFuseMode> =
            SamplingContext<LocationSample, LocationSampleElementType, LocationSampleFuseMode>,
        LocationSampleVector extends
            FieldPointVectorWithMultiObjects<
                    LocationSampleElementType,
                    LocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    LocationSampleElementType,
                    LocationSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        VectorContext extends
            FusedVectorSamplingContext<
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationSampleVector,
                    LocationSampleVector
                > =
            FusedVectorSamplingContext<
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    LocationSample,
                    LocationSampleElementType,
                    LocationSampleFuseMode,
                    LocationSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    Context,
                    LocationSampleVector,
                    LocationSampleVector
                >,
    >
    extends IdentitySampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        LocationSample,
        LocationSampleElementType,
        LocationSampleFuseMode,
        LocationSampleContainer,
        Context,
        LocationSampleVector,
        VectorContext
    >
    implements Texture<
        LocationSample,
        LocationSampleElementType,
        LocationSampleFuseMode,
        LocationSampleContainer,
        LocationSample,
        LocationSampleElementType,
        LocationSampleFuseMode,
        LocationSampleContainer,
        Context,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        LocationSampleVector,
        LocationSampleVector,
        VectorContext
    > {
    constructor() {
        super()
    }
    
    render(resolution: Vec2, context: TextureRenderContext<
            LocationSample,
            LocationSampleElementType,
            LocationSampleFuseMode,
            LocationSampleContainer,
            LocationSample,
            LocationSampleElementType,
            LocationSampleFuseMode,
            LocationSampleContainer,
            Context,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LocationSampleVector,
            LocationSampleVector,
            VectorContext
        >): FieldPointTensor2D<LocationSampleElementType> {
        return <FieldPointTensor2D<LocationSampleElementType>>{
            uv: UVColorTexture.prototype.render(resolution, <any>context)
        }
    }
}