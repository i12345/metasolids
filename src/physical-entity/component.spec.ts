import { mockDOM } from "node-canvas-webgl" 
import jsdomSetup from "jsdom-global"
import fs from 'node:fs'
import path from 'node:path'
import { describe, it, beforeEach, afterEach } from "mocha"
import { Application, Color, Entity } from "playcanvas-extended"
import * as textures from "../textures/index.js"
import * as surfaces from "../surfaces/index.js"
import * as solids from "../solids/index.js"
import * as storage from "../storage/index.js"
import * as physicalEntity from "./index.js"

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

    it("metasolid1", async () => {
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = 512
        const app = new Application(canvas)
        app.start()

        await surfaces.UVunwrapping.init_XAtlasAPI("file://" + path.join(process.cwd(), "./node_modules/xatlasjs-esm/dist"))

        const storageService = new storage.MemoryStorageService()
        const system = new physicalEntity.ComponentSystem(app, storageService)
        app.systems.add(system)

        const entity1 = new Entity()
        const component1 = entity1.addComponent(physicalEntity.SYSTEM_ID)! as physicalEntity.Component
        component1.volumeSamplingSettings = {
            max_depth: 7,
            indicesType: Uint32Array,
            recommendation_threshold: 1
        }
        component1.volume = new solids.metasolids.MetaSolidVolume(new solids.metasolids.MetaSphere()) as unknown as physicalEntity.VolumeT



        ///@ts-ignore
        // const texturer = new textures.CopyTexturer()
        const texturer = new textures.ConstantTexturer(Color.GREEN)
        // texturer.mappings.inputs.value = [fields.MultiObjectsInfluencesGroupsDefaultKey, "segment 1", "segment 2"]
        texturer.mappings.outputs.value = ['material', 'textures', 'diffuse']
        
        ///@ts-ignore
        component1.texturers = [
            ///@ts-ignore
            texturer
        ]

        const cam = new Entity("camera")
        cam.setPosition(1, 2, -5)
        cam.lookAt(0, 0, 0)
        cam.addComponent('camera')
        app.root.addChild(cam)

        component1.makeRoot = true
        component1.processFromRaw()
        app.root.addChild(entity1)

        const light1 = new Entity('light1')
        light1.setPosition(1, 5, 0)
        light1.lookAt(0, 0, 0)
        light1.addComponent('light', {
            type: 'spot',
            color: Color.WHITE,
            range: 8
        })
        app.root.addChild(light1)

        app.tick()
        fs.writeFileSync("test-screenshot-metasolid-component.png", (<any>canvas).toBuffer())
        app.destroy()
    }).timeout(100000)
})