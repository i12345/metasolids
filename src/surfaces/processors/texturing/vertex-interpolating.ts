import { FieldPoint, groupKinds, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsInfluencesGroupsDefault } from "../../../fields/index.js";
import { Processor } from "../../../processor/processor.js";
import { TextureLocation, VertexInterpolatingTexture } from "../../../textures/index.js";
import { onlyOne } from "../../../utils/only-one.js";
import { PropertyPath } from "../../../utils/property-path.js";
import { SurfaceProcessingContext } from "../../processor.js";
import { Surface, SurfaceSample } from "../../surface.js";
import { SurfaceSampleProcessingContextWithIndividualTextureLocations, SurfaceSampleWithIndividualTextureLocations, SurfaceTextureLocationsGroupKinds, SurfaceTextureLocationsGroupKindsTemplate, SurfaceTextureLocationsGroupsDefault, SurfaceTexturesGroupKinds } from "./types.js";

export const SurfaceVertexInterpolatingGroupsKindKey = Symbol("group-kind:surface:vertex-interpolating")
export interface SurfaceVertexInterpolatingGroupsKind extends MultiObjectsGroupsKindsTemplate {
    [SurfaceVertexInterpolatingGroupsKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}
export const SurfaceVertexInterpolatingGroupsKindTemplate: SurfaceVertexInterpolatingGroupsKind = {
    [SurfaceVertexInterpolatingGroupsKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export interface SurfaceVertexInterpolatingGroupsDefault
    extends MultiObjectsGroupsTemplate,
    MultiObjectsInfluencesGroupsDefault,
    SurfaceTextureLocationsGroupsDefault {
    // NormalGroupsDefault {
}

export type SurfaceSampleWithInterpolatingValues<
        TextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
    > =
    SurfaceSample &
    SurfaceSampleWithIndividualTextureLocations<TextureLocationGroup> &
    MultiObjectsGroupsMapped<InterpolatingGroups, InterpolatingValue>

export type SurfaceSampleProcessingContextWithInterpolatingValues<
        TextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
    > =
    SurfaceSampleProcessingContextWithIndividualTextureLocations<TextureLocationGroup> &
    MultiObjectsGroupsProcessingContext<
        InterpolatingGroups,
        InterpolatingGroupsKind
    >

export type SurfaceWithInterpolatingValueTextures<
        TextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        SurfaceSampleT extends
            SurfaceSampleWithInterpolatingValues<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue
                > =
            SurfaceSampleWithInterpolatingValues<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue
                >
    > =
    Surface<SurfaceSampleT> &
    MultiObjectsGroupsMapped<
        InterpolatingGroups,
        VertexInterpolatingTexture<InterpolatingValue>
    >

export type SurfaceWithInterpolatingValueTexturesProcessingContext<
        TextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        SampleProcessingContextT extends
            SurfaceSampleProcessingContextWithInterpolatingValues<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithInterpolatingValues<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            >
    > =
    SurfaceProcessingContext<SampleProcessingContextT> &
    MultiObjectsGroupsProcessingContext<
        TextureLocationGroup,
        SurfaceTextureLocationsGroupKinds
    > &
    MultiObjectsGroupsProcessingContext<
        InterpolatingGroups,
        SurfaceTexturesGroupKinds
    >

export class SurfaceWithInterpolatingValueTexturesProcessor<
        TextureLocationGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        InterpolatingGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        InterpolatingValue extends FieldPoint = FieldPoint,
        SurfaceSampleT extends
            SurfaceSampleWithInterpolatingValues<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue
                > =
            SurfaceSampleWithInterpolatingValues<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue
                >,
        SurfaceSampleProcessingContextT extends
            SurfaceSampleProcessingContextWithInterpolatingValues<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            > =
            SurfaceSampleProcessingContextWithInterpolatingValues<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds
            >,
        SurfaceT extends
            SurfaceWithInterpolatingValueTextures<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    SurfaceSampleT
                > =
            SurfaceWithInterpolatingValueTextures<
                    TextureLocationGroup,
                    InterpolatingGroups,
                    InterpolatingValue,
                    SurfaceSampleT
                >,
        SurfaceProcessingContextT extends
            SurfaceWithInterpolatingValueTexturesProcessingContext<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds,
                SurfaceSampleProcessingContextT
            > =
            SurfaceWithInterpolatingValueTexturesProcessingContext<
                TextureLocationGroup,
                InterpolatingGroups,
                InterpolatingGroupKinds,
                SurfaceSampleProcessingContextT
            >
    > implements
    Processor<SurfaceT, SurfaceProcessingContextT> {
    private _dependencies: PropertyPath[]
    
    get dependencies() {
        return this._dependencies
    }
    
    constructor(
        public interpolatingGroupsKinds: InterpolatingGroupKinds,
        public interpolatingGroups?: InterpolatingGroups,
        public textureLocationGroup?: TextureLocationGroup
    ) {
    }
    
    init(context: SurfaceProcessingContextT): void {
        const { group: textureLocationGroup } =
            onlyOne(groupKinds(
                    context,
                    SurfaceTextureLocationsGroupKindsTemplate,
                    this.textureLocationGroup
                ))

        const interpolatingGroups =
            groupKinds(
                    context.sample,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
            )
        
        this._dependencies = [
            textureLocationGroup.path,
            ...[...interpolatingGroups].map(({ group: { path } }) => path)
        ]
    }

    process(surface: SurfaceT, context: SurfaceProcessingContextT): void {
        const { group: textureLocationGroup } =
            onlyOne(groupKinds(
                    context,
                    SurfaceTextureLocationsGroupKindsTemplate,
                    this.textureLocationGroup
                ))
        
        const UVs = surface.samples.map(sample =>
            textureLocationGroup.get<TextureLocation>(sample).uv)

        const interpolatingGroups =
            groupKinds(
                    context.sample,
                    this.interpolatingGroupsKinds,
                    this.interpolatingGroups
                )

        for (const { group: interpolatingGroup } of interpolatingGroups) {
            const values = surface.samples.map(sample => interpolatingGroup.get<InterpolatingValue>(sample))
            const texture = new VertexInterpolatingTexture(values, UVs, surface.mesh.triangles)
            interpolatingGroup.set(surface, texture)
        }
    }
}