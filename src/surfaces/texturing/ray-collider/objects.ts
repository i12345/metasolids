import { Ray } from "playcanvas-physics-advanced";
import { makeIntractor, groupKindObjectsGrouped, groupKinds, iterObjects, MultiObjectsGrouped, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplate_Leaf, MultiObjectsMapped, MultiObjectsMappedAgainGrouped, MultiObjectsTemplate, MultiObjectsMappedAgainGroupTypes, MultiObjectsIDsKey, WithMultiObjectsIDs } from "../../../paradigm/trees/index.js";
import { ExtraFields, FieldPoint, FieldsPointMapped } from "../../../fields/point.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplatedWithObjects } from "../../../textures/texture.js";
import { SurfaceObjectsTexturesGroupKinds, SurfaceObjectsTexturesGroupKindsTemplate, SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping, SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping } from "../types.js";
import { change } from "../../../fields/object-algebra.js";
import { Field, SampleDomainLocationFieldKey, groupKindObjectsGroupedWithFields } from "../../../fields/index.js";
import { MultiObjectsDomainInternalPreservedGroupsKinds, MultiObjectsDomainInternalPreservedGroupsKindsTemplate, MultiObjectsSampleDomain } from '../../../fields/domains/index.js'
import { defaultField, FieldsField, Vec2Field } from '../../../fields/fields/index.js'
import { Surface, SurfaceInstance, SurfaceSample } from "../../surface.js";
import { SurfaceProcessingContext } from "../../processing.js";
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeProcessingWithSurfacesInstance, VolumeSurfacesKey } from "../../volume-surfaces.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../../volumes/volume.js";
import { VolumeWithSurfacesUVRayCollider, VolumeWithSurfacesUVRayColliderProcessingContext, VolumeWithSurfacesUVRayCollision } from "../../unwrapping/uv/ray-collider.js";
import { VolumeWithSurfacesRayCollider } from "../../ray-collider.js";
import { IndicesTypedArray } from "../../../utils/indices-array.js";
import { FieldPointVector, FieldPointVectorContainer, FieldPointVectorContainerStatic } from "../../../fields/vectorized/point.js";
import { NumberTypedArray } from "../../../utils/typed-array.js";

export interface VolumeWithSurfacesObjectsTexturesRayCollision<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureSampleT extends FieldPoint = FieldPoint,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>
    > extends VolumeWithSurfacesUVRayCollision {
    samples: any
    // samples: MultiObjectsMappedAgainGrouped<
    //         Objects,
    //         TextureGroups,
    //         TextureSampleT,
    //         TextureSamplesGrouped
    //     >
}

export interface VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, TextureGroups> =
            MultiObjectsGrouped<Objects, TextureGroups>,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                >,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>,
        TexturesGrouped extends
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT
                > =
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT
                >,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplingContextT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleElementType
                > =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplingContextT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleElementType
                >,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    Objects,
                    TextureGroups //,
                    // TexturesGrouped,
                > =
            SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    Objects,
                    TextureGroups //,
                    // TexturesGrouped,
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                > =
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
    > extends
    VolumeWithSurfacesUVRayColliderProcessingContext<
            IndicesT,
            UVUnwrappingGroup,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleContainer,
            VolumeSampleVector,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT
        > {
    extraLocationParameters: ExtraFields<TextureLocationT, TextureLocation>
}

interface VolumeWithSurfacesObjectsTexturesRayColliderProcessingContextPrivate<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, TextureGroups> =
            MultiObjectsGrouped<Objects, TextureGroups>,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                >,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>,
        TexturesGrouped extends
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT
                > =
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT
                >,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplingContextT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleElementType
                > =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplingContextT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleElementType
                >,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT //,
                    // TexturesGrouped,
                > =
            SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT //,
                    // TexturesGrouped,
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                > =
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
    > extends
    VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
            IndicesT,
            UVUnwrappingGroup,
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSampleT,
            TextureSamplingContextT,
            TextureT,
            TextureSamplesGrouped,
            TexturesGrouped,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleContainer,
            VolumeSampleVector,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        > {
    /**
     * textures[i_surface] = information for textures for surface
     */
    textures: {
        texture: Texture<
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            MultiObjectsMappedAgainGrouped<
                Objects,
                TextureGroups,
                TextureSampleT,
                TextureSamplesGrouped
            >,
            MultiObjectsMappedAgainGroupTypes<
                Objects,
                TextureGroups,
                TextureSampleT,
                TextureSamplesGrouped
            >,
            TextureSamplesGrouped,
            FieldPointVectorContainerStatic<NumberTypedArray>,
            TextureSamplingContextT
        >
        samplingContext: TextureSamplingContextT
        intract: ReturnType<typeof makeIntractor<TextureSampleT>>
    }[][]
}

