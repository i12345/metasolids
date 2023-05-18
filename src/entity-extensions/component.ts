import { calculateNormals, Component, Entity, GraphNode, Mesh, MeshInstance, PRIMITIVE_TRIANGLES, StandardMaterial } from "playcanvas-extended";
import { FieldsPoint } from "../fields/point.js";
import { fields, meshing, solids, surfaces, textures, volumes } from "../index.js";
import { Volume } from "../volumes/volume.js";
import { VolumeComponentSystem } from "./system.js";
import { ProcessorGraph } from "../processor/index.js";
import { MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsInfluencesGroupKinds, MultiObjectsInfluencesGroupsDefaultTemplate, MultiObjectsProcessingContext, MultiObjectsProcessingContextGroupKinds, MultiObjectsProcessingContextObjectsGrouped, MultiObjectsTemplate, MultiObjectsTemplate_Leaf } from "../fields/multi-objects-fields-point.js";
import { MultiObjectsVolume, TransformVolume } from "../volumes/index.js";
import { Objects, ObjectsOtherInterpolatingGrouped, ObjectsSurfaceObjectsTexturesGrouped, OtherInterpolatingGroupsKindsT, OtherInterpolatingGroupsT, Sample_MultiObjectsMappedGroups_Template, SampleProcessingContext_MultiObjects, SampleProcessingContext_MultiObjects_Template, SampleProcessingContextT, SurfaceObjectsTexturesGroupsT, SurfaceProcessingContext_MultiObjects_Template, SurfaceProcessingContextT, VolumeProcessingContext_MultiObjects_Template, VolumeProcessingContextT, VolumeProcessingT, VolumeT } from "./types.js";
import { MultiObjectsGroupsTemplate } from "../fields/multi-objects-fields-point.js";
import { makeClone } from "../utils/cloneable.js";
import { MultiObjectsGroupedObjectsKey } from "../fields/multi-objects-fields-point.js";
import { intract, pathsToNodeWithKey } from "../utils/tree.js";
import { Reflect_entries, Reflect_fromEntries } from "../utils/index.js";

const _schema = ['enabled']

export class VolumeComponent extends Component {
    volume?: Volume
    makeRoot: boolean = false
    extraLocationParameters?: FieldsPoint
    samplingSettings = { ...volumes.defaultVolumeSamplerSettings }
    meshingSettings = { ...meshing.defaultMeshingSettings }

    get root() {
        return this.findRoot().entity
    }

    constructor(system: VolumeComponentSystem, entity: Entity) { 
        super(system, entity)
    }

    /**
     * Updates the mesh, texture, and other attributes for this and child
     * entities with {@link VolumeComponent}'s.
     */
    update() {
        this.removeVolume()
        this.renderVolume()
    }

