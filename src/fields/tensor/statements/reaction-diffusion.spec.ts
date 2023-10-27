import * as tf from '@tensorflow/tfjs-node'
import { describe, it, beforeEach, afterEach } from "mocha"
import { FieldPointTensorSystem, FieldPointTensorSpace, FieldPointTensorVariable, FieldPointTensorExpressionConstant, FieldPointTensorStatementDiffusion, field_point_tensor_encode, FieldPointTensorTopologyProjectorFactoryIdentity, FieldPointTensorTopologyProjectorFactory, FieldPointTensorStatement, FieldPointTensorStatementParallel, scalarSpace, FieldPointTensorExpressionVariable, FieldPointTensorArithmeticOp, FieldPointTensorExpressionArithmetic, FieldPointTensorFactory, FieldPointTensorStatementPDE } from "../index.js"
import { Triangle2DMeshTopologyProjectorFactory, Triangles2DMesh } from "../../triangle-2D-mesh/index.js"
import { Vec2 } from "playcanvas-extended"
import { TensorShape } from "../../../utils/tf-rank.js"
import { renderTensor } from "../../../utils/tf-img.js"
import { assert } from "chai"
import { mockDOM } from "node-canvas-webgl"
import jsdomSetup from "jsdom-global"
import { Reflect_fromEntries } from '../../../utils/reflect-entries.js'
import { FieldPointTensorStatementReactionGrayScott } from './reactions/gray-scott.js'

