import { Processor } from "../processor/processor.js";
import { onlyOne } from "../utils/only-one.js";
import { PropertyPath } from "../utils/property-path.js";
import { extract, leavesByValue, mapTreeByLeavesValue, pathsToValue } from "../utils/tree.js";
import { FieldPoint, FieldsPoint, fields_point_add_inplace_weighted, field_point_divide } from "./point.js";

export const MultiObjectsTemplate_Leaf = Symbol("object")
export interface MultiObjectsTemplate {
    [key: PropertyKey]:
        MultiObjectsTemplate |
        typeof MultiObjectsTemplate_Leaf
}

export type MultiObjectsMapped<
        Objects extends MultiObjectsTemplate,
        T,
    > = {
    [K in keyof Objects]:
        Objects[K] extends MultiObjectsTemplate ?
            MultiObjectsMapped<Objects[K], T> :
            T
}

export type MultiObjectsFieldPoint<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Point extends FieldPoint = FieldPoint
    > =
    MultiObjectsMapped<Objects, Point>

export const MultiObjectsCombinedValue = Symbol("combined")

export type MultiObjectsMappedAndCombined<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        T = any,
        Combined = T
    > =
    { [MultiObjectsCombinedValue]?: Combined } &
    MultiObjectsMapped<Objects, T>


export const objectValuePaths = <
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    >(objects: Objects): Generator<PropertyPath> =>
    pathsToValue(objects as any, MultiObjectsTemplate_Leaf)

export const objectValues = <
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    >(objects: Objects) => 
    leavesByValue(objects as any, MultiObjectsTemplate_Leaf)

export const mapObjects = <
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        T = any
    > (
        values: MultiObjectsMapped<Objects, T>,
        template: Objects,
        action: (o: object, key: PropertyKey, fullpath: PropertyPath) => void
    ) =>
    mapTreeByLeavesValue(values, template, MultiObjectsTemplate_Leaf, action)

export const MultiObjectsGroupsTemplate_Leaf = Symbol("group")
export interface MultiObjectsGroupsTemplate {
    [key: PropertyKey]:
        MultiObjectsGroupsTemplate |
        typeof MultiObjectsGroupsTemplate_Leaf
}

export type MultiObjectsGroupsMapped<
        Groups extends MultiObjectsGroupsTemplate,
        T,
    > = {
    [K in keyof Groups]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            MultiObjectsGroupsMapped<Groups[K], T> :
            T
}

export type MultiObjectsGroupsCombinedTemplate
    <Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate> =
    MultiObjectsGroupsMapped<
            Groups,
            { [MultiObjectsCombinedValue]: typeof MultiObjectsGroupsTemplate_Leaf }
        >

export type MultiObjectsGrouped<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    MultiObjectsGroupsMapped<
            Groups,
            { [MultiObjectsGroupsTemplate_Leaf]: Objects }
        >

export const groupPaths = <
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    >(groups: Groups): Generator<PropertyPath> =>
    pathsToValue(groups as any, MultiObjectsGroupsTemplate_Leaf)

export const groups = <
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >(groups: Groups) => 
    leavesByValue(groups as any, MultiObjectsGroupsTemplate_Leaf)

// export const groupPaths4objectsGrouped = <
//         Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
//         Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ObjectsGrouped extends
//             MultiObjectsGrouped<Objects, Groups> =
//             MultiObjectsGrouped<Objects, Groups>
//     >(objectsGrouped: ObjectsGrouped) =>
//     pathsToKey(objectsGrouped, MultiObjectsGroupsTemplate_Leaf)

// export function* groups4objectGrouped<
//         Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
//         Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         ObjectsGrouped extends
//             MultiObjectsGrouped<Objects, Groups> =
//             MultiObjectsGrouped<Objects, Groups>
//     >(objectsGrouped: ObjectsGrouped) {
//     for (const leaf of leavesByKey(objectsGrouped, MultiObjectsGroupsTemplate_Leaf)) {
//         yield {
//             ...leaf,
//             objectsTemplate: leaf.extractor<Objects>(objectsGrouped)
//         }
//     }
// }

export type MultiObjectsMappedGrouped<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any
    > = {
    [Group in keyof Groups]:
        Groups[Group] extends MultiObjectsGroupsTemplate ?
            MultiObjectsMappedGrouped<Objects, Groups[Group], T> :
            MultiObjectsMapped<Objects, T>
}

