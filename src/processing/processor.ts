import { PropertyPath } from "../paradigm/property-path.js"

export interface ProcessorConnections {
    readonly inputs: PropertyPath[]
    readonly outputs: PropertyPath[]
}

export interface ProcessorInitialization {
    readonly connections: ProcessorConnections
}

export interface Processor<
        Item = any,
        Context = any
    > {
    init(context: Context): ProcessorInitialization

    process(
            item: Item,
            context: Context
        ): void
}

export interface ProcessingPair<
        Item = any,
        Context = any
    > {
    item: Item
    context: Context
}