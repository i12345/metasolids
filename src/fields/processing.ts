import { MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsProcessingContext, MultiObjectsProcessingResult, MultiObjectsTemplate, groupKindObjectsGrouped, groupKinds } from "../paradigm/trees/index.js";
import { Field } from "./field.js";
import { FieldPoint } from "./point.js";

export const GroupFieldKey = Symbol("field")

export interface GroupWithField<FieldT extends Field = Field> {
    [GroupFieldKey]: FieldT
}

export type MultiObjectsGroupsWithFieldsProcessingContext<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        GroupKinds extends
            MultiObjectsGroupsKindsTemplate =
            MultiObjectsGroupsKindsTemplate,
        T extends FieldPoint = FieldPoint,
        FieldT extends Field<T> = Field<T>,
    > =
    MultiObjectsGroupsProcessingContext<Groups, GroupKinds> &
    MultiObjectsGroupsMapped<Groups, GroupWithField<FieldT>>

//TODO: separate different fieldpoint type parameters for the fieldT
export type MultiObjectsWithGroupFieldsProcessingContext<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends MultiObjectsGrouped<Objects, Groups> = MultiObjectsGrouped<Objects, Groups>,
        GroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        T extends FieldPoint = FieldPoint,
        FieldT extends Field<T> = Field<T>,
    > =
    MultiObjectsProcessingContext<Objects, Groups, ObjectsGrouped, GroupKinds> &
    MultiObjectsGroupsWithFieldsProcessingContext<Groups, GroupKinds, T, FieldT>

export function* groupKindsWithFields<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        GroupKinds extends
            MultiObjectsGroupsKindsTemplate =
            MultiObjectsGroupsKindsTemplate,
        T extends FieldPoint = FieldPoint,
        FieldT extends Field<T> = Field<T>,
    >(
        context: MultiObjectsGroupsWithFieldsProcessingContext<Groups, GroupKinds, T, FieldT>,
        kindsTemplate?: GroupKinds,
        groupsFilter?: Groups
    ) {
    for (const { group, kind } of groupKinds(context, kindsTemplate, groupsFilter)) {
        yield {
            group: {
                ...group,
                field: group.get<GroupWithField<FieldT>>(context)[GroupFieldKey]
            },
            kind
        }
    }
}

export function* groupKindObjectsGroupedWithFields<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends MultiObjectsGrouped<Objects, Groups> = MultiObjectsGrouped<Objects, Groups>,
        GroupKinds extends
            MultiObjectsGroupsKindsTemplate =
            MultiObjectsGroupsKindsTemplate,
        T = any,
        Point extends FieldPoint = FieldPoint,
        FieldT extends Field<Point> = Field<Point>,
    >(
        result: MultiObjectsProcessingResult<Objects, Groups, T>,
        context: MultiObjectsWithGroupFieldsProcessingContext<Objects, Groups, ObjectsGrouped, GroupKinds, Point, FieldT>,
        kindsTemplate: GroupKinds,
        groupsFilter?: Groups
    ) {
    for (const groupedObjects of groupKindObjectsGrouped(result, context, kindsTemplate, groupsFilter)) {
        yield {
            ...groupedObjects,
            group: {
                ...groupedObjects.group,
                field: groupedObjects.group.get<GroupWithField<FieldT>>(context)[GroupFieldKey]
            }
        }
    }
}