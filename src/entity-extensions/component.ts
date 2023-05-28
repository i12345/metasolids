import { Component, Entity, GraphNode } from "playcanvas-extended";
import { fields, processors, solids, surfaces, textures, volumes } from "../index.js";
import { mergeGroups, mergeGroupsInplace, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsProcessingContext, MultiObjectsInfluencesGroupsDefaultTemplate, MultiObjectsProcessingContext, MultiObjectsProcessingContextGroupKinds, MultiObjectsProcessingContextObjectsGrouped, MultiObjectsTemplate, MultiObjectsTemplate_Leaf, MultiObjectsGroupsTemplate, MultiObjectsGroupedObjectsKey, groupKindPaths, MultiObjectsGroupsKindsTemplate_Leaf } from "../fields/multi-objects-fields-point.js";
import { Objects, ObjectsOtherInterpolatingGrouped, ObjectsSurfaceObjectsTexturesGrouped, OtherInterpolatingGroupsKindsT, OtherInterpolatingGroupsKindsTemplate, OtherInterpolatingGroupsT, SampleProcessingContext_MultiObjects_Template, SampleProcessingContextT, SampleT, SolidT, SurfaceCombinedTextureLocationT, SurfaceObjectsTexturesGroupsT, SurfaceProcessingContext_MultiObjects_Template, SurfaceProcessingContextT, SurfaceT, Volume_Context_PreservedGroupsKindsTemplate, Volume_Sample_PreservedGroupsKindsTemplate, VolumeLocationT, VolumeProcessingContext_MultiObjects_Template, VolumeProcessingContextT, VolumeProcessingT, VolumeProcessorT, VolumeSurfaceProcessorT, VolumeT } from "./types.js";
import { makeClone } from "../utils/cloneable.js";
import { intract, pathsToNodeWithKey } from "../utils/tree.js";
import { onlyOne, PropertyPath, Reflect_entries, Reflect_fromEntries } from "../utils/index.js";
import { VolumeComponentSystem } from "./system.js";

const _schema = ['enabled']

export class VolumeComponent extends Component {
    private _volume?: VolumeT
    private _processed?: VolumeProcessingT
    private _multiObjPath?: PropertyPath

    get volume() {
        return this._volume
    }

    set volume(volume) {
        this._volume = volume
        this.update()
    }

    get processed() {
        return this._processed
    }

    set processed(processed) {
        if (this.findRoot() !== this)
            throw new Error("processed volume can only be set on the root entity")

        this._processed = processed

        this.removeVolume()
        this.renderVolume()
    }

    get multiObjPath() {
        return this._multiObjPath
    }

    makeRoot: boolean = false
    extraLocationParameters?: fields.FieldsPoint
    samplerSettings?: volumes.VolumeSamplerSettings
    meshingSettings?: surfaces.meshing.MeshingSettings
    interpolatingGroups?: MultiObjectsGroupsTemplate[]
    texturers?: textures.Texturer[]
    customProcessors?: VolumeProcessorT[]

    get root() {
        return this.findRoot().entity
    }

    get isRoot() {
        return this.root === this.entity
    }

    constructor(system: VolumeComponentSystem, entity: Entity) { 
        super(system, entity)
    }

