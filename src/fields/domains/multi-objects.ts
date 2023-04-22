import { extract, GeneratorType } from "../../utils/index.js"
import { SampleDomain, SamplingContext } from "../domain.js"
import { Field } from "../field.js"
import { FieldsField } from "../fields/fields.js"
import { makeInterpolator } from "../interpolation.js"
import { MultiObjectsTemplate, MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsKindsTemplate, MultiObjectsGroupsProcessingContext, groupKinds, MultiObjectsGroupsOmitted, MultiObjectsGroupsFiltered, MultiObjectsGroupedObjectsAndRegularValues } from "../multi-objects-fields-point.js"

import { FieldPoint, FieldsPoint, fields_point_map, field_point_add_inplace } from "../point.js"
import { EncapsulatingDomainSamplingContext, EncapsulatingDomainSamplingContextParentContext, EncapsulatingDomainSamplingContextParentDomain } from "./encapsulating.js"

export const MultiObjectsSamplingContextParent = Symbol("parent")

export type MultiObjectsSample<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        LeafSample extends
            MultiObjectsGroupsMapped<Groups, FieldPoint> =
            MultiObjectsGroupsMapped<Groups, FieldPoint>
    > = 
    FieldsPoint &
    MultiObjectsGroupedObjectsAndRegularValues<Objects, Groups, LeafSample>

// let objects: { a: typeof MultiObjectsTemplate_Leaf, b: typeof MultiObjectsTemplate_Leaf }
// let groups: { texture: typeof MultiObjectsGroupsTemplate_Leaf }
// let _groupKinds_: MultiObjectsGroupsKindsTemplate = { randomFields: MultiObjectsGroupsKindsTemplate_Leaf }

// let leafSample: { texture: number }
// let sample: MultiObjectsGroupedObjectsAndRegularValues<
//     typeof objects,
//     typeof groups,
//     typeof leafSample
// >
// sample.texture.a

export type MultiObjectsContext<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        GroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        Location extends FieldPoint = FieldPoint,
        LeafContext extends
            SamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any> =
            SamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any>
    > =
    SamplingContext<Location> &
    // MultiObjectsGroupsOmitted<Groups, LeafContext> &
    MultiObjectsGroupedObjectsAndRegularValues<Objects, Groups, MultiObjectsGroupsFiltered<Groups, LeafContext>> &
    MultiObjectsGroupsProcessingContext<Groups, GroupKinds>

// let leafContext: MultiObjectsGroupsProcessingContext<typeof groups, typeof _groupKinds_> & {
//     [SampleDomainLocationField]: Field<Vec2>,
//     texture: string
// }
// let multiObjectsContext: MultiObjectsContext<
//     typeof objects,
//     typeof groups,
//     typeof _groupKinds_,
//     Vec2,
//     typeof leafContext
// >
// multiObjectsContext.texture.a // string

export type MultiObjectsLeafContext<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        GroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        Location extends FieldPoint = FieldPoint,
        LeafSample extends
            MultiObjectsGroupsMapped<Groups, FieldPoint> =
            MultiObjectsGroupsMapped<Groups, FieldPoint>,
        LeafContext extends
            SamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any> =
            SamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any>,
        LeafDomain extends
            SampleDomain<
                Location,
                LeafSample,
                LeafContext // MultiObjectsLeafContext<Objects, Groups, GroupKinds, Location, LeafSample, LeafContext>
            > =
            SampleDomain<
                Location,
                LeafSample,
                LeafContext // MultiObjectsLeafContext<Objects, Groups, GroupKinds, Location, LeafSample, LeafContext>
            >
    > =
    LeafContext &
    EncapsulatingDomainSamplingContext<
        Location, Location,
        MultiObjectsSample<Objects, Groups, LeafSample>,
        MultiObjectsContext<Objects, Groups, GroupKinds, Location, LeafContext>
    > &
    {
        [MultiObjectsSamplingContextParent]: {
            item: MultiObjectsSampleDomain<
                Objects,
                Groups,
                GroupKinds,
                Location,
                LeafSample,
                LeafContext,
                LeafDomain
            >,
            context: MultiObjectsGroupsOmitted<
                Groups,
                MultiObjectsContext<
                    Objects,
                    Groups,
                    GroupKinds,
                    LeafContext
                >
            >
        }
    }

// let trueLeafContext: MultiObjectsLeafContext<
//     typeof objects,
//     typeof groups,
//     typeof _groupKinds_,
//     Vec2,
//     typeof leafSample,
//     typeof leafContext>

// trueLeafContext.texture // string
// trueLeafContext[MultiObjectsSamplingContextParent].context.texture // never
// trueLeafContext[MultiObjectsSamplingContextParent].item.children.a // unknown

