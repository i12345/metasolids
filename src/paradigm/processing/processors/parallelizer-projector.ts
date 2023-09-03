import { WithEncapsulating, encapsulated } from "../../trees/encapsulating.js";
import { MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped } from "../../trees/multi-objects-groups.js";
import { PropertyPath } from "../../trees/path.js";
import { LeafInterface } from "../../trees/tree.js";
import { ParallelizedProcessor } from "./parallel.js";
import { GroupsParallelizer } from "./parallelizer-groups.js";

export class ProjectorParallelizer<
    ParallelizedGroups extends MultiObjectsGroupsTemplate,
    ParallelizedItem extends object,
    ParallelizedContext extends object = object,
    Item extends
        MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItem> =
        MultiObjectsGroupsMapped<ParallelizedGroups, ParallelizedItem>,
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
        ParallelizedItem,
        ParallelizedContext,
        Item,
        Context,
        ParallelizedProcessorT
    > {
    constructor(parallelizedGroups: ParallelizedGroups) {
        super(parallelizedGroups)
    }

    protected connectionItemPath(
            context: Context,
            parallelizedGroup: LeafInterface<any>,
            parallelizedContext: ParallelizedContext
        ): PropertyPath {
        return []
    }

    protected parallelizeProcess(
            item: Item,
            context: Context,
            parallelizedGroup: LeafInterface<any>,
            parallelizedItems: ParallelizedItem,
            parallelizedContextEncapsulated: ParallelizedContext & WithEncapsulating<Context>,
            parallelizedProcessor: ParallelizedProcessorT
        ): void {
        const parallelizedItemEncapsulated = encapsulated(parallelizedItems, item)

        parallelizedProcessor.process(parallelizedItemEncapsulated, parallelizedContextEncapsulated)
    }
}