    /**
     * Updates the mesh, texture, and other attributes for this and child
     * entities with {@link VolumeComponent}'s.
     */
    update() {
        const root = this.findRoot()
        if (root !== this) {
            root.update()
            return
        }

        if (!this.volume)
            return
        
        const system = this.system as VolumeComponentSystem
        
        const map_volume_component = new Map<VolumeT, VolumeComponent>()
        function compositeVolume(node: GraphNode, require_multiObjects = false): VolumeT | undefined {
            const entity = node as Entity
            const component = entity?.findComponent('volume') as VolumeComponent
            
            if (component?.volume)
                map_volume_component.set(component.volume, component)

            const children = [
                ...(component?.volume ? [['$$main', component.volume]] : []),
                ...node.children
                    .filter(child => !child.name.startsWith("$$"))
                    .map(child => [
                        child.name,
                        new volumes.TransformVolume(
                            compositeVolume(child)!,
                            child.getLocalTransform()
                        )
                    ] as [string, volumes.TransformVolume<VolumeLocationT, SampleT, VolumeProcessingContextT>])
                    .filter(([, { inner }]) => inner !== undefined)
            ] as [string, VolumeT][]

            if (children.length === 0)
                return undefined
            else if (children.length === 1 && component?.volume !== undefined && !require_multiObjects)
                return children[0][1]
            else {
                return new volumes.MultiObjectsVolume(
                    Reflect_fromEntries<Record<string, VolumeT>>(children),
                    {
                        context: {
                            groupKindsTemplate: Volume_Context_PreservedGroupsKindsTemplate
                        },
                        sample: {
                            groupKindsTemplate: Volume_Sample_PreservedGroupsKindsTemplate
                        }
                    },
                    MultiObjectsInfluencesGroupsDefaultTemplate
                ) as any as VolumeT
            }
        }

        const compositeVolume_final = compositeVolume(this.entity, true)!

        function assignMultiObjPaths(volume: VolumeT, path: PropertyPath) {
            if (volume instanceof volumes.TransformVolume)
                assignMultiObjPaths(volume.inner as any as VolumeT, path)
            else {
                const component = map_volume_component.get(volume)
                if (component)
                    component._multiObjPath = path
                if (volume instanceof volumes.MultiObjectsVolume)
                    for (const [key, child] of Reflect_entries(volume.children))
                        assignMultiObjPaths(child as unknown as VolumeT, [...path, key])
            }
        }

        assignMultiObjPaths(compositeVolume_final, [])

        function objectsTemplate_populate(volume: VolumeT): MultiObjectsTemplate | typeof MultiObjectsTemplate_Leaf {
            if (volume instanceof volumes.MultiObjectsVolume)
                return Reflect_fromEntries(Reflect_entries(volume.children as any).map(([key, child]) =>
                    [key, objectsTemplate_populate(child as VolumeT) as ReturnType<typeof objectsTemplate_populate>])
                ) as MultiObjectsTemplate
            else if (volume instanceof volumes.TransformVolume)
                return objectsTemplate_populate(volume.inner as unknown as VolumeT)
            return MultiObjectsTemplate_Leaf
        }

        const objectsTemplate = <MultiObjectsTemplate>objectsTemplate_populate(compositeVolume_final)

        function multiObjectsContext_insertObjects<
            Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            ObjectsGrouped extends
            MultiObjectsGrouped<Objects, Groups> =
            MultiObjectsGrouped<Objects, Groups>,
            GroupsKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
        >({
            [MultiObjectsProcessingContextObjectsGrouped]: objectsGrouped
        }: MultiObjectsProcessingContext<Objects, Groups, ObjectsGrouped, GroupsKinds>) {
            for (const path of pathsToNodeWithKey(objectsGrouped, MultiObjectsGroupedObjectsKey)) {
                intract(
                    objectsGrouped,
                    [...path, MultiObjectsGroupedObjectsKey],
                    objectsTemplate
                )
            }
        }

        function multiObjectsContext_insertGroups<
            Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            GroupsKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
        >(
            context: MultiObjectsGroupsProcessingContext<Groups, GroupsKind>,
            kind: GroupsKind,
            groups: Groups
        ) {
            const kindPath = onlyOne(groupKindPaths(kind))
            intract(context[MultiObjectsProcessingContextGroupKinds], kindPath, MultiObjectsGroupsKindsTemplate_Leaf)
            intract(context, kindPath, groups)
            mergeGroupsInplace(context, groups)
        }

        const sample_multiObjectsContext = makeClone(SampleProcessingContext_MultiObjects_Template)
        const surface_multiObjectsContext = makeClone(SurfaceProcessingContext_MultiObjects_Template)
        const volume_multiObjectsContext = makeClone(VolumeProcessingContext_MultiObjects_Template)

        multiObjectsContext_insertGroups(sample_multiObjectsContext, OtherInterpolatingGroupsKindsTemplate, (this.interpolatingGroups ?? []).reduce(mergeGroups, {}))
        multiObjectsContext_insertGroups(surface_multiObjectsContext, OtherInterpolatingGroupsKindsTemplate, (this.interpolatingGroups ?? []).reduce(mergeGroups, {}))

        multiObjectsContext_insertObjects<OtherInterpolatingGroupsT, ObjectsOtherInterpolatingGrouped, OtherInterpolatingGroupsKindsT>(sample_multiObjectsContext)
        multiObjectsContext_insertObjects<SurfaceObjectsTexturesGroupsT, ObjectsSurfaceObjectsTexturesGrouped, surfaces.texturing.SurfaceObjectsTexturesGroupKinds>(surface_multiObjectsContext)
        multiObjectsContext_insertObjects(volume_multiObjectsContext as any)

        const sample_context: SampleProcessingContextT = {
            ...sample_multiObjectsContext,
        }

        const surface_context: SurfaceProcessingContextT = {
            sample: sample_context,
            [textures.TexturersKey]: (this.texturers ?? []) as any,
            material: {},
            
            ...surface_multiObjectsContext
        }

        const volume_context: VolumeProcessingContextT = {
            [fields.SampleDomainLocationField]: volumes.defaultVolumeLocationField,

            [volumes.VolumeSampleKey]: sample_context,
            [volumes.VolumeSamplingKey]: {
                volume: compositeVolume_final,
                extraLocationParameters: this.extraLocationParameters,
                settings: this.samplerSettings ?? volumes.defaultVolumeSamplerSettings,
            },

            [surfaces.VolumeSurfacesKey]: surface_context,
            [surfaces.meshing.VolumeSurfaceMeshingKey]: {
                algorithm: new surfaces.meshing.SurfaceNetsMeshingAlgorithm(),
                settings: this.meshingSettings ?? surfaces.meshing.defaultMeshingSettings,
            },

            [solids.VolumeSolidsKey]: {
                sample: sample_context,
                surface: surface_context,
            },

            ...volume_multiObjectsContext
        }

        const processing = {
            [surfaces.VolumeSurfacesKey]: [] as SurfaceT[],
            [solids.VolumeSolidsKey]: [] as SolidT[],
        } as VolumeProcessingT

        const graph = new processors.GraphProcessor<VolumeProcessingT, VolumeProcessingContextT>([
            ...system.processors,
            new processors.ParallelizingProcessor(
                surfaces.VolumeSurfacesParallelizer.instance,
                ///@ts-ignore
                new textures.TextureableProcessor<SurfaceT, SurfaceCombinedTextureLocationT>() as VolumeSurfaceProcessorT
            ),
            ...(this.customProcessors ?? [])
        ])
        graph.init(volume_context)
        graph.process(processing, volume_context)

        this.processed = processing
    }

