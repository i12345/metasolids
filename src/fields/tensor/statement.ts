import { FieldPointTensorExpressionContext } from "./expression.js"
import { FieldPointTensor } from "./tensor.js"
import { FieldPointTensorVariable, FieldPointTensorVariableMap } from "./variable.js"

export interface FieldPointTensorStatementContext
    extends FieldPointTensorExpressionContext {
}

export interface FieldPointTensorStatementResult {
    differentials?: Map<FieldPointTensorVariable, FieldPointTensor[]>
    values?: Map<FieldPointTensorVariable, FieldPointTensor>
}

export interface FieldPointTensorStatement {
    init(context: FieldPointTensorStatementContext): void
    dispose(): void

    update(context: FieldPointTensorStatementContext): FieldPointTensorStatementResult
}