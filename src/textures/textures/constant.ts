import { Vec2 } from "playcanvas-extended";
import { ConstantSampleDomain } from "../../fields/domains/constant.js";
import { VectorSamplingContext } from "../../fields/domains/vector.js";
import { FieldPointVectorContainerStatic, FieldPointVector, field_point_vectorized_new } from "../../fields/vectorized/point.js";
import { MultiObjectsTemplate } from "../../paradigm/trees/multi-objects.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";
import { FieldPointTensor2D, field_point_tensor_encode, field_point_tensor_map } from "../../fields/tensor/tensor.js";
import { Field } from "../../fields/field.js";

export class ConstantTexture<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Context extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        SampleVector extends
            FieldPointVector<SampleElementType, SampleContainer> =
            FieldPointVector<SampleElementType, SampleContainer>,
        VectorContext extends
            VectorSamplingContext<
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
            VectorSamplingContext<
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
                >
    >
    extends ConstantSampleDomain<
        Location,
        Sample,
        LocationElementType,
        LocationFuseMode,
        SampleElementType,
        SampleFuseMode,
        Context
    >
    implements Texture<
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
    > {
    constructor(
            value: Sample,
            field?: Field<Sample, SampleElementType, SampleFuseMode>
        ) {
        super(value, field)
    }
    
    render(resolution: Vec2, context: Context): FieldPointTensor2D<SampleElementType> {
        const vector1 = field_point_vectorized_new<SampleElementType, FieldPointVectorContainerStatic>(this.field.elementType, 1, false, undefined, <SampleElementType><unknown>this.value)
        const tensor1 = field_point_tensor_encode(this.field.elementType, [1, 1], undefined, vector1)
        return field_point_tensor_map(
            this.field.elementType,
            tensor1,
            raw => raw.broadcastTo([resolution.y, resolution.x])
        )
    }
}