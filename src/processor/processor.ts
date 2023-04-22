import { ContextWorker } from "./context-worker.js"

export interface Processor<
        Item,
        Context = any
    > extends
    ContextWorker<Context> {
    readonly dependencies: Function[]
        
    process(
            item: Item,
            context: Context
        ): void
}