    private renderVolume() {
        const root = this.findRoot()
        if (root !== this) {
            root.renderVolume()
            return
        }

        const render_surfaces = this.processed![surfaces.VolumeSurfacesKey] as SurfaceT[]
        
        if (render_surfaces.length === 0)
            return

        const renderers = render_surfaces
            .filter(surface => surface.renderer)
            .map(surface => surface.renderer.individualize(this.entity))

        this.entity.addComponent('render', {
            meshInstances: renderers.map(renderer => renderer.implementation)
        })
    }

    private removeVolume() {
        const root = this.findRoot()
        if (root !== this) {
            root.removeVolume()
            return
        }

        if (this.entity.render) this.entity.removeComponent('render')
        if (this.entity.collision) this.entity.removeComponent('collision')
        if (this.entity.physics) this.entity.removeComponent('physics')
        if (this.entity.multibody) this.entity.removeComponent('multibody')
    }

    private findRoot(node: GraphNode = this.entity): VolumeComponent {
        if (node.root === node)
            return undefined!
        
        const e = node as Entity
        if (!e.findComponent)
            return this.findRoot(node.parent)

        const component = e.findComponent('volume') as VolumeComponent
        if (component.makeRoot) return component
        else return this.findRoot(e.parent) ?? component
    }

    onEnable() {
        if (this.volume)
            this.renderVolume()
    }

    onDisable() {
        this.removeVolume()
    }

    // private _onBeforeRemove() {
    //     this.fire('remove')
    // }

    private _onRemove() {
        this.removeVolume()
    }
}

Component._buildAccessors(VolumeComponent.prototype, _schema)