    private renderVolume() {
        const root = this.findRoot()
        if (root !== this) {
            root.renderVolume()
            return
        }

        if (!this.volume)
            return

        const system = this.system as VolumeComponentSystem
        
        function compositeVolume(node: GraphNode, require_multiObjects = false): VolumeT | undefined {
            const entity = node as Entity
            const component = entity?.findComponent('volume') as VolumeComponent
            
            const children = [
                ...(component?.volume ? [['$$main', component.volume]] : []),
                ...node.children
                    .filter(child => !child.name.startsWith("$$"))
                    .map(child => [child.name, new volumes.TransformVolume(compositeVolume(child)!, child.getLocalTransform())] as [string, TransformVolume])
                    .filter(([, { inner }]) => inner !== undefined)
            ] as [string, VolumeT][]

            if (children.length === 0)
                return undefined
            else if (children.length === 1 && component?.volume !== undefined && !require_multiObjects)
                return children[0][1]
            else {
                return new volumes.MultiObjectsVolume(
                    Reflect_fromEntries<Record<string, VolumeT>>(children),
                    undefined as unknown as MultiObjectsInfluencesGroupKinds & MultiObjectsGroupsKindsTemplate,
                    Sample_MultiObjectsMappedGroups_Template,
                    MultiObjectsInfluencesGroupsDefaultTemplate
                ) as any as VolumeT
            }
        }

        const compositeVolume_final = compositeVolume(this.entity, true)!
        function objectsTemplate_populate(volume: Volume): MultiObjectsTemplate | typeof MultiObjectsTemplate_Leaf {
            if (volume instanceof MultiObjectsVolume)
                return Reflect_fromEntries(Reflect_entries(volume.children as any).map(([key, child]) =>
                    [key, objectsTemplate_populate(child as Volume) as ReturnType<typeof objectsTemplate_populate>])
                ) as MultiObjectsTemplate
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

        const sample_multiObjectsContext = makeClone(SampleProcessingContext_MultiObjects_Template)
        const surface_multiObjectsContext = makeClone(SurfaceProcessingContext_MultiObjects_Template)
        const volume_multiObjectsContext = makeClone(VolumeProcessingContext_MultiObjects_Template)
        multiObjectsContext_insertObjects<OtherInterpolatingGroupsT, ObjectsOtherInterpolatingGrouped, OtherInterpolatingGroupsKindsT>(sample_multiObjectsContext)
        multiObjectsContext_insertObjects<SurfaceObjectsTexturesGroupsT, ObjectsSurfaceObjectsTexturesGrouped, surfaces.SurfaceObjectsTexturesGroupKinds>(surface_multiObjectsContext)
        multiObjectsContext_insertObjects(volume_multiObjectsContext as any)

        const sample_context: SampleProcessingContextT = {
            ...sample_multiObjectsContext,
        }

        const surface_context: SurfaceProcessingContextT = {
            sample: sample_context,
            material: { },
            
            ...surface_multiObjectsContext
        }

        const volume_context: VolumeProcessingContextT = {
            [fields.SampleDomainLocationField]: volumes.defaultVolumeLocationField,

            [volumes.VolumeSampleKey]: sample_context,
            [volumes.VolumeSamplingKey]: {
                volume: compositeVolume_final,
                extraLocationParameters: this.extraLocationParameters,
                settings: this.samplingSettings,
            },

            [surfaces.VolumeSurfacesKey]: surface_context,
            [surfaces.VolumeSurfaceMeshingKey]: {
                algorithm: new meshing.SurfaceNetsMeshingAlgorithm(),
                settings: this.meshingSettings,
            },

            [solids.VolumeSolidsKey]: {
                sample: sample_context,
                surface: surface_context,
            },

            ...volume_multiObjectsContext
        }

        const processing = {} as VolumeProcessingT

        const graph = new ProcessorGraph(system.processors)
        graph.init(volume_context)
        graph.process(processing, volume_context)

        const surface = processing[surfaces.VolumeSurfacesKey][0]
        
        if (surface.mesh.triangles.length === 0)
            return

        const mesh = new Mesh(this.system.app.graphicsDevice)
        
        const positions = new Float32Array(surface.mesh.vertices.length * 3)
        const indices = new Uint32Array(surface.mesh.triangles)

        for (let position_i = 0; position_i < surface.mesh.vertices.length; position_i++) {
            const position = surface.mesh.vertices[position_i]
            positions[(position_i * 3) + 0] = position.x
            positions[(position_i * 3) + 1] = position.y
            positions[(position_i * 3) + 2] = position.z
        }

        mesh.setPositions(positions)
        mesh.setIndices(indices)
        mesh.setNormals(calculateNormals(positions as unknown as number[], indices as unknown as number[]))
        mesh.update(PRIMITIVE_TRIANGLES)

        const material = new StandardMaterial()
        material.diffuse.set(0.2, 0.4, 0.23)
        material.update()

        this.entity.addComponent('render', {
            meshInstances: [new MeshInstance(mesh, material, this.entity)]
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