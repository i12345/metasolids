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
import { processing } from "../paradigm/index.js"
import '@tensorflow/tfjs-node'
import * as tf from "@tensorflow/tfjs"
import { tensor } from "../fields/index.js"
import { PerRank, ScalarN } from "../utils/tf-rank.js"

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

            await surfaces.unwrapping.uv.algorithms.init_XAtlasAPI("file://" + path.join(process.cwd(), "./node_modules/xatlasjs-esm/dist"))

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
            fs.writeFileSync(`output-textures/test-screenshot-metasolid-${name}.png`, (<any>canvas).toBuffer())
            app.destroy()
        }).timeout(100000)
    }

    function defaultTexturers(): processing.processors.FactoryProcessor[] {
        const texturer = new textures.factories.ConstantTextureFactory(Color.GREEN)
        texturer.mappings.outputs = ['material', 'textures', 'diffuse']

        return [
            texturer
        ]
    }

    function uvTexturers(): processing.processors.FactoryProcessor[] {
        return [
            new textures.factories.IdentityTextureFactory({
                inputs: {},
                outputs: ['uvs']
            }),

            new textures.factories.RemappedTextureFactory(
                [
                    {
                        from: ['uv'],
                        to: []
                    }
                ],
                {
                    inputs: ['uvs'],
                    outputs: ['material', 'textures', 'diffuse']
                }
            )
        ]
    }

    function copyInfluences(objID: number[]): () => processing.processors.FactoryProcessor[] {
        //TODO: use node-based texturer system
        // nodes generate textures
        // and copy links are distinct

        return () => [
            new processing.processors.factories.CopyFactory({
                inputs: onlyOne(groupPaths(physicalEntity.InfluenceGroupTemplate)),
                outputs: ['material', 'textures', 'diffuse']
            })
        ]
    }

    function spaceStretchTexturer(): processing.processors.FactoryProcessor[] {
        return [
            new textures.factories.RemappedTextureFactory(
                [
                    {
                        from: [0],
                        to: []
                    }
                ],
                {
                    inputs: [surfaces.unwrapping.spaceStretch.SpaceStretchKey],
                    outputs: ['material', 'textures', 'color']
                }
            )
        ]
    }

    function RDtexturer1(): processing.processors.FactoryProcessor[] {
        const space1: tensor.FieldPointTensorSpace<tf.Rank.R2> = {
            shape: [["resolution", "y"], ["resolution", "x"]],
        }

        const a = new tensor.FieldPointTensorVariable<number, tf.Rank.R2>(
            Number,
            space1,
            "a"
        )

        const b = new tensor.FieldPointTensorVariable<number, tf.Rank.R2>(
            Number,
            space1,
            "b"
        )
 
        const spaceStretch = new tensor.FieldPointTensorVariable<ScalarN<tf.Rank.R2>, tf.Rank.R2>(
            { [0]: Number, [1]: Number },
            space1,
            surfaces.unwrapping.spaceStretch.SpaceStretchKey
        )
        
        const system = new tensor.FieldPointTensorSystem(
            [space1],
            [a, b, spaceStretch],
            new tensor.FieldPointTensorStatementDiffusion(a, spaceStretch, undefined!),
            new tensor.FieldPointTensorExpressionConstant<boolean, tf.Rank.R0>(Boolean, [], new Uint8Array([1]), 'bool')
        )
        
        return [
            new textures.factories.ConstantTextureFactory(
                1,
                {
                    inputs: {},
                    outputs: ['a_initial']
                }
            ),
            // new processing.processors.factories.CopyFactory({
            //     inputs: ['a_initial'],
            //     outputs: ['material', 'textures', 'color']
            // }),
            new surfaces.texturing.SurfaceTexturingTensorSystemFactory(
                system,
                {
                    resolution: new Vec2(512, 512),
                    dt: 0.1,
                },
                {
                    inputs: {
                        [spaceStretch.name!]: [surfaces.unwrapping.spaceStretch.SpaceStretchKey],
                        [a.name!]: ['a_initial'],
                        [b.name!]: ['a_initial'],
                    },
                    outputs: {
                        [a.name!]: ['material', 'textures', 'color'],
                        // [b.name!]: ['material', 'textures', 'color'],
                    }
                }
            )
        ]
    }

    function testShape(
            name: string,
            number_entities: number,
            setupShape: (entity1: Entity, ...components: physicalEntity.Component[]) => void,
            setupTexturers: () => processing.processors.FactoryProcessor[] = defaultTexturers
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
            component1.factories = {
                surfaces: setupTexturers()
            }

            component1.processFromRaw()

            const material = new BasicMaterial()
            material.color.set(0.8, 0.8, 0.7)
            material.update()
            entity1.render!.material = material
        })
    }

    // const texturers = spaceStretchTexturer
    const texturers = RDtexturer1

    testShape("one sphere", 1, (entity1, component1) => {
        component1.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaSphere()) as unknown as physicalEntity.VolumeT
    }, texturers)

    testShape("multiple spheres", 3, (entity1, component1, component2, component3, component4) => {
        component1.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaSphere()) as unknown as physicalEntity.VolumeT
        component2.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaSphere()) as unknown as physicalEntity.VolumeT
        component3.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaSphere()) as unknown as physicalEntity.VolumeT
        // component4.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaSphere()) as unknown as physicalEntity.VolumeT

        entity1.addChild(component2.entity)
        component2.entity.setLocalPosition(0, 1, 0)
        
        // entity1.addChild(component3.entity)
        // component3.entity.setLocalPosition(1, 1, 2)
        // component3.entity.setLocalScale(0.1, 1.4, 1.4)

        // entity1.addChild(component4.entity)
        // component4.entity.setLocalPosition(1, 1, 0)
        // component4.entity.setLocalScale(0.8, 0.8, 0.6)
    }, texturers)

    testShape("plane", 1, (entity1, component1) => {
        component1.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaPlane({ offset: Vec2.ZERO, size: Vec2.ONE })) as unknown as physicalEntity.VolumeT
    }, texturers)

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
    }, texturers)

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
    }, texturers)

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
    }, texturers)
})