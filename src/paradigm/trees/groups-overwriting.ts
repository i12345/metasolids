import { DeepPartial } from "../../utils/deep-partial.js";
import { MultiObjectsGroupsMapped, MultiObjectsGroupsTemplate, isGroupLeaf } from "./multi-objects-groups.js";

export function mergeOverwrite<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T extends MultiObjectsGroupsMapped<Groups, any> = MultiObjectsGroupsMapped<Groups, any>
    >(
        obj: T,
        overwrite_group: Groups,
        overwrite_values: DeepPartial<T>
    ) {
    for (const key of Reflect.ownKeys(overwrite_group)) {
        if (isGroupLeaf(overwrite_group[key]) || !(key in obj))
            (<any>obj)[key] = overwrite_values[key]
        else mergeOverwrite(
            (<any>obj)[key],
            <MultiObjectsGroupsTemplate>overwrite_group[key],
            (<any>overwrite_values)[key]
        )
    }
}