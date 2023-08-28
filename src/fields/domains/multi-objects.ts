import { GeneratorType, IndicesTypedArray, Reflect_entries, Reflect_fromEntries } from "../../utils/index.js"
import { SampleDomain, SampleDomainLocationFieldKey, SamplingContext } from "../domain.js"
import { Field } from "../field.js"
import { FieldsField } from "../fields/fields.js"
import { makeInterpolator } from "../interpolation.js"
import { MultiObjectsTemplate, MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, groupKinds, MultiObjectsGroupsFiltered, MultiObjectsGroupedObjectsAndRegularValues, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsMapped, MultiObjectsTemplate_Leaf, MultiObjectsIDsKey, extract, PropertyPath, intract, WithMultiObjectsIDs } from "../../paradigm/trees/index.js"
import { FieldPoint, FieldPointMapped, FieldsPoint, field_point_map, fields_point_map } from "../point.js"
import { EncapsulatingDomainSamplingContext, EncapsulatingDomainSamplingContextParentContext, EncapsulatingDomainSamplingContextParentDomain } from "./encapsulating.js"
import { vectorized } from "vectorized-functions"
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, ItemObjIDsKey, ItemObjValuesOffsetsKey } from "../vectorized/point.js"
import { FieldPointWithMultiObjectPath, FuseMode, FusingFieldPointVectorWithMultiObjects, fusePoints, fuseVectors, fuse_mode_contains, fuse_mode_equal } from "../vectorized/index.js"
import { FusedVectorSamplingContext, FusingVectorSampleDomain, fusingVectorSampling } from "./fusing.js"
import { VectorSampleDomain, VectorSampleFunction } from "./vector.js"
import { ArithmeticPrimitiveFuseMode, ArithmeticPrimitiveFuseModeOp } from "../vectorized/fuse-modes/arithmetic.js"
import { MultiObjectsField } from "../fields/multi-objects.js"
import { FieldPointType, field_point_type_contains } from "../type.js"
import { vectorIterator } from "../vectorized/iterators/factory.js"

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

export const FusedSamplingNonfusedSamples = Symbol("fused-sampling-nonfused-samples")

export type MultiObjectsSamplingContext<
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

