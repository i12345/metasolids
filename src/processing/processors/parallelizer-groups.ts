import { LeafInterface, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, PropertyPath, groups } from "../../paradigm/index.js";
import { Reflect_entries, Reflect_fromEntries } from "../../utils/reflect-entries.js";
import { ProcessorConnections, ProcessorInitialization } from "../processor.js";
import { ParallelizedContext, ParallelizedContextParallelInfo, ParallelizedProcessor, Parallelizer } from "./parallel.js";

interface GroupsParallelizerContextDetails<
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
    > {
    parallelizedContext_additions: MultiObjectsGroupsMapped<ParallelizedGroups, Partial<ParallelizedItemContext>>
}

const parallelizerInfoKey = Symbol()
interface GroupsParallelizerContext<
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
    > {
    [parallelizerInfoKey]?: Map<
        GroupsParallelizer<
            ParallelizedGroups,
            ParallelizedItem,
            ParallelizedItems,
            ParallelizedItemContext,
            Item,
            Context,
            ParallelizedItemProcessor
        >,
        GroupsParallelizerContextDetails<
            ParallelizedGroups,
            ParallelizedItem,
            ParallelizedItems,
            ParallelizedItemContext,
            Item,
            Context,
            ParallelizedItemProcessor
        >
    >
}

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

    private contextDetails(context: Context) {
        type GroupsParallelizerContextT = GroupsParallelizerContext<
            ParallelizedGroups,
            ParallelizedItem,
            ParallelizedItems,
            ParallelizedItemContext,
            Item,
            Context,
            ParallelizedItemProcessor
        >
        
        type GroupsParallelizerContextDetailsT = GroupsParallelizerContextDetails<
            ParallelizedGroups,
            ParallelizedItem,
            ParallelizedItems,
            ParallelizedItemContext,
            Item,
            Context,
            ParallelizedItemProcessor
        >
        
        const map = (context as GroupsParallelizerContextT)[parallelizerInfoKey] ??= new Map<typeof this, GroupsParallelizerContextDetailsT>()
        if (!map.has(this)) {
            map.set(this, {
                parallelizedContext_additions: {} as MultiObjectsGroupsMapped<ParallelizedGroups, Partial<ParallelizedItemContext>>
            })
        }

        return map.get(this)!
    }

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
        const details = this.contextDetails(context)
        
        for (const parallelizedGroup of groups(this.parallelizedGroups)) {
            const parallelizedItems = item ? parallelizedGroup.get<ParallelizedItems>(item) : undefined
            const parallelizedContext = {
                ...parallelizedGroup.get<ParallelizedItemContext>(context),
                ...(parallelizedGroup.get(details.parallelizedContext_additions) ?? {}),
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

        const details = this.contextDetails(context)

        for (const { parallelizedGroup, parallelizedContext } of this.parallelized(undefined, context)) {
            const parallelizedContext_keys_original = Reflect.ownKeys(parallelizedContext) as PropertyKey[]
            const connectionItemPath = this.connectionItemPath(context, parallelizedGroup, parallelizedContext)
            const parallelizedInitialization = parallelizedItemProcessor.init(parallelizedContext)
            parallelizedInitialization.connections.inputs.forEach(path => connections.inputs.push([...parallelizedGroup.path, ...connectionItemPath, ...path]))
            parallelizedInitialization.connections.outputs.forEach(path => connections.outputs.push([...parallelizedGroup.path, ...connectionItemPath, ...path]))

            const parallelizedContext_entries_new = Reflect_entries<ParallelizedItemContext>(parallelizedContext)
            const paralellizedContext_entries_added = parallelizedContext_entries_new.filter(([key,]) => !parallelizedContext_keys_original.includes(key))
            const parallelizedContext_additions = Reflect_fromEntries<ParallelizedItemContext>(paralellizedContext_entries_added)
            parallelizedGroup.set(details.parallelizedContext_additions, parallelizedContext_additions)
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