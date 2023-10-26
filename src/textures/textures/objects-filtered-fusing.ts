import { Vec2 } from "playcanvas-extended";
import { MultiObjectsDomainInternalPreservedGroupsKinds } from "../../fields/domains/multi-objects.js";
import { ObjectsFilteredFusingSampleDomain } from "../../fields/domains/objects-filtered-fusing.js";
import { VectorSampleFunction, VectorSamplingContext } from "../../fields/domains/vector.js";
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, FuseMode } from "../../fields/vectorized/index.js";
import { MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsTemplate, WithMultiObjectsIDs } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureRenderContext, TextureSample, TextureSamplingContext, textureSampleLocationsGridVector, textureTensorSampleUsingVectorSample } from "../texture.js";
import { FieldPointTensor2D, field_point_tensor_encode } from "../../fields/tensor/tensor.js";

export class ObjectsFilteredFusingTexture<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        LocationT extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = LocationT,
        LocationFuseMode extends TextureLocation = LocationT,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        SampleFuseMode extends TextureSample = TextureSample,
        ResultSampleT extends TextureSample = SampleFuseMode,
        ResultSampleElementType extends TextureSample = ResultSampleT,
        InnerSampleT extends TextureSample = SampleFuseMode,
        InnerSampleElementType extends TextureSample = InnerSampleT,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic<NumberTypedArray>,
        SingularContext extends
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            TextureSamplingContext<LocationT, LocationElementType, LocationFuseMode> =
            WithMultiObjectsIDs<Objects, ObjIDsT> &
            MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> &
            TextureSamplingContext<LocationT, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        ResultSampleVector extends
            FieldPointVectorWithMultiObjects<
                    ResultSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    ResultSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        InnerSampleVector extends
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        ResultVectorContext extends
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                ResultSampleT,
                ResultSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                ResultSampleVector
            > =
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                ResultSampleT,
                ResultSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                ResultSampleVector
            >,
        InnerVectorContext extends
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                InnerSampleT,
                InnerSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                InnerSampleVector
            > =
            VectorSamplingContext<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                InnerSampleT,
                InnerSampleElementType,
                SampleFuseMode,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                InnerSampleVector
            >
    >
    extends ObjectsFilteredFusingSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SampleGroups,
        SampleGroupKinds,
        LocationT,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        SampleFuseMode,
        ResultSampleT,
        ResultSampleElementType,
        InnerSampleT,
        InnerSampleElementType,
        SampleContainer,
        SingularContext,
        LocationVector,
        ResultSampleVector,
        InnerSampleVector,
        ResultVectorContext,
        InnerVectorContext
    >
    implements Texture<
        LocationT,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        ResultSampleT,
        ResultSampleElementType,
        SampleFuseMode,
        SampleContainer,
        SingularContext,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        LocationVector,
        ResultSampleVector
        // VectorSamplingContext
    > {
    constructor(
            inner: Texture<
                LocationT,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                InnerSampleT,
                InnerSampleElementType,
                SampleFuseMode,
                SampleContainer,
                SingularContext
                >,
            objectsFilter?: ObjIDsT,
            multiObj?: {
                sample?: {
                    groupKindsTemplate: SampleGroupKinds,
                    groupsTemplate?: SampleGroups
                }
            },
            fuseMode?: FuseMode<SampleFuseMode>
        ) {
        super(
            inner,
            objectsFilter,
            multiObj,
            fuseMode
        )
    }

    render(
        resolution: Vec2,
        context: TextureRenderContext<
            LocationT,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            ResultSampleT,
            ResultSampleElementType,
            SampleFuseMode,
            SampleContainer,
            SingularContext,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LocationVector,
            ResultSampleVector,
            ResultVectorContext
        >): FieldPointTensor2D<ResultSampleElementType> {
        return textureTensorSampleUsingVectorSample(this, resolution, context)
    }
}