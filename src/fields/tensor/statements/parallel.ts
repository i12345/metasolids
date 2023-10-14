import { FieldPointTensorStatement, FieldPointTensorStatementContext, FieldPointTensorStatementResult } from "../statement.js"

export class FieldPointTensorStatementParallel implements FieldPointTensorStatement {
    constructor(public readonly children: FieldPointTensorStatement[]) { }
    
    init(context: FieldPointTensorStatementContext): void {
        for (const child of this.children)
            child.init(context)
    }

    dispose(): void {
        for (const child of this.children)
            child.dispose()
    }
    
    update(context: FieldPointTensorStatementContext): FieldPointTensorStatementResult {
        const childResults = this.children.map(child => child.update(context))

        const result: FieldPointTensorStatementResult = {
            differentials: new Map(),
            values: new Map()
        }

        for (const { differentials, values } of childResults) {
            if (differentials) {
                for (const [key, values] of differentials.entries()) {
                    if (!result.differentials!.has(key))
                        result.differentials!.set(key, values)
                    else result.differentials!.get(key)!.push(...values)
                }
            }

            if (values) {
                for (const [key, value] of values) {
                    if (result.values!.has(key))
                        throw new Error()

                    result.values!.set(key, value)
                }
            }
        }

        return result
    }
}