export type MultiObjectsMappedAndCombinedGrouped<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        Combined = T
    > = {
    [Group in keyof Groups]:
        Groups[Group] extends MultiObjectsGroupsTemplate ?
            MultiObjectsMappedAndCombinedGrouped<Objects, Groups[Group], T, Combined> :
            MultiObjectsMappedAndCombined<Objects, T, Combined>
}
    

// group kinds could include influence, vertex-color, UV, etc
// groups scaffold where the individual instances of those fields belong
// objects can each have a value in a group

export const MultiObjectsGroupsKindsTemplate_Leaf = Symbol("group-kind")
export interface MultiObjectsGroupsKindsTemplate {
    [key: PropertyKey]:
        MultiObjectsGroupsKindsTemplate |
        typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export type MultiObjectsGroupsKindsTemplateMapped<
        Kinds extends MultiObjectsGroupsKindsTemplate,
        T,
    > = {
    [K in keyof Kinds]:
        Kinds[K] extends MultiObjectsGroupsKindsTemplate ?
            MultiObjectsGroupsKindsTemplateMapped<Kinds[K], T> :
            T
}

export type MultiObjectsGroupsFiltered<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        RegularValues extends
            MultiObjectsGroupsMapped<Groups, any> =
            MultiObjectsGroupsMapped<Groups, any>
    > = {
    [K in keyof RegularValues]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            MultiObjectsGroupsFiltered<Groups[K], RegularValues[K]> :
        Groups[K] extends typeof MultiObjectsGroupsTemplate_Leaf ?
            RegularValues[K] :
        never
}

export type MultiObjectsGroupsOmitted<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        RegularValues extends
            MultiObjectsGroupsMapped<Groups, any> =
            MultiObjectsGroupsMapped<Groups, any>
    > = {
    [K in keyof RegularValues]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            MultiObjectsGroupsOmitted<Groups[K], RegularValues[K]> :
        Groups[K] extends typeof MultiObjectsGroupsTemplate_Leaf ?
            never :
        RegularValues[K]
}

export type MultiObjectsGroupedObjectsAndRegularValues<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        RegularGroupValues extends
            MultiObjectsGroupsMapped<Groups, any> =
            MultiObjectsGroupsMapped<Groups, any>
    > = {
        [Group in keyof RegularGroupValues]:
            Groups[Group] extends typeof MultiObjectsGroupsTemplate_Leaf ?
                MultiObjectsMapped<Objects, RegularGroupValues[Group]> :
            Groups[Group] extends MultiObjectsGroupsTemplate ?
                (RegularGroupValues[Group] extends MultiObjectsGroupsMapped<infer G2, any> ?
                MultiObjectsGroupedObjectsAndRegularValues<Objects, G2, RegularGroupValues[Group]> : never) :
            RegularGroupValues[Group]
    }

export const MultiObjectsProcessingContextGroupKinds = Symbol('group-kinds')
export type MultiObjectsGroupsProcessingContext<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        GroupKinds extends
            MultiObjectsGroupsKindsTemplate =
            MultiObjectsGroupsKindsTemplate
    > =
    { [MultiObjectsProcessingContextGroupKinds]:  GroupKinds } &
    MultiObjectsGroupsKindsTemplateMapped<GroupKinds, Groups>

export type MultiObjectsProcessingContext<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends MultiObjectsGrouped<Objects, Groups> = MultiObjectsGrouped<Objects, Groups>,
        GroupKinds extends
            MultiObjectsGroupsKindsTemplate =
            MultiObjectsGroupsKindsTemplate
    > =
    MultiObjectsGroupsProcessingContext<Groups, GroupKinds> &
    ObjectsGrouped

export type MultiObjectsProcessingResult<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any
    > =
    MultiObjectsMappedGrouped<Objects, Groups, T>

export const groupKindPaths = <
        GroupKinds extends
            MultiObjectsGroupsKindsTemplate =
            MultiObjectsGroupsKindsTemplate
    >(groupKinds: GroupKinds): Generator<PropertyPath> =>
    pathsToValue(groupKinds as any, MultiObjectsGroupsKindsTemplate_Leaf)

export function* groupKinds<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        GroupKinds extends
            MultiObjectsGroupsKindsTemplate =
            MultiObjectsGroupsKindsTemplate
    >(
        context: MultiObjectsGroupsProcessingContext<Groups, GroupKinds>,
        kindsTemplate: GroupKinds,
        groupsFilter?: Groups
    ) {
    for (const kind of leavesByValue(kindsTemplate as any, MultiObjectsGroupsKindsTemplate_Leaf)) {
        const groupsTemplate = kind.get<Groups>(context)
        for (const group of groups(groupsTemplate)) {
            if (groupsFilter &&
                group.get(groupsFilter)
                !== MultiObjectsGroupsTemplate_Leaf)
                continue
            
            yield {
                kind,
                group
            }
        }
    }
}

export function* groupKindObjectsGrouped<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends MultiObjectsGrouped<Objects, Groups> = MultiObjectsGrouped<Objects, Groups>,
        GroupKinds extends
            MultiObjectsGroupsKindsTemplate =
            MultiObjectsGroupsKindsTemplate,
        T = any
    >(
        result: MultiObjectsProcessingResult<Objects, Groups, T>,
        context: MultiObjectsProcessingContext<Objects, Groups, ObjectsGrouped, GroupKinds>,
        kindsTemplate: GroupKinds,
        groupsFilter?: Groups
    ) {
    for (const { group, kind } of groupKinds(context, kindsTemplate, groupsFilter)) {
        const objectsTemplate = group.get<Objects>(context)
        const objects = group.get<MultiObjectsMapped<Objects, T>>(result)

        yield {
            kind,
            group,
            objects: {
                template: objectsTemplate,
                value: objects
            }
        }
    }
}

export type MultiObjectsInfluences
    <Objects extends MultiObjectsTemplate = MultiObjectsTemplate> =
    MultiObjectsMappedAndCombined<Objects, number>

export type MultiObjectsInfluencesGrouped<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    > =
    MultiObjectsMappedGrouped<
            Objects,
            InfluenceGroups,
            number
        >

export type MultiObjectsInfluencesProcessingResult<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    > =
    MultiObjectsProcessingResult<
        Objects,
        InfluenceGroups,
        number
    >
    // =
    // MultiObjectsInfluencesGrouped<
    //         Objects,
    //         InfluenceGroups
    //     >

export const MultiObjectsInfluencesGroupKindKey: unique symbol = Symbol('group-kind:influence')
export interface MultiObjectsInfluencesGroupKinds
    extends MultiObjectsGroupsKindsTemplate {
    [MultiObjectsInfluencesGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const MultiObjectsInfluencesGroupKindsTemplate: MultiObjectsInfluencesGroupKinds = {
    [MultiObjectsInfluencesGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const MultiObjectsInfluencesGroupsDefault: MultiObjectsGroupsTemplate = {
    influences: MultiObjectsGroupsTemplate_Leaf
}

export type MultiObjectsInfluencesProcessingContext<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, InfluenceGroups> = 
            MultiObjectsGrouped<Objects, InfluenceGroups>
    > =
    MultiObjectsProcessingContext<
            Objects,
            InfluenceGroups,
            ObjectsGrouped,
            MultiObjectsInfluencesGroupKinds
        >

// export class MultiObjectsInfluencesNormalizingProcessor<
//         Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
//         InfluenceGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
//         Result extends
//             MultiObjectsInfluencesProcessingResult<Objects, InfluenceGroups> =
//             MultiObjectsInfluencesProcessingResult<Objects, InfluenceGroups>,
//         Context extends
//             MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroups> =
//             MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroups>
//     >
//     implements Processor<Result, Context> {
//     init(context: Context): void {
//         throw new Error("Method not implemented.");
//     }

//     readonly dependencies = []

//     /**
//      * The influence groups to normalize.
//      * 
//      * If undefined or null, all influence groups will be normalized.
//      * 
//      * @default undefined
//      */
//     influenceGroups?: InfluenceGroups

//     process(result: Result, context: Context): void {
//         for (const influenceGroup of groupKindObjectsGrouped(result, context, MultiObjectsInfluencesGroupKindsTemplate)) {
//             if (this.influenceGroups &&
//                 !influenceGroup.group.get(this.influenceGroups))
//                 continue

//             const influences = influenceGroup.objects.value as MultiObjectsInfluences<Objects>
//             const objects_template = influenceGroup.objects.template

//             let sum = 0
//             mapObjects(
//                 influences,
//                 objects_template,
//                 (influences, key) =>
//                     sum += influences[key]
//             )
            
//             if (sum > 0) {
//                 mapObjects(
//                     influences,
//                     objects_template,
//                     (influences, key) =>
//                         influences[key] /= sum
//                 )

//                 sum = 1
//             }

//             influences[MultiObjectsCombinedValue] = sum
//         }
//     }
// }

export const influences = <
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, InfluenceGroup> =
            MultiObjectsGrouped<Objects, InfluenceGroup>
    >(
        result: MultiObjectsInfluencesProcessingResult<Objects, InfluenceGroup>,
        context: MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroup, ObjectsGrouped>,
        influenceGroup?: InfluenceGroup
    ) =>
    onlyOne(groupKindObjectsGrouped(
        result,
        context,
        MultiObjectsInfluencesGroupKindsTemplate,
        influenceGroup
    ))

export type MultiObjectsInfluenceCombiningProcessingResult<
        Value = any,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    > =
    MultiObjectsInfluencesProcessingResult<Objects, InfluenceGroup> &
    MultiObjectsMappedAndCombinedGrouped<Objects, ValueGroups, Value>

export type MultiObjectsInfluenceCombiningProcessingContext<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueGroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, ValueGroups> =
            MultiObjectsGrouped<Objects, ValueGroups>,
    > =
    MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroup> &
    MultiObjectsProcessingContext<Objects, ValueGroups, ObjectsGrouped, ValueGroupKinds>

export interface Combiner<
        Value = any,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate
    > {
    combine(
            template: Objects,
            values: MultiObjectsMapped<Objects, Value>,
            influences: MultiObjectsInfluences<Objects>
        ): Value
}

export class FieldPointCombiner<
        Value extends FieldPoint = FieldPoint,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate
    > implements
    Combiner<Value, Objects> {
    combine(
        template: Objects,
        values: MultiObjectsMapped<Objects, Value>,
        influences: MultiObjectsInfluences<Objects>
    ) {
        let combined: FieldsPoint & {
            value: Value,
            influence: number
        } = undefined

        mapObjects(
            values,
            template,
            (o, k, path) => {
                const influence = extract<number>(influences, path)
                const value = o[k] as Value

                if (combined === undefined)
                    combined = { influence, value }
                else {
                    combined.influence += influence
                    fields_point_add_inplace_weighted(
                        combined,
                        "value",
                        value,
                        influence
                    )
                }
            }
        )

        return field_point_divide(combined.value, combined.influence)
    }

    static readonly instance = new FieldPointCombiner()
}

export class MultiObjectsCombiningProcessor<
        Value = any,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroup extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ValueGroupKind extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        ObjectsGrouped extends
            MultiObjectsGrouped<Objects, ValueGroups> =
            MultiObjectsGrouped<Objects, ValueGroups>,
        Result extends
            MultiObjectsInfluenceCombiningProcessingResult<Value, Objects, InfluenceGroup, ValueGroups> =
            MultiObjectsInfluenceCombiningProcessingResult<Value, Objects, InfluenceGroup, ValueGroups>,
        Context extends
            MultiObjectsInfluenceCombiningProcessingContext<Objects, InfluenceGroup, ValueGroups, ValueGroupKind, ObjectsGrouped> =
            MultiObjectsInfluenceCombiningProcessingContext<Objects, InfluenceGroup, ValueGroups, ValueGroupKind, ObjectsGrouped>,
    > implements Processor<Result, Context> {
    private _dependencies: PropertyPath[]

    get dependencies() {
        return this._dependencies
    }
    
    constructor(
        public combiner: Combiner<Value, Objects>,
        /**
         * At least one group kind should be given
         */
        public valueGroupKinds: ValueGroupKind,
        /**
         * If set, this will limit the processor to only combine the specified
         * value groups from all groups of the given value group kinds
         */
        public valueGroups?: ValueGroups,
        /**
         * This defaults to the only influence group if there is only one
         * influence group
         */
        public influenceGroup?: InfluenceGroup,
    ) { }

    init(context: Context): void {
        const infuenceGroup = onlyOne(groupKinds(context, MultiObjectsInfluencesGroupKindsTemplate, this.influenceGroup)).group
        const valueGroups = [...groupKinds(context, this.valueGroupKinds, this.valueGroups)]

        this._dependencies = [
            infuenceGroup.path,
            ...valueGroups.map(({ group: { path } }) => path)
        ]
    }

    process(result: Result, context: Context): void {
        const influenceValues = influences(result, context, this.influenceGroup).objects.value as MultiObjectsInfluences<Objects>
        for (const group of groupKindObjectsGrouped(result, context, this.valueGroupKinds, this.valueGroups)) {
            const values = group.objects.value as MultiObjectsMappedAndCombined<Objects, Value>

            values[MultiObjectsCombinedValue] = this.combiner.combine(
                group.objects.template as Objects,
                values,
                influenceValues
            )
        }
    }
}