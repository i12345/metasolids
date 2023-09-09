import { Cloneable, GeneratorType, IndicesTypedArray, Reflect_entries, Reflect_fromEntries, addDeltas, clone, makeClone } from "../../utils/index.js"
import { SampleDomain, SampleDomainLocationFieldKey, SamplingContext } from "../domain.js"
import { Field } from "../field.js"
import { FieldsField } from "../fields/fields.js"
import { makeInterpolator } from "../interpolation.js"
import { MultiObjectsTemplate, MultiObjectsGroupsTemplate, MultiObjectsGroupsMapped, MultiObjectsGroupsProcessingContext, groupKinds, MultiObjectsGroupsFiltered, MultiObjectsGroupedObjectsAndRegularValues, MultiObjectsGroupsKindsTemplate_Leaf, MultiObjectsMapped, MultiObjectsTemplate_Leaf, MultiObjectsIDsKey, extract, PropertyPath, intract, WithMultiObjectsIDs, MultiObjectsGroupedObjectsAndRegularValuesType, MultiObjectsGroupsOverwritten, MultiObjectsGroupsOrLeafMapped, MultiObjectsGroupsTemplateOrLeaf, groupsProxyOverwritten, MultiObjectsGroupsTemplate_Leaf } from "../../paradigm/trees/index.js"
import { FieldPoint, FieldPointMapped, FieldsPoint, FieldsPointMapped, field_point_map, fields_point_map } from "../point.js"
import { EncapsulatingDomainSamplingContext, EncapsulatingDomainSamplingContextParentContext, EncapsulatingDomainSamplingContextParentDomain } from "./encapsulating.js"
import { vectorized } from "vectorized-functions"
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorWithMultiObjects, IsDynamicVector, ItemObjIDsKey, ItemObjValuesOffsetsKey } from "../vectorized/point.js"
import { FieldPointWithMultiObjectPath, FuseMode, FusingFieldPointVectorWithMultiObjects, fusePoints, fuseVectors, fuse_mode_contains, fuse_mode_equal } from "../vectorized/index.js"
import { FusedVectorSamplingContext, FusingVectorSampleDomain, fusingVectorSampling } from "./fusing.js"
import { VectorSampleDomain, VectorSampleFunction, VectorSamplingContext, makeVectorSamplingContext } from "./vector.js"
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

export type MultiObjectsLeafSample<
        SampleGroups extends MultiObjectsGroupsTemplate
    > = MultiObjectsGroupsMapped<SampleGroups, FieldPoint>

export type MultiObjectsSample<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        LeafSample extends MultiObjectsLeafSample<SampleGroups> = MultiObjectsLeafSample<SampleGroups>
    > =
    FieldsPoint &
    MultiObjectsGroupedObjectsAndRegularValues<Objects, SampleGroups, LeafSample>

export type MultiObjectsSampleElementType<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        LeafSample extends MultiObjectsLeafSample<SampleGroups> = MultiObjectsLeafSample<SampleGroups>
    > =
    MultiObjectsGroupedObjectsAndRegularValuesType<Objects, SampleGroups, LeafSample>

export type MultiObjectsSampleFuseMode<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        LeafSample extends MultiObjectsLeafSample<SampleGroups> = MultiObjectsLeafSample<SampleGroups>
    > =
    LeafSample

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
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ContextGroupKinds extends MultiObjectsDomainInternalPreservedGroupsKinds = MultiObjectsDomainInternalPreservedGroupsKinds,
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LeafContext extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any> =
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any>
    > =
    SamplingContext<Location, LocationElementType, LocationFuseMode> &
    WithMultiObjectsIDs<Objects, ObjIDsT> &
    // MultiObjectsGroupsOmitted<Groups, LeafContext> &
    MultiObjectsGroupsOverwritten<ContextGroups, LeafContext, {}> &
    MultiObjectsGroupedObjectsAndRegularValues<Objects, ContextGroups, MultiObjectsGroupsFiltered<ContextGroups, LeafContext>> &
    MultiObjectsGroupsProcessingContext<ContextGroups, ContextGroupKinds>

export type MultiObjectsVectorSamplingContext<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        LeafSample extends MultiObjectsLeafSample<SampleGroups> = MultiObjectsLeafSample<SampleGroups>,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends SamplingContext<Location, LocationElementType, LocationFuseMode> = SamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        LeafSampleVector extends
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
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    MultiObjectsSampleElementType<
                            Objects,
                            SampleGroups,
                            LeafSample
                        >,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    MultiObjectsSampleElementType<
                            Objects,
                            SampleGroups,
                            LeafSample
                        >,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ContextGroupKinds extends MultiObjectsDomainInternalPreservedGroupsKinds = MultiObjectsDomainInternalPreservedGroupsKinds,
        LeafContext extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any> =
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any>,
    > =
    MultiObjectsSamplingContext<
            Objects,
            ObjIDsT,
            ContextGroups,
            ContextGroupKinds,
            Location,
            LocationElementType,
            LocationFuseMode,
            LeafContext
        > &
    VectorSamplingContext<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            MultiObjectsSample<Objects, SampleGroups, LeafSample>,
            MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
            MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>,
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            SingularContext,
            LocationVector,
            SampleVector
        >

