import { GeneratorType, Reflect_entries, Reflect_fromEntries } from "../../utils/index.js"
import { SampleDomain, SampleDomain_vectorized, SamplingContext } from "../domain.js"
import { Field } from "../field.js"
import { FieldsField } from "../fields/fields.js"
import { makeInterpolator } from "../interpolation.js"
import { MultiObjectsTemplate, MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, groupKinds, MultiObjectsGroupsOmitted, MultiObjectsGroupsFiltered, MultiObjectsGroupedObjectsAndRegularValues, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsMapped, MultiObjectsTemplate_Leaf } from "../../paradigm/multi-objects.js"
import { FieldPoint, FieldsPoint, fields_point_map, field_point_add_inplace } from "../point.js"
import { EncapsulatingDomainSamplingContext, EncapsulatingDomainSamplingContextParentContext, EncapsulatingDomainSamplingContextParentDomain } from "./encapsulating.js"
import { VectorFunction, vectorized } from "vectorized-functions"

export const MultiObjectsDomainInternalPreservedGroupsKindsKey = Symbol("groups-kind:multi-objects-domain:internal-preserved")
export type MultiObjectsDomainInternalPreservedGroupsKinds = {
    [MultiObjectsDomainInternalPreservedGroupsKindsKey]: typeof MultiObjectsGroupsKindsTemplate_Leaf
}

