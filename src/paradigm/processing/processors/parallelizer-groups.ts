import { LeafInterface, MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, PropertyPath, groups } from "../../trees/index.js";
import { Reflect_entries, Reflect_fromEntries, mergeObjects } from "../../../utils/index.js";
import { ProcessorConnections, ProcessorInitialization } from "../processor.js";
import { ParallelizedProcessor, Parallelizer } from "./parallel.js";
import { EncapsulatingKey, WithEncapsulating, encapsulated } from "../../trees/encapsulating.js";

interface GroupsParallelizerContextDetails<
        ParallelizedGroups extends MultiObjectsGroupsTemplate,
        ParallelizedItem extends object,
        ParallelizedItems,
        ParallelizedContext extends object = object,
        Item extends
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItems> =
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItems>,
        Context extends
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedContext> =
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedContext>,
        ParallelizedItemProcessor extends
            ParallelizedProcessor<
                    Item,
                    Context,
                    ParallelizedItem & WithEncapsulating<Item>,
                    ParallelizedContext & WithEncapsulating<Context>
                > =
            ParallelizedProcessor<
                    Item,
                    Context,
                    ParallelizedItem & WithEncapsulating<Item>,
                    ParallelizedContext & WithEncapsulating<Context>
                >
    > {
    parallelizedContext_additions: MultiObjectsGroupsMapped<ParallelizedGroups, Partial<ParallelizedContext>>
}

const parallelizerInfoKey = Symbol("parallelizer-groups")
interface GroupsParallelizerContext<
        ParallelizedGroups extends MultiObjectsGroupsTemplate,
        ParallelizedItem extends object,
        ParallelizedItems,
        ParallelizedContext extends object = object,
        Item extends
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItems> =
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItems>,
        Context extends
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedContext> =
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedContext>,
        ParallelizedItemProcessor extends
            ParallelizedProcessor<
                    Item,
                    Context,
                    ParallelizedItem & WithEncapsulating<Item>,
                    ParallelizedContext & WithEncapsulating<Context>
                > =
            ParallelizedProcessor<
                    Item,
                    Context,
                    ParallelizedItem & WithEncapsulating<Item>,
                    ParallelizedContext & WithEncapsulating<Context>
                >
    > {
    [parallelizerInfoKey]?: Map<
        GroupsParallelizer<
            ParallelizedGroups,
            ParallelizedItem,
            ParallelizedItems,
            ParallelizedContext,
            Item,
            Context,
            ParallelizedItemProcessor
        >,
        GroupsParallelizerContextDetails<
            ParallelizedGroups,
            ParallelizedItem,
            ParallelizedItems,
            ParallelizedContext,
            Item,
            Context,
            ParallelizedItemProcessor
        >
    >
}

