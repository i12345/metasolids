import { Processor } from "../processor/processor.js";
import { onlyOne } from "../utils/only-one.js";
import { PropertyPath } from "../utils/property-path.js";
import { pathsToNodeWithKey } from "../utils/tree.js";
import { intract } from "../utils/tree.js";
import { extract, leavesByValue, iterTreeByLeavesValue, pathsToValue, makeLeafInterface } from "../utils/tree.js";
import { FieldPoint, FieldsPoint, fields_point_add_inplace_weighted, field_point_divide } from "./point.js";

export const MultiObjectsTemplate_Leaf = Symbol("object")
export type MultiObjectsTemplate = {
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

export type MultiObjectsCombined<Combined> =
    { [MultiObjectsCombinedValue]?: Combined }

export type MultiObjectsMappedAndCombined<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        T = any,
        Combined = T
    > =
    MultiObjectsCombined<Combined> &
    MultiObjectsMapped<Objects, T>

export const objectValuePaths = <
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    >(objects: Objects): Generator<PropertyPath> =>
    pathsToValue(objects as any, MultiObjectsTemplate_Leaf)

export const objectValues = <
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
    >(objects: Objects) => 
    leavesByValue(objects as any, MultiObjectsTemplate_Leaf)

export const iterObjects = <
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        T = any
    > (
        values: MultiObjectsMapped<Objects, T>,
        template: Objects,
        action: (o: any, key: PropertyKey, fullpath: PropertyPath) => void
    ) =>
    iterTreeByLeavesValue(values, template, MultiObjectsTemplate_Leaf, action)

export const MultiObjectsGroupsTemplate_Leaf = Symbol("group")
export const MultiObjectsGroupsTemplate_LeafKey = Symbol("group(leaf-key)")
export const MultiObjectsGroupsTemplate_LeafValue = Symbol("group(leaf-value)")
export type MultiObjectsGroupsTemplateLeaf =
    typeof MultiObjectsGroupsTemplate_Leaf |
    { [MultiObjectsGroupsTemplate_LeafKey]: typeof MultiObjectsGroupsTemplate_LeafValue }

// let leaf1: MultiObjectsGroupsTemplateLeaf
// let groupTemplate1: MultiObjectsGroupsTemplate
// leaf1 = { [MultiObjectsGroupsTemplate_LeafKey]: MultiObjectsGroupsTemplate_LeafValue } // works
// groupTemplate1 = { [MultiObjectsGroupsTemplate_LeafKey]: MultiObjectsGroupsTemplate_LeafValue } // error
// groupTemplate1 = leaf1 // error

export type MultiObjectsGroupsTemplate = {
    [key: PropertyKey]:
        MultiObjectsGroupsTemplate |
        MultiObjectsGroupsTemplateLeaf
}

// interface T1 {
//     A: MultiObjectsGroupsTemplateLeaf
//     B: {
//         sub: MultiObjectsGroupsTemplateLeaf
//     }
// }

// interface T2 {
//     B: MultiObjectsGroupsTemplateLeaf
//     A: {
//         sub: MultiObjectsGroupsTemplateLeaf
//     }
// }

// type T = T1 & T2
// let t: T = {
//     A: {
//         [MultiObjectsGroupsTemplate_LeafKey]: MultiObjectsGroupsTemplate_LeafValue,
//         sub: { [MultiObjectsGroupsTemplate_LeafKey]: MultiObjectsGroupsTemplate_LeafValue }
//     },
//     B: {
//         [MultiObjectsGroupsTemplate_LeafKey]: MultiObjectsGroupsTemplate_LeafValue,
//         sub: MultiObjectsGroupsTemplate_Leaf
//     }
// }

export function* groupPaths<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
    >(groups: Groups): Generator<PropertyPath> {
    for (const path of pathsToValue(groups as any, MultiObjectsGroupsTemplate_Leaf))
        yield path
    for (const path of pathsToNodeWithKey(groups, MultiObjectsGroupsTemplate_LeafKey))
        yield path
}

export function* groups<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >(groups: Groups) {
    for (const path of groupPaths(groups))
        yield makeLeafInterface(path)
}

export function mergeGroups<
        G1 extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        G2 extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >(g1: G1, g2: G2): G1 & G2 {
    const result = {} as G1 & G2

    mergeGroupsInplace(result, g1)
    mergeGroupsInplace(result, g2)
    
    return result
}

export function mergeGroupsInplace<
        Addend extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Result extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >(result: Result, addend: Addend): Result {
    function insertLeafNode(path: PropertyPath) {
        /**
         * The leaf node can be inserted as a leaf value or a leaf key.
         * 
         * If the path points to an object that already exists, then a leaf key
         * is inserted there.
         * 
         * If the path goes through a leaf value, then that leaf value is made
         * into a leaf key and the final path is inserted as a leaf value.
         * 
         * Otherwise, a regular leaf value is intracted.
         */

        let i: number, sub_result: any
        for (i = 0, sub_result = result;
            (i < path.length - 1 && sub_result !== undefined && typeof sub_result === 'object');
            i++, sub_result = sub_result[path[i]]) {
            const sub_result_item = sub_result[path[i]]
            switch (typeof sub_result_item) {
                case 'object':
                case 'undefined':
                    break
                case 'symbol':
                    if (sub_result_item !== MultiObjectsGroupsTemplate_Leaf)
                        throw new Error("group value unmergeable")
                    sub_result[path[i]] = { [MultiObjectsGroupsTemplate_Leaf]: MultiObjectsGroupsTemplate_Leaf }
                    intract(result, path, MultiObjectsGroupsTemplate_Leaf)
                    return
                default:
                    throw new Error("group value unmergeable")
            }
        }

        if (sub_result && (sub_result = sub_result[path[i]]) !== undefined) {
            if (sub_result === MultiObjectsGroupsTemplate_Leaf)
                return
            else if (typeof sub_result !== 'object')
                throw new Error("group value unmergeable")
            
            sub_result[MultiObjectsGroupsTemplate_Leaf] = MultiObjectsGroupsTemplate_Leaf
        }

        intract(result, path, MultiObjectsGroupsTemplate_Leaf)
    }

    for (const path of groupPaths(addend))
        insertLeafNode(path)

    return result
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

export function mapByGroups<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        R = any,
    >(
        groupsTemplate: Groups,
        values: MultiObjectsGroupsMapped<Groups, T>,
        selector: (path: PropertyPath, item: T) => R
    ): MultiObjectsGroupsMapped<Groups, R> {
    let result = {} as MultiObjectsGroupsMapped<Groups, R>

    for (const { path, get, set } of groups(groupsTemplate))
        set(result, selector(path, get(values)))

    return result
}

export function mapGroups<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        R = any,
    >(
        groupsTemplate: Groups,
        selector: (path: PropertyPath) => R
    ): MultiObjectsGroupsMapped<Groups, R> {
    let result = {} as MultiObjectsGroupsMapped<Groups, R>

    for (const { path, get, set } of groups(groupsTemplate))
        set(result, selector(path))

    return result
}

export type MultiObjectsGroupsCombined<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    MultiObjectsGroupsMapped<
        Groups,
        { [MultiObjectsCombinedValue]: MultiObjectsGroupsTemplateLeaf }
    >

export const MultiObjectsGroupsCombinedTemplate = <
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    >(groupsTemplate: Groups): MultiObjectsGroupsCombined<Groups> =>
    mapGroups(
        groupsTemplate,
        () => ({ [MultiObjectsCombinedValue]: MultiObjectsGroupsTemplate_Leaf })
    )

export type MultiObjectsGroupsCombinedMapped<
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Combined = any,
        CombinedGrouped extends
            MultiObjectsGroupsMapped<Groups, Combined> =
            MultiObjectsGroupsMapped<Groups, Combined>
    > = {
    [K in keyof Groups]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            (CombinedGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], Combined> ?
                MultiObjectsGroupsCombinedMapped<Groups[K], Combined, CombinedGrouped[K]> :
                never) :
            { [MultiObjectsCombinedValue]: CombinedGrouped[K] }
}

export const MultiObjectsGroupedObjectsKey = Symbol('grouped-objects')

export type MultiObjectsGrouped<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate
    > =
    MultiObjectsGroupsMapped<
            Groups,
            { [MultiObjectsGroupedObjectsKey]: Objects }
        >

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

export type MultiObjectsMappedAgainGrouped<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>
    > = {
    [K in keyof Groups]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            TGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], T> ?
                MultiObjectsMappedAgainGrouped<Objects, Groups[K], T, TGrouped[K]> :
                never :
        MultiObjectsMapped<Objects, TGrouped[K]>
}

