import { mockDOM } from "node-canvas-webgl"
import jsdomSetup from "jsdom-global"
import fs from 'node:fs'
import path from 'node:path'
import { describe, it, beforeEach, afterEach } from "mocha"
import { Application, BasicMaterial, Color, Entity, Vec2 } from "playcanvas-extended"
import * as textures from "../textures/index.js"
import * as surfaces from "../surfaces/index.js"
import * as solids from "../solids/index.js"
import * as storage from "../storage/index.js"
import * as physicalEntity from "./index.js"
import { fields } from "../index.js"
import { groupPaths } from "../paradigm/trees/index.js"
import { onlyOne } from "../utils/only-one.js"

describe("playcanvas-node", () => {
    let jsdomCleanup: Function
    
    beforeEach(() => {
        jsdomCleanup = jsdomSetup(``, {
            pretendToBeVisual: true
        })

        mockDOM(window)
    })

    afterEach(() => {
        jsdomCleanup()
    })

    function testRender(name: string, setup: (entity: Entity) => void) {
        it(name, async () => {
            const canvas = document.createElement("canvas")
            canvas.width = canvas.height = 512
            const app = new Application(canvas)
            app.start()

            await surfaces.UVunwrapping.init_XAtlasAPI("file://" + path.join(process.cwd(), "./node_modules/xatlasjs-esm/dist"))

            const storageService = new storage.MemoryStorageService()
            const system = new physicalEntity.ComponentSystem(app, storageService)
            app.systems.add(system)

            const cam = new Entity("camera")
            // cam.setPosition(1, 2, -5)
            cam.setPosition(4, 5, -10)
            cam.lookAt(0, 0, 0)
            cam.addComponent('camera')
            app.root.addChild(cam)

            const light1 = new Entity('light1')
            light1.setPosition(1, 5, 0)
            light1.lookAt(0, 0, 0)
            light1.addComponent('light', {
                type: 'spot',
                color: Color.WHITE,
                range: 8
            })
            app.root.addChild(light1)

            const entity = new Entity()
            app.root.addChild(entity)
            setup(entity)

            app.tick()
            fs.writeFileSync(`textures/test-screenshot-metasolid-${name}.png`, (<any>canvas).toBuffer())
            app.destroy()
        }).timeout(100000)
    }

    function defaultTexturers(): textures.Texturer[] {
        ///@ts-ignore
        // const texturer = new textures.CopyTexturer()
        const texturer = new textures.ConstantTexturer(Color.GREEN)
        // texturer.mappings.inputs.value = [fields.MultiObjectsInfluencesGroupsDefaultKey, "segment 1", "segment 2"]
        texturer.mappings.outputs.value = ['material', 'textures', 'diffuse']

        ///@ts-ignore
        return [
            ///@ts-ignore
            texturer
        ]
    }

    function uvTexturers(): textures.Texturer[] {
        ///@ts-ignore
        return [
            ///@ts-ignore
            new textures.IdentityTexturer({
                outputs: {
                    value: ['uvs']
                }
            }),

            ///@ts-ignore
            new textures.MappingTexturer(
                {
                    inputs: {
                        value: ['uvs']
                    },
                    outputs: {
                        value: ['material', 'textures', 'diffuse']
                    }
                },
                [
                    {
                        from: ['uv'],
                        to: []
                    }
                ]
            )
        ]
    }

    function copyInfluences(objID: number[]): () => textures.Texturer[] {
        //TODO: use node-based texturer system
        // nodes generate textures
        // and copy links are distinct

        return () => [
            ///@ts-ignore
            new textures.CopyTexturer({
                inputs: {
                    value: onlyOne(groupPaths(physicalEntity.InfluenceGroupTemplate))
                },
                outputs: {
                    value: ['material', 'textures', 'diffuse']
                }
            })
        ]
    }

    function testShape(
            name: string,
            number_entities: number,
            setupShape: (entity1: Entity, ...components: physicalEntity.Component[]) => void,
            setupTexturers: () => textures.Texturer[] = defaultTexturers
        ) {
        testRender(name, entity => {
            const entity1 = entity
            entity1.name = "Entity 0"

            const component1 = entity1.addComponent(physicalEntity.SYSTEM_ID)! as physicalEntity.Component
            component1.volumeSamplingSettings = {
                max_depth: 7,
                indicesType: Uint32Array,
                recommendation_threshold: 1
            }

            const components = [component1]
            for (let i = 1; i < number_entities; i++) {
                const entityN = new Entity(`Entity ${i}`)
                const componentN = entityN.addComponent(physicalEntity.SYSTEM_ID)! as physicalEntity.Component
                components.push(componentN)
            }

            setupShape(entity1, ...components)
            component1.texturers = setupTexturers()

            component1.processFromRaw()

            const material = new BasicMaterial()
            material.color.set(0.8, 0.8, 0.7)
            material.update()
            entity1.render!.material = material
        })
    }

    testShape("one sphere", 1, (entity1, component1) => {
        component1.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaSphere()) as unknown as physicalEntity.VolumeT
    }, uvTexturers)

    testShape("multiple spheres", 4, (entity1, component1, component2, component3, component4) => {
        component1.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaSphere()) as unknown as physicalEntity.VolumeT
        component2.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaSphere()) as unknown as physicalEntity.VolumeT
        component3.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaSphere()) as unknown as physicalEntity.VolumeT
        component4.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaSphere()) as unknown as physicalEntity.VolumeT

        entity1.addChild(component2.entity)
        component2.entity.setLocalPosition(0, 1, 0)
        
        entity1.addChild(component3.entity)
        component3.entity.setLocalPosition(1, 1, 2)
        component3.entity.setLocalScale(0.1, 1.4, 1.4)

        entity1.addChild(component4.entity)
        component4.entity.setLocalPosition(1, 1, 0)
        component4.entity.setLocalScale(0.8, 0.8, 0.6)
    }, uvTexturers)

    testShape("plane", 1, (entity1, component1) => {
        component1.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaPlane({ offset: Vec2.ZERO, size: Vec2.ONE })) as unknown as physicalEntity.VolumeT
    }, uvTexturers)

    testShape("spline 1", 2, (entity1, component1, component2) => {
        component1.volume = new solids.metasolids.MetaSolidVolume(
            new solids.metasolids.MetaSplineSegment(
                new fields.domains.ConstantSampleDomain({
                        unit: {
                            height: 1,
                            length: 0.5
                        },
                        falloff: {
                            rate: 1
                        }
                    },
                    solids.metasolids.MetaSolidVolume.defaultFields.parametersIn
                )
            )
        ) as unknown as physicalEntity.VolumeT

        component1.entity.addChild(component2.entity)
        component2.entity.setLocalPosition(0, 0, 2)
        component2.volume = new solids.metasolids.MetaSolidVolume(
            new solids.metasolids.MetaSplineSegment(
                new fields.domains.ConstantSampleDomain({
                        unit: {
                            height: 1,
                            length: 0.5
                        },
                        falloff: {
                            rate: 1
                        }
                    },
                    solids.metasolids.MetaSolidVolume.defaultFields.parametersIn
                )
            )
        ) as unknown as physicalEntity.VolumeT
    }, uvTexturers)

    return
    testShape("spline 2", 3, (entity1, component1, component2, component3) => {
        component1.volume = new solids.metasolids.MetaSolidVolume(
            new solids.metasolids.MetaSplineSegment(
                new fields.domains.ConstantSampleDomain({
                        unit: {
                            height: 1,
                            length: 0.5
                        },
                        falloff: {
                            rate: 1
                        }
                    },
                    solids.metasolids.MetaSolidVolume.defaultFields.parametersIn
                )
            )
        ) as unknown as physicalEntity.VolumeT

        component1.entity.addChild(component2.entity)
        component2.entity.setLocalPosition(0, 0, 2)
        component2.volume = new solids.metasolids.MetaSolidVolume(
            new solids.metasolids.MetaSplineSegment(
                new fields.domains.ConstantSampleDomain({
                        unit: {
                            height: 1.23,
                            length: 0.5
                        },
                        falloff: {
                            rate: 1
                        }
                    },
                    solids.metasolids.MetaSolidVolume.defaultFields.parametersIn
                )
            )
        ) as unknown as physicalEntity.VolumeT

        component2.entity.addChild(component3.entity)
        component3.entity.setLocalPosition(0, 0, 2)
        component3.volume = new solids.metasolids.MetaSolidVolume(
            new solids.metasolids.MetaSplineSegment(
                new fields.domains.ConstantSampleDomain({
                        unit: {
                            height: 1,
                            length: 0.5
                        },
                        falloff: {
                            rate: 1
                        }
                    },
                    solids.metasolids.MetaSolidVolume.defaultFields.parametersIn
                )
            )
        ) as unknown as physicalEntity.VolumeT
    })

    testShape("spline 3", 4, (entity1, component1, component2, component3, component4) => {
        component1.volume = new solids.metasolids.MetaSolidVolume(
            new solids.metasolids.MetaSplineSegment(
                new fields.domains.ConstantSampleDomain({
                        unit: {
                            height: 1,
                            length: 0.5
                        },
                        falloff: {
                            rate: 1
                        }
                    },
                    solids.metasolids.MetaSolidVolume.defaultFields.parametersIn
                )
            )
        ) as unknown as physicalEntity.VolumeT

        component1.entity.addChild(component2.entity)
        component2.entity.setLocalPosition(0, 0, 2)
        component2.volume = new solids.metasolids.MetaSolidVolume(
            new solids.metasolids.MetaSplineSegment(
                new fields.domains.ConstantSampleDomain({
                        unit: {
                            height: 1.23,
                            length: 0.5
                        },
                        falloff: {
                            rate: 1
                        }
                    },
                    solids.metasolids.MetaSolidVolume.defaultFields.parametersIn
                )
            )
        ) as unknown as physicalEntity.VolumeT

        component2.entity.addChild(component3.entity)
        component3.entity.setLocalPosition(0, 0, 2)
        component3.volume = new solids.metasolids.MetaSolidVolume(
            new solids.metasolids.MetaSplineSegment(
                new fields.domains.ConstantSampleDomain({
                        unit: {
                            height: 1,
                            length: 0.5
                        },
                        falloff: {
                            rate: 1
                        }
                    },
                    solids.metasolids.MetaSolidVolume.defaultFields.parametersIn
                )
            )
        ) as unknown as physicalEntity.VolumeT

        component3.entity.addChild(component4.entity)
        component4.entity.setLocalPosition(0, 0, 1)
        component4.volume = new solids.metasolids.MetaSolidVolume(
            new solids.metasolids.MetaSplineSegment(
                new fields.domains.ConstantSampleDomain({
                        unit: {
                            height: 0.5,
                            length: 0.4
                        },
                        falloff: {
                            rate: 1
                        }
                    },
                    solids.metasolids.MetaSolidVolume.defaultFields.parametersIn
                )
            )
        ) as unknown as physicalEntity.VolumeT
    })
})