export type MultiObjectsFusedVectorSamplingContext<
        Location extends FieldPoint = FieldPoint,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Sample extends FieldPoint = FieldPoint,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,    
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
        LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
        SampleVector extends 
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        Groups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        GroupKinds extends MultiObjectsDomainInternalPreservedGroupsKinds = MultiObjectsDomainInternalPreservedGroupsKinds,
        LeafContext extends
            SamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any> =
            SamplingContext<Location> & MultiObjectsGroupsMapped<Groups, any>,
    > =
    MultiObjectsSamplingContext<Objects, Groups, GroupKinds, Location, LeafContext> &
    FusedVectorSamplingContext<
            Location,
            LocationContainer,
            Sample,
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            SingularContext,
            LocationVector,
            SampleVector
        > & {
        [FusedSamplingNonfusedSamples]: Map<MultiObjectsSampleDomain, [keyof Objects, SampleVector][]>
    }

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
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ContextGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        Location extends FieldPoint = FieldPoint,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        LeafSample extends
            MultiObjectsGroupsMapped<SampleGroups, FieldPoint> =
            MultiObjectsGroupsMapped<SampleGroups, FieldPoint>,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
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
            >,
        LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
        SampleVector extends 
            FieldPointVectorWithMultiObjects<
                    LeafSample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    LeafSample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
    > =
    LeafContext &
    EncapsulatingDomainSamplingContext<
        Location, Location,
        MultiObjectsSample<Objects, SampleGroups, LeafSample>,
        MultiObjectsSamplingContext<Objects, ContextGroups, ContextGroupKinds, Location, LeafContext>
    > &
    {
        [MultiObjectsSamplingContextParent]: {
            item: MultiObjectsSampleDomain<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LocationContainer,
                LeafSample,
                SampleContainer,
                LeafContext,
                LeafDomain
            >,
            // context: MultiObjectsGroupsOmitted<
            //     ContextGroups,
            //     MultiObjectsSamplingContext<
            //         Objects,
            //         ContextGroups,
            //         ContextGroupKinds,
            //         Location,
            //         LeafContext
            //     >
            // >
            context: MultiObjectsSamplingContext<
                    Objects,
                    ContextGroups,
                    ContextGroupKinds,
                    Location,
                    LeafContext
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
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        SampleGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ContextGroupKinds extends
            MultiObjectsDomainInternalPreservedGroupsKinds =
            MultiObjectsDomainInternalPreservedGroupsKinds,
        Location extends FieldPoint = FieldPoint,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        LeafSample extends
            MultiObjectsGroupsMapped<SampleGroups, FieldPoint> =
            MultiObjectsGroupsMapped<SampleGroups, FieldPoint>,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        LeafContext extends
            SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any> =
            SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any>,
        LeafDomain extends
            SampleDomain<
                    Location,
                    LeafSample,
                    MultiObjectsLeafContext<
                            Objects,
                            ObjIDsT,
                            ObjIDsContainer,
                            SampleGroups,
                            SampleGroupKinds,
                            ContextGroups,
                            ContextGroupKinds,
                            Location,
                            LocationContainer,
                            LeafSample,
                            SampleContainer,
                            LeafContext
                        >
                > =
            SampleDomain<
                    Location,
                    LeafSample,
                    MultiObjectsLeafContext<
                            Objects,
                            ObjIDsT,
                            ObjIDsContainer,
                            SampleGroups,
                            SampleGroupKinds,
                            ContextGroups,
                            ContextGroupKinds,
                            Location,
                            LocationContainer,
                            LeafSample,
                            SampleContainer,
                            LeafContext
                        >
                >,
        Sample extends
            MultiObjectsSample<Objects, SampleGroups, LeafSample> =
            MultiObjectsSample<Objects, SampleGroups, LeafSample>,
        SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
        LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
        SampleVector extends 
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    Sample,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
    > implements
    FusingVectorSampleDomain<
        Location,
        LocationContainer,
        Sample,
        SampleContainer,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        MultiObjectsFusedVectorSamplingContext<
            Location,
            LocationContainer,
            Sample,
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            SingularContext,
            LocationVector,
            SampleVector,
            ContextGroups,
            ContextGroupKinds,
            LeafContext
        >
    > {
    field!: Field<Sample>
    private groupsMemoized!: {
        context: GeneratorType<ReturnType<typeof groupKinds>>[]
        sample: GeneratorType<ReturnType<typeof groupKinds>>[]
    }

    private childrenFieldTypes!: Record<keyof Objects, "child" | "result">

    constructor(
        public children: { [Object in keyof Objects]: LeafDomain },
        //TODO: this can be moved to the context object
        public readonly multiObj: {
            context: {
                groupKindsTemplate: ContextGroupKinds,
                groupsTemplate?: ContextGroups
            }
            sample?: {
                groupKindsTemplate: SampleGroupKinds,
                groupsTemplate?: SampleGroups
            }
        } =
        {
            context: {
                groupKindsTemplate: MultiObjectsDomainInternalPreservedGroupsKindsTemplate as ContextGroupKinds
            },
            sample: {
                groupKindsTemplate: MultiObjectsDomainInternalPreservedGroupsKindsTemplate as SampleGroupKinds
            }
        },
        public readonly fuseMode: FuseMode<Sample> | undefined,
        public readonly childField: Field<LeafSample>
    ) { }

    isCompositeArithmetic(...ops: ArithmeticPrimitiveFuseModeOp[]): boolean {
        const fuseMode = (this.fuseMode ?? this.field.fuseMode)
        let allLinear = true

        field_point_map<FieldPoint, FuseMode, void>(
            <FuseMode>fuseMode,
            value => value instanceof Function,
            (_, path) => {
                const primitiveFuseMode = extract(fuseMode, path)
                if (primitiveFuseMode !== undefined) {
                    if (primitiveFuseMode instanceof ArithmeticPrimitiveFuseMode) {
                        if (!ops.includes(primitiveFuseMode.op))
                            allLinear = false
                    }
                    else
                        allLinear = false
                }
            }
        )

        return allLinear
    }

    static compositeArithmetic<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
            ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            ContextGroupKinds extends
                MultiObjectsDomainInternalPreservedGroupsKinds =
                MultiObjectsDomainInternalPreservedGroupsKinds,
            Location extends FieldPoint = FieldPoint,
            LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            Sample extends FieldPoint = FieldPoint,
            SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            LeafContext extends
                SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any> =
                SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any>,
            LeafDomain extends
                SampleDomain<
                        Location,
                        Sample,
                        MultiObjectsLeafContext<
                                Objects,
                                ObjIDsT,
                                ObjIDsContainer,
                                {},
                                MultiObjectsDomainInternalPreservedGroupsKinds,
                                ContextGroups,
                                ContextGroupKinds,
                                Location,
                                LocationContainer,
                                Sample,
                                SampleContainer,
                                LeafContext
                            >
                    > =
                SampleDomain<
                        Location,
                        Sample,
                        MultiObjectsLeafContext<
                                Objects,
                                ObjIDsT,
                                ObjIDsContainer,
                                {},
                                MultiObjectsDomainInternalPreservedGroupsKinds,
                                ContextGroups,
                                ContextGroupKinds,
                                Location,
                                LocationContainer,
                                Sample,
                                SampleContainer,
                                LeafContext
                            >
                    >,
            SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
            LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
            SampleVector extends 
                FieldPointVectorWithMultiObjects<
                        Sample,
                        SampleContainer,
                        ObjIDsT,
                        ObjIDsContainer
                    > =
                FieldPointVectorWithMultiObjects<
                        Sample,
                        SampleContainer,
                        ObjIDsT,
                        ObjIDsContainer
                    >,
        >(
            op: ArithmeticPrimitiveFuseModeOp,
            field: Field<Sample>,
            ...children: LeafDomain[]
        ): MultiObjectsSampleDomain<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            {},
            MultiObjectsDomainInternalPreservedGroupsKinds,
            ContextGroups,
            ContextGroupKinds,
            Location,
            LocationContainer,
            Sample,
            SampleContainer,
            LeafContext,
            LeafDomain,
            Sample & MultiObjectsSample<Objects, {}, Sample>,
            SingularContext,
            LocationVector,
            SampleVector
        >{
        const fuseMode = <FuseMode<Sample>><unknown>field_point_map<Sample, FuseMode, ArithmeticPrimitiveFuseMode>(
            <FieldPointMapped<Sample, FuseMode>>field.fuseMode,
            type => type instanceof Function,
            () => new ArithmeticPrimitiveFuseMode(op)
        )

        ///@ts-ignore
        return new MultiObjectsSampleDomain(
            Reflect_fromEntries<any>(children.entries()),
            {
                context: {
                    groupKindsTemplate: MultiObjectsDomainInternalPreservedGroupsKindsTemplate
                },
                sample: {
                    groupKindsTemplate: MultiObjectsDomainInternalPreservedGroupsKindsTemplate,
                    groupsTemplate: {}
                }
            },
            <any>fuseMode,
            field
        )
    }

    /**
     * Extracts the sample context for this domain's context
     * @param context the domain context
     * @returns the sample context
     */
    protected sampleContext(context: MultiObjectsSamplingContext<Objects, ContextGroups, ContextGroupKinds, Location, LeafContext>): MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> {
        return context as unknown as MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds>
    }

    init(context: MultiObjectsSamplingContext<Objects, ContextGroups, ContextGroupKinds, Location, LeafContext>): void {
        this.groupsMemoized = {
            context: [...groupKinds(context, this.multiObj.context.groupKindsTemplate, this.multiObj.context.groupsTemplate)],
            sample: this.multiObj.sample ? [...groupKinds(this.sampleContext(context), this.multiObj.sample.groupKindsTemplate, this.multiObj.sample.groupsTemplate)] : [],
        }

        const sampleMultiObjTemplate = <{ root: MultiObjectsGroupsMapped<SampleGroups, true> }>{ }
        this.groupsMemoized.sample.forEach(path => intract(sampleMultiObjTemplate, ['root', ...path.group.path], true))
        
        const multiObjectsIDs = (<WithMultiObjectsIDs<Objects, ObjIDsT>><unknown>context)[MultiObjectsIDsKey]

        function multiObjField_recursive(field: Field, sampleMultiObjMapped: MultiObjectsGroupsMapped<SampleGroups, true>): Field {
            if (sampleMultiObjMapped === true)
                return new MultiObjectsField(field, multiObjectsIDs)
            else if (field instanceof FieldsField) {
                const result_fields = <FieldPointMapped<FieldsPoint, Field>>{}

                fields_point_map(
                    field.fields,
                    subfield => subfield.interpolationType !== undefined && subfield.interpolationType[makeInterpolator] !== undefined,
                    (subfield, path) =>
                        intract(
                            result_fields,
                            path,
                            multiObjField_recursive(
                                subfield,
                                extract(sampleMultiObjMapped, path)
                            )
                        )
                )

                return new FieldsField(result_fields)
            }
            else return field
        }

        this.field = <Field<Sample>><unknown>multiObjField_recursive(this.childField, sampleMultiObjTemplate.root)

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
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LocationContainer,
                LeafSample,
                SampleContainer,
                LeafContext,
                LeafDomain,
                LocationVector //,
                // LeafSampleVector
            >

            const context_original_groups =
                {} as MultiObjectsGroupedObjectsAndRegularValues<Objects, ContextGroups, LeafContext>
            
            const multiObjectsIDs_original_template = multiObjectsIDs.template
            const multiObjectsIDs_original_IDs = multiObjectsIDs.IDs
            
            for (const { group } of this.groupsMemoized.context) {
                const context_original_group = group.get(child_context)
                group.set(context_original_groups, context_original_group)
                group.delete(child_context)
            }

            multiObjectsIDs.template = <any>multiObjectsIDs_original_template[key]
            multiObjectsIDs.IDs = <any>multiObjectsIDs_original_IDs[key]

            child.init(child_context as any)

            for (const { group } of this.groupsMemoized.context) {
                const context_original_group = group.get(context_original_groups)
                const context_child_group = group.get(child_context)
                context_original_group[key] = context_child_group
                group.delete(child_context)
                group.set(context, context_original_group)
            }

            multiObjectsIDs.template = multiObjectsIDs_original_template
            multiObjectsIDs.IDs = multiObjectsIDs_original_IDs

            if (field_point_type_contains(this.childField.elementType, child.field.elementType))
                this.childrenFieldTypes[<keyof Objects>key] = "child"
            else if (field_point_type_contains(this.field.elementType, child.field.elementType))
                this.childrenFieldTypes[<keyof Objects>key] = "result"
            else
                throw new Error()
        }
    }

    @vectorized(MultiObjectsSampleDomain.sample_vectorized)
    sample(
            location: Location,
            context: MultiObjectsSamplingContext<Objects, ContextGroups, ContextGroupKinds, Location, LeafContext>
        ): Sample {
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
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LocationContainer,
                LeafSample,
                SampleContainer,
                LeafContext,
                LeafDomain,
                LocationVector //,
                // LeafSampleVector
            >

        const multiObjectsIDs = (<WithMultiObjectsIDs<Objects, ObjIDsT>><unknown>context)[MultiObjectsIDsKey]
        
        const context_original_groups =
            {} as MultiObjectsGroupedObjectsAndRegularValues<Objects, ContextGroups, LeafContext>
            
        for (const { group } of this.groupsMemoized.context)
            group.set(context_original_groups, group.get(context))

        const multiObjectsIDs_original_template = multiObjectsIDs.template
        const multiObjectsIDs_original_IDs = multiObjectsIDs.IDs
        
        const child_samples = Reflect.ownKeys(this.children).map(key => {
            for (const { group } of this.groupsMemoized.context) {
                const context_original_group = group.get(context_original_groups)
                const context_child_group = context_original_group[key]
                group.set(child_context, context_child_group)
            }
            multiObjectsIDs.template = <any>multiObjectsIDs_original_template[key]
            multiObjectsIDs.IDs = <any>multiObjectsIDs_original_IDs[key]

            const sample = this.children[key].sample(location, child_context as any)

            return <FieldPointWithMultiObjectPath<LeafSample>>{
                value: sample,
                multiObjPath: [key],
            }
        })

        for (const { group } of this.groupsMemoized.context)
            group.set(context, group.get(context_original_groups))

        const fused = <Sample>fusePoints(
            this.field.elementType,
            <any>this.fuseMode,
            <FieldPointWithMultiObjectPath<Sample>[]><unknown>child_samples
        )
        
        multiObjectsIDs.template = multiObjectsIDs_original_template
        multiObjectsIDs.IDs = multiObjectsIDs_original_IDs
        
        return fused
    }

    can_fuse(
            sampleType: FieldPointType<Sample>,
            fuseMode: FuseMode<Sample>,
            context: MultiObjectsFusedVectorSamplingContext<
                    Location,
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector,
                    ContextGroups,
                    ContextGroupKinds,
                    LeafContext
                >
        ): boolean {
        return (
            field_point_type_contains(sampleType, this.field.elementType) &&
            // fuse_mode_contains(fuseMode, this.fuseMode ?? this.field.fuseMode)
            fuse_mode_equal(fuseMode, this.fuseMode ?? this.field.fuseMode)
        )
    }

    sample_fused_objectCounts(
            objCounts: ObjIDsT,
            locations: FieldPointVector<Location, LocationContainer>,
            context: MultiObjectsFusedVectorSamplingContext<
                    Location,
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector,
                    ContextGroups,
                    ContextGroupKinds,
                    LeafContext
                >,
            sampleType: FieldPointType<Sample>,
            fuseMode: FuseMode<Sample>,
        ): void {
        const location_iterator = vectorIterator<Location, FieldPointVectorContainerStatic>(context[SampleDomainLocationFieldKey].elementType, undefined, context[MultiObjectsIDsKey])
        const sample_count = location_iterator.length(<FieldPointMapped<Location, FieldPointVectorContainerStatic>>locations, locations)
        
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
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LocationContainer,
                LeafSample,
                SampleContainer,
                LeafContext,
                LeafDomain,
                LocationVector //,
                // LeafSampleVector
            >

        type ChildFusingSampleDomain = FusingVectorSampleDomain<
                Location,
                LocationContainer,
                Sample | LeafSample,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LeafContext,
                LocationVector //,
                // ?
            >
        
        const multiObjectsIDs = (<WithMultiObjectsIDs<Objects, ObjIDsT>><unknown>context)[MultiObjectsIDsKey]

        const context_original_groups =
            {} as MultiObjectsGroupedObjectsAndRegularValues<Objects, ContextGroups, LeafContext>
        
        for (const { group } of this.groupsMemoized.context)
            group.set(context_original_groups, group.get(context))

        const multiObjectsIDs_original_template = multiObjectsIDs.template
        const multiObjectsIDs_original_IDs = multiObjectsIDs.IDs

        const nonfusing = Reflect_entries<Record<keyof Objects, ChildFusingSampleDomain>>(<any>this.children).filter(([, child]) => !(child.can_fuse && child.can_fuse(sampleType, fuseMode, <any>context)))
        
        const nonfused_samples = nonfusing.map(([key, sampleDomain]) => {
            for (const { group } of this.groupsMemoized.context) {
                const context_original_group = group.get(context_original_groups)
                const context_child_group = context_original_group[key]
                group.set(child_context, context_child_group)
            }

            multiObjectsIDs.template = <any>multiObjectsIDs_original_template[key]
            multiObjectsIDs.IDs = <any>multiObjectsIDs_original_IDs[key]
            
            const samples = context[VectorSampleFunction](<SampleDomain<Location, Sample, SingularContext>><unknown>sampleDomain, locations, context)
            
            if (this.childrenFieldTypes[key] === "child") {
                const multiObjVector = <FieldPointVectorWithMultiObjects<LeafSample, SampleContainer, ObjIDsT, ObjIDsContainer>><unknown>samples

                if (multiObjVector[ItemObjIDsKey] || multiObjVector[ItemObjValuesOffsetsKey])
                    throw new Error("did not expect children to have multi objects")

                multiObjVector[ItemObjIDsKey] = <FieldPointVector<ObjIDsT, ObjIDsContainer>><FieldPointVectorContainerStatic<ObjIDsT>>new multiObjectsIDs.IDsType(sample_count)
                multiObjVector[ItemObjValuesOffsetsKey] = new Uint32Array(sample_count)

                multiObjVector[ItemObjIDsKey].fill(<number>multiObjectsIDs.IDs)
                const offsets = multiObjVector[ItemObjValuesOffsetsKey]
                for (let i = 0; i < sample_count; i++)
                    offsets[i] = i + 1
            }

            return <[keyof Objects, SampleVector]>[key, samples]
        })

        context[FusedSamplingNonfusedSamples] ??= new Map()
        context[FusedSamplingNonfusedSamples].set(<any>this, nonfused_samples)

        for (const [key, child] of Reflect_entries<Record<keyof Objects, ChildFusingSampleDomain>>(<any>this.children)) {
            if (child.sample_fused_objectCounts) {
                for (const { group } of this.groupsMemoized.context) {
                    const context_original_group = group.get(context_original_groups)
                    const context_child_group = context_original_group[key]
                    group.set(child_context, context_child_group)
                }

                multiObjectsIDs.template = <any>multiObjectsIDs_original_template[key]
                multiObjectsIDs.IDs = <any>multiObjectsIDs_original_IDs[key]

                child.sample_fused_objectCounts(objCounts, locations, <any>context, sampleType, fuseMode)
            }
        }

        for (const [, samples] of nonfused_samples) {
            let objOffset_prev = 0
            let objOffset_next: number
            const objOffsets = samples[ItemObjValuesOffsetsKey]
            for (let i = 0; i < objCounts.length; i++) {
                objOffset_next = objOffsets[i]
                objCounts[i] += (objOffset_next - objOffset_prev)
                objOffset_prev = objOffset_next
            }
        }

        for (const { group } of this.groupsMemoized.context)
            group.set(child_context, group.get(context_original_groups))

        multiObjectsIDs.template = multiObjectsIDs_original_template
        multiObjectsIDs.IDs = multiObjectsIDs_original_IDs
    }

    sample_fused_results(
        samples: FusingFieldPointVectorWithMultiObjects<Sample, ObjIDsT, SampleContainer, ObjIDsContainer>,
        locations: FieldPointVector<Location, LocationContainer>,
        context: MultiObjectsFusedVectorSamplingContext<
            Location,
            LocationContainer,
            Sample,
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            SingularContext,
            LocationVector,
            SampleVector,
            ContextGroups,
            ContextGroupKinds,
            LeafContext
        >,
        sampleType: FieldPointType<Sample>,
        fuseMode: FuseMode<Sample>,
    ): void {
        // const location_iterator = vectorIterator<Location, FieldPointVectorContainerStatic>(context[SampleDomainLocationFieldKey].elementType, undefined, context[MultiObjectsIDsKey])
        // const sample_count = location_iterator.length(<FieldPointMapped<Location, FieldPointVectorContainerStatic>>locations, locations)
        
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
            ObjIDsT,
            ObjIDsContainer,
            SampleGroups,
            SampleGroupKinds,
            ContextGroups,
            ContextGroupKinds,
            Location,
            LocationContainer,
            LeafSample,
            SampleContainer,
            LeafContext,
            LeafDomain,
            LocationVector //,
            // LeafSampleVector
        >

        type ChildFusingSampleDomain = FusingVectorSampleDomain<
            Location,
            LocationContainer,
            Sample | LeafSample,
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LeafContext,
            LocationVector //,
            // ?
        >

        const multiObjectsIDs = (<WithMultiObjectsIDs<Objects, ObjIDsT>><unknown>context)[MultiObjectsIDsKey]

        const context_original_groups =
            {} as MultiObjectsGroupedObjectsAndRegularValues<Objects, ContextGroups, LeafContext>
        
        const multiObjectsIDs_original_template = multiObjectsIDs.template
        const multiObjectsIDs_original_IDs = multiObjectsIDs.IDs
        
        for (const { group } of this.groupsMemoized.context)
            group.set(context_original_groups, group.get(context))
        
        const nonfused_sample_vectors = context[FusedSamplingNonfusedSamples].get(<any>this)!

        fuseVectors(
            this.field.elementType,
            this.field.elementType,
            fuseMode,
            nonfused_sample_vectors.map<SampleVector>(([, samples]) => samples),
            context[MultiObjectsIDsKey],
            samples,
            true
        )

        for (const [key, child] of Reflect_entries<Record<keyof Objects, ChildFusingSampleDomain>>(<any>this.children)) {
            if (child.sample_fused_results) {
                for (const { group } of this.groupsMemoized.context) {
                    const context_original_group = group.get(context_original_groups)
                    const context_child_group = context_original_group[key]
                    group.set(child_context, context_child_group)
                }

                multiObjectsIDs.template = <any>multiObjectsIDs_original_template[key]
                multiObjectsIDs.IDs = <any>multiObjectsIDs_original_IDs[key]

                child.sample_fused_results(<any>samples, locations, <any>context, sampleType, fuseMode)
            }
        }

        for (const { group } of this.groupsMemoized.context)
            group.set(child_context, group.get(context_original_groups))

        multiObjectsIDs.template = multiObjectsIDs_original_template
        multiObjectsIDs.IDs = multiObjectsIDs_original_IDs
    }

    private static sample_vectorized<
            Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
            ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
            ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
            SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            SampleGroupKinds extends
                MultiObjectsDomainInternalPreservedGroupsKinds =
                MultiObjectsDomainInternalPreservedGroupsKinds,
            ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
            ContextGroupKinds extends
                MultiObjectsDomainInternalPreservedGroupsKinds =
                MultiObjectsDomainInternalPreservedGroupsKinds,
            Location extends FieldPoint = FieldPoint,
            LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            LeafSample extends
                MultiObjectsGroupsMapped<SampleGroups, FieldPoint> =
                MultiObjectsGroupsMapped<SampleGroups, FieldPoint>,
            SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            LeafContext extends
                SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any> =
                SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any>,
            LeafDomain extends
                SampleDomain<
                        Location,
                        LeafSample,
                        MultiObjectsLeafContext<
                                Objects,
                                ObjIDsT,
                                ObjIDsContainer,
                                SampleGroups,
                                SampleGroupKinds,
                                ContextGroups,
                                ContextGroupKinds,
                                Location,
                                LocationContainer,
                                LeafSample,
                                SampleContainer,
                                LeafContext
                            >
                    > =
                SampleDomain<
                        Location,
                        LeafSample,
                        MultiObjectsLeafContext<
                                Objects,
                                ObjIDsT,
                                ObjIDsContainer,
                                SampleGroups,
                                SampleGroupKinds,
                                ContextGroups,
                                ContextGroupKinds,
                                Location,
                                LocationContainer,
                                LeafSample,
                                SampleContainer,
                                LeafContext
                            >
                    >,
            Sample extends
                MultiObjectsSample<Objects, SampleGroups, LeafSample> =
                MultiObjectsSample<Objects, SampleGroups, LeafSample>,
            SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
            LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
            SampleVector extends 
                FieldPointVectorWithMultiObjects<
                        Sample,
                        SampleContainer,
                        ObjIDsT,
                        ObjIDsContainer
                    > =
                FieldPointVectorWithMultiObjects<
                        Sample,
                        SampleContainer,
                        ObjIDsT,
                        ObjIDsContainer
                    >,
        >(
            this: MultiObjectsSampleDomain<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LocationContainer,
                LeafSample,
                SampleContainer,
                LeafContext,
                LeafDomain,
                Sample,
                SingularContext,
                LocationVector,
                SampleVector
            >,
            locations: LocationVector,
            context: MultiObjectsFusedVectorSamplingContext<
                    Location,
                    LocationContainer,
                    Sample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    SampleVector,
                    ContextGroups,
                    ContextGroupKinds,
                    LeafContext
                >
        ): SampleVector {
        return <SampleVector><unknown>fusingVectorSampling.sample <
                Location,
                Sample,
                Objects,
                ObjIDsT,
                LocationContainer,
                SampleContainer,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                SampleVector//,
                // Context,
            >(<any>this, locations, context, this.fuseMode)
    }

    static build<
                Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
                ObjIDsT extends IndicesTypedArray = IndicesTypedArray,
                ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
                SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
                SampleGroupKinds extends
                    MultiObjectsDomainInternalPreservedGroupsKinds =
                    MultiObjectsDomainInternalPreservedGroupsKinds,
                ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
                ContextGroupKinds extends
                    MultiObjectsDomainInternalPreservedGroupsKinds =
                    MultiObjectsDomainInternalPreservedGroupsKinds,
                Location extends FieldPoint = FieldPoint,
                LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
                LeafSample extends
                    MultiObjectsGroupsMapped<SampleGroups, FieldPoint> =
                    MultiObjectsGroupsMapped<SampleGroups, FieldPoint>,
                SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
                LeafContext extends
                    SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any> =
                    SamplingContext<Location> & MultiObjectsGroupsMapped<ContextGroups, any>,
                LeafDomain extends
                    SampleDomain<
                            Location,
                            LeafSample,
                            MultiObjectsLeafContext<
                                    Objects,
                                    ObjIDsT,
                                    ObjIDsContainer,
                                    SampleGroups,
                                    SampleGroupKinds,
                                    ContextGroups,
                                    ContextGroupKinds,
                                    Location,
                                    LocationContainer,
                                    LeafSample,
                                    SampleContainer,
                                    LeafContext
                                >
                        > =
                    SampleDomain<
                            Location,
                            LeafSample,
                            MultiObjectsLeafContext<
                                    Objects,
                                    ObjIDsT,
                                    ObjIDsContainer,
                                    SampleGroups,
                                    SampleGroupKinds,
                                    ContextGroups,
                                    ContextGroupKinds,
                                    Location,
                                    LocationContainer,
                                    LeafSample,
                                    SampleContainer,
                                    LeafContext
                                >
                        >,
                Sample extends
                    MultiObjectsSample<Objects, SampleGroups, LeafSample> =
                    MultiObjectsSample<Objects, SampleGroups, LeafSample>,
                SingularContext extends SamplingContext<Location> = SamplingContext<Location>,
                LocationVector extends FieldPointVector<Location, LocationContainer> = FieldPointVector<Location, LocationContainer>,
                SampleVector extends 
                    FieldPointVectorWithMultiObjects<
                            Sample,
                            SampleContainer,
                            ObjIDsT,
                            ObjIDsContainer
                        > =
                    FieldPointVectorWithMultiObjects<
                            Sample,
                            SampleContainer,
                            ObjIDsT,
                            ObjIDsContainer
                        >,
            >(
                sampleDomains: MultiObjectsMapped<Objects, LeafDomain>,
                template: Objects,
                multiObj?: {
                    sample?: {
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
                MultiObjectsSamplingContext<
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
                MultiObjectsSamplingContext<
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
                                sampleDomain, //as unknown as MultiObjectsMapped<Objects, LeafDomain>,
                                (template as any)[key] as Objects,
                                multiObj
                        )] as [PropertyKey, LeafDomain]
                    )
                ),
            multiObj
        )
    }
}