import { mockDOM } from "node-canvas-webgl" 
import fs from 'node:fs'
import { describe, it, beforeEach, afterEach } from "mocha"
import { Application, Color, Entity, StandardMaterial } from "playcanvas-extended"
import jsdomSetup from "jsdom-global"

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

    it("creates application", () => {
        console.log('app1')
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = 512
        const app = new Application(canvas)
        app.start()
        app.tick()
        app.destroy()
    })

    it("creates entity", () => {
        console.log('app2')
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = 512
        const app = new Application(canvas)
        app.start()
        app.tick()
        const box1 = new Entity("box1")
        box1.addComponent('render', { type: 'box' })
        app.root.addChild(box1)
        app.tick()
        app.destroy()
    })

    it("renders frame", () => {
        console.log('app3')
        const canvas = document.createElement("canvas")
        canvas.width = canvas.height = 512
        const app = new Application(canvas)
        app.start()
        app.tick()

        const cam = new Entity("camera")
        cam.setPosition(1, 2, -5)
        cam.lookAt(0, 0, 0)
        cam.addComponent('camera')
        app.root.addChild(cam)

        const box1 = new Entity("box1")
        box1.setPosition(-1, 0, -0.5)
        box1.addComponent('render', { type: 'box' })
        const box1_mat = box1.render!.material = new StandardMaterial()
        box1_mat.diffuse.set(0.1, 0.5, 0.02)
        box1_mat.update()
        app.root.addChild(box1)

        const torus1 = new Entity("torus1")
        torus1.setPosition(1, 0, 0)
        torus1.addComponent('render', { type: 'torus' })
        const torus1_mat = torus1.render!.material = new StandardMaterial()
        torus1_mat.diffuse.set(0.1, 0.5, 0.02)
        torus1_mat.update()
        app.root.addChild(torus1)

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
        fs.writeFileSync('playcanvas-node-screenshot.png', (<any>canvas).toBuffer())
        app.destroy()
    })
})