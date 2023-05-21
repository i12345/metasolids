import { PropertyPath } from "../../utils/property-path.js";
import { Processor } from "../processor.js";

export const ParallelizedContextParallelInfo = Symbol("parallel")

export interface ParallelizedContext<
        ParallelItem,
        ParallelContext
    > {
    [ParallelizedContextParallelInfo]: {
        item?: ParallelItem
        context: ParallelContext
    }
}

export interface ParallelizedProcessor<
        Item,
        Context,
        ParallelizedItem,
        ParallelizedItemContext extends
            ParallelizedContext<Item, Context> = 
            ParallelizedContext<Item, Context>,
    > extends
        Processor<
                ParallelizedItem,
                ParallelizedItemContext
            > { }

export interface Parallelizer<
        Item,
        Context,
        ParallelizedItem,
        ParallelizedItemContext extends
            ParallelizedContext<Item, Context> = 
            ParallelizedContext<Item, Context>,
        ParallelizedItemProcessor extends
            ParallelizedProcessor<Item, Context, ParallelizedItem, ParallelizedItemContext> =
            ParallelizedProcessor<Item, Context, ParallelizedItem, ParallelizedItemContext>
    > {
    readonly parallelizedPath: PropertyPath
    
    init(
            context: Context,
            parallelizedItemProcessor: ParallelizedItemProcessor
        ): void
    
    parallelize(
            item: Item,
            context: Context,
            parallelizedItemProcessor: ParallelizedItemProcessor
        ): void
}

export class ParallelizingProcessor<
        Item,
        Context,
        ParallelizedItem,
        ParallelizedItemContext extends
            ParallelizedContext<Item, Context> = 
            ParallelizedContext<Item, Context>,
        ParallelizedItemProcessor extends
            Processor<
                    ParallelizedItem,
                    ParallelizedContext<Item, Context>
                > =
            Processor<
                    ParallelizedItem,
                    ParallelizedContext<Item, Context>
                >,
        ParallelizerT extends
            Parallelizer<Item, Context, ParallelizedItem, ParallelizedItemContext, ParallelizedItemProcessor> =
            Parallelizer<Item, Context, ParallelizedItem, ParallelizedItemContext, ParallelizedItemProcessor>
    >
    implements Processor<Item, Context> {
    private _connections!: {
        readonly inputs: PropertyPath[]
        readonly outputs: PropertyPath[]
    }

    get connections() {
        return this._connections
    }

    constructor(
            public parallelizer: ParallelizerT,
            public itemProcessor: ParallelizedItemProcessor,
            public otherDependencies: PropertyPath[] = []
        ) { }
    
    init(context: Context): void {
        this.parallelizer.init(context, this.itemProcessor)

        this._connections = {
            inputs: this.itemProcessor.connections.inputs.map(input => [...this.parallelizer.parallelizedPath, ...input]),
            outputs: this.itemProcessor.connections.outputs.map(output => [...this.parallelizer.parallelizedPath, ...output]),
        }
    }

    process(item: Item, context: Context): void {
        this.parallelizer.parallelize(item, context, this.itemProcessor)
    }
}