export type MultiObjectsMappedAndCombinedAgainGrouped<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        T = any,
        Combined = T,
        TGrouped extends
            MultiObjectsGroupsMapped<Groups, T> =
            MultiObjectsGroupsMapped<Groups, T>,
        CombinedGrouped extends
            MultiObjectsGroupsMapped<Groups, Combined> =
            MultiObjectsGroupsMapped<Groups, Combined>
    > = {
    [K in keyof Groups]:
        Groups[K] extends MultiObjectsGroupsTemplate ?
            TGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], T> ?
                CombinedGrouped[K] extends MultiObjectsGroupsMapped<Groups[K], Combined> ?
                    MultiObjectsMappedAndCombinedAgainGrouped<Objects, Groups[K], T, Combined, TGrouped[K], CombinedGrouped[K]> :
                never : never :
        MultiObjectsMappedAndCombined<Objects, TGrouped[K], CombinedGrouped[K]>
}

// group kinds could include influence, vertex-color, UV, etc
// groups scaffold where the individual instances of those fields belong
// objects can each have a value in a group

export const MultiObjectsGroupsKindsTemplate_Leaf = Symbol("group-kind")
export type MultiObjectsGroupsKindsTemplate = {
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
        Groups[K] extends MultiObjectsGroupsTemplateLeaf ?
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
        Groups[K] extends MultiObjectsGroupsTemplateLeaf ?
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
            Groups[Group] extends MultiObjectsGroupsTemplateLeaf ?
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
    { [MultiObjectsProcessingContextGroupKinds]: GroupKinds } &
    MultiObjectsGroupsKindsTemplateMapped<GroupKinds, Groups>

export const MultiObjectsProcessingContextObjectsGrouped = Symbol('objects-grouped')
export type MultiObjectsProcessingContext<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ObjectsGrouped extends MultiObjectsGrouped<Objects, Groups> = MultiObjectsGrouped<Objects, Groups>,
        GroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate
    > =
    { [MultiObjectsProcessingContextObjectsGrouped]: ObjectsGrouped } &
    MultiObjectsGroupsProcessingContext<Groups, GroupKinds>

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
        kindsTemplate?: GroupKinds,
        groupsFilter?: Groups
    ) {
    kindsTemplate ??= context[MultiObjectsProcessingContextGroupKinds]
    for (const kind of leavesByValue(kindsTemplate as any, MultiObjectsGroupsKindsTemplate_Leaf)) {
        const groupsTemplate = kind.get<Groups>(context)
        for (const group of groups(groupsTemplate)) {
            if (groupsFilter) {
                const groupFilter = group.get(groupsFilter)
                if (!groupFilter || (
                    groupFilter !== MultiObjectsGroupsTemplate_Leaf &&
                    groupFilter[MultiObjectsGroupsTemplate_LeafKey] !== MultiObjectsGroupsTemplate_LeafValue))
                    continue
            }
            
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
        yield {
            kind,
            group,
            objects: {
                template: group.get<{ [MultiObjectsGroupedObjectsKey]: Objects }>(
                    context[MultiObjectsProcessingContextObjectsGrouped]
                )[MultiObjectsGroupedObjectsKey],
                value: group.get<MultiObjectsMapped<Objects, T>>(result)
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

// let influencesProcessing: MultiObjectsInfluencesProcessingResult
// let influencesGrouped: MultiObjectsInfluencesGrouped
// influencesProcessing = influencesGrouped // works
// influencesGrouped = influencesProcessing // works

export const MultiObjectsInfluencesGroupKindKey: unique symbol = Symbol('group-kind:influence')
export type MultiObjectsInfluencesGroupKinds = {
    [MultiObjectsInfluencesGroupKindKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const MultiObjectsInfluencesGroupKindsTemplate: MultiObjectsInfluencesGroupKinds = {
    [MultiObjectsInfluencesGroupKindKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

export const MultiObjectsInfluencesGroupsDefaultKey = Symbol("influences")
export type MultiObjectsInfluencesGroupsDefault = {
    [MultiObjectsInfluencesGroupsDefaultKey]: MultiObjectsGroupsTemplateLeaf
}
export const MultiObjectsInfluencesGroupsDefaultTemplate: MultiObjectsInfluencesGroupsDefault = {
    [MultiObjectsInfluencesGroupsDefaultKey]: MultiObjectsGroupsTemplate_Leaf
}

export type MultiObjectsInfluencesGroupsKindsMappedGroupsDefault =
    MultiObjectsGroupsKindsTemplateMapped<
        MultiObjectsInfluencesGroupKinds,
        MultiObjectsInfluencesGroupsDefault
    >

export const MultiObjectsInfluencesGroupsKindsMappedGroupsDefaultTemplate:
    MultiObjectsInfluencesGroupsKindsMappedGroupsDefault = {
    [MultiObjectsInfluencesGroupKindKey]: MultiObjectsInfluencesGroupsDefaultTemplate
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
        } | undefined = undefined

        iterObjects(
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

        return field_point_divide(combined!.value, combined!.influence)
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
    private _connections!: {
        readonly inputs: PropertyPath[]
        readonly outputs: PropertyPath[]
    }

    get connections() {
        return this._connections
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
        
        //TODO: currently, any processor depending on the combined value would
        // be satisfied by this processor's input requirements, thus it may not
        // receive the real combined value.

        this._connections = {
            inputs: [
                infuenceGroup.path,
                ...valueGroups.map(({ group: { path } }) => path)
            ],
            outputs: [
                ...valueGroups.map(({ group: { path } }) => [...path, MultiObjectsCombinedValue])
            ]
        }
    }

    process(result: Result, context: Context): void {
        const influenceValues = influences(result, context as any, this.influenceGroup).objects.value as MultiObjectsInfluences<Objects>
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