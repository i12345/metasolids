import { MultiObjectsGrouped, MultiObjectsGroupedObjectsKey, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, MultiObjectsGroupsTemplate, MultiObjectsMapped, MultiObjectsProcessingContext, MultiObjectsProcessingResult, MultiObjectsTemplate, groupKindObjectsGrouped, groupKinds } from "../paradigm/trees/index.js";
import { Field } from "./field.js";
import { MultiObjectsField } from "./fields/index.js";
import { FieldPoint } from "./point.js";
import { MultiObjectsFieldPointElement } from "./type.js";

export const GroupFieldKey = Symbol("field")

export interface GroupWithField<FieldT extends Field = Field> {
    [GroupFieldKey]: FieldT
}

export type MultiObjectsGroupsWithFieldsProcessingContext<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        GroupKinds extends
            MultiObjectsGroupsKindsTemplate =
            MultiObjectsGroupsKindsTemplate,
        Point extends FieldPoint = FieldPoint,
        ElementTypePoint extends FieldPoint = Point,
        FuseModePoint extends FieldPoint = Point,
        FieldT extends
            Field<Point, ElementTypePoint, FuseModePoint> =
            Field<Point, ElementTypePoint, FuseModePoint>,
    > =
    MultiObjectsGroupsProcessingContext<Groups, GroupKinds> &
    MultiObjectsGroupsMapped<Groups, GroupWithField<FieldT>>

//TODO: separate different fieldpoint type parameters for the fieldT
export type MultiObjectsWithGroupFieldsProcessingContext<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends MultiObjectsGrouped<Objects, Groups> = MultiObjectsGrouped<Objects, Groups>,
        GroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        Point extends FieldPoint = FieldPoint
    > =
    MultiObjectsProcessingContext<Objects, Groups, ObjectsGrouped, GroupKinds> &
    MultiObjectsGroupsWithFieldsProcessingContext<
            Groups,
            GroupKinds,
            MultiObjectsMapped<Objects, Point>,
            MultiObjectsFieldPointElement<Point>,
            Point,
            MultiObjectsField<Point, Objects>
        >

export function* groupKindsWithFields<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        GroupKinds extends
            MultiObjectsGroupsKindsTemplate =
            MultiObjectsGroupsKindsTemplate,
        Point extends FieldPoint = FieldPoint,
        ElementTypePoint extends FieldPoint = Point,
        FuseModePoint extends FieldPoint = Point,
        FieldT extends
            Field<Point, ElementTypePoint, FuseModePoint> =
            Field<Point, ElementTypePoint, FuseModePoint>,
    >(
        context: MultiObjectsGroupsWithFieldsProcessingContext<Groups, GroupKinds, Point, ElementTypePoint, FuseModePoint, FieldT>,
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
    >(
        result: MultiObjectsProcessingResult<Objects, Groups, T>,
        context: MultiObjectsWithGroupFieldsProcessingContext<Objects, Groups, ObjectsGrouped, GroupKinds, Point>,
        kindsTemplate: GroupKinds,
        groupsFilter?: Groups
    ) {
    type FieldT = MultiObjectsField<Point, Objects>

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