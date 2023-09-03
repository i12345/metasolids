import { Processor, ProcessorInitialization } from "../processor.js";
import { WithEncapsulating } from "../../trees/encapsulating.js";

export interface ParallelizedProcessor<
        Item,
        Context,
        ParallelizedItem extends
            WithEncapsulating<Item> =
            WithEncapsulating<Item>,
        ParallelizedContext extends
            WithEncapsulating<Context> =
            WithEncapsulating<Context>,
    > extends
        Processor<
                ParallelizedItem,
                ParallelizedContext
            > { }

export interface Parallelizer<
        Item,
        Context,
        ParallelizedItem extends
            WithEncapsulating<Item> =
            WithEncapsulating<Item>,
        ParallelizedContext extends
            WithEncapsulating<Context> =
            WithEncapsulating<Context>,
        ParallelizedItemProcessor extends
            ParallelizedProcessor<Item, Context, ParallelizedItem, ParallelizedContext> =
            ParallelizedProcessor<Item, Context, ParallelizedItem, ParallelizedContext>
    > {
    init(
            context: Context,
            parallelizedItemProcessor: ParallelizedItemProcessor
        ): ProcessorInitialization

    process(
            item: Item,
            context: Context,
            parallelizedItemProcessor: ParallelizedItemProcessor
        ): void
}

export class ParallelizingProcessor<
        Item,
        Context,
        ParallelizedItem extends
            WithEncapsulating<Item> =
            WithEncapsulating<Item>,
        ParallelizedContext extends
            WithEncapsulating<Context> =
            WithEncapsulating<Context>,
        ParallelizedItemProcessor extends
            Processor<
                    ParallelizedItem,
                    ParallelizedContext
                > =
            Processor<
                    ParallelizedItem,
                    ParallelizedContext
                >,
        ParallelizerT extends
            Parallelizer<Item, Context, ParallelizedItem, ParallelizedContext, ParallelizedItemProcessor> =
            Parallelizer<Item, Context, ParallelizedItem, ParallelizedContext, ParallelizedItemProcessor>
    >
    implements Processor<Item, Context> {
    constructor(
            public parallelizer: ParallelizerT,
            public itemProcessor: ParallelizedItemProcessor
        ) { }

    init(context: Context) {
        return this.parallelizer.init(context, this.itemProcessor)
    }

    process(item: Item, context: Context): void {
        this.parallelizer.process(item, context, this.itemProcessor)
    }
}