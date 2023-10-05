import { FieldPoint } from "../point.js"
import * as tf from '@tensorflow/tfjs'
import { extract } from "../../paradigm/trees/index.js"
import { FieldPointTensorStatement, FieldPointTensorStatementContext } from "./statement.js"
import { FieldPointTensor, field_point_tensor_map } from "./tensor.js"
import { FieldPointTensorExpression } from "./expression.js"
import { FieldPointTensorVariable, FieldPointTensorVariableInitializationContext, FieldPointTensorVariableMap } from "./variable.js"

export class FieldPointTensorSystem {
    constructor(
        public variables: FieldPointTensorVariable[],
        public statement: FieldPointTensorStatement,
        public end: FieldPointTensorExpression<number, tf.Rank.R0>
    ) { }
}

export interface FieldPointTensorSystemRunnerContext
    extends
    FieldPointTensorStatementContext,
    FieldPointTensorVariableInitializationContext {
    runner: FieldPointTensorSystemRunner
}

export class FieldPointTensorSystemRunner {
    readonly context: FieldPointTensorSystemRunnerContext

    constructor(
        public readonly system: FieldPointTensorSystem,
        public readonly parameters: FieldPoint,
        public readonly dt: number = 0.1
    ) {
        this.context = {
            parameters,
            runner: this,
            variables: new FieldPointTensorVariableMap(system.variables.map(variable => variable.instance()))
        }
    }

    init() {
        this.context.variables.init(this.context)
        this.system.statement.init(this.context)
        this.system.end.init(this.context)
    }

    update() {
        return tf.tidy(() => {
            const result = this.system.statement.update(this.context)

            const dt = this.dt

            if (result.differentials) {
                for (const [buffer, differential] of result.differentials) {
                    const currentValue = this.context.variables.get(buffer)!
                    const newValue = <FieldPointTensor>field_point_tensor_map(
                        buffer.type,
                        currentValue,
                        (raw, path) => <any>tf.add(raw, extract<tf.Tensor>(differential, path).mul(dt))
                    )
                    this.context.variables.set(buffer, newValue)
                }
            }

            if (result.values)
                for (const [buffer, value] of result.values)
                    this.context.variables.set(buffer, value)

            return this.system.end.eval(this.context)
        })
    }

    dispose() {
        this.context.variables.dispose()
        this.system.statement.dispose()
        this.system.end.dispose()
    }
}
