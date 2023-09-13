import { Ray } from "playcanvas-extended";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, groupKinds, makeIntractor } from "../../../paradigm/trees/index.js";
import { ExtraFields, FieldPoint, FieldsPointMapped } from "../../../fields/point.js";
import { Texture, TextureLocation, TextureSample, TextureSamplingContext, TexturesTemplated } from "../../../textures/texture.js";
import { SurfaceIndividualTexturesGroupKindsTemplate, SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping, SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping } from "../types.js";
import { change } from "../../../fields/object-algebra.js";
import { Surface, SurfaceInstance, SurfaceSample } from "../../surface.js";
import { Field, SampleDomainLocationFieldKey } from "../../../fields/index.js";
import { FieldsField, Vec2Field, defaultField } from "../../../fields/fields/index.js"
import { VolumeWithSurfacesUVRayCollider, VolumeWithSurfacesUVRayColliderProcessingContext, VolumeWithSurfacesUVRayCollision } from "../../uv-unwrapping/ray-collider.js";
import { VolumeWithSurfacesRayCollider } from "../../ray-collider.js";
import { VolumeProcessingWithSurfaces, VolumeProcessingWithSurfacesContext, VolumeProcessingWithSurfacesInstance, VolumeSurfacesKey } from "../../volume-surfaces.js";
import { Volume, VolumeLocation, VolumeSample, VolumeSamplingContext } from "../../../volumes/volume.js";
import { IndicesTypedArray } from "../../../utils/indices-array.js";
import { FieldPointVector, FieldPointVectorContainer } from "../../../fields/vectorized/index.js";
import { NumberTypedArray } from "../../../utils/typed-array.js";

export interface VolumeWithSurfacesIndividualTexturesRayCollision<
    TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    TextureSampleT extends FieldPoint = FieldPoint,
    TextureSamplesGrouped extends
        MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
        MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>
    > extends VolumeWithSurfacesUVRayCollision {
    samples: TextureSamplesGrouped
}

export interface VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureSampleT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureSampleT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT
                >,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>,
        TextureSampleElementTypesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleElementType> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleElementType>,
        TextureSampleFuseModesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleFuseMode> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleFuseMode>,
        TexturesGrouped extends
            TexturesTemplated<
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplesGrouped,
                    TextureSampleElementTypesGrouped,
                    TextureSampleFuseModesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT
                > =
            TexturesTemplated<
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplesGrouped,
                    TextureSampleElementTypesGrouped,
                    TextureSampleFuseModesGrouped,
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
            SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT,
                    TextureT
                    // TexturesGrouped
                > =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> &
            SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT,
                    TextureT
                    // TexturesGrouped
                >,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode
                > =
            SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode
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
            SurfaceProcessingContextT,
            VolumeProcessingT,
            VolumeProcessingInstanceT,
            VolumeProcessingContextT
        > {
    extraLocationParameters: ExtraFields<TextureLocationT, TextureLocation>
}

interface VolumeWithSurfacesIndividualTexturesRayColliderProcessingContextPrivate<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureSampleT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureSampleT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT
                >,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>,
        TextureSampleElementTypesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleElementType> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleElementType>,
        TextureSampleFuseModesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleFuseMode> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleFuseMode>,
        TexturesGrouped extends
            TexturesTemplated<
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplesGrouped,
                    TextureSampleElementTypesGrouped,
                    TextureSampleFuseModesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT
                > =
            TexturesTemplated<
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplesGrouped,
                    TextureSampleElementTypesGrouped,
                    TextureSampleFuseModesGrouped,
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
            SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT,
                    TextureT
                    // TexturesGrouped
                > =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> &
            SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT,
                    TextureT
                    // TexturesGrouped
                >,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode
                > =
            SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode
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
    VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
        IndicesT,
        UVUnwrappingGroup,
        TextureGroups,
        TextureLocationT,
        TextureLocationElementType,
        TextureLocationFuseMode,
        TextureSampleT,
        TextureSampleElementType,
        TextureSampleFuseMode,
        TextureSamplingContextT,
        TextureT,
        TextureSamplesGrouped,
        TextureSampleElementTypesGrouped,
        TextureSampleFuseModesGrouped,
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
        texture: TextureT
        samplingContext: TextureSamplingContextT
        intract: ReturnType<typeof makeIntractor<TextureSampleT>>
    }[][]
}

