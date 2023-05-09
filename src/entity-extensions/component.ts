import { calculateNormals, Component, Entity, GraphNode, Mesh, MeshInstance, PRIMITIVE_TRIANGLES, StandardMaterial } from "playcanvas-extended";
import { FieldsPoint } from "../fields/point.js";
import { fields, meshing, surfaces, volumes } from "../index.js";
import { Volume } from "../volumes/volume.js";
import { VolumeComponentSystem } from "./system.js";
import { ProcessorGraph } from "../processor/index.js";
import { groupKinds, MultiObjectsGroupsTemplate, MultiObjectsInfluencesGroupsDefaultTemplate, MultiObjectsTemplate, MultiObjectsTemplate_Leaf } from "../fields/multi-objects-fields-point.js";
import { MultiObjectsVolume } from "../volumes/index.js";

const _schema = ['enabled']

export class VolumeComponent extends Component {
    volume: Volume
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

        const system = this.system as VolumeComponentSystem
        
        function compositeVolume(node: GraphNode, require_multiObjects = false) {
            const entity = node as Entity
            const component = entity?.findComponent('volume') as VolumeComponent
            
            const children = [
                ['$$main', component?.volume],
                ...node.children
                    .filter(child => !child.name.startsWith("$$"))
                    .map(child => [child.name, new volumes.TransformVolume(compositeVolume(child), child.getLocalTransform())])
            ].filter(([, volume]) => volume !== undefined)

            if (children.length === 0)
                return undefined
            else if (children.length === 1 && component?.volume !== undefined && !require_multiObjects)
                return children[0][1]
            else {
                return new volumes.MultiObjectsVolume(
                    Object.fromEntries(children),
                    system.multiObj.groupKinds,
                    undefined,
                    MultiObjectsInfluencesGroupsDefaultTemplate
                )
            }
        }

        const compositeVolume_final = compositeVolume(this.entity, true)
        function objectsTemplate_populate(volume: Volume): MultiObjectsTemplate | typeof MultiObjectsTemplate_Leaf {
            if (volume instanceof MultiObjectsVolume)
                return Object.fromEntries(Object.entries(volume.children as any).map(([key, child]) =>
                    [key, objectsTemplate_populate(child as Volume) as ReturnType<typeof objectsTemplate_populate>])
                ) as MultiObjectsTemplate
            return MultiObjectsTemplate_Leaf
        }
        const objectsTemplate = <MultiObjectsTemplate>objectsTemplate_populate(compositeVolume_final)

        const multiObjectsContext = {
            [fields.MultiObjectsProcessingContextGroupKinds]: system.multiObj.groupKinds,
            ...system.multiObj.groupKindsMappedGroups
        } as fields.MultiObjectsGroupsProcessingContext

        for (const { group } of groupKinds(multiObjectsContext, system.multiObj.groupKinds))
            group.set(multiObjectsContext, objectsTemplate)

        const context = {
            ...{
                [fields.SampleDomainLocationField]: volumes.defaultVolumeLocationField,
                [volumes.VolumeSampleKey]: {},
                [volumes.VolumeSamplingKey]: {
                    volume: compositeVolume_final,
                    extraLocationParameters: this.extraLocationParameters,
                    settings: this.samplingSettings,
                },
                [surfaces.VolumeSurfacesKey]: {
                    sample: {}
                },
                [surfaces.VolumeSurfaceMeshingKey]: {
                    algorithm: new meshing.SurfaceNetsMeshingAlgorithm(),
                    settings: this.meshingSettings,
                },
            } as (
                volumes.VolumeProcessingContext &
                surfaces.VolumeSurfaceMeshingProcessingContext
            ),

            ...multiObjectsContext
        }

        const processing = {
        } as surfaces.VolumeSurfaceMeshingProcessing & volumes.VolumeProcessing

        const graph = new ProcessorGraph(system.processors)
        graph.init(context)
        graph.process(processing, context)

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
            return undefined
        
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