export class MultiObjectsSampleDomain<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        GroupKinds extends MultiObjectsGroupsKindsTemplate = MultiObjectsGroupsKindsTemplate,
        Location extends FieldPoint = FieldPoint,
        LeafSample extends
            MultiObjectsGroupsMapped<Groups, FieldPoint> =
            MultiObjectsGroupsMapped<Groups, FieldPoint>,
        LeafContext extends
            SamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any> =
            SamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any>,
        LeafDomain extends
            SampleDomain<
                    Location,
                    LeafSample,
                    MultiObjectsLeafContext<Objects, Groups, GroupKinds, Location, LeafSample, LeafContext>
                > =
            SampleDomain<
                    Location,
                    LeafSample,
                    MultiObjectsLeafContext<Objects, Groups, GroupKinds, Location, LeafSample, LeafContext>
                >,
        Sample extends
            MultiObjectsSample<Objects, Groups, LeafSample> =
            MultiObjectsSample<Objects, Groups, LeafSample>
    > implements
    SampleDomain<
        Location,
        Sample,
        MultiObjectsContext<Objects, Groups, GroupKinds, Location, LeafContext>
    > {
    field: Field<Sample>
    private groupsMemoized: GeneratorType<ReturnType<typeof groupKinds>>[]

    constructor(
        public children: { [Object in keyof Objects]: LeafDomain },
        public groupKindsTemplate: GroupKinds,
        public groupsTemplate?: Groups,
    ) { }

    /**
     * Combines the residual into the accumulating sample (the groups are already combined)
     * @param accumulator the accumulating multi object sample
     * @param residual the residual of the child's sample that wasn't combined by a group
     */
    protected combineResidualLeafSample(
        accumulator: MultiObjectsSample<Objects, Groups, LeafSample>,
        residual: MultiObjectsGroupsOmitted<Groups, LeafSample>
    ): MultiObjectsSample<Objects, Groups, LeafSample> {
        return field_point_add_inplace(
            accumulator as any as MultiObjectsGroupsOmitted<Groups, LeafSample>,
            residual
        ) as any as MultiObjectsSample<Objects, Groups, LeafSample>
    }

    /**
     * Finalizes a sample after children samples were combined with the groups
     * and residual combinations
     * @param sample the sample to finalize combinations
     * @returns the final sample
     */
    protected finalizeSample(sample: MultiObjectsSample<Objects, Groups, LeafSample>): Sample {
        return sample as Sample
    }

    init(context: MultiObjectsContext<Objects, Groups, GroupKinds, Location, LeafContext>): void {
        this.groupsMemoized = [...groupKinds(context, this.groupKindsTemplate, this.groupsTemplate)]
        
        const fields: FieldsField<Sample>[] = []

        for (const key of Reflect.ownKeys(this.children)) {
            const child = this.children[key]

            let child_context = {
                ...context,
                [MultiObjectsSamplingContextParent]: {
                    item: this,
                    context
                },
                [EncapsulatingDomainSamplingContextParentContext]: context,
                [EncapsulatingDomainSamplingContextParentDomain]: this
            } as any as MultiObjectsLeafContext<Objects, Groups, GroupKinds, Location, LeafSample, LeafContext, LeafDomain>

            const context_original_groups =
                {} as MultiObjectsGroupedObjectsAndRegularValues<Objects, Groups, LeafContext>

            for (const { group } of this.groupsMemoized) {
                const context_original_group = group.get(child_context)
                group.set(context_original_groups, context_original_group)
                group.set(child_context, undefined)
            }

            child.init(child_context as any)
            
            const child_fields =
                fields_point_map<LeafSample, Field, Field>(
                    (child.field as FieldsField<LeafSample>).fields,
                    leaf =>
                        leaf.interpolationType !== undefined &&
                        leaf.interpolationType[makeInterpolator] !== undefined,
                    field => field
                )

            for (const { group } of this.groupsMemoized) {
                const context_original_group = group.get(context_original_groups, true)
                const context_child_group = group.get(child_context)
                context_original_group[key] = context_child_group
                group.set(context, context_original_group)
                group.set(child_context, undefined)
                
                const child_field = group.get(child_fields)
                const child_field_container = extract(child_fields, group.path.slice(0, -1))
                child_field_container[group.path.at(-1)] = { [key]: child_field }
            }

            fields.push(child_fields as any as FieldsField<Sample>)
        }

        this.field = FieldsField.merge(...fields)
    }

    sample(
            location: Location,
            context: MultiObjectsContext<Objects, Groups, GroupKinds, Location, LeafContext>
        ): Sample {
        let sample = {} as MultiObjectsSample<Objects, Groups, LeafSample>
        
        const child_context = {
            ...context,
            [MultiObjectsSamplingContextParent]: {
                item: this,
                context
            },
            [EncapsulatingDomainSamplingContextParentContext]: context,
            [EncapsulatingDomainSamplingContextParentDomain]: this
        } as any as MultiObjectsLeafContext<Objects, Groups, GroupKinds, Location, LeafSample, LeafContext, LeafDomain>

        const context_original_groups =
            {} as MultiObjectsGroupedObjectsAndRegularValues<Objects, Groups, LeafContext>
        
        for (const { group } of this.groupsMemoized)
            group.set(context_original_groups, group.get(context))
        
        for (const key of Reflect.ownKeys(this.children)) {
            for (const { group } of this.groupsMemoized) {
                const context_original_group = group.get(context_original_groups)
                const context_child_group = context_original_group[key]
                group.set(child_context, context_child_group)
            }

            const child_sample = this.children[key].sample(location, child_context as any)

            for (const { group } of this.groupsMemoized) {
                const child_sample_group = group.get(child_sample)
                const final_sample_group = group.get(sample)
                if (final_sample_group === undefined)
                    group.set(sample, { [key]: child_sample_group })
                else
                    final_sample_group[key] = child_sample_group
                group.delete(child_sample)
            }

            sample = this.combineResidualLeafSample(sample, child_sample as MultiObjectsGroupsOmitted<Groups, LeafSample>)
        }

        for (const { group } of this.groupsMemoized) {
            const context_original_group = group.get(context_original_groups)
            group.set(context, context_original_group)
        }

        return this.finalizeSample(sample)
    }
}