import { PropertyPath } from "../paradigm/property-path.js"
import { ContextWorker } from "./context-worker.js"

export interface Processor<
        Item,
        Context = any
    > extends
    ContextWorker<Context> {
    //TODO: connections should be returned from init() method
    readonly connections: {
        readonly inputs: PropertyPath[]
        readonly outputs: PropertyPath[]
    }

    process(
            item: Item,
            context: Context
        ): void
}