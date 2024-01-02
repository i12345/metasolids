import { Vec2 } from "playcanvas-physics-advanced";
import { FieldPointTensorEncodingConstant, FieldPointTensorEncodingVector, FieldPointTensorSystemFactory, FieldPointTensorSystem, FieldPointTensorSystemParameters, FieldPointTensorTopologyProjectorFactoryIdentity } from "../../fields/tensor/index.js";
import { TextureTensorEncoding } from "../../textures/tensor-factory.js";
import { FactoryMappings } from "../../paradigm/processing/processors/factory.js";
import { PropertyPath } from "../../paradigm/trees/path.js";
import { Triangle2DMeshTopologyProjectorFactory, Triangles2DMesh } from "../../fields/index.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, groupKinds } from "../../paradigm/trees/multi-objects-groups.js";
import { SurfaceSample, unwrapping } from "../index.js";
import { FieldPointVector, FieldPointVectorContainer } from "../../fields/vectorized/index.js";
import { NumberTypedArray } from "../../utils/typed-array.js";
import { IndicesTypedArray } from "../../utils/indices-array.js";
import { onlyOne } from "../../utils/only-one.js";

export interface SurfaceTexturingTensorSystemParameters extends FieldPointTensorSystemParameters {
    resolution: Vec2
}

export class SurfaceTexturingTensorSystemFactory<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        SurfaceUVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SurfaceSampleElementType extends SurfaceSample = SurfaceSample,
        SampleProcessingContextT = any,
        SurfaceSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        SurfaceSampleVector extends
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer> =
            FieldPointVector<SurfaceSampleElementType, SurfaceSampleContainer>,
        SurfaceT extends
            unwrapping.uv.SurfaceWithUVUnwrapping<
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    SurfaceSampleElementType,
                    SurfaceSampleContainer,
                    SurfaceSampleVector
                > =
            unwrapping.uv.SurfaceWithUVUnwrapping<
                    IndicesT,
                    SurfaceUVUnwrappingGroup,
                    SurfaceSampleElementType,
                    SurfaceSampleContainer,
                    SurfaceSampleVector
                >,
        ContextT extends
            unwrapping.uv.SurfaceProcessingContextWithUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    SampleProcessingContextT
                > =
            unwrapping.uv.SurfaceProcessingContextWithUVUnwrapping<
                    SurfaceUVUnwrappingGroup,
                    SampleProcessingContextT
                >,
    >
    extends FieldPointTensorSystemFactory<SurfaceT, ContextT> {
    constructor(
            system: FieldPointTensorSystem,
            parameters: SurfaceTexturingTensorSystemParameters,
            mappings: FactoryMappings,
            public readonly surfaceUVUnwrappingGroup?: SurfaceUVUnwrappingGroup
        ) {
        super(
            system,
            parameters,
            new Map(),
            [
                FieldPointTensorEncodingConstant.instance,
                FieldPointTensorEncodingVector.instance,
                new TextureTensorEncoding(),
            ],
            mappings
        )
    }

    protected factory(inputs: MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, any>, item: SurfaceT, context: ContextT): MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, any> {
        const surfaceUVunrwapping = onlyOne(groupKinds(context, unwrapping.uv.SurfaceUVUnwrappingGroupKindsTemplate, this.surfaceUVUnwrappingGroup)).group.get<unwrapping.uv.SurfaceUVUnwrapping>(item)
        const uv_mesh = Triangles2DMesh.build(
            surfaceUVunrwapping.UVs,
            surfaceUVunrwapping.finalIndices,
            { origin: Vec2.ZERO, size: Vec2.ONE }
        )

        const topology_spaceStretch = new Triangle2DMeshTopologyProjectorFactory(uv_mesh, item.mesh.triangles)
        const topology_identity = new FieldPointTensorTopologyProjectorFactoryIdentity()

        this.topologyProjectors.clear()
        for (const space of this.system.spaces)
            this.topologyProjectors.set(space, space.shape.length === 2 ? topology_spaceStretch : topology_identity)
        
        return super.factory(inputs, item, context)
    }
}