import { LeafInterface, PROPERTYKEY_ALL, PropertyPath, MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped } from "../../trees/index.js";
import { encapsulated, WithEncapsulating } from "../../trees/encapsulating.js";
import { ParallelizedProcessor } from "./parallel.js";
import { GroupsParallelizer } from "./parallelizer-groups.js";

export class IterableParallelizer<
        ParallelizedGroups extends MultiObjectsGroupsTemplate,
        ParallelizedItem extends object,
        ParallelizedContext extends object = object,
        Item extends
            MultiObjectsGroupsMapped<ParallelizedGroups, Iterable<ParallelizedItem>> =
            MultiObjectsGroupsMapped<ParallelizedGroups, Iterable<ParallelizedItem>>,
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
    > extends
    GroupsParallelizer<
            ParallelizedGroups,
            ParallelizedItem,
            Iterable<ParallelizedItem>,
            ParallelizedContext,
            Item,
            Context,
            ParallelizedProcessorT
        > {
    protected connectionItemPath(
            context: Context,
            parallelizedGroup: LeafInterface,
            parallelizedContext: ParallelizedContext
        ): PropertyPath {
        return [PROPERTYKEY_ALL]
    }

    protected parallelizeProcess(
            item: Item,
            context: Context,
            parallelizedGroup: LeafInterface,
            parallelizedItems: Iterable<ParallelizedItem>,
            parallelizedContextEncapsulated: ParallelizedContext & WithEncapsulating<Context>,
            parallelizedProcessor: ParallelizedProcessorT
        ): void {
        for (const parallelizedItem of parallelizedItems) {
            const parallelizedItemEncapsulated = encapsulated(parallelizedItem, item)
            parallelizedProcessor.process(parallelizedItemEncapsulated, parallelizedContextEncapsulated)
        }
    }
}