describe("tensor reaction-diffusion", () => {
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

    const tensorInitializers = {
        constant_25: <FieldPointTensorFactory<number, tf.Rank.R2>>{
            init(type, shape) {
                return field_point_tensor_encode(type, shape, undefined, new Float32Array(shape[0] * shape[1]).fill(0.25))
            }
        },
        constant_50: <FieldPointTensorFactory<number, tf.Rank.R2>>{
            init(type, shape) {
                return field_point_tensor_encode(type, shape, undefined, new Float32Array(shape[0] * shape[1]).fill(0.50))
            }
        },
        gradient: <FieldPointTensorFactory<number, tf.Rank.R2>>{
            init(type, shape) {
                const elements = new Float32Array(shape[0] * shape[1])
                for (let y = 0; y < shape[0]; y++)
                    for (let x = 0; x < shape[1]; x++)
                        elements[(y * shape[1]) + x] = x / shape[1]
                return field_point_tensor_encode(type, shape, undefined, elements)
            }
        },
        stripes: <FieldPointTensorFactory<number, tf.Rank.R2>>{
            init(type, shape) {
                const elements = new Float32Array(shape[0] * shape[1])
                const width = 5
                for (let y = 0; y < shape[0]; y++)
                    for (let x = 0; x < shape[1]; x++)
                        elements[(y * shape[1]) + x] = ((x + y) % (2 * width)) >= width ? 0.5 : 0
                return field_point_tensor_encode(type, shape, undefined, elements)
            }
        },
    }

    const topologyProjectorFactories = {
        plain: new FieldPointTensorTopologyProjectorFactoryIdentity<tf.Rank.R2>(),
        tris: new Triangle2DMeshTopologyProjectorFactory(
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
        ),
    }

    it("diffusion / plane 2D / stripes", () => {
        runDiffusion({
            topologyProjectorFactory: topologyProjectorFactories.plain,
            variables: {
                a: tensorInitializers.stripes,
            },
            t: 10,
            init: () => [],
        })
    }).timeout(-1)

    it("diffusion / 2 tri / stripes", () => {
        runDiffusion({
            topologyProjectorFactory: topologyProjectorFactories.tris,
            variables: {
                a: tensorInitializers.stripes,
            },
            t: 10,
            init: () => [],
        })
    }).timeout(-1)

    it("diffusion / 2 tri / gradient", () => {
        runDiffusion({
            topologyProjectorFactory: topologyProjectorFactories.tris,
            variables: {
                a: tensorInitializers.gradient,
            },
            t: 10,
            init: () => [],
        })
    }).timeout(-1)

    it("reaction-diffusion / 2 tri / stripes & gradient / Grey Scott", () => {
        runDiffusion({
            topologyProjectorFactory: topologyProjectorFactories.tris,
            variables: {
                a: tensorInitializers.stripes,
                b: tensorInitializers.constant_25,
            },
            t: 100,
            init: ({ a, b }) => [
                new FieldPointTensorStatementReactionGrayScott(
                    a,
                    b,
                    new FieldPointTensorExpressionConstant<number>(Number, scalarSpace, new Float32Array([0.0625])),
                    new FieldPointTensorExpressionConstant<number>(Number, scalarSpace, new Float32Array([0.04545])),
                )
            ],
        })
    }).timeout(-1)

    function runDiffusion(options: {
            topologyProjectorFactory: FieldPointTensorTopologyProjectorFactory<tf.Rank.R2>
            variables: Record<string, FieldPointTensorFactory<number, tf.Rank.R2>>
            t: number
            init: (variables: Record<string, FieldPointTensorVariable<number, tf.Rank.R2>>) => FieldPointTensorStatement[]
        }) {
        const spaceR2: FieldPointTensorSpace<tf.Rank.R2> = {
            shape: [["resolution", "y"], ["resolution", "x"]]
        }

        const variable_t = new FieldPointTensorVariable(Number, scalarSpace)
        const variables = Reflect_fromEntries<Record<string, FieldPointTensorVariable<number, tf.Rank.R2>>>(
            (<string[]>Reflect.ownKeys(options.variables))
                .map(variable => [variable, new FieldPointTensorVariable(Number, spaceR2, variable)])
        )
        const spaceStretch = new FieldPointTensorVariable({ [0]: Number, [1]: Number }, spaceR2, "spaceStretch")

        const diffusions = Reflect.ownKeys(options.variables).map(variable => new FieldPointTensorStatementDiffusion(
            variables[<string>variable],
            spaceStretch,
            undefined!
        ))

        const system = new FieldPointTensorSystem(
            [scalarSpace, spaceR2],
            [...(<string[]>Reflect.ownKeys(options.variables)).map(variable => variables[variable]), variable_t, spaceStretch],
            new FieldPointTensorStatementParallel([
                ...diffusions,
                new FieldPointTensorStatementPDE(variable_t, new FieldPointTensorExpressionConstant(Number, scalarSpace, new Float32Array([1]))),
                ...options.init(variables)
            ]),
            new FieldPointTensorExpressionArithmetic<boolean, tf.Rank.R0>(
                FieldPointTensorArithmeticOp.gte,
                new FieldPointTensorExpressionVariable(variable_t),
                new FieldPointTensorExpressionConstant(Number, scalarSpace, new Float32Array([options.t]))
            )
        )

        const instance = system.instance({
                resolution: new Vec2(256, 256),
                dt: 0.1,
            },
            new Map<FieldPointTensorVariable, FieldPointTensorFactory>([
                ...(<string[]>Reflect.ownKeys(options.variables)).map(variable => <[FieldPointTensorVariable<number, tf.Rank.R2>, FieldPointTensorFactory<number, tf.Rank.R2>]>[
                    variables[variable],
                    options.variables[variable]
                ]),
                [variable_t, {
                    init() { return tf.scalar(0) }
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
                [scalarSpace, new FieldPointTensorTopologyProjectorFactoryIdentity()],
                [spaceR2, options.topologyProjectorFactory],
            ])
        )

        instance.init()

        function renderVariables() {
            for (const variable of Reflect.ownKeys(variables))
                renderTensor(<tf.Tensor2D>instance.variables.get(variables[<string>variable])!.register, 1.5, <string>variable)
        }

        renderVariables()
        for (let i = 0, isComplete = false; !isComplete; i++) {
            isComplete = instance.update().complete
            if ((i % 10) === 0)
                renderVariables()
        }
    }
})