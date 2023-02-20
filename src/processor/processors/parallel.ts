import { ContextWorker } from "../context-worker.js";
import { Processor } from "../processor.js";

export const ParallelizedContextParallelInfo = Symbol("parallel")

export interface ParallelizedContext<
        ParallelItem,
        ParallelContext
    > {
        [ParallelizedContextParallelInfo]: {
        item: ParallelItem,
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
    get dependencies(): Function[] {
        return []
    }

    constructor(
            public parallelizer: ParallelizerT,
            public itemProcessor: ParallelizedItemProcessor
        ) { }
    
    init(context: Context): void {
        this.parallelizer.init(context, this.itemProcessor)
    }

    process(item: Item, context: Context): void {
        this.parallelizer.parallelize(item, context, this.itemProcessor)
    }
}