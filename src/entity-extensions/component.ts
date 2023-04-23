import { calculateNormals, Component, createCone, createCylinder, CULLFACE_FRONT, Entity, GraphNode, Mesh, MeshInstance, PRIMITIVE_TRIANGLES, StandardMaterial } from "playcanvas-extended";
import { FieldsPoint } from "../fields/point.js";
import { fields, meshing, ProcessorGraph, solids, surfaces, volumes } from "../index.js";
import { Volume } from "../volumes/volume.js";
import { VolumeComponentSystem } from "./system.js";
import { MultiObjectsInfluencesGroupsDefault } from "../fields/multi-objects-fields-point.js";

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
        
        function compositeVolume(node: GraphNode) {
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
            else if (children.length === 1 && component?.volume !== undefined)
                return children[0][1]
            else {
                return new volumes.MultiObjectsVolume(
                    Object.fromEntries(children),
                    system.multiObj.groupKinds,
                    system.multiObj.groupKindsMappedGroups,
                    MultiObjectsInfluencesGroupsDefault
                )
            }
        }

        const context = {
            ...{
                [fields.SampleDomainLocationField]: volumes.defaultVolumeLocationField,
                [volumes.VolumeSampleKey]: {},
                [volumes.VolumeSamplingKey]: {
                    volume: compositeVolume(this.entity),
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

            ...{
                [fields.MultiObjectsProcessingContextGroupKinds]: system.multiObj.groupKinds as fields.MultiObjectsGroupsKindsTemplate,
                ...system.multiObj.groupKindsMappedGroups
            } as fields.MultiObjectsProcessingContext
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