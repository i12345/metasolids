import { PropertyPath } from "../utils/property-path.js"
import { ContextWorker } from "./context-worker.js"

export interface Processor<
        Item,
        Context = any
    > extends
    ContextWorker<Context> {
    readonly dependencies: PropertyPath[]    

    process(
            item: Item,
            context: Context
        ): void
}