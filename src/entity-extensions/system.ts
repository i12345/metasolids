import { AppBase, ComponentSystem, Entity } from "playcanvas-extended"
import { MultiObjectsGroupsTemplate, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsKindsTemplateMapped, MultiObjectsInfluencesGroupKindsTemplate, MultiObjectsInfluencesGroupKindKey, MultiObjectsInfluencesGroupKinds, MultiObjectsInfluencesGroupsDefaultTemplate } from "../fields/multi-objects-fields-point.js"
import { processors, solids, surfaces, volumes } from "../index.js"
import { VolumeProcessor } from "../volumes/processor.js"
import { VolumeComponent } from "./component.js"
import { VolumeComponentData } from "./data.js"
import { SurfaceTextureLocationsGroupKindKey, SurfaceTextureLocationsGroupKinds, SurfaceTextureLocationsGroupKindsTemplate, SurfaceTextureLocationsGroupsDefaultTemplate, SurfaceTexturesGroupKindKey, SurfaceTexturesGroupKinds, SurfaceTexturesGroupKindsTemplate } from "../surfaces/processors/texturing/types.js"
import { Material_Groups_Template } from "../surfaces/processors/rendering/material/groups.js"
import { SurfaceWithRendering_TexturesGroupsTemplate } from "../surfaces/processors/rendering/surface.js"

export class VolumeComponentSystem extends ComponentSystem {
    id: 'volume'
    ComponentType: typeof VolumeComponent
    DataType: typeof VolumeComponentData
    
    processors: VolumeProcessor[] = [
        new volumes.VolumeSamplingProcessor(),
        new surfaces.VolumeSurfaceMeshingProcessor(),
        new processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new surfaces.SurfaceWithSurfaceAreaProcessor()
        ),
        new processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new surfaces.SurfaceWithSurfaceTextureLocationUVUnwrappingProcessor()
        ),
        new processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new surfaces.SurfaceWithInterpolatingValueTexturesProcessor(
                {
                    ...MultiObjectsInfluencesGroupKindsTemplate,
                    ...TextureLocationsGroupKindsTemplate,
                    
                }
            ) as any as processors.Processor<surfaces.Surface, surfaces.VolumeSurfaceProcessingContext>
        ),
        new processors.ParallelizingProcessor(
            surfaces.VolumeSurfacesParallelizer.instance,
            new solids.VolumeSurfaceSolidifyingProcessor(),
        ),
        new processors.ParallelizingProcessor(
            solids.VolumeSolidsParallelizer.instance,
            new solids.SolidWithEnclosingVolumeProcessor()
        ),
    ]
    multiObj: {
        groupKinds:
            MultiObjectsInfluencesGroupKinds &
            SurfaceTextureLocationsGroupKinds &
            SurfaceTexturesGroupKinds &
            MultiObjectsGroupsKindsTemplate,
        groupKindsMappedGroups: {
            [MultiObjectsInfluencesGroupKindKey]: typeof MultiObjectsInfluencesGroupsDefaultTemplate,
            [SurfaceTextureLocationsGroupKindKey]: typeof SurfaceTextureLocationsGroupsDefaultTemplate,
            [ObjectsTextureLocationsGroupKindKey]: typeof ObjectTextureLocationsGroupsDefaultTemplate
            [TextureLocationsGroupKindKey]: typeof SurfaceTextureLocationsGroupsDefaultTemplate & typeof ObjectTextureLocationsGroupsDefaultTemplate
            [SurfaceTexturesGroupKindKey]: {} // typeof SurfaceWithRendering_TexturesGroupsTemplate
        } /* & MultiObjectsGroupsKindsTemplateMapped<MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsTemplate> */
    } = {
        groupKinds: {
            ...MultiObjectsInfluencesGroupKindsTemplate,
            ...SurfaceTextureLocationsGroupKindsTemplate,
            ...SurfaceTexturesGroupKindsTemplate,
        },
        groupKindsMappedGroups: {
            [MultiObjectsInfluencesGroupKindKey]: MultiObjectsInfluencesGroupsDefaultTemplate,
            [SurfaceTextureLocationsGroupKindKey]: SurfaceTextureLocationsGroupsDefaultTemplate,
            [ObjectsTextureLocationsGroupKindKey]: ObjectsTextureLocationsGroupsDefaultTemplate,
            [TextureLocationsGroupKindKey]: {
                ...SurfaceTextureLocationsGroupsDefaultTemplate,
                ...ObjectTextureLocationsGroupsDefaultTemplate,
            },
            [SurfaceTexturesGroupKindKey]: {
                // ...SurfaceWithRendering_TexturesGroupsTemplate
            }
        }
    }

    constructor(app: AppBase) {
        super(app)

        this.id = 'volume'

        this.ComponentType = VolumeComponent
        this.DataType = VolumeComponentData;

        this.on('beforeremove', this._onBeforeRemove, this);
    }

    initializeComponentData(component: VolumeComponent, data: VolumeComponentData, properties) {
        component.enabled = data.hasOwnProperty('enabled') ? !!data.enabled : true;
    }

    cloneComponent(entity: Entity, clone: Entity) {
        throw new Error('not implemented')

        const component = entity.findComponent('volume') as VolumeComponent
        
        const data: VolumeComponentData = {
            enabled: component.enabled
        };

        return this.addComponent(clone, data);
    }

    private _onBeforeRemove(entity: Entity, component: VolumeComponent) {
        //TODO: is this already handled?
        component.fire('remove');
    }
}