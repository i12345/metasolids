import { LeafInterface, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, PropertyPath, groups } from "../../paradigm/index.js";
import { ProcessorConnections, ProcessorInitialization } from "../processor.js";
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer } from "./parallel.js";

export abstract class GroupsParallelizer<
        ParallelizedGroups extends MultiObjectsGroupsTemplate,
        ParallelizedItem,
        ParallelizedItems,
        ParallelizedItemContext,
        Item extends
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItems> =
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItems>,
        Context extends
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItemContext> =
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItemContext>,
        ParallelizedItemProcessor extends
            ParallelizedProcessor<
                    Item,
                    Context,
                    ParallelizedItem,
                    ParallelizedItemContext & ParallelizedContext<Item, Context>
                > =
            ParallelizedProcessor<
                    Item,
                    Context,
                    ParallelizedItem,
                    ParallelizedItemContext & ParallelizedContext<Item, Context>
                >
    >
    implements
    Parallelizer<
        Item,
        Context,
        ParallelizedItem,
        ParallelizedItemContext & ParallelizedContext<Item, Context>,
        ParallelizedItemProcessor
    > {
    constructor(public readonly parallelizedGroups: ParallelizedGroups) { }

    private readonly parallelized = function* (
            this: GroupsParallelizer<
                    ParallelizedGroups,
                    ParallelizedItem,
                    ParallelizedItems,
                    ParallelizedItemContext,
                    Item,
                    Context,
                    ParallelizedItemProcessor
                >,
            item: Item | undefined,
            context: Context
        ) {
        for (const parallelizedGroup of groups(this.parallelizedGroups)) {
            const parallelizedItems = item ? parallelizedGroup.get<ParallelizedItems>(item) : undefined
            const parallelizedContext = {
                ...parallelizedGroup.get<ParallelizedItemContext>(context),
                [ParallelizedContextParallelInfo]: { item, context }
            }

            yield {
                parallelizedGroup,
                parallelizedItems,
                parallelizedContext
            }
        }
    }

    protected abstract connectionItemPath(
        context: Context,
        parallelizedGroup: LeafInterface,
        parallelizedItemContext: ParallelizedItemContext
    ): PropertyPath

    protected abstract parallelizeProcess(
        context: Context,
        parallelizedGroup: LeafInterface,
        parallelizedItems: ParallelizedItems,
        parallelizedContext: ParallelizedItemContext & ParallelizedContext<Item, Context>,
        parallelizedItemProcessor: ParallelizedItemProcessor
    ): void

    init(
            context: Context,
            parallelizedItemProcessor: ParallelizedItemProcessor
        ): ProcessorInitialization {
        const connections: ProcessorConnections = {
            inputs: [],
            outputs: []
        }

        for (const { parallelizedGroup, parallelizedContext } of this.parallelized(undefined, context)) {
            const connectionItemPath = this.connectionItemPath(context, parallelizedGroup, parallelizedContext)
            const parallelizedInitialization = parallelizedItemProcessor.init(parallelizedContext)
            parallelizedInitialization.connections.inputs.forEach(path => connections.inputs.push([...parallelizedGroup.path, ...connectionItemPath, ...path]))
            parallelizedInitialization.connections.outputs.forEach(path => connections.outputs.push([...parallelizedGroup.path, ...connectionItemPath, ...path]))
        }
        
        return { connections }
    }

    process(
            item: Item,
            context: Context,
            parallelizedItemProcessor: ParallelizedItemProcessor
        ): void {
        for (const { parallelizedGroup, parallelizedItems, parallelizedContext } of this.parallelized(item, context)) {
            this.parallelizeProcess(
                context,
                parallelizedGroup,
                parallelizedItems!,
                parallelizedContext,
                parallelizedItemProcessor
            )
        }
    }
}