export const MultiObjectsDomainInternalPreservedGroupsKindsTemplate: MultiObjectsDomainInternalPreservedGroupsKinds = {
    [MultiObjectsDomainInternalPreservedGroupsKindsKey]: MultiObjectsGroupsKindsTemplate_Leaf
}

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
        GroupKinds extends MultiObjectsDomainInternalPreservedGroupsKinds = MultiObjectsDomainInternalPreservedGroupsKinds,
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
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ContextGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        Location extends FieldPoint = FieldPoint,
        LeafSample extends
            MultiObjectsGroupsMapped<SampleGroups, FieldPoint> =
            MultiObjectsGroupsMapped<SampleGroups, FieldPoint>,
        LeafContext extends
            SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any> =
            SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any>,
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
        MultiObjectsSample<Objects, SampleGroups, LeafSample>,
        MultiObjectsContext<Objects, ContextGroups, ContextGroupKinds, Location, LeafContext>
    > &
    {
        [MultiObjectsSamplingContextParent]: {
            item: MultiObjectsSampleDomain<
                Objects,
                SampleGroups,
                SampleGroupKinds,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LeafSample,
                LeafContext,
                LeafDomain
            >,
            context: MultiObjectsGroupsOmitted<
                ContextGroups,
                MultiObjectsContext<
                    Objects,
                    ContextGroups,
                    ContextGroupKinds,
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
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ContextGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        Location extends FieldPoint = FieldPoint,
        LeafSample extends
            MultiObjectsGroupsMapped<SampleGroups, FieldPoint> =
            MultiObjectsGroupsMapped<SampleGroups, FieldPoint>,
        LeafContext extends
            SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any> =
            SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any>,
        LeafDomain extends
            SampleDomain<
                    Location,
                    LeafSample,
                    MultiObjectsLeafContext<
                            Objects,
                            SampleGroups,
                            SampleGroupKinds,
                            ContextGroups,
                            ContextGroupKinds,
                            Location,
                            LeafSample,
                            LeafContext
                        >
                > =
            SampleDomain<
                    Location,
                    LeafSample,
                    MultiObjectsLeafContext<
                            Objects,
                            SampleGroups,
                            SampleGroupKinds,
                            ContextGroups,
                            ContextGroupKinds,
                            Location,
                            LeafSample,
                            LeafContext
                        >
                >,
        Sample extends
            MultiObjectsSample<Objects, SampleGroups, LeafSample> =
            MultiObjectsSample<Objects, SampleGroups, LeafSample>
    > implements
    SampleDomain<
        Location,
        Sample,
        MultiObjectsContext<
            Objects,
            ContextGroups,
            ContextGroupKinds,
            Location,
            LeafContext
        >
    > {
    field!: Field<Sample>
    private groupsMemoized!: {
        context: GeneratorType<ReturnType<typeof groupKinds>>[]
        sample: GeneratorType<ReturnType<typeof groupKinds>>[]
    }

    constructor(
        public children: { [Object in keyof Objects]: LeafDomain },
        //TODO: this can be moved to the context object
        public readonly multiObj: {
            sample: {
                groupKindsTemplate: SampleGroupKinds,
                groupsTemplate?: SampleGroups
            }
            context: {
                groupKindsTemplate: ContextGroupKinds,
                groupsTemplate?: ContextGroups
            }
        } =
        {
            context: {
                groupKindsTemplate: MultiObjectsDomainInternalPreservedGroupsKindsTemplate as ContextGroupKinds
            },
            sample: {
                groupKindsTemplate: MultiObjectsDomainInternalPreservedGroupsKindsTemplate as SampleGroupKinds
            }
        }
    ) { }

    /**
     * Combines the residual into the accumulating sample (the groups are already combined)
     * @param accumulator the accumulating multi object sample
     * @param key the child whose residual is being combined
     * @param residual the residual of the child's sample that wasn't combined by a group
     */
    protected combineResidualLeafSample(
            accumulator: MultiObjectsSample<Objects, SampleGroups, LeafSample>,
            key: PropertyKey,
            residual: MultiObjectsGroupsOmitted<SampleGroups, LeafSample>
        ): MultiObjectsSample<Objects, SampleGroups, LeafSample> {
        return field_point_add_inplace(
            accumulator as any as MultiObjectsGroupsOmitted<SampleGroups, LeafSample>,
            residual
        ) as any as MultiObjectsSample<Objects, SampleGroups, LeafSample>
    }

    /**
     * Finalizes a sample after children samples were combined with the groups
     * and residual combinations
     * @param sample the sample to finalize combinations
     * @returns the final sample
     */
    protected finalizeSample(sample: MultiObjectsSample<Objects, SampleGroups, LeafSample>): Sample {
        return sample as Sample
    }

    /**
     * Extracts the sample context for this domain's context
     * @param context the domain context
     * @returns the sample context
     */
    protected sampleContext(context: MultiObjectsContext<Objects, ContextGroups, ContextGroupKinds, Location, LeafContext>): MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> {
        return context as unknown as MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds>
    }

    init(context: MultiObjectsContext<Objects, ContextGroups, ContextGroupKinds, Location, LeafContext>): void {
        this.groupsMemoized = {
            context: [...groupKinds(context, this.multiObj.context.groupKindsTemplate, this.multiObj.context.groupsTemplate)],
            sample: [...groupKinds(this.sampleContext(context), this.multiObj.sample.groupKindsTemplate, this.multiObj.sample.groupsTemplate)],
        }
        
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
            } as any as MultiObjectsLeafContext<
                Objects,
                SampleGroups,
                SampleGroupKinds,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LeafSample,
                LeafContext,
                LeafDomain
            >

            const context_original_groups =
                {} as MultiObjectsGroupedObjectsAndRegularValues<Objects, ContextGroups, LeafContext>

            for (const { group } of this.groupsMemoized.context) {
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

            for (const { group } of this.groupsMemoized.context) {
                const context_original_group = group.get(context_original_groups, true)
                const context_child_group = group.get(child_context)
                context_original_group[key] = context_child_group
                group.set(context, context_original_group)
                group.set(child_context, undefined)
                
                const child_field = group.get(child_fields)
                group.get(child_fields, true)[key] = child_field
                // const child_field_container = extract(child_fields, group.path.slice(0, -1))
                // child_field_container[group.path.at(-1)] = { [key]: child_field }
            }

            fields.push(child_fields as any as FieldsField<Sample>)
        }

        this.field = FieldsField.merge(...fields)
    }

    @vectorized(MultiObjectsSampleDomain.sample_vectorized)
    sample(
            location: Location,
            context: MultiObjectsContext<Objects, ContextGroups, ContextGroupKinds, Location, LeafContext>
        ): Sample {
        let sample = {} as MultiObjectsSample<Objects, SampleGroups, LeafSample>
        
        const child_context = {
            ...context,
            [MultiObjectsSamplingContextParent]: {
                item: this,
                context
            },
            [EncapsulatingDomainSamplingContextParentContext]: context,
            [EncapsulatingDomainSamplingContextParentDomain]: this
        } as any as MultiObjectsLeafContext<
            Objects,
            SampleGroups,
            SampleGroupKinds,
            ContextGroups,
            ContextGroupKinds,
            Location,
            LeafSample,
            LeafContext,
            LeafDomain
        >

        const context_original_groups =
            {} as MultiObjectsGroupedObjectsAndRegularValues<Objects, ContextGroups, LeafContext>
        
        for (const { group } of this.groupsMemoized.context)
            group.set(context_original_groups, group.get(context))
        
        for (const key of Reflect.ownKeys(this.children)) {
            for (const { group } of this.groupsMemoized.context) {
                const context_original_group = group.get(context_original_groups)
                const context_child_group = context_original_group[key]
                group.set(child_context, context_child_group)
            }

            const child_sample = this.children[key].sample(location, child_context as any)

            for (const { group } of this.groupsMemoized.sample) {
                const child_sample_group = group.get(child_sample)
                const final_sample_group = group.get(sample)
                if (final_sample_group === undefined)
                    group.set(sample, { [key]: child_sample_group })
                else
                    final_sample_group[key] = child_sample_group
                group.delete(child_sample)
            }

            sample = this.combineResidualLeafSample(sample, key, child_sample as MultiObjectsGroupsOmitted<SampleGroups, LeafSample>)
        }

        for (const { group } of this.groupsMemoized.context) {
            const context_original_group = group.get(context_original_groups)
            group.set(context, context_original_group)
        }

        return this.finalizeSample(sample)
    }

    private static sample_vectorized<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            SampleGroupKinds extends
                MultiObjectsDomainInternalPreservedGroupsKinds =
                MultiObjectsDomainInternalPreservedGroupsKinds,
            ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            ContextGroupKinds extends
                MultiObjectsDomainInternalPreservedGroupsKinds =
                MultiObjectsDomainInternalPreservedGroupsKinds,
            Location extends FieldPoint = FieldPoint,
            LeafSample extends
                MultiObjectsGroupsMapped<SampleGroups, FieldPoint> =
                MultiObjectsGroupsMapped<SampleGroups, FieldPoint>,
            LeafContext extends
                SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any> =
                SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any>,
            LeafDomain extends
                SampleDomain<
                        Location,
                        LeafSample,
                        MultiObjectsLeafContext<
                                Objects,
                                SampleGroups,
                                SampleGroupKinds,
                                ContextGroups,
                                ContextGroupKinds,
                                Location,
                                LeafSample,
                                LeafContext
                            >
                    > =
                SampleDomain<
                        Location,
                        LeafSample,
                        MultiObjectsLeafContext<
                                Objects,
                                SampleGroups,
                                SampleGroupKinds,
                                ContextGroups,
                                ContextGroupKinds,
                                Location,
                                LeafSample,
                                LeafContext
                            >
                    >,
            Sample extends
                MultiObjectsSample<Objects, SampleGroups, LeafSample> =
                MultiObjectsSample<Objects, SampleGroups, LeafSample>
        >(
            this: MultiObjectsSampleDomain<
                Objects,
                SampleGroups,
                SampleGroupKinds,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LeafSample,
                LeafContext,
                LeafDomain,
                Sample
            >,
            locations: Location[],
            context: MultiObjectsContext<Objects, ContextGroups, ContextGroupKinds, Location, LeafContext>
        ): Sample[] {
        let samples = locations.map(() => ({} as MultiObjectsSample<Objects, SampleGroups, LeafSample>))
    
        const child_context = {
            ...context,
            [MultiObjectsSamplingContextParent]: {
                item: this,
                context
            },
            [EncapsulatingDomainSamplingContextParentContext]: context,
            [EncapsulatingDomainSamplingContextParentDomain]: this
        } as any as MultiObjectsLeafContext<
            Objects,
            SampleGroups,
            SampleGroupKinds,
            ContextGroups,
            ContextGroupKinds,
            Location,
            LeafSample,
            LeafContext,
            LeafDomain
        >

        const context_original_groups =
            {} as MultiObjectsGroupedObjectsAndRegularValues<Objects, ContextGroups, LeafContext>
        
        for (const { group } of this.groupsMemoized.context)
            group.set(context_original_groups, group.get(context))
        
        for (const key of Reflect.ownKeys(this.children)) {
            for (const { group } of this.groupsMemoized.context) {
                const context_original_group = group.get(context_original_groups)
                const context_child_group = context_original_group[key]
                group.set(child_context, context_child_group)
            }

            const child_samples = SampleDomain_vectorized.sample(this.children[key], locations, child_context as any)

            for (const { group } of this.groupsMemoized.sample) {
                for (let i = 0; i < samples.length; i++) {
                    const sample = samples[i]
                    const child_sample = child_samples[i]

                    const child_sample_group = group.get(child_sample)
                    const final_sample_group = group.get(sample)
                    if (final_sample_group === undefined)
                        group.set(sample, { [key]: child_sample_group })
                    else
                        final_sample_group[key] = child_sample_group
                    group.delete(child_sample)
                }
            }

            samples = MultiObjectsSampleDomain.vectorized.combineResidualLeafSample.call(this as any, samples, key, child_samples as MultiObjectsGroupsOmitted<SampleGroups, LeafSample>[]) as typeof samples
        }

        for (const { group } of this.groupsMemoized.context) {
            const context_original_group = group.get(context_original_groups)
            group.set(context, context_original_group)
        }

        return MultiObjectsSampleDomain.vectorized.finalizeSamples.call(this as any, samples) as Sample[]
    }

    protected static readonly vectorized = {
        combineResidualLeafSample: new VectorFunction<
                ({
                    combineResidualLeafSample(
                            accumulator: MultiObjectsSample<
                                MultiObjectsTemplate,
                                MultiObjectsGroupsTemplate,
                                MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                            >,
                            key: PropertyKey,
                            residual: MultiObjectsGroupsOmitted<
                                MultiObjectsGroupsTemplate,
                                MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                            >
                        ): MultiObjectsSample<
                            MultiObjectsTemplate,
                            MultiObjectsGroupsTemplate,
                            MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                        >
                }),
                "combineResidualLeafSample",
                (
                        accumulator: MultiObjectsSample<
                            MultiObjectsTemplate,
                            MultiObjectsGroupsTemplate,
                            MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                        >,
                        key: PropertyKey,
                        residual: MultiObjectsGroupsOmitted<
                            MultiObjectsGroupsTemplate,
                            MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                        >
                    ) => MultiObjectsSample<
                        MultiObjectsTemplate,
                        MultiObjectsGroupsTemplate,
                        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                        >,
                (
                        accumulators: MultiObjectsSample<
                            MultiObjectsTemplate,
                            MultiObjectsGroupsTemplate,
                            MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                        >[],
                        key: PropertyKey,
                        residuals: MultiObjectsGroupsOmitted<
                            MultiObjectsGroupsTemplate,
                            MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                        >[]
                    ) => MultiObjectsSample<
                        MultiObjectsTemplate,
                        MultiObjectsGroupsTemplate,
                        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                    >[]
            >("combineResidualLeafSample", [0, 2]),

        finalizeSamples: new VectorFunction<
                {
                    finalizeSample(
                            sample: MultiObjectsSample<
                                MultiObjectsTemplate,
                                MultiObjectsGroupsTemplate,
                                MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                            >
                    ): FieldPoint
                },
                "finalizeSample",
                (
                    sample: MultiObjectsSample<
                        MultiObjectsTemplate,
                        MultiObjectsGroupsTemplate,
                        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                    >
                ) => FieldPoint,
                (
                    samples: MultiObjectsSample<
                        MultiObjectsTemplate,
                        MultiObjectsGroupsTemplate,
                        MultiObjectsGroupsMapped<MultiObjectsGroupsTemplate, FieldPoint>
                    >[]
                ) => FieldPoint[]
            >("finalizeSample")
    }

    static build<
            Objects extends MultiObjectsTemplate,
            SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            SampleGroupKinds extends
                MultiObjectsDomainInternalPreservedGroupsKinds =
                MultiObjectsDomainInternalPreservedGroupsKinds,
            ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            ContextGroupKinds extends
                MultiObjectsDomainInternalPreservedGroupsKinds =
                MultiObjectsDomainInternalPreservedGroupsKinds,
            Location extends FieldPoint = FieldPoint,
            LeafSample extends
                MultiObjectsGroupsMapped<SampleGroups, FieldPoint> =
                MultiObjectsGroupsMapped<SampleGroups, FieldPoint>,
            LeafContext extends
                SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any> =
                SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any>,
            LeafDomain extends
                SampleDomain<
                        Location,
                        LeafSample,
                        MultiObjectsLeafContext<
                                Objects,
                                SampleGroups,
                                SampleGroupKinds,
                                ContextGroups,
                                ContextGroupKinds,
                                Location,
                                LeafSample,
                                LeafContext
                            >
                    > =
                SampleDomain<
                        Location,
                        LeafSample,
                        MultiObjectsLeafContext<
                                Objects,
                                SampleGroups,
                                SampleGroupKinds,
                                ContextGroups,
                                ContextGroupKinds,
                                Location,
                                LeafSample,
                                LeafContext
                            >
                    >,
            Sample extends
                MultiObjectsSample<Objects, SampleGroups, LeafSample> =
                MultiObjectsSample<Objects, SampleGroups, LeafSample>
            >(
                sampleDomains: MultiObjectsMapped<Objects, LeafDomain>,
                template: Objects,
                multiObj?: {
                    sample: {
                        groupKindsTemplate: SampleGroupKinds,
                        groupsTemplate?: SampleGroups
                    }
                    context: {
                        groupKindsTemplate: ContextGroupKinds,
                        groupsTemplate?: ContextGroups
                    }
                }
        ): SampleDomain<
                Location,
                Sample,
                MultiObjectsContext<
                        Objects,
                        ContextGroups,
                        ContextGroupKinds,
                        Location,
                        LeafContext
                    >
            > {
        if (template as unknown === MultiObjectsTemplate_Leaf) {
            return sampleDomains as SampleDomain<
                Location,
                Sample,
                MultiObjectsContext<
                    Objects,
                    ContextGroups,
                    ContextGroupKinds,
                    Location,
                    LeafContext
                >
            >
        }

        ///@ts-ignore
        return new MultiObjectsSampleDomain(
            ///@ts-ignore
            Reflect_fromEntries<any>(
                Reflect_entries<any>(sampleDomains)
                    .map(([key, sampleDomain]) =>
                        ///@ts-ignore
                        [key, MultiObjectsSampleDomain.build(
                                sampleDomain as MultiObjectsMapped<Objects, LeafDomain>,
                                (template as any)[key] as Objects,
                                multiObj
                        )] as [PropertyKey, LeafDomain]
                    )
                ),
            multiObj
        )
    }
}