import { Vec2 } from "playcanvas-extended";
import { FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects } from "../../fields/vectorized/point.js";
import { MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureSample } from "../texture.js";
import { FieldPointTensor2D } from "../../fields/tensor/tensor.js";
import { IdentitySampleDomain } from "../../fields/domains/identity.js";
import { SamplingContext } from "../../fields/index.js";
import { FusedVectorSamplingContext } from "../../fields/domains/fusing.js";
import * as tf from "@tensorflow/tfjs"

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
    
    render(resolution: Vec2, context: Context): FieldPointTensor2D<LocationSampleElementType> {
        const uv = <FieldPointTensor2D<Vec2>>{
            x: tf.broadcastTo(tf.range(0, resolution.x).div(resolution.x).expandDims(0), [resolution.y, resolution.x]),
            y: tf.broadcastTo(tf.range(0, resolution.y).div(resolution.y).expandDims(1), [resolution.y, resolution.x]),
        }

        return <FieldPointTensor2D<LocationSampleElementType>>{ uv }
    }
}