export abstract class GroupsParallelizer<
        ParallelizedGroups extends MultiObjectsGroupsTemplate,
        ParallelizedItem extends object,
        ParallelizedItems,
        ParallelizedContext extends object = object,
        Item extends
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItems> =
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItems>,
        Context extends
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedContext> =
            MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedContext>,
        ParallelizedProcessorT extends
            ParallelizedProcessor<
                    Item,
                    Context,
                    ParallelizedItem & WithEncapsulating<Item>,
                    ParallelizedContext & WithEncapsulating<Context>
                > =
            ParallelizedProcessor<
                    Item,
                    Context,
                    ParallelizedItem & WithEncapsulating<Item>,
                    ParallelizedContext & WithEncapsulating<Context>
                >
    >
    implements
    Parallelizer<
        Item,
        Context,
        ParallelizedItem & WithEncapsulating<Item>,
        ParallelizedContext & WithEncapsulating<Context>,
        ParallelizedProcessorT
    > {
    constructor(public readonly parallelizedGroups: ParallelizedGroups) { }

    private contextDetails(context: Context) {
        type GroupsParallelizerContextT = GroupsParallelizerContext<
            ParallelizedGroups,
            ParallelizedItem,
            ParallelizedItems,
            ParallelizedContext,
            Item,
            Context,
            ParallelizedProcessorT
        >
        
        type GroupsParallelizerContextDetailsT = GroupsParallelizerContextDetails<
            ParallelizedGroups,
            ParallelizedItem,
            ParallelizedItems,
            ParallelizedContext,
            Item,
            Context,
            ParallelizedProcessorT
        >
        
        const map = (context as GroupsParallelizerContextT)[parallelizerInfoKey] ??= new Map<typeof this, GroupsParallelizerContextDetailsT>()
        if (!map.has(this)) {
            map.set(this, {
                parallelizedContext_additions: {} as MultiObjectsGroupsMapped<ParallelizedGroups, Partial<ParallelizedContext>>
            })
        }

        return map.get(this)!
    }

    private readonly parallelized = function* (
            this: GroupsParallelizer<
                    ParallelizedGroups,
                    ParallelizedItem,
                    ParallelizedItems,
                    ParallelizedContext,
                    Item,
                    Context,
                    ParallelizedProcessorT
                >,
            item: Item | undefined,
            context: Context
        ) {        
        const details = this.contextDetails(context)
        
        for (const parallelizedGroup of groups(this.parallelizedGroups)) {
            const parallelizedItems = item ? parallelizedGroup.get<ParallelizedItems>(item) : undefined
            const parallelizedContext: ParallelizedContext = {
                ...parallelizedGroup.get<ParallelizedContext>(context),
                ...(parallelizedGroup.get(details.parallelizedContext_additions) ?? {})
            }

            const parallelizedContextEncapsulated = encapsulated(parallelizedContext, context)

            yield {
                parallelizedGroup,
                parallelizedItems,
                parallelizedContextEncapsulated
            }
        }
    }

    protected abstract connectionItemPath(
        context: Context,
        parallelizedGroup: LeafInterface,
        parallelizedContext: ParallelizedContext
    ): PropertyPath

    protected abstract parallelizeProcess(
        item: Item,
        context: Context,
        parallelizedGroup: LeafInterface,
        parallelizedItems: ParallelizedItems,
        parallelizedContextEncapsulated: ParallelizedContext & WithEncapsulating<Context>,
        parallelizedProcessor: ParallelizedProcessorT
    ): void

    init(
            context: Context,
            parallelizedProcessor: ParallelizedProcessorT
        ): ProcessorInitialization {
        const connections: ProcessorConnections = {
            inputs: [],
            outputs: []
        }

        const details = this.contextDetails(context)

        for (const { parallelizedGroup, parallelizedContextEncapsulated } of this.parallelized(undefined, context)) {
            const parallelizedContext_keys_original = Reflect.ownKeys(parallelizedContextEncapsulated) as PropertyKey[]
            const connectionItemPath = this.connectionItemPath(context, parallelizedGroup, parallelizedContextEncapsulated)
            const parallelizedInitialization = parallelizedProcessor.init(parallelizedContextEncapsulated)
            parallelizedInitialization.connections.inputs.forEach(path => connections.inputs.push([...parallelizedGroup.path, ...connectionItemPath, ...path]))
            parallelizedInitialization.connections.outputs.forEach(path => connections.outputs.push([...parallelizedGroup.path, ...connectionItemPath, ...path]))

            const parallelizedContext_entries_new = Reflect_entries(parallelizedContextEncapsulated)
            const paralellizedContext_entries_added = parallelizedContext_entries_new.filter(([key,]) => !parallelizedContext_keys_original.includes(key))
            const parallelizedContext_additions = Reflect_fromEntries(paralellizedContext_entries_added)
            
            parallelizedGroup.set(
                details.parallelizedContext_additions,
                mergeObjects([
                    parallelizedGroup.get(details.parallelizedContext_additions),
                    parallelizedContext_additions
                ])
            )
        }
        
        return { connections }
    }

    process(
            item: Item,
            context: Context,
            parallelizedProcessor: ParallelizedProcessorT
        ): void {
        for (const { parallelizedGroup, parallelizedItems, parallelizedContextEncapsulated } of this.parallelized(item, context)) {
            this.parallelizeProcess(
                item,
                context,
                parallelizedGroup,
                parallelizedItems!,
                parallelizedContextEncapsulated,
                parallelizedProcessor
            )
        }
    }
}