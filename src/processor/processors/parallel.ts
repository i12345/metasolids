import { PropertyPath } from "../../utils/property-path.js";
import { Processor } from "../processor.js";

export const ParallelizedContextParallelInfo = Symbol("parallel")

export interface ParallelizedContext<
        ParallelItem,
        ParallelContext
    > {
    [ParallelizedContextParallelInfo]: {
        item: ParallelItem
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
    readonly dependencyPrefix: PropertyPath
    
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
    get dependencies() {
        return [
            ...this.itemProcessor.dependencies.map(dependencies => [
                ...this.parallelizer.dependencyPrefix,
                ...dependencies
            ]),
            ...this.otherDependencies
        ]
    }

    constructor(
            public parallelizer: ParallelizerT,
            public itemProcessor: ParallelizedItemProcessor,
            public otherDependencies: PropertyPath[] = []
        ) { }
    
    init(context: Context): void {
        this.parallelizer.init(context, this.itemProcessor)
    }

    process(item: Item, context: Context): void {
        this.parallelizer.parallelize(item, context, this.itemProcessor)
    }
}