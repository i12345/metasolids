import { Tensor, Rank } from "@tensorflow/tfjs";
import { Vec2 } from "playcanvas-extended";
import { MappingSampleDomain } from "../../fields/domains/mapping.js";
import { VectorSamplingContext } from "../../fields/domains/vector.js";
import { FieldPointMapped, FieldPointNumbers } from "../../fields/point.js";
import { FieldPointVector, FieldPointVectorContainerStatic } from "../../fields/vectorized/index.js";
import { MultiObjectsGroupedObjectsKey, MultiObjectsTemplate, PropertyMapping, PropertyPath, object_mapped } from "../../paradigm/trees/index.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, textureSampleLocationsGridVector } from "../texture.js";
import { FieldPointTensor2D, field_point_tensor_encode } from "../../fields/tensor/tensor.js";
import { SampleDomainLocationFieldKey } from "../../fields/domain.js";

export class MappingTexture<
        Location extends TextureLocation = TextureLocation,
        LocationElementType extends TextureLocation = Location,
        LocationFuseMode extends TextureLocation = Location,
        LocationContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Sample extends TextureSample = TextureSample,
        SampleElementType extends TextureSample = Sample,
        SampleFuseMode extends TextureSample = Sample,
        SampleContainer extends FieldPointVectorContainerStatic<NumberTypedArray> = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode> =
            TextureSamplingContext<Location, LocationElementType, LocationFuseMode>,
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
    extends MappingSampleDomain<
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
        SampleVector,
        VectorContext
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
        VectorContext
    > {
    constructor(
            mappings?: PropertyMapping[]
        ) {
        super(mappings)
    }

    render(resolution: Vec2, context: VectorContext): FieldPointTensor2D<SampleElementType> {
        const locations = field_point_tensor_encode(context[SampleDomainLocationFieldKey].elementType, [resolution.y, resolution.x], undefined, textureSampleLocationsGridVector(resolution))

        function objGroupRemoved(path: PropertyPath) {
            const objGroupIndex = path.indexOf(MultiObjectsGroupedObjectsKey)
            if (objGroupIndex === -1)
                return path
            else return [...path.slice(0, objGroupIndex), ...path.slice(objGroupIndex + 1)]
        }

        const mappings_objGroupRemoved = this.mappings.map(({ from, to }) => ({
            from: objGroupRemoved(from),
            to: objGroupRemoved(to),
        }))

        return <FieldPointTensor2D<SampleElementType>>object_mapped(locations, mappings_objGroupRemoved)
    }
}