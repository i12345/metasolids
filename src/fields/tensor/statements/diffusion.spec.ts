import * as tf from '@tensorflow/tfjs-node'
import { describe, it, beforeEach, afterEach } from "mocha"
import { FieldPointTensorSystem, FieldPointTensor2D, FieldPointTensorTopology, FieldPointTensorSpace, FieldPointTensorVariableInstance, FieldPointTensorVariable, FieldPointTensorEncodingConstant, FieldPointTensorExpressionConstant, FieldPointTensorStatementDiffusion, field_point_tensor_encode, FieldPointTensorTopologyProjectorIdentity, FieldPointTensorTopologyProjectorFactoryIdentity, FieldPointTensorTopologyProjectorFactory } from "../index.js"
import { Triangle2DMeshTopologyProjectorFactory, Triangles2DMesh } from "../../triangle-2D-mesh/index.js"
import { Vec2 } from "playcanvas-extended"
import { TensorShape } from "../../../utils/tf-rank.js"
import { renderTensor } from "../../../utils/tf-img.js"
import { assert } from "chai"
import { mockDOM } from "node-canvas-webgl"
import jsdomSetup from "jsdom-global"

describe("tensor diffusion", () => {
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

    // it("plane 2D", () => {
    //     runDiffusion({
    //         topologyProjectorFactory: new FieldPointTensorTopologyProjectorFactoryIdentity(),
    //     })
    // }).timeout(99999)

    it("plane with 2 tri", () => {
        runDiffusion({
            topologyProjectorFactory: new Triangle2DMeshTopologyProjectorFactory(
                Triangles2DMesh.build(
                    [0.1, 0.5, 0.3, 0.1, 0.3, 0.9,
                        0.9, 0.5, 0.7, 0.1, 0.7, 0.9],
                    [0, 1, 2,
                        3, 4, 5],
                    {
                        origin: Vec2.ZERO,
                        size: Vec2.ONE
                    }
                ),
                new Uint32Array([0, 1, 2, 0, 1, 2])
            )
        })
    }).timeout(99999)

    function runDiffusion(options: {
            topologyProjectorFactory: FieldPointTensorTopologyProjectorFactory<tf.Rank.R2>,
        }) {
        const spaceR2: FieldPointTensorSpace<tf.Rank.R2> = {
            shape: [["resolution", "y"], ["resolution", "x"]]
        }

        const spaceR0: FieldPointTensorSpace<tf.Rank.R0> = {
            shape: []
        }

        const a = new FieldPointTensorVariable(Number, spaceR2, "a")
        const spaceStretch = new FieldPointTensorVariable({ [0]: Number, [1]: Number }, spaceR2, "spaceStretch")

        const diffusion = new FieldPointTensorStatementDiffusion(
            a,
            spaceStretch,
            undefined!
        )

        const system = new FieldPointTensorSystem(
            [spaceR0, spaceR2],
            [a, spaceStretch],
            diffusion,
            new FieldPointTensorExpressionConstant<boolean, tf.Rank.R0>(Boolean, spaceR0, new Uint8Array([1]))
        )

        const instance = system.instance({
                resolution: new Vec2(256, 256),
                dt: 0.01,
            },
            new Map([
                [a, {
                    init(type, shape: TensorShape<tf.Rank.R2>) {
                        const elements = new Float32Array(shape[0] * shape[1])
                        const width = 5
                        for (let y = 0; y < shape[0]; y++)
                            for (let x = 0; x < shape[1]; x++)
                                elements[(y * shape[1]) + x] = ((x + y) % (2 * width)) >= width ? 0.5 : 0
                        return field_point_tensor_encode(type, shape, undefined, elements)
                    },
                }],
                [spaceStretch, {
                    init(type, shape: TensorShape<tf.Rank.R2>) {
                        return field_point_tensor_encode(
                            type,
                            shape,
                            undefined,
                            {
                                [0]: new Float32Array(shape[0] * shape[1]).fill(1),
                                [1]: new Float32Array(shape[0] * shape[1]).fill(1),
                            }
                        )
                    }
                }]
            ]),
            new Map<FieldPointTensorSpace, FieldPointTensorTopologyProjectorFactory>([
                [spaceR0, new FieldPointTensorTopologyProjectorFactoryIdentity()],
                [spaceR2, options.topologyProjectorFactory],
            ])
        )

        instance.init()

        renderTensor(<tf.Tensor2D>instance.variables.get(a)!.register, 1.5, "a")
        for (let i = 0; i < 20; i++) {
            assert.equal(instance.update().complete, true)
            renderTensor(<tf.Tensor2D>instance.variables.get(a)!.register, 1.5, "a")
        }
    }
})