export class VolumeWithSurfacesIndividualTexturesRayCollider<
        IndicesT extends IndicesTypedArray = IndicesTypedArray,
        UVUnwrappingGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        TextureLocationT extends TextureLocation = TextureLocation,
        TextureLocationElementType extends TextureLocation = TextureLocationT,
        TextureLocationFuseMode extends TextureLocation = TextureLocationT,
        TextureSampleT extends TextureSample = TextureSample,
        TextureSampleElementType extends TextureSample = TextureSampleT,
        TextureSampleFuseMode extends TextureSample = TextureSampleT,
        TextureSamplingContextT extends
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode> =
            TextureSamplingContext<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
        TextureT extends
            Texture<
                    TextureLocationT,
                    TextureSampleT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT
                > =
            Texture<
                    TextureLocationT,
                    TextureSampleT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT
                >,
        TextureSamplesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleT>,
        TextureSampleElementTypesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleElementType> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleElementType>,
        TextureSampleFuseModesGrouped extends
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleFuseMode> =
            MultiObjectsGroupsMapped<TextureGroups, TextureSampleFuseMode>,
        TexturesGrouped extends
            TexturesTemplated<
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplesGrouped,
                    TextureSampleElementTypesGrouped,
                    TextureSampleFuseModesGrouped,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSamplingContextT
                > =
            TexturesTemplated<
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplesGrouped,
                    TextureSampleElementTypesGrouped,
                    TextureSampleFuseModesGrouped,
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
            SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT,
                    TextureT
                    // TexturesGrouped
                > =
            Surface<IndicesT, VolumeSampleElementType, VolumeSampleContainer, VolumeSampleVector> &
            SurfaceWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    IndicesT,
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT,
                    TextureT
                    // TexturesGrouped
                >,
        SurfaceInstanceT extends
            SurfaceInstance<SurfaceT> =
            SurfaceInstance<SurfaceT>,
        SurfaceProcessingContextT extends
            SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode
                > =
            SurfaceProcessingContextWithIndividualTexturesUsingSurfaceUVUnwrapping<
                    UVUnwrappingGroup,
                    VolumeSampleProcessingContextT,
                    TextureGroups,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode
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
        VolumeWithSurfacesIndividualTexturesRayCollision<
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
        VolumeProcessingT,
        VolumeProcessingInstanceT,
        VolumeProcessingContextT,
        VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
                IndicesT,
                UVUnwrappingGroup,
                TextureGroups,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleT,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSamplingContextT,
                TextureT,
                TextureSamplesGrouped,
                TextureSampleElementTypesGrouped,
                TextureSampleFuseModesGrouped,
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

    init(context: VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
                IndicesT,
                UVUnwrappingGroup,
                TextureGroups,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleT,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSamplingContextT,
                TextureT,
                TextureSamplesGrouped,
                TextureSampleElementTypesGrouped,
                TextureSampleFuseModesGrouped,
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

        type ContextPrivateT = VolumeWithSurfacesIndividualTexturesRayColliderProcessingContextPrivate<
                IndicesT,
                UVUnwrappingGroup,
                TextureGroups,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleT,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSamplingContextT,
                TextureT,
                TextureSamplesGrouped,
                TextureSampleElementTypesGrouped,
                TextureSampleFuseModesGrouped,
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

        const textureGroups = groupKinds(
            context.context[VolumeSurfacesKey],
            SurfaceIndividualTexturesGroupKindsTemplate,
            this.textureGroups
        )

        const sharedContext = {
            [SampleDomainLocationFieldKey]: FieldsField.merge(
                defaultField(<FieldPoint>context.extraLocationParameters) as unknown as FieldsField<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>,
                new FieldsField<TextureLocationT, TextureLocationElementType, TextureLocationFuseMode>({
                    uv: Vec2Field.instance
                } as FieldsPointMapped<TextureLocationT, Field>)
            )
        }

        context_private.textures = context.instance[VolumeSurfacesKey].map(surface => {
            const textures = []
            for (const { group } of textureGroups) {
                const texture = group.get<TextureT>(surface.shared)
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

                texture.init(samplingContext)
            }
            return textures
        })
    }

    private transformCollision(
            collision: VolumeWithSurfacesUVRayCollision,
            context: VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
                IndicesT,
                UVUnwrappingGroup,
                TextureGroups,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleT,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSamplingContextT,
                TextureT,
                TextureSamplesGrouped,
                TextureSampleElementTypesGrouped,
                TextureSampleFuseModesGrouped,
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
        ): VolumeWithSurfacesIndividualTexturesRayCollision<
                TextureGroups,
                TextureSampleT,
                TextureSamplesGrouped
            > {
        type ContextPrivateT = VolumeWithSurfacesIndividualTexturesRayColliderProcessingContextPrivate<
                IndicesT,
                UVUnwrappingGroup,
                TextureGroups,
                TextureLocationT,
                TextureLocationElementType,
                TextureLocationFuseMode,
                TextureSampleT,
                TextureSampleElementType,
                TextureSampleFuseMode,
                TextureSamplingContextT,
                TextureT,
                TextureSamplesGrouped,
                TextureSampleElementTypesGrouped,
                TextureSampleFuseModesGrouped,
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
            context: VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
                    IndicesT,
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT,
                    TextureT,
                    TextureSamplesGrouped,
                    TextureSampleElementTypesGrouped,
                    TextureSampleFuseModesGrouped,
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
            context: VolumeWithSurfacesIndividualTexturesRayColliderProcessingContext<
                    IndicesT,
                    UVUnwrappingGroup,
                    TextureGroups,
                    TextureLocationT,
                    TextureLocationElementType,
                    TextureLocationFuseMode,
                    TextureSampleT,
                    TextureSampleElementType,
                    TextureSampleFuseMode,
                    TextureSamplingContextT,
                    TextureT,
                    TextureSamplesGrouped,
                    TextureSampleElementTypesGrouped,
                    TextureSampleFuseModesGrouped,
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