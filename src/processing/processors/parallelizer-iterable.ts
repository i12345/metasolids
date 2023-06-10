import { MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped } from "../../paradigm/multi-objects.js";
import { PROPERTYKEY_ALL, PropertyPath } from "../../paradigm/property-path.js";
import { LeafInterface } from "../../paradigm/tree.js";
import { ParallelizedProcessor, ParallelizedContext } from "./parallel.js";
import { GroupsParallelizer } from "./parallelizer-groups.js";

export class IterableParallelizer<
        ParallelizedGroups extends MultiObjectsGroupsTemplate,
        ParallelizedItem,
        ParallelizedItemContext,
        Item extends
            MultiObjectsGroupsMapped<ParallelizedGroups, Iterable<ParallelizedItem>> =
            MultiObjectsGroupsMapped<ParallelizedGroups, Iterable<ParallelizedItem>>,
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
    > extends
    GroupsParallelizer<
            ParallelizedGroups,
            ParallelizedItem,
            Iterable<ParallelizedItem>,
            ParallelizedItemContext,
            Item,
            Context,
            ParallelizedItemProcessor
    > {
    protected connectionItemPath(
            context: Context,
            parallelizedGroup: LeafInterface,
            parallelizedItemContext: ParallelizedItemContext
        ): PropertyPath {
        return [PROPERTYKEY_ALL]
    }

    protected parallelizeProcess(
            context: Context,
            parallelizedGroup: LeafInterface,
            parallelizedItems: Iterable<ParallelizedItem>,
            parallelizedContext: ParallelizedItemContext & ParallelizedContext<Item, Context>,
            parallelizedItemProcessor: ParallelizedItemProcessor
        ): void {
        for (const parallelizedItem of parallelizedItems)
            parallelizedItemProcessor.process(parallelizedItem, parallelizedContext)
    }
}