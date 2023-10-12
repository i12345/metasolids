import { Tensor, Rank } from "@tensorflow/tfjs";
import { Vec2 } from "playcanvas-extended";
import { RemappedSampleDomain } from "../../fields/domains/remapped.js";
import { VectorSamplingContext } from "../../fields/domains/vector.js";
import { FieldPointMapped } from "../../fields/point.js";
import { FieldPointNumbers } from "../../fields/numbers.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../../fields/vectorized/index.js";
import { MultiObjectsTemplate, PropertyMapping, WithMultiObjectsIDs, object_mapped } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext } from "../texture.js";
import { FieldPointTensor2D } from "../../fields/tensor/tensor.js";

export class RemappedTexture<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Intermediate extends TextureSample = TextureSample,
        IntermediateElementType extends TextureSample = Intermediate,
        IntermediateFuseMode extends TextureSample = Intermediate,
        IntermediateContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> &
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            Partial<WithMultiObjectsIDs<Objects, ObjIDsT>> &
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        IntermediateVector extends FieldPointVector<IntermediateElementType, IntermediateContainer> = FieldPointVector<IntermediateElementType, IntermediateContainer>,
        SampleVector extends FieldPointVector<SampleElementType, SampleContainer> = FieldPointVector<SampleElementType, SampleContainer>,
        IntermediateVectorContext extends
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                > =
            VectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    Intermediate,
                    IntermediateElementType,
                    IntermediateFuseMode,
                    IntermediateContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    IntermediateVector
                >,
        SampleVectorContext extends
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
                    SingularContext,
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
                    SingularContext,
                    LocationVector,
                    SampleVector
                >
    >
    extends RemappedSampleDomain<
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        Intermediate,
        IntermediateElementType,
        IntermediateFuseMode,
        IntermediateContainer,
        Sample,
        SampleElementType,
        SampleFuseMode,
        SampleContainer,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SingularContext,
        LocationVector,
        IntermediateVector,
        SampleVector,
        IntermediateVectorContext,
        SampleVectorContext
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
        SingularContext,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        LocationVector,
        SampleVector,
        SampleVectorContext
    > {
    constructor(
        inner: Texture<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                Intermediate,
                IntermediateElementType,
                IntermediateFuseMode,
                IntermediateContainer,
                SingularContext,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LocationVector,
                IntermediateVector,
                IntermediateVectorContext
            >,
        mappings?: PropertyMapping[]
    ) {
        super(
            inner,
            mappings
        )
    }

    render(resolution: Vec2, context: SampleVectorContext): FieldPointTensor2D<SampleElementType> {
        const inner = <Texture<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Intermediate,
            IntermediateElementType,
            IntermediateFuseMode,
            IntermediateContainer,
            SingularContext,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LocationVector,
            IntermediateVector,
            IntermediateVectorContext
        >>this.inner
        
        return object_mapped(
            inner.render(resolution, this.transformContext_vectorized(context)),
            this.mappings
        )
    }
}