import { Component, Entity, GraphNode, Mesh, MeshInstance, PRIMITIVE_TRIANGLES, StandardMaterial } from "playcanvas-extended";
import { FieldsPoint } from "../fields/point.js";
import { fields, ProcessorGraph, solids, surfaces, volumes } from "../index.js";
import { Volume } from "../volumes/volume.js";
import { VolumeComponentSystem } from "./system.js";

const _schema = ['enabled']

export class VolumeComponent extends Component {
    volume: Volume
    makeRoot: boolean = false
    extraLocationParameters?: FieldsPoint

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
                ['main', component?.volume],
                ...node.children
                    .map(child => [child.name, compositeVolume(child)])
                    .filter(([, volume]) => volume !== undefined)
            ]

            if (children.length === 0)
                return undefined
            else if (children.length === 1 && component?.volume !== undefined)
                return new volumes.TransformVolume(component.volume, node.getLocalTransform())
            else {
                return new volumes.MultiObjectsVolume(
                    Object.fromEntries(children),
                    system.multiObj.groupKinds,
                    system.multiObj.groups
                )
            }
        }

        const context: volumes.VolumeProcessingContext = {
            [volumes.VolumeSampleKey]: {},
            [volumes.VolumeSamplingKey]: {
                volume: compositeVolume(this.entity),
                extraLocationParameters: this.extraLocationParameters,
                settings: volumes.defaultVolumeSamplerSettings,
            },
            [fields.SampleDomainLocationField]: volumes.defaultVolumeLocationField
        }

        const processing = {} as surfaces.VolumeSurfaceMeshingProcessing

        const graph = new ProcessorGraph(system.processors)
        graph.init(context)
        graph.process(processing, context)

        const surface = processing[surfaces.VolumeSurfacesKey][0]
        const mesh = new Mesh()
        
        const positions = new Float32Array(surface.mesh.vertices.length * 3)
        const indices = new Uint32Array(surface.mesh.triangles.length * 3)
        mesh.setPositions(positions)
        mesh.setIndices(indices)
        mesh.update(PRIMITIVE_TRIANGLES)
        
        const material = new StandardMaterial()
        material.diffuse.set(0.2, 0.4, 0.23)
        material.update()

        this.entity.addComponent('render', {
            meshInstances: [new MeshInstance(mesh, material)]
        })
    }

    private removeVolume() {
        const root = this.findRoot()
        if (root !== this) {
            root.renderVolume()
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