export class VolumeWithSurfacesObjectsTexturesRayCollider<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsTexturesGrouped extends
            MultiObjectsGrouped<Objects, TextureGroups> =
            MultiObjectsGrouped<Objects, TextureGroups>,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                >,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>,
        TexturesGrouped extends
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT
                > =
            TexturesTemplatedWithObjects<
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureSamplesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT
                >,
        VolumeLocationT extends VolumeLocation = VolumeLocation,
        VolumeLocationElementType extends VolumeLocation = VolumeLocationT,
        VolumeLocationFuseMode extends VolumeLocation = VolumeLocationT,
        VolumeSampleT extends VolumeSample = VolumeSample,
        VolumeSampleElementType extends VolumeSample = VolumeSampleT,
        VolumeSampleFuseMode extends VolumeSample = VolumeSampleT,
        VolumeSampleContainer extends FieldPointVectorContainer<NumberTypedArray> = FieldPointVectorContainer<NumberTypedArray>,
        VolumeSampleVector extends
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer> =
            FieldPointVector<VolumeSampleElementType, VolumeSampleContainer>,
        VolumeSampleProcessingContextT = any,
        VolumeSamplingContextT extends
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT> =
            VolumeSamplingContext<VolumeLocationT, VolumeLocationElementType, VolumeLocationFuseMode, VolumeSampleProcessingContextT>,
        VolumeT extends
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                > =
            Volume<
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT
                >,
        SurfaceT extends
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplingContextT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleElementType
                > =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> &
            SurfaceWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSampleT,
                    TextureSamplingContextT,
                    TextureT //,
                    // TexturesGrouped,
                    // SampleElementType
                >,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT //,
                    // TexturesGrouped,
                > =
            SurfaceProcessingContextWithObjectsTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureSampleT //,
                    // TexturesGrouped,
                >,
        VolumeProcessingT extends
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                > =
            VolumeProcessingWithSurfaces<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT
                >,
        VolumeProcessingInstanceT extends
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                > =
            VolumeProcessingWithSurfacesInstance<
                    IndicesT,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    VolumeProcessingT
                >,
        VolumeProcessingContextT extends
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                > =
            VolumeProcessingWithSurfacesContext<
                    VolumeSampleProcessingContextT,
                    SurfaceProcessingContextT
                >,
    > implements
    VolumeWithSurfacesRayCollider<
        IndicesT,
        VolumeWithSurfacesObjectsTexturesRayCollision<
            Objects,
            TextureGroups,
            TextureSampleT,
            TextureSamplesGrouped
        >,
        VolumeLocationT,
        VolumeLocationElementType,
        VolumeLocationFuseMode,
        VolumeSampleT,
        VolumeSampleElementType,
        VolumeSampleFuseMode,
        VolumeSampleContainer,
        VolumeSampleVector,
        VolumeSampleProcessingContextT,
        VolumeSamplingContextT,
        VolumeT,
        SurfaceT,
        SurfaceInstanceT,
        SurfaceProcessingContextT,
        VolumeProcessingWithSurfaces<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleContainer,
                VolumeSampleVector,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
                SurfaceT
            >,
        VolumeProcessingWithSurfacesInstance<
                IndicesT,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleContainer,
                VolumeSampleVector,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
                SurfaceT,
                SurfaceInstanceT//,
                // VolumeProcessingT
            >,
        VolumeProcessingWithSurfacesContext<
                VolumeSampleProcessingContextT,
                SurfaceProcessingContextT
            >,
        VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
                IndicesT,
                UVUnwrappingGroup,
                Objects,
                TextureGroups,
                ObjectsTexturesGrouped,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleT,
                TextureSamplingContextT,
                TextureT,
                TextureSamplesGrouped,
                TexturesGrouped,
                VolumeLocationT,
                VolumeLocationElementType,
                VolumeLocationFuseMode,
                VolumeSampleT,
                VolumeSampleElementType,
                VolumeSampleFuseMode,
                VolumeSampleContainer,
                VolumeSampleVector,
                VolumeSampleProcessingContextT,
                VolumeSamplingContextT,
                VolumeT,
                SurfaceT,
                SurfaceInstanceT,
                SurfaceProcessingContextT,
                VolumeProcessingWithSurfaces<
                        IndicesT,
                        VolumeLocationT,
                        VolumeLocationElementType,
                        VolumeLocationFuseMode,
                        VolumeSampleT,
                        VolumeSampleElementType,
                        VolumeSampleFuseMode,
                        VolumeSampleContainer,
                        VolumeSampleVector,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeT,
                        SurfaceT
                    >,
                VolumeProcessingWithSurfacesInstance<
                        IndicesT,
                        VolumeLocationT,
                        VolumeLocationElementType,
                        VolumeLocationFuseMode,
                        VolumeSampleT,
                        VolumeSampleElementType,
                        VolumeSampleFuseMode,
                        VolumeSampleContainer,
                        VolumeSampleVector,
                        VolumeSampleProcessingContextT,
                        VolumeSamplingContextT,
                        VolumeT,
                        SurfaceT,
                        SurfaceInstanceT //,
                        // VolumeProcessingT
                    >,
                VolumeProcessingWithSurfacesContext<
                        VolumeSampleProcessingContextT,
                        SurfaceProcessingContextT
                    >
            >
    > {
    private readonly UVcollider: VolumeWithSurfacesUVRayCollider<
            IndicesT,
            UVUnwrappingGroup,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleContainer,
            VolumeSampleVector,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT
        >

    constructor(
        public readonly UVunwrappingGroup?: UVUnwrappingGroup,
        public readonly textureGroups?: TextureGroups
    ) {
        this.UVcollider = new VolumeWithSurfacesUVRayCollider(UVunwrappingGroup)
    }

    init(context: VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
            IndicesT,
            UVUnwrappingGroup,
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSampleT,
            TextureSamplingContextT,
            TextureT,
            TextureSamplesGrouped,
            TexturesGrouped,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleContainer,
            VolumeSampleVector,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        >): void {
        this.UVcollider.init(context)

        type ContextPrivateT = VolumeWithSurfacesObjectsTexturesRayColliderProcessingContextPrivate<
            IndicesT,
            UVUnwrappingGroup,
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSampleT,
            TextureSamplingContextT,
            TextureT,
            TextureSamplesGrouped,
            TexturesGrouped,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleContainer,
            VolumeSampleVector,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        >

        const context_private = context as ContextPrivateT

        const textureGroups = groupKindObjectsGroupedWithFields<Objects, TextureGroups, ObjectsTexturesGrouped, SurfaceObjectsTexturesGroupKinds, TextureT, TextureSampleT>(
            undefined!,
            context.context[VolumeSurfacesKey],
            SurfaceObjectsTexturesGroupKindsTemplate,
            this.textureGroups
        )

        const sharedContext = {
            [MultiObjectsIDsKey]: (<Partial<WithMultiObjectsIDs>>context.context)[MultiObjectsIDsKey],
            [SampleDomainLocationFieldKey]: FieldsField.merge(
                defaultField(<FieldPoint>context.extraLocationParameters) as unknown as FieldsField<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
                new FieldsField<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>({
                    uv: Vec2Field.instance
                } as FieldsPointMapped<TextureLocationT, Field>)
            )
        }

        context_private.textures = context.instance[VolumeSurfacesKey].map(surface => {
            const textures = []
            for (const { group, objects } of textureGroups) {
                const objectsTextures = group.get<MultiObjectsMapped<Objects, TextureT>>(surface.shared)
                // This will eventually need to be changed
                // because the context is where private variables are stored.
                // There could be a [Private] field in the context for this
                // and this group could be automatically covered by the sole
                // group kind that could be added

                type ObjIDsT = IndicesTypedArray
                type ObjIDsContainer = FieldPointVectorContainerStatic<ObjIDsT>

                type TextureLocationContainer = FieldPointVectorContainerStatic
                type TextureSampleContainer = FieldPointVectorContainerStatic

                type CombinedTexture = Texture<
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    MultiObjectsMappedAgainGrouped<
                        Objects,
                        TextureGroups,
                        TextureSampleT,
                        TextureSamplesGrouped
                    >,
                    MultiObjectsMappedAgainGroupTypes<
                        Objects,
                        TextureGroups,
                        TextureSampleT,
                        TextureSamplesGrouped
                    >,
                    TextureSamplesGrouped,
                    FieldPointVectorContainerStatic<NumberTypedArray>,
                    TextureSamplingContextT
                >

                const texture = MultiObjectsSampleDomain.build<
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        {},
                        MultiObjectsDomainInternalPreservedGroupsKinds,
                        {},
                        MultiObjectsDomainInternalPreservedGroupsKinds,
                        TextureLocationT,
                        TextureLocationElementType,
                        TextureLocationFuseMode,
                        TextureLocationContainer,
                        TextureSampleT,
                        TextureSampleContainer,
                        TextureSamplingContextT //,
                        // TextureT,
                        // TextureSamplingContextT
                    >(
                    objectsTextures as any,
                    objects.template,
                    group.field.inner
                ) as unknown as CombinedTexture

                const specializedContext = group.get<TextureSamplingContextT>(context.context) ?? {}

                const samplingContext = (specializedContext ? {
                    ...sharedContext,
                    ...specializedContext,
                    [SampleDomainLocationFieldKey]: FieldsField.merge(
                        sharedContext[SampleDomainLocationFieldKey],
                        specializedContext[SampleDomainLocationFieldKey] as FieldsField<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>
                    )
                } : sharedContext) as unknown as TextureSamplingContextT

                textures.push({
                    intract: group.set,
                    texture,
                    samplingContext
                })

                iterObjects(
                    objectsTextures,
                    objects.template,
                    (texture: TextureT) => texture.init(samplingContext)
                )
            }
            return textures
        })
    }

    private transformCollision(
            collision: VolumeWithSurfacesUVRayCollision,
            context: VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
                    IndicesT,
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSamplingContextT,
                    TextureT,
                    TextureSamplesGrouped,
                    TexturesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingInstanceT,
                    VolumeProcessingContextT
                >
        ): VolumeWithSurfacesObjectsTexturesRayCollision<
                Objects,
                TextureGroups,
                TextureSampleT,
                TextureSamplesGrouped
            > {
        type ContextPrivateT = VolumeWithSurfacesObjectsTexturesRayColliderProcessingContextPrivate<
            IndicesT,
            UVUnwrappingGroup,
            Objects,
            TextureGroups,
            ObjectsTexturesGrouped,
            TextureLocationT,
            TextureLocationElementType,
            TextureLocationFuseMode,
            TextureSampleT,
            TextureSamplingContextT,
            TextureT,
            TextureSamplesGrouped,
            TexturesGrouped,
            VolumeLocationT,
            VolumeLocationElementType,
            VolumeLocationFuseMode,
            VolumeSampleT,
            VolumeSampleElementType,
            VolumeSampleFuseMode,
            VolumeSampleContainer,
            VolumeSampleVector,
            VolumeSampleProcessingContextT,
            VolumeSamplingContextT,
            VolumeT,
            SurfaceT,
            SurfaceInstanceT,
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        >

        const context_private = context as ContextPrivateT

        const samples = {} as TextureSamplesGrouped

        const location = change<TextureLocationT, TextureLocation, {}>({ uv: collision.uv }, [], context.extraLocationParameters)

        for (const { texture, samplingContext, intract } of context_private.textures[collision.i_surface])
            intract(samples, texture.sample(location, samplingContext))

        return {
            ...collision,
            samples
        }
    }

    sample_multiple(
            ray: Ray,
            context: VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
                    IndicesT,
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSamplingContextT,
                    TextureT,
                    TextureSamplesGrouped,
                    TexturesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingInstanceT,
                    VolumeProcessingContextT
                >
        ) {
        return this.UVcollider.sample_multiple(ray, context).map(collision => this.transformCollision(collision, context))
    }

    sample(
            ray: Ray,
            context: VolumeWithSurfacesObjectsTexturesRayColliderProcessingContext<
                    IndicesT,
                    UVUnwrappingGroup,
                    Objects,
                    TextureGroups,
                    ObjectsTexturesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSamplingContextT,
                    TextureT,
                    TextureSamplesGrouped,
                    TexturesGrouped,
                    VolumeLocationT,
                    VolumeLocationElementType,
                    VolumeLocationFuseMode,
                    VolumeSampleT,
                    VolumeSampleElementType,
                    VolumeSampleFuseMode,
                    VolumeSampleContainer,
                    VolumeSampleVector,
                    VolumeSampleProcessingContextT,
                    VolumeSamplingContextT,
                    VolumeT,
                    SurfaceT,
                    SurfaceInstanceT,
                    SurfaceProcessingContextT,
                    VolumeProcessingT,
                    VolumeProcessingInstanceT,
                    VolumeProcessingContextT
                >
        ) {
        const collision = this.UVcollider.sample(ray, context)
        if (collision)
            return this.transformCollision(collision, context)
        return undefined
    }
}