import { PropertyPath } from "../utils/property-path.js"
import { ContextWorker } from "./context-worker.js"

export interface Processor<
        Item,
        Context = any
    > extends
    ContextWorker<Context> {
    readonly connections: {
        readonly inputs: PropertyPath[]
        readonly outputs: PropertyPath[]
    }

    process(
            item: Item,
            context: Context
        ): void
}