import { MultiObjectsCombinedValue, MultiObjectsGrouped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsKindsTemplateMapped, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsGroupsTemplate, MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsMapped, MultiObjectsMappedAndCombined, MultiObjectsMappedAndCombinedGrouped, MultiObjectsMappedGrouped, MultiObjectsProcessingContext, MultiObjectsProcessingResult, MultiObjectsTemplate, groupKindObjectsGrouped, groupKinds, iterObjects } from "../paradigm/index.js";
import { Processor } from "../processing/processor.js";
import { onlyOne, PropertyPath, extract } from "../utils/index.js";
import { FieldPoint, FieldsPoint, fields_point_add_inplace_weighted, field_point_divide } from "./point.js";

export type MultiObjectsFieldPoint<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Point extends FieldPoint = FieldPoint
    > =
    MultiObjectsMapped<Objects, Point>

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

export class MultiObjectsInfluencesNormalizingProcessor<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        InfluenceGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        Result extends
            MultiObjectsInfluencesProcessingResult<Objects, InfluenceGroups> =
            MultiObjectsInfluencesProcessingResult<Objects, InfluenceGroups>,
        Context extends
            MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroups> =
            MultiObjectsInfluencesProcessingContext<Objects, InfluenceGroups>
    >
    implements Processor<Result, Context> {
    connections!: {
        readonly inputs: PropertyPath[]
        readonly outputs: PropertyPath[]
    }
    
    constructor(
        public readonly influenceGroups?: InfluenceGroups
    ) {
    }

    init(context: Context): void {
        const influenceGroups = groupKinds(
            context,
            MultiObjectsInfluencesGroupKindsTemplate,
            this.influenceGroups
        )

        const paths = [...influenceGroups].map(({ group: { path } }) => path)

        this.connections = {
            inputs: paths,
            outputs: paths.map(path => [...path, MultiObjectsCombinedValue])
        }
    }

    process(result: Result, context: Context): void {
        for (const { objects } of groupKindObjectsGrouped(result, context, MultiObjectsInfluencesGroupKindsTemplate, this.influenceGroups)) {
            const influences = objects.value as MultiObjectsInfluences<Objects>
            const objects_template = objects.template

            let sum = 0
            
            iterObjects(
                influences,
                objects_template,
                (influences, key) =>
                    sum += influences[key]
            )
            
            if (sum > 0) {
                iterObjects(
                    influences,
                    objects_template,
                    (influences, key) =>
                        influences[key] /= sum
                )

                sum = 1
            }

            influences[MultiObjectsCombinedValue] = sum
        }
    }

    // public static readonly instance = new this()
}

const influences = <
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
        const influenceGroup = onlyOne(groupKinds(context, MultiObjectsInfluencesGroupKindsTemplate, this.influenceGroup)).group
        const valueGroups = [...groupKinds(context, this.valueGroupKinds, this.valueGroups)]
        
        //TODO: currently, any processor depending on the combined value would
        // be satisfied by this processor's input requirements, thus it may not
        // receive the real combined value.

        this._connections = {
            inputs: [
                influenceGroup.path,
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