export type MultiObjectsFusedVectorSamplingContext<
        Location extends FieldPoint = FieldPoint,
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        SampleGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        LeafSample extends MultiObjectsLeafSample<SampleGroups> = MultiObjectsLeafSample<SampleGroups>,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        SingularContext extends SamplingContext<Location, LocationElementType, LocationFuseMode> = SamplingContext<Location, LocationElementType, LocationFuseMode>,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        LeafSampleVector extends
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
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    MultiObjectsSampleElementType<
                            Objects,
                            SampleGroups,
                            LeafSample
                        >,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    MultiObjectsSampleElementType<
                            Objects,
                            SampleGroups,
                            LeafSample
                        >,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        ContextGroups extends MultiObjectsGroupsTemplate = MultiObjectsGroupsTemplate,
        ContextGroupKinds extends MultiObjectsDomainInternalPreservedGroupsKinds = MultiObjectsDomainInternalPreservedGroupsKinds,
        LeafContext extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any> =
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any>,
    > =
    MultiObjectsSamplingContext<
            Objects,
            ObjIDsT,
            ContextGroups,
            ContextGroupKinds,
            Location,
            LocationElementType,
            LocationFuseMode,
            LeafContext
        > &
    FusedVectorSamplingContext<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            MultiObjectsSample<Objects, SampleGroups, LeafSample>,
            MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
            MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>,
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
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        LeafSample extends MultiObjectsLeafSample<SampleGroups> = MultiObjectsLeafSample<SampleGroups>,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        LeafContext extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any> =
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any>,
        LeafDomain extends
            SampleDomain<
                Location,
                LeafSample,
                LocationElementType,
                LocationFuseMode,
                LeafSample,
                LeafSample,
                LeafContext
            > =
            SampleDomain<
                Location,
                LeafSample,
                LocationElementType,
                LocationFuseMode,
                LeafSample,
                LeafSample,
                LeafContext
            >,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        LeafSampleVector extends
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
    WithMultiObjectsIDs<Objects, ObjIDsT> &
    EncapsulatingDomainSamplingContext<
        Location,
        LocationElementType,
        LocationFuseMode,
        Location,
        LocationElementType,
        LocationFuseMode,
        MultiObjectsSample<Objects, SampleGroups, LeafSample>,
        MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
        MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>,
        MultiObjectsSamplingContext<
            Objects,
            ObjIDsT,
            ContextGroups,
            ContextGroupKinds,
            Location,
            LocationElementType,
            LocationFuseMode,
            LeafContext
        >
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
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                LeafSample,
                SampleContainer,
                LeafContext,
                LeafDomain
            >,
            context: MultiObjectsSamplingContext<
                    Objects,
                    ObjIDsT,
                    ContextGroups,
                    ContextGroupKinds,
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LeafContext
                >
        }
    }

export type MultiObjectsLeafVectorSamplingContext<
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
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        LeafSample extends MultiObjectsLeafSample<SampleGroups> = MultiObjectsLeafSample<SampleGroups>,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        LeafContext extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any> =
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any>,
        LeafDomain extends
            SampleDomain<
                Location,
                LeafSample,
                LocationElementType,
                LocationFuseMode,
                LeafSample,
                LeafSample,
                LeafContext
            > =
            SampleDomain<
                Location,
                LeafSample,
                LocationElementType,
                LocationFuseMode,
                LeafSample,
                LeafSample,
                LeafContext
            >,
        LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
        LeafSampleVector extends
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
    MultiObjectsLeafContext<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            SampleGroups,
            SampleGroupKinds,
            ContextGroups,
            ContextGroupKinds,
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            LeafSample,
            SampleContainer,
            LeafContext,
            LeafDomain,
            LocationVector,
            LeafSampleVector
        > &
    VectorSamplingContext<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            LeafSample,
            LeafSample,
            LeafSample,
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            LeafContext,
            LocationVector,
            LeafSampleVector
        >

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
        LocationElementType extends FieldPoint = Location,
        LocationFuseMode extends FieldPoint = Location,
        LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        LeafSample extends MultiObjectsLeafSample<SampleGroups> = MultiObjectsLeafSample<SampleGroups>,
        SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        LeafContext extends
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any> =
            SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any>,
        LeafDomain extends
            SampleDomain<
                    Location,
                    LeafSample,
                    LocationElementType,
                    LocationFuseMode,
                    LeafSample,
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
                            LocationElementType,
                            LocationFuseMode,
                            LocationContainer,
                            LeafSample,
                            SampleContainer,
                            LeafContext
                        >
                > =
            SampleDomain<
                    Location,
                    LeafSample,
                    LocationElementType,
                    LocationFuseMode,
                    LeafSample,
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
                            LocationElementType,
                            LocationFuseMode,
                            LocationContainer,
                            LeafSample,
                            SampleContainer,
                            LeafContext
                        >
                >,
        SingularContext extends
            MultiObjectsSamplingContext<
                    Objects,
                    ObjIDsT,
                    ContextGroups,
                    ContextGroupKinds,
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LeafContext
                > =
            MultiObjectsSamplingContext<
                    Objects,
                    ObjIDsT,
                    ContextGroups,
                    ContextGroupKinds,
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LeafContext
                >,
        LocationVector extends
            FieldPointVector<LocationElementType, LocationContainer> =
            FieldPointVector<LocationElementType, LocationContainer>,
        LeafSampleVector extends
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
        SampleVector extends
            FieldPointVectorWithMultiObjects<
                    MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                    SampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
    > implements
    FusingVectorSampleDomain<
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        MultiObjectsSample<Objects, SampleGroups, LeafSample>,
        MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
        MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>,
        SampleContainer,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SingularContext,
        LocationVector,
        SampleVector,
        MultiObjectsFusedVectorSamplingContext<
            Location,
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            SampleGroups,
            LeafSample,
            SampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            SingularContext,
            LocationVector,
            LeafSampleVector,
            SampleVector,
            ContextGroups,
            ContextGroupKinds,
            LeafContext
        >
    >,
    Cloneable<MultiObjectsSampleDomain<
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        SampleGroups,
        SampleGroupKinds,
        ContextGroups,
        ContextGroupKinds,
        Location,
        LocationElementType,
        LocationFuseMode,
        LocationContainer,
        LeafSample,
        SampleContainer,
        LeafContext,
        LeafDomain,
        SingularContext,
        LocationVector,
        LeafSampleVector,
        SampleVector
    >> {
    field!: Field<
            MultiObjectsSample<Objects, SampleGroups, LeafSample>,
            MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
            MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>
        >

    private groupsMemoized!: {
        context: GeneratorType<ReturnType<typeof groupKinds>>[]
        sample: GeneratorType<ReturnType<typeof groupKinds>>[]
    }

    private childrenFieldTypes!: Record<keyof Objects, "leaf" | "stem">

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
        public readonly childField: Field<LeafSample>,
        public readonly fuseMode?: FuseMode<MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>>,
    ) { }

    [clone]() {
        return new MultiObjectsSampleDomain<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                LeafSample,
                SampleContainer,
                LeafContext,
                LeafDomain,
                SingularContext,
                LocationVector,
                LeafSampleVector,
                SampleVector
            >(
                makeClone(this.children),
                makeClone(this.multiObj),
                makeClone(this.childField),
                makeClone(this.fuseMode),
            )
    }

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
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            Sample extends FieldPoint = FieldPoint,
            SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            LeafContext extends
                SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any> =
                SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any>,
            LeafDomain extends
                SampleDomain<
                        Location,
                        Sample,
                        LocationElementType,
                        LocationFuseMode,
                        Sample,
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
                                LocationElementType,
                                LocationFuseMode,
                                LocationContainer,
                                Sample,
                                SampleContainer,
                                LeafContext
                            >
                    > =
                SampleDomain<
                        Location,
                        Sample,
                        LocationElementType,
                        LocationFuseMode,
                        Sample,
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
                                LocationElementType,
                                LocationFuseMode,
                                LocationContainer,
                                Sample,
                                SampleContainer,
                                LeafContext
                            >
                    >,
            SingularContext extends
                MultiObjectsSamplingContext<
                        Objects,
                        ObjIDsT,
                        ContextGroups,
                        ContextGroupKinds,
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LeafContext
                    > =
                MultiObjectsSamplingContext<
                        Objects,
                        ObjIDsT,
                        ContextGroups,
                        ContextGroupKinds,
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LeafContext
                    >,
            LocationVector extends
                FieldPointVector<LocationElementType, LocationContainer> =
                FieldPointVector<LocationElementType, LocationContainer>,
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
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            Sample,
            SampleContainer,
            LeafContext,
            LeafDomain,
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
                ///@ts-ignore
                context: {
                    groupKindsTemplate: MultiObjectsDomainInternalPreservedGroupsKindsTemplate
                },
                sample: {
                    groupKindsTemplate: MultiObjectsDomainInternalPreservedGroupsKindsTemplate,
                    groupsTemplate: {}
                }
            },
            field,
            fuseMode
        )
    }

    /**
     * Extracts the sample context for this domain's context
     * @param context the domain context
     * @returns the sample context
     */
    protected sampleContext(context: MultiObjectsSamplingContext<
            Objects,
            ObjIDsT,
            ContextGroups,
            ContextGroupKinds,
            Location,
            LocationElementType,
            LocationFuseMode,
            LeafContext
        >): MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds> {
        return context as unknown as MultiObjectsGroupsProcessingContext<SampleGroups, SampleGroupKinds>
    }

    private childContext<T>(
            context: MultiObjectsSamplingContext<
                Objects,
                ObjIDsT,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LocationElementType,
                LocationFuseMode,
                LeafContext
            >,
            child_key: keyof Objects,
            worker: (child_context: MultiObjectsLeafContext<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SampleGroups,
                    SampleGroupKinds,
                    ContextGroups,
                    ContextGroupKinds,
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    LeafSample,
                    SampleContainer,
                    LeafContext,
                    LeafDomain,
                    LocationVector,
                    LeafSampleVector
                >
            ) => T
        ): T {
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
            LocationElementType,
            LocationFuseMode,
            LocationContainer,
            LeafSample,
            SampleContainer,
            LeafContext,
            LeafDomain,
            LocationVector,
            LeafSampleVector
        >

        const context_original_groups =
            {} as MultiObjectsGroupedObjectsAndRegularValues<Objects, ContextGroups, LeafContext>

        for (const { group } of this.groupsMemoized.context)
            group.set(context_original_groups, group.get(context))

        const multiObjectsIDs = context[MultiObjectsIDsKey]
        
        const multiObjectsIDs_original_template = multiObjectsIDs.template
        const multiObjectsIDs_original_IDs = multiObjectsIDs.IDs

        for (const { group } of this.groupsMemoized.context) {
            // const context_original_group = group.get(child_context)
            // group.set(context_original_groups, context_original_group)
            // group.delete(child_context)

            const context_original_group = group.get(context_original_groups)
            if (context_original_group) {
                const context_child_group = context_original_group[child_key]
                group.set(child_context, context_child_group)
            }
        }

        multiObjectsIDs.template = <any>multiObjectsIDs_original_template[child_key]
        multiObjectsIDs.IDs = <any>multiObjectsIDs_original_IDs[child_key]

        const result = worker(child_context)

        for (const { group } of this.groupsMemoized.context) {
            const context_original_group = group.get(context_original_groups) ?? {}
            const context_child_group = group.get(child_context)
            context_original_group[child_key] = context_child_group
            // group.delete(child_context)
            group.set(context, context_original_group)
        }

        const toplevel_exclude_copy: PropertyKey[] = [
            MultiObjectsSamplingContextParent,
            EncapsulatingDomainSamplingContextParentContext,
            EncapsulatingDomainSamplingContextParentDomain,
            VectorSampleFunction,
        ]

        for (const toplevel_key of Reflect.ownKeys(child_context))
            if (context[toplevel_key] !== child_context[toplevel_key] &&
                !toplevel_exclude_copy.includes(toplevel_key) &&
                !this.groupsMemoized.context.some(({ group }) => group.path.length > 0 && group.path[0] === toplevel_key))
                (<any>context)[toplevel_key] = child_context[toplevel_key]
        
        multiObjectsIDs.template = multiObjectsIDs_original_template
        multiObjectsIDs.IDs = multiObjectsIDs_original_IDs

        return result
    }

    init(context: MultiObjectsSamplingContext<
            Objects,
            ObjIDsT,
            ContextGroups,
            ContextGroupKinds,
            Location,
            LocationElementType,
            LocationFuseMode,
            LeafContext
        >): void {
        this.groupsMemoized = {
            context: [...groupKinds(context, this.multiObj.context.groupKindsTemplate, this.multiObj.context.groupsTemplate)],
            sample: this.multiObj.sample ? [...groupKinds(this.sampleContext(context), this.multiObj.sample.groupKindsTemplate, this.multiObj.sample.groupsTemplate)] : [],
        }

        const sampleMultiObjTemplate = <{ root: MultiObjectsGroupsMapped<SampleGroups, true> }>{}
        this.groupsMemoized.sample.forEach(path => intract(sampleMultiObjTemplate, ['root', ...path.group.path], true))

        const multiObjectsIDs = (<WithMultiObjectsIDs<Objects, ObjIDsT>><unknown>context)[MultiObjectsIDsKey]

        function multiObjField_recursive(field: Field, sampleMultiObjMapped: MultiObjectsGroupsMapped<SampleGroups, true>): Field {
            if (sampleMultiObjMapped === true)
                return new MultiObjectsField(field, multiObjectsIDs)
            else if (field instanceof FieldsField) {
                function fields_recursive(
                    fields: FieldPointMapped<FieldPoint, Field>,
                    sampleMultiObjMapped: MultiObjectsGroupsOrLeafMapped<MultiObjectsGroupsTemplateOrLeaf, true>
                ): FieldPointMapped<FieldPoint, Field> {
                    if (sampleMultiObjMapped === true) {
                        return new MultiObjectsField(
                            ((<Field>fields).interpolationType && (makeInterpolator in (<Field>fields).interpolationType)) ?
                                <Field>fields :
                                new FieldsField(<FieldPointMapped<FieldsPoint, Field>>fields),
                            multiObjectsIDs
                        )
                    }
                    else if ((<Field>fields).interpolationType && (makeInterpolator in (<Field>fields).interpolationType))
                        return fields
                    else {
                        return Reflect_fromEntries(
                            Reflect_entries(fields).map(([key, subfields]) => [
                                key,
                                fields_recursive(
                                    <FieldPointMapped<FieldPoint, Field>>subfields,
                                    sampleMultiObjMapped[key]
                                )
                            ] as [typeof key, FieldPointMapped<FieldPoint, Field>]))
                    }
                }

                const mapped = fields_recursive((<FieldsField>field).fields, sampleMultiObjMapped)
                if (mapped.interpolationType && makeInterpolator in mapped.interpolationType)
                    return <Field>mapped
                else return new FieldsField(<FieldsPointMapped<FieldsPoint, Field>>mapped)
            }
            else return field
        }

        type SampleField = Field<
            MultiObjectsSample<Objects, SampleGroups, LeafSample>,
            MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
            MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>
        >

        this.field = <SampleField><unknown>multiObjField_recursive(this.childField, sampleMultiObjTemplate.root)
        this.childrenFieldTypes = <typeof this.childrenFieldTypes>{}

        for (const key of Reflect.ownKeys(this.children)) {
            const child = this.children[key]

            this.childContext<void>(context, key, child_context => child.init(child_context as any))

            if (field_point_type_contains(child.field.elementType, this.childField.elementType))
                this.childrenFieldTypes[<keyof Objects>key] = "leaf"
            else if (field_point_type_contains(child.field.elementType, this.field.elementType))
                this.childrenFieldTypes[<keyof Objects>key] = "stem"
            else
                throw new Error()
        }
    }

    @vectorized(MultiObjectsSampleDomain.sample_vectorized)
    sample(
            location: Location,
            context: MultiObjectsSamplingContext<
                    Objects,
                    ObjIDsT,
                    ContextGroups,
                    ContextGroupKinds,
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LeafContext
                >
        ): MultiObjectsSample<Objects, SampleGroups, LeafSample> {
        const child_samples = Reflect.ownKeys(this.children).map(key => {
            const sample = this.childContext<LeafSample>(context, key, child_context => this.children[key].sample(location, child_context as any))

            return <FieldPointWithMultiObjectPath<LeafSample>>{
                value: sample,
                multiObjPath: [key],
            }
        })

        type Sample = MultiObjectsSample<Objects, SampleGroups, LeafSample>
        type SampleElementType = MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>
        type SampleFuseMode = MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>

        const fused = fusePoints<LeafSample, Sample, LeafSample, SampleElementType, SampleFuseMode, Objects, ObjIDsT>(
            this.field.elementType,
            this.childField.elementType,
            this.fuseMode ?? this.field.fuseMode,
            <FieldPointWithMultiObjectPath<LeafSample>[]><unknown>child_samples,
            context[MultiObjectsIDsKey]
        )

        return fused
    }

    can_fuse(
            sampleType: FieldPointType<MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>>,
            fuseMode: FuseMode<MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>>,
            context: MultiObjectsFusedVectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleGroups,
                    LeafSample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    LeafSampleVector,
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
            locations: LocationVector,
            context: MultiObjectsFusedVectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleGroups,
                    LeafSample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    LeafSampleVector,
                    SampleVector,
                    ContextGroups,
                    ContextGroupKinds,
                    LeafContext
                >,
            sampleType: FieldPointType<MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>>,
            fuseMode: FuseMode<MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>>,
        ): void {
        const location_iterator = vectorIterator<LocationElementType, LocationContainer>(
            context[SampleDomainLocationFieldKey].elementType,
            <IsDynamicVector<LocationElementType, LocationContainer>>false,
            context[MultiObjectsIDsKey]
        )

        const sample_count = location_iterator.length(locations, locations)
        const multiObjectsIDs = context[MultiObjectsIDsKey]

        // const child_context = {
        //     ...context,
        //     [MultiObjectsSamplingContextParent]: {
        //         item: this,
        //         context
        //     },
        //     [EncapsulatingDomainSamplingContextParentContext]: context,
        //     [EncapsulatingDomainSamplingContextParentDomain]: this
        // } as typeof context & MultiObjectsLeafContext<
        //         Objects,
        //         ObjIDsT,
        //         ObjIDsContainer,
        //         SampleGroups,
        //         SampleGroupKinds,
        //         ContextGroups,
        //         ContextGroupKinds,
        //         Location,
        //         LocationElementType,
        //         LocationFuseMode,
        //         LocationContainer,
        //         LeafSample,
        //         SampleContainer,
        //         LeafContext,
        //         LeafDomain,
        //         LocationVector,
        //         LeafSampleVector
        //     >

        // const child_leaf_context = {
        //     ...child_context,
        //     [VectorSampleFunction]: undefined
        // } as MultiObjectsLeafVectorSamplingContext<
        //     Objects,
        //     ObjIDsT,
        //     ObjIDsContainer,
        //     SampleGroups,
        //     SampleGroupKinds,
        //     ContextGroups,
        //     ContextGroupKinds,
        //     Location,
        //     LocationElementType,
        //     LocationFuseMode,
        //     LocationContainer,
        //     LeafSample,
        //     SampleContainer,
        //     LeafContext,
        //     LeafDomain,
        //     LocationVector,
        //     LeafSampleVector
        // >

        // makeVectorSamplingContext(this.childField, child_leaf_context, multiObjectsIDs)

        type ChildFusingSampleDomain = FusingVectorSampleDomain<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                MultiObjectsSample<Objects, SampleGroups, LeafSample>,
                MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LeafContext,
                LocationVector,
                SampleVector,
                LeafContext & MultiObjectsFusedVectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleGroups,
                    LeafSample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    LeafSampleVector,
                    SampleVector,
                    ContextGroups,
                    ContextGroupKinds,
                    LeafContext
                >
            >

        type ChildLeafVectorDomain = VectorSampleDomain<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                LeafSample,
                LeafSample,
                LeafSample,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LeafContext,
                LocationVector,
                LeafSampleVector,
                MultiObjectsLeafVectorSamplingContext<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SampleGroups,
                    SampleGroupKinds,
                    ContextGroups,
                    ContextGroupKinds,
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    LeafSample,
                    SampleContainer,
                    LeafContext,
                    LeafDomain,
                    LocationVector,
                    LeafSampleVector
                >
            >

        type ChildStemVectorDomain = VectorSampleDomain<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                MultiObjectsSample<Objects, SampleGroups, LeafSample>,
                MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LeafContext,
                LocationVector,
                SampleVector,
                LeafContext & MultiObjectsVectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleGroups,
                    LeafSample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    LeafSampleVector,
                    SampleVector,
                    ContextGroups,
                    ContextGroupKinds,
                    LeafContext
                >
            >

        ///@ts-ignore
        const nonfusing = Reflect_entries<Record<keyof Objects, ChildFusingSampleDomain>>(<any>this.children).filter(([, child]) => !(child.can_fuse && child.can_fuse(sampleType, fuseMode, <any>context)))

        const nonfused_samples = nonfusing.map(([key, sampleDomain]) => {
            // for (const { group } of this.groupsMemoized.context) {
            //     const context_original_group = group.get(context_original_groups)
            //     const context_child_group = context_original_group[key]
            //     group.set(child_context, context_child_group)
            //     group.set(child_leaf_context, context_child_group)
            // }

            // multiObjectsIDs.template = <any>multiObjectsIDs_original_template[key]
            // multiObjectsIDs.IDs = <any>multiObjectsIDs_original_IDs[key]

            let samples: SampleVector

            if (this.childrenFieldTypes[key] === "leaf") {
                samples = this.childContext<SampleVector>(context, key, child_context => {
                    const child_leaf_context = child_context as MultiObjectsLeafVectorSamplingContext<
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        SampleGroups,
                        SampleGroupKinds,
                        ContextGroups,
                        ContextGroupKinds,
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        LeafSample,
                        SampleContainer,
                        LeafContext,
                        LeafDomain,
                        LocationVector,
                        LeafSampleVector
                    >
                    
                    makeVectorSamplingContext(this.childField, child_leaf_context, multiObjectsIDs)
                    const leaf_samples = child_leaf_context[VectorSampleFunction](<ChildLeafVectorDomain><unknown>sampleDomain, locations, child_leaf_context)

                    const multiObjVector = <FieldPointVectorWithMultiObjects<MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>, SampleContainer, ObjIDsT, ObjIDsContainer>><unknown>leaf_samples

                    if (multiObjVector[ItemObjIDsKey]?.length > 0)
                        throw new Error("did not expect children to have multi objects")
    
                    multiObjVector[ItemObjIDsKey] = <FieldPointVector<ObjIDsT, ObjIDsContainer>><FieldPointVectorContainerStatic<ObjIDsT>>new multiObjectsIDs.IDsType(sample_count)
                    multiObjVector[ItemObjValuesOffsetsKey] = new Uint32Array(sample_count)
    
                    multiObjVector[ItemObjIDsKey].fill(<number>multiObjectsIDs.IDs)
                    const offsets = multiObjVector[ItemObjValuesOffsetsKey]
                    for (let i = 0; i < sample_count; i++)
                        offsets[i] = i + 1

                    return <SampleVector>multiObjVector
                })
            }
            else {
                samples = this.childContext<SampleVector>(context, key, child_context_ => {
                    const child_context = child_context_ as typeof context & MultiObjectsLeafContext<
                        Objects,
                        ObjIDsT,
                        ObjIDsContainer,
                        SampleGroups,
                        SampleGroupKinds,
                        ContextGroups,
                        ContextGroupKinds,
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LocationContainer,
                        LeafSample,
                        SampleContainer,
                        LeafContext,
                        LeafDomain,
                        LocationVector,
                        LeafSampleVector
                    >
                
                    return child_context[VectorSampleFunction](<ChildStemVectorDomain><unknown>sampleDomain, locations, child_context)
                })
            }

            return <[keyof Objects, SampleVector]>[key, samples]
        })

        context[FusedSamplingNonfusedSamples] ??= new Map()
        context[FusedSamplingNonfusedSamples].set(<any>this, nonfused_samples)

        for (const [key, child] of Reflect_entries<Record<keyof Objects, ChildFusingSampleDomain>>(<any>this.children)) {
            if (nonfused_samples.find(([key1]) => key === key1))
                continue

            if (this.childrenFieldTypes[key] !== "leaf")
                throw new Error()
            
            // for (const { group } of this.groupsMemoized.context) {
            //     const context_original_group = group.get(context_original_groups)
            //     const context_child_group = context_original_group[key]
            //     group.set(child_context, context_child_group)
            // }

            // multiObjectsIDs.template = <any>multiObjectsIDs_original_template[key]
            // multiObjectsIDs.IDs = <any>multiObjectsIDs_original_IDs[key]

            this.childContext<void>(context, key, child_context => {
                child.sample_fused_objectCounts(objCounts, locations, <any>child_context, sampleType, fuseMode)
            })
        }

        for (const [, samples] of nonfused_samples)
            addDeltas(objCounts, samples[ItemObjValuesOffsetsKey])

        // for (const { group } of this.groupsMemoized.context)
        //     group.set(child_context, group.get(context_original_groups))

        // multiObjectsIDs.template = multiObjectsIDs_original_template
        // multiObjectsIDs.IDs = multiObjectsIDs_original_IDs
    }

    sample_fused_results(
        samples: FusingFieldPointVectorWithMultiObjects<
                MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                ObjIDsT,
                SampleContainer,
                ObjIDsContainer
            >,
        locations: LocationVector,
        context: MultiObjectsFusedVectorSamplingContext<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                SampleGroups,
                LeafSample,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                LeafSampleVector,
                SampleVector,
                ContextGroups,
                ContextGroupKinds,
                LeafContext
            >,
        sampleType: FieldPointType<MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>>,
        fuseMode: FuseMode<MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>>,
    ): void {
        type ChildFusingSampleDomain = FusingVectorSampleDomain<
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                MultiObjectsSample<Objects, SampleGroups, LeafSample>,
                MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>,
                SampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                LeafContext,
                LocationVector,
                SampleVector,
                LeafContext & MultiObjectsFusedVectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleGroups,
                    LeafSample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    LeafSampleVector,
                    SampleVector,
                    ContextGroups,
                    ContextGroupKinds,
                    LeafContext
                >
            >

        const multiObjectsIDs = (<WithMultiObjectsIDs<Objects, ObjIDsT>><unknown>context)[MultiObjectsIDsKey]

        const nonfused_sample_vectors = context[FusedSamplingNonfusedSamples].get(<any>this)!

        type SampleFusingVector = FusingFieldPointVectorWithMultiObjects<MultiObjectsGroupedObjectsAndRegularValuesType<Objects, SampleGroups, LeafSample>, ObjIDsT, SampleContainer, ObjIDsContainer>

        fuseVectors<
                MultiObjectsSample<Objects, SampleGroups, LeafSample>,
                MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>,
                SampleContainer,
                SampleVector,
                SampleVector,
                Objects,
                ObjIDsT,
                ObjIDsContainer
            >(
            sampleType,
            this.field.elementType,
            fuseMode,
            nonfused_sample_vectors.map<SampleVector>(([, samples]) => samples),
            multiObjectsIDs,
            <SampleFusingVector>samples,
            true
        )

        for (const [key, child] of Reflect_entries<Record<keyof Objects, ChildFusingSampleDomain>>(<any>this.children)) {
            if (child.sample_fused_results) {
                this.childContext<void>(context, key, child_context =>
                    child.sample_fused_results(<SampleFusingVector>samples, locations, <any>context, sampleType, fuseMode)
                )
            }
        }
    }

    private static sample_vectorized<
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
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            LeafSample extends MultiObjectsLeafSample<SampleGroups> = MultiObjectsLeafSample<SampleGroups>,
            SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            LeafContext extends
                SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any> =
                SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any>,
            LeafDomain extends
                SampleDomain<
                        Location,
                        LeafSample,
                        LocationElementType,
                        LocationFuseMode,
                        LeafSample,
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
                                LocationElementType,
                                LocationFuseMode,
                                LocationContainer,
                                LeafSample,
                                SampleContainer,
                                LeafContext
                            >
                    > =
                SampleDomain<
                        Location,
                        LeafSample,
                        LocationElementType,
                        LocationFuseMode,
                        LeafSample,
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
                                LocationElementType,
                                LocationFuseMode,
                                LocationContainer,
                                LeafSample,
                                SampleContainer,
                                LeafContext
                            >
                    >,
            SingularContext extends
                MultiObjectsSamplingContext<
                        Objects,
                        ObjIDsT,
                        ContextGroups,
                        ContextGroupKinds,
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LeafContext
                    > =
                MultiObjectsSamplingContext<
                        Objects,
                        ObjIDsT,
                        ContextGroups,
                        ContextGroupKinds,
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LeafContext
                    >,
            LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
            LeafSampleVector extends
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
            SampleVector extends
                FieldPointVectorWithMultiObjects<
                        MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                        SampleContainer,
                        ObjIDsT,
                        ObjIDsContainer
                    > =
                FieldPointVectorWithMultiObjects<
                        MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
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
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                LeafSample,
                SampleContainer,
                LeafContext,
                LeafDomain,
                SingularContext,
                LocationVector,
                LeafSampleVector,
                SampleVector
            >,
            locations: LocationVector,
            context: MultiObjectsFusedVectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleGroups,
                    LeafSample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    LeafSampleVector,
                    SampleVector,
                    ContextGroups,
                    ContextGroupKinds,
                    LeafContext
                >
        ): SampleVector {
        return <SampleVector><unknown>fusingVectorSampling.sample<
                Location,
                LocationElementType,
                LocationFuseMode,
                MultiObjectsSample<Objects, SampleGroups, LeafSample>,
                MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>,
                Objects,
                ObjIDsT,
                LocationContainer,
                SampleContainer,
                ObjIDsContainer,
                SingularContext,
                LocationVector,
                SampleVector,
                MultiObjectsFusedVectorSamplingContext<
                    Location,
                    LocationElementType,
                    LocationFuseMode,
                    LocationContainer,
                    SampleGroups,
                    LeafSample,
                    SampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    SingularContext,
                    LocationVector,
                    LeafSampleVector,
                    SampleVector,
                    ContextGroups,
                    ContextGroupKinds,
                    LeafContext
                >
            >(<any>this, locations, context, this.fuseMode)
    }

    static build<
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
            LocationElementType extends FieldPoint = Location,
            LocationFuseMode extends FieldPoint = Location,
            LocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            LeafSample extends MultiObjectsLeafSample<SampleGroups> = MultiObjectsLeafSample<SampleGroups>,
            SampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
            LeafContext extends
                SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any> =
                SamplingContext<Location, LocationElementType, LocationFuseMode> & MultiObjectsGroupsMapped<ContextGroups, any>,
            LeafDomain extends
                SampleDomain<
                        Location,
                        LeafSample,
                        LocationElementType,
                        LocationFuseMode,
                        LeafSample,
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
                                LocationElementType,
                                LocationFuseMode,
                                LocationContainer,
                                LeafSample,
                                SampleContainer,
                                LeafContext
                            >
                    > =
                SampleDomain<
                        Location,
                        LeafSample,
                        LocationElementType,
                        LocationFuseMode,
                        LeafSample,
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
                                LocationElementType,
                                LocationFuseMode,
                                LocationContainer,
                                LeafSample,
                                SampleContainer,
                                LeafContext
                            >
                    >,
            SingularContext extends
                MultiObjectsSamplingContext<
                        Objects,
                        ObjIDsT,
                        ContextGroups,
                        ContextGroupKinds,
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LeafContext
                    > =
                MultiObjectsSamplingContext<
                        Objects,
                        ObjIDsT,
                        ContextGroups,
                        ContextGroupKinds,
                        Location,
                        LocationElementType,
                        LocationFuseMode,
                        LeafContext
                    >,
            LocationVector extends FieldPointVector<LocationElementType, LocationContainer> = FieldPointVector<LocationElementType, LocationContainer>,
            LeafSampleVector extends
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
            SampleVector extends
                FieldPointVectorWithMultiObjects<
                        MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                        SampleContainer,
                        ObjIDsT,
                        ObjIDsContainer
                    > =
                FieldPointVectorWithMultiObjects<
                        MultiObjectsSampleElementType<Objects, SampleGroups, LeafSample>,
                        SampleContainer,
                        ObjIDsT,
                        ObjIDsContainer
                    >,
            >(
                sampleDomains: MultiObjectsMapped<Objects, LeafDomain>,
                template: Objects,
                childField: Field<LeafSample>,
                multiObj?: {
                    sample?: {
                        groupKindsTemplate: SampleGroupKinds,
                        groupsTemplate?: SampleGroups
                    }
                    context: {
                        groupKindsTemplate: ContextGroupKinds,
                        groupsTemplate?: ContextGroups
                    }
                },
                fuseMode?: FuseMode<MultiObjectsSampleFuseMode<Objects, SampleGroups, LeafSample>>
        ): MultiObjectsSampleDomain<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                SampleGroups,
                SampleGroupKinds,
                ContextGroups,
                ContextGroupKinds,
                Location,
                LocationElementType,
                LocationFuseMode,
                LocationContainer,
                LeafSample,
                SampleContainer,
                LeafContext,
                LeafDomain,
                SingularContext,
                LocationVector,
                LeafSampleVector,
                SampleVector
            > {
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
                                childField,
                                multiObj,
                                fuseMode
                        )] as [PropertyKey, LeafDomain]
                    )
                ),
            multiObj,
            childField,
            fuseMode
        )
    }
}