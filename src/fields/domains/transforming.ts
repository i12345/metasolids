import { FieldPoint } from '../point.js'
import { FieldPointType } from '../type.js'
import { SampleDomain, SampleDomainLocationFieldKey, SamplingContext } from '../domain.js'
import { Field } from '../field.js'
import { EncapsulatingDomainSamplingContext, EncapsulatingDomainSamplingContextParentContext, EncapsulatingDomainSamplingContextParentDomain } from './encapsulating.js'
import { PropertyPath } from '../../paradigm/trees/path.js'
import { vectorized } from 'vectorized-functions'
import { VectorSampleFunction, makeVectorSamplingContext } from './vector.js'
import { FusedVectorSamplingContext, FusingVectorSampleDomain } from './fusing.js'
import { FieldPointVector, FieldPointVectorContainerStatic, FieldPointVectorFunction, FieldPointVectorWithMultiObjects, FuseMode, FusingFieldPointVectorWithMultiObjects, fuseVectors } from '../vectorized/index.js'
import { MultiObjectsGroupsTemplateLeaf, MultiObjectsGroupsTemplate_Leaf, MultiObjectsIDsKey, MultiObjectsTemplate } from '../../paradigm/trees/index.js'
import { IndicesTypedArray } from '../../utils/indices-array.js'

export type TransformingDefaultInnerSamplingContext<
        OuterLocation extends FieldPoint = FieldPoint,
        OuterLocationElementType extends FieldPoint = OuterLocation,
        OuterLocationFuseMode extends FieldPoint = OuterLocation,
        InnerLocation extends FieldPoint = FieldPoint,
        InnerLocationElementType extends FieldPoint = InnerLocation,
        InnerLocationFuseMode extends FieldPoint = InnerLocation,
        OuterSample extends FieldPoint = FieldPoint,
        OuterSampleElementType extends FieldPoint = OuterSample,
        OuterSampleFuseMode extends FieldPoint = OuterSample,
        OuterContext extends
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode> =
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode>
    > = Omit<OuterContext, typeof SampleDomainLocationFieldKey> &
    EncapsulatingDomainSamplingContext<
        InnerLocation,
        InnerLocationElementType,
        InnerLocationFuseMode,
        OuterLocation,
        OuterLocationElementType,
        OuterLocationFuseMode,
        OuterSample,
        OuterSampleElementType,
        OuterSampleFuseMode,
        OuterContext
    > &
    { [SampleDomainLocationFieldKey]: Field<InnerLocation, InnerLocationElementType, InnerLocationFuseMode> }

export const TransformingTransformedLocationsKey = Symbol("transformed-locations")

export type TransformingSampleDomainPreservedGroups = {
    [TransformingTransformedLocationsKey]: MultiObjectsGroupsTemplateLeaf
}

export const TransformingSampleDomainPreservedGroupsTemplate: TransformingSampleDomainPreservedGroups = {
    [TransformingTransformedLocationsKey]: MultiObjectsGroupsTemplate_Leaf
}

type TransformingFusingVectorSampleContextPrivate<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        OuterLocation extends FieldPoint = FieldPoint,
        OuterLocationElementType extends FieldPoint = OuterLocation,
        OuterLocationFuseMode extends FieldPoint = OuterLocation,
        OuterLocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        OuterSample extends FieldPoint = FieldPoint,
        OuterSampleElementType extends FieldPoint = OuterSample,
        OuterSampleFuseMode extends FieldPoint = OuterSample,
        OuterSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        OuterContext extends
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode> =
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode>,
        OuterLocationVector extends
            FieldPointVector<OuterLocationElementType, OuterLocationContainer> =
            FieldPointVector<OuterLocationElementType, OuterLocationContainer>,
        OuterSampleVector extends
            FieldPointVectorWithMultiObjects<
                    OuterSampleElementType,
                    OuterSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    OuterSampleElementType,
                    OuterSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        OuterVectorContext extends
            FusedVectorSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector
                > =
            FusedVectorSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector
                >,
        InnerLocation extends FieldPoint = FieldPoint,
        InnerLocationElementType extends FieldPoint = InnerLocation,
        InnerLocationFuseMode extends FieldPoint = InnerLocation,
        InnerLocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        InnerSample extends FieldPoint = FieldPoint,
        InnerSampleElementType extends FieldPoint = InnerSample,
        InnerSampleFuseMode extends FieldPoint = InnerSample,
        InnerSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        InnerContext extends
            SamplingContext<InnerLocation, InnerLocationElementType, InnerLocationFuseMode> =
            TransformingDefaultInnerSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterContext
                >,
        InnerLocationVector extends
            FieldPointVector<InnerLocationElementType, InnerLocationContainer> =
            FieldPointVector<InnerLocationElementType, InnerLocationContainer>,
        InnerSampleVector extends
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    InnerSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    InnerSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        InnerVectorContext extends
            FusedVectorSamplingContext<
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector
                > =
            FusedVectorSamplingContext<
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector
                >,
    > =
    FusedVectorSamplingContext<
            OuterLocation,
            OuterLocationElementType,
            OuterLocationFuseMode,
            OuterLocationContainer,
            OuterSample,
            OuterSampleElementType,
            OuterSampleFuseMode,
            OuterSampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            OuterContext,
            OuterLocationVector,
            OuterSampleVector
        > & {
        [TransformingTransformedLocationsKey]: Map<
            TransformingSampleDomain<
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                OuterLocation,
                OuterLocationElementType,
                OuterLocationFuseMode,
                OuterLocationContainer,
                OuterSample,
                OuterSampleElementType,
                OuterSampleFuseMode,
                OuterSampleContainer,
                OuterContext,
                OuterLocationVector,
                OuterSampleVector,
                OuterVectorContext,
                InnerLocation,
                InnerLocationElementType,
                InnerLocationFuseMode,
                InnerLocationContainer,
                InnerSample,
                InnerSampleElementType,
                InnerSampleFuseMode,
                InnerSampleContainer,
                InnerContext,
                InnerLocationVector,
                InnerSampleVector,
                InnerVectorContext
            >,
            InnerLocationVector
        >
    }
/**
 * A transforming sample domain. It has overrideable behavoir for transforming
 * the outer location to a different inner location, the inner sample to a
 * different outer sample, and the outer context to a different inner context.
 *
 * By default, the outer location is considered equal to the inner location,
 * the inner sample is considered equal to the outer sample, and the outer
 * context is wrapped with an {@link EncapsulatingDomainSamplingContext} though
 * with the same location field from the outer context by default.
 */
export abstract class TransformingSampleDomain<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        OuterLocation extends FieldPoint = FieldPoint,
        OuterLocationElementType extends FieldPoint = OuterLocation,
        OuterLocationFuseMode extends FieldPoint = OuterLocation,
        OuterLocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        OuterSample extends FieldPoint = FieldPoint,
        OuterSampleElementType extends FieldPoint = OuterSample,
        OuterSampleFuseMode extends FieldPoint = OuterSample,
        OuterSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        OuterContext extends
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode> =
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode>,
        OuterLocationVector extends
            FieldPointVector<OuterLocationElementType, OuterLocationContainer> =
            FieldPointVector<OuterLocationElementType, OuterLocationContainer>,
        OuterSampleVector extends
            FieldPointVectorWithMultiObjects<
                    OuterSampleElementType,
                    OuterSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    OuterSampleElementType,
                    OuterSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        OuterVectorContext extends
            FusedVectorSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector
                > =
            FusedVectorSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector
                >,
        InnerLocation extends FieldPoint = FieldPoint,
        InnerLocationElementType extends FieldPoint = InnerLocation,
        InnerLocationFuseMode extends FieldPoint = InnerLocation,
        InnerLocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        InnerSample extends FieldPoint = FieldPoint,
        InnerSampleElementType extends FieldPoint = InnerSample,
        InnerSampleFuseMode extends FieldPoint = InnerSample,
        InnerSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        InnerContext extends
            SamplingContext<InnerLocation, InnerLocationElementType, InnerLocationFuseMode> =
            TransformingDefaultInnerSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterContext
                >,
        InnerLocationVector extends
            FieldPointVector<InnerLocationElementType, InnerLocationContainer> =
            FieldPointVector<InnerLocationElementType, InnerLocationContainer>,
        InnerSampleVector extends
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    InnerSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    InnerSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        InnerVectorContext extends
            FusedVectorSamplingContext<
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector
                > =
            FusedVectorSamplingContext<
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector
                >,
    > implements
    FusingVectorSampleDomain<
        OuterLocation,
        OuterLocationElementType,
        OuterLocationFuseMode,
        OuterLocationContainer,
        OuterSample,
        OuterSampleElementType,
        OuterSampleFuseMode,
        OuterSampleContainer,
        Objects,
        ObjIDsT,
        ObjIDsContainer,
        OuterContext,
        OuterLocationVector,
        OuterSampleVector,
        OuterVectorContext
    > {
    protected abstract transformsLocation?: boolean
    protected abstract transformsSample?: boolean

    constructor(public inner: SampleDomain<
            InnerLocation,
            InnerSample,
            InnerLocationElementType,
            InnerLocationFuseMode,
            InnerSampleElementType,
            InnerSampleFuseMode,
            InnerContext
        >) { }
    
    field!: Field<OuterSample, OuterSampleElementType, OuterSampleFuseMode>
    private location_field!: Field<InnerLocation, InnerLocationElementType, InnerLocationFuseMode>

    init(context: OuterContext): void {
        this.location_field = this.init_location_field(context)
        const innerContext = this.transformContext(context)
        this.inner.init(innerContext)
        this.init_transfer_context(innerContext, context)
        this.field = this.init_make_field(this.inner.field, {
            inner: innerContext,
            outer: context
        })
        this.init_fusing(context)
    }

    private init_fusing(context: OuterContext) {
        type ContextPrivateT = TransformingFusingVectorSampleContextPrivate<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            OuterLocation,
            OuterLocationElementType,
            OuterLocationFuseMode,
            OuterLocationContainer,
            OuterSample,
            OuterSampleElementType,
            OuterSampleFuseMode,
            OuterSampleContainer,
            OuterContext,
            OuterLocationVector,
            OuterSampleVector,
            OuterVectorContext,
            InnerLocation,
            InnerLocationElementType,
            InnerLocationFuseMode,
            InnerLocationContainer,
            InnerSample,
            InnerSampleElementType,
            InnerSampleFuseMode,
            InnerSampleContainer,
            InnerContext,
            InnerLocationVector,
            InnerSampleVector,
            InnerVectorContext
        >
        
        type InnerDomain = FusingVectorSampleDomain<
            InnerLocation,
            InnerLocationElementType,
            InnerLocationFuseMode,
            InnerLocationContainer,
            InnerSample,
            InnerSampleElementType,
            InnerSampleFuseMode,
            InnerSampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            InnerContext,
            InnerLocationVector,
            InnerSampleVector,
            InnerVectorContext
        >

        const contextPrivate = <ContextPrivateT>context
        contextPrivate[TransformingTransformedLocationsKey] = new Map()

        const inner = <InnerDomain><unknown>this.inner
        if (inner.sample_fused_objectCounts === undefined) {
            this.can_fuse = undefined!
            this.sample_fused_objectCounts = undefined!
            this.sample_fused_results = undefined!
        }
    }

    private _transformVectorContext(outerContext: OuterVectorContext) {
        const innerContext = <InnerVectorContext><unknown>this.transformContext(outerContext)
        const context = { outer: outerContext, inner: innerContext }

        if (outerContext[MultiObjectsIDsKey])
            innerContext[MultiObjectsIDsKey] = outerContext[MultiObjectsIDsKey]

        return context
    }

    protected transformContext(context: OuterContext): InnerContext {
        //TODO: could use proxy

        const innerContext: TransformingDefaultInnerSamplingContext<
                OuterLocation,
                OuterLocationElementType,
                OuterLocationFuseMode,
                InnerLocation,
                InnerLocationElementType,
                InnerLocationFuseMode,
                OuterSample,
                OuterSampleElementType,
                OuterSampleFuseMode,
                OuterContext
            > = {
            ...context,
            [SampleDomainLocationFieldKey]: this.location_field,
            [EncapsulatingDomainSamplingContextParentContext]: context,
            [EncapsulatingDomainSamplingContextParentDomain]: this
        }

        return innerContext as any as InnerContext
    }

    protected init_location_field(context: OuterContext): Field<InnerLocation, InnerLocationElementType, InnerLocationFuseMode> {
        return context[SampleDomainLocationFieldKey] as any as Field<InnerLocation, InnerLocationElementType, InnerLocationFuseMode>
    }

    protected init_transfer_context(
            innerContext: InnerContext,
            outerContext: OuterContext
        ): void {
        const exclude_keys: PropertyPath = [EncapsulatingDomainSamplingContextParentContext, EncapsulatingDomainSamplingContextParentDomain]

        Reflect.ownKeys(innerContext)
            .filter(key => !exclude_keys.includes(key) && !(outerContext as any)[key])
            .forEach(key => (outerContext as any)[key] = (innerContext as any)[key])
    }

    protected init_make_field(innerField: Field<InnerSample, InnerSampleElementType, InnerSampleFuseMode>, context: { inner: InnerContext, outer: OuterContext }): Field<OuterSample, OuterSampleElementType, OuterSampleFuseMode> {
        return innerField as any as Field<OuterSample, OuterSampleElementType, OuterSampleFuseMode>
    }

    @vectorized(TransformingSampleDomain._transformLocation_vectorized)
    protected transformLocation(
            location: OuterLocation,
            context: { outer: OuterContext, inner: InnerContext }
        ): InnerLocation {
        return location as any as InnerLocation
    }

    private static _transformLocation_vectorized<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        OuterLocation extends FieldPoint = FieldPoint,
        OuterLocationElementType extends FieldPoint = OuterLocation,
        OuterLocationFuseMode extends FieldPoint = OuterLocation,
        OuterLocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        OuterSample extends FieldPoint = FieldPoint,
        OuterSampleElementType extends FieldPoint = OuterSample,
        OuterSampleFuseMode extends FieldPoint = OuterSample,
        OuterSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        OuterContext extends
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode> =
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode>,
        OuterLocationVector extends
            FieldPointVector<OuterLocationElementType, OuterLocationContainer> =
            FieldPointVector<OuterLocationElementType, OuterLocationContainer>,
        OuterSampleVector extends
            FieldPointVectorWithMultiObjects<
                    OuterSampleElementType,
                    OuterSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    OuterSampleElementType,
                    OuterSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        OuterVectorContext extends
            FusedVectorSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector
                > =
            FusedVectorSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector
                >,
        InnerLocation extends FieldPoint = FieldPoint,
        InnerLocationElementType extends FieldPoint = InnerLocation,
        InnerLocationFuseMode extends FieldPoint = InnerLocation,
        InnerLocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        InnerSample extends FieldPoint = FieldPoint,
        InnerSampleElementType extends FieldPoint = InnerSample,
        InnerSampleFuseMode extends FieldPoint = InnerSample,
        InnerSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        InnerContext extends
            SamplingContext<InnerLocation, InnerLocationElementType, InnerLocationFuseMode> =
            TransformingDefaultInnerSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterContext
                >,
        InnerLocationVector extends
            FieldPointVector<InnerLocationElementType, InnerLocationContainer> =
            FieldPointVector<InnerLocationElementType, InnerLocationContainer>,
        InnerSampleVector extends
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    InnerSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    InnerSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        InnerVectorContext extends
            FusedVectorSamplingContext<
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector
                > =
            FusedVectorSamplingContext<
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector
                >,
        >(
            this: TransformingSampleDomain<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,

                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector,
                    OuterVectorContext,

                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector,
                    InnerVectorContext
                >,
            location: OuterLocationVector,
            context: { outer: OuterContext, inner: InnerContext }
        ): InnerLocationVector {
        return <InnerLocationVector><unknown>location
    }

    @vectorized(TransformingSampleDomain._transformSample_vectorized)
    protected transformSample(
            sample: InnerSample,
            innerLocation: InnerLocation,
            outerLocation: OuterLocation,
            context: { outer: OuterContext, inner: InnerContext }
        ): OuterSample {
        return sample as any as OuterSample
    }

    protected transformSamples_fused_inplace?(
            result: FusingFieldPointVectorWithMultiObjects<
                OuterSampleElementType,
                ObjIDsT,
                OuterSampleContainer,
                ObjIDsContainer
            >,
            innerLocations: InnerLocationVector,
            outerLocations: OuterLocationVector,
            context: { outer: OuterVectorContext, inner: InnerVectorContext }
        ): void

    private static _transformSample_vectorized<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        OuterLocation extends FieldPoint = FieldPoint,
        OuterLocationElementType extends FieldPoint = OuterLocation,
        OuterLocationFuseMode extends FieldPoint = OuterLocation,
        OuterLocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        OuterSample extends FieldPoint = FieldPoint,
        OuterSampleElementType extends FieldPoint = OuterSample,
        OuterSampleFuseMode extends FieldPoint = OuterSample,
        OuterSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        OuterContext extends
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode> =
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode>,
        OuterLocationVector extends
            FieldPointVector<OuterLocationElementType, OuterLocationContainer> =
            FieldPointVector<OuterLocationElementType, OuterLocationContainer>,
        OuterSampleVector extends
            FieldPointVectorWithMultiObjects<
                    OuterSampleElementType,
                    OuterSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    OuterSampleElementType,
                    OuterSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        OuterVectorContext extends
            FusedVectorSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector
                > =
            FusedVectorSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector
                >,
        InnerLocation extends FieldPoint = FieldPoint,
        InnerLocationElementType extends FieldPoint = InnerLocation,
        InnerLocationFuseMode extends FieldPoint = InnerLocation,
        InnerLocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        InnerSample extends FieldPoint = FieldPoint,
        InnerSampleElementType extends FieldPoint = InnerSample,
        InnerSampleFuseMode extends FieldPoint = InnerSample,
        InnerSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        InnerContext extends
            SamplingContext<InnerLocation, InnerLocationElementType, InnerLocationFuseMode> =
            TransformingDefaultInnerSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterContext
                >,
        InnerLocationVector extends
            FieldPointVector<InnerLocationElementType, InnerLocationContainer> =
            FieldPointVector<InnerLocationElementType, InnerLocationContainer>,
        InnerSampleVector extends
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    InnerSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    InnerSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        InnerVectorContext extends
            FusedVectorSamplingContext<
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector
                > =
            FusedVectorSamplingContext<
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector
                >,
        >(
            this: TransformingSampleDomain<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,

                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector,
                    OuterVectorContext,

                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector,
                    InnerVectorContext
                >,
            samples: InnerSampleVector,
            innerLocations: InnerLocationVector,
            outerLocations: OuterLocationVector,
            context: { outer: OuterContext, inner: InnerContext }
        ): OuterSampleVector {
        return <OuterSampleVector><unknown>samples
    }

    sample_fused_objectCounts(
            objCounts: ObjIDsT,
            outerLocations: OuterLocationVector,
            outerContext: OuterVectorContext,
            sampleType: FieldPointType<OuterSampleElementType>,
            fuseMode: FuseMode<OuterSampleFuseMode>
        ): void {
        type ContextPrivateT = TransformingFusingVectorSampleContextPrivate<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            OuterLocation,
            OuterLocationElementType,
            OuterLocationFuseMode,
            OuterLocationContainer,
            OuterSample,
            OuterSampleElementType,
            OuterSampleFuseMode,
            OuterSampleContainer,
            OuterContext,
            OuterLocationVector,
            OuterSampleVector,
            OuterVectorContext,
            InnerLocation,
            InnerLocationElementType,
            InnerLocationFuseMode,
            InnerLocationContainer,
            InnerSample,
            InnerSampleElementType,
            InnerSampleFuseMode,
            InnerSampleContainer,
            InnerContext,
            InnerLocationVector,
            InnerSampleVector,
            InnerVectorContext
        >

        type InnerDomain = FusingVectorSampleDomain<
            InnerLocation,
            InnerLocationElementType,
            InnerLocationFuseMode,
            InnerLocationContainer,
            InnerSample,
            InnerSampleElementType,
            InnerSampleFuseMode,
            InnerSampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            InnerContext,
            InnerLocationVector,
            InnerSampleVector,
            InnerVectorContext
        >

        const contextPrivate = <ContextPrivateT><unknown>outerContext

        const context = this._transformVectorContext(outerContext)

        makeVectorSamplingContext<
                InnerLocation,
                InnerLocationElementType,
                InnerLocationFuseMode,
                InnerLocationContainer,
                InnerSample,
                InnerSampleElementType,
                InnerSampleFuseMode,
                InnerSampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                InnerContext,
                InnerLocationVector,
                InnerSampleVector,
                InnerVectorContext
            >(this.inner.field, context.inner, outerContext[MultiObjectsIDsKey])

        const transformLocationVectorFunction = new FieldPointVectorFunction<
                {
                    transformLocation(
                        location: OuterLocation,
                        context: { outer: OuterVectorContext, inner: InnerVectorContext }
                    ): InnerLocation
                },
                "transformLocation",
                (
                    location: OuterLocation,
                    context: { outer: OuterVectorContext, inner: InnerVectorContext }
                ) => InnerLocation,
                [OuterLocationElementType, undefined],
                InnerLocationElementType,
                [OuterLocationContainer, undefined],
                InnerLocationContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer
            >(
                "transformLocation",
                [
                    <OuterLocationElementType extends FieldPoint ? FieldPointType<OuterLocationElementType> : OuterLocationElementType>outerContext[SampleDomainLocationFieldKey].elementType,
                    undefined
                ],
                <InnerLocationElementType extends FieldPoint ? FieldPointType<InnerLocationElementType> : undefined>context.inner[SampleDomainLocationFieldKey].elementType,
                [1, MultiObjectsIDsKey]
            )

        const innerLocations = (this.transformsLocation ?? true) ? <InnerLocationVector><unknown>transformLocationVectorFunction.call(this as any, <any>outerLocations, context) : <InnerLocationVector><unknown>outerLocations
        contextPrivate[TransformingTransformedLocationsKey].set(this, innerLocations)

        const {
            sampleType: innerSampleType,
            fuseMode: innerFuseMode
        } = this.transformFusedSettings(sampleType, fuseMode, context)!

        const inner = <InnerDomain><unknown>this.inner
        inner.sample_fused_objectCounts(objCounts, innerLocations, context.inner, innerSampleType, innerFuseMode)
    }

    can_fuse(
            sampleType: FieldPointType<OuterSampleElementType>,
            fuseMode: FuseMode<OuterSampleFuseMode>,
            context: OuterVectorContext
        ): boolean {
        return this.transformFusedSettings(sampleType, fuseMode, this._transformVectorContext(context)) !== undefined
    }

    protected transformFusedSettings(
            sampleType: FieldPointType<OuterSampleElementType>,
            fuseMode: FuseMode<OuterSampleFuseMode>,
            context: {
                outer: OuterVectorContext
                inner: InnerVectorContext
            }
        ): {
            sampleType: FieldPointType<InnerSampleElementType>,
            fuseMode: FuseMode<InnerSampleFuseMode>
        } | undefined {
        return {
            sampleType: <FieldPointType<InnerSampleElementType>><unknown>sampleType,
            fuseMode: <FuseMode<InnerSampleFuseMode>><unknown>fuseMode
        }
    }

    sample_fused_results(
            result: FusingFieldPointVectorWithMultiObjects<
                    OuterSampleElementType,
                    ObjIDsT,
                    OuterSampleContainer,
                    ObjIDsContainer
                >,
            outerLocations: OuterLocationVector,
            outerContext: OuterVectorContext,
            sampleType: FieldPointType<OuterSampleElementType>,
            fuseMode: FuseMode<OuterSampleFuseMode>
        ): void {
        type ContextPrivateT = TransformingFusingVectorSampleContextPrivate<
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            OuterLocation,
            OuterLocationElementType,
            OuterLocationFuseMode,
            OuterLocationContainer,
            OuterSample,
            OuterSampleElementType,
            OuterSampleFuseMode,
            OuterSampleContainer,
            OuterContext,
            OuterLocationVector,
            OuterSampleVector,
            OuterVectorContext,
            InnerLocation,
            InnerLocationElementType,
            InnerLocationFuseMode,
            InnerLocationContainer,
            InnerSample,
            InnerSampleElementType,
            InnerSampleFuseMode,
            InnerSampleContainer,
            InnerContext,
            InnerLocationVector,
            InnerSampleVector,
            InnerVectorContext
        >

        type InnerDomain = FusingVectorSampleDomain<
            InnerLocation,
            InnerLocationElementType,
            InnerLocationFuseMode,
            InnerLocationContainer,
            InnerSample,
            InnerSampleElementType,
            InnerSampleFuseMode,
            InnerSampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer,
            InnerContext,
            InnerLocationVector,
            InnerSampleVector,
            InnerVectorContext
        >

        const contextPrivate = <ContextPrivateT><unknown>outerContext

        const context = this._transformVectorContext(outerContext)

        makeVectorSamplingContext<
                InnerLocation,
                InnerLocationElementType,
                InnerLocationFuseMode,
                InnerLocationContainer,
                InnerSample,
                InnerSampleElementType,
                InnerSampleFuseMode,
                InnerSampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                InnerContext,
                InnerLocationVector,
                InnerSampleVector,
                InnerVectorContext
            >(this.inner.field, context.inner, outerContext[MultiObjectsIDsKey])

        const innerLocations = contextPrivate[TransformingTransformedLocationsKey].get(this)!

        const inner = <InnerDomain><unknown>this.inner

        // inner.sample_fused(<InnerSampleVector>outerSamples, innerLocations, innerContext)

        const transformSampleVectorFunction = new FieldPointVectorFunction<
            {
                transformSample(
                    sample: InnerSample,
                    innerLocation: InnerLocation,
                    outerLocation: OuterLocation,
                    context: { outer: OuterVectorContext, inner: InnerVectorContext }
                ): OuterSample
            },
            "transformSample",
            (
                sample: InnerSample,
                innerLocation: InnerLocation,
                outerLocation: OuterLocation,
                context: { outer: OuterVectorContext, inner: InnerVectorContext }
            ) => OuterSample,
            [
                InnerSampleElementType,
                InnerLocationElementType,
                OuterLocationElementType,
                undefined
            ],
            OuterSampleElementType,
            [
                InnerSampleContainer,
                InnerLocationContainer,
                OuterLocationContainer,
                undefined
            ],
            OuterSampleContainer,
            Objects,
            ObjIDsT,
            ObjIDsContainer
        >(
            "transformSample",
            [
                <InnerSampleElementType extends FieldPoint ? FieldPointType<InnerSampleElementType> : InnerSampleElementType>this.inner.field.elementType,
                <InnerLocationElementType extends FieldPoint ? FieldPointType<InnerLocationElementType> : InnerLocationElementType>context.inner[SampleDomainLocationFieldKey].elementType,
                <OuterLocationElementType extends FieldPoint ? FieldPointType<OuterLocationElementType> : OuterLocationElementType>context.outer[SampleDomainLocationFieldKey].elementType,
                undefined
            ],
            <OuterSampleElementType extends FieldPoint ? FieldPointType<OuterSampleElementType> : undefined>this.field.elementType,
            [3, "outer", MultiObjectsIDsKey]
        )

        const {
            sampleType: innerSampleType,
            fuseMode: innerFuseMode
        } = this.transformFusedSettings(sampleType, fuseMode, context)!

        if (this.transformsSample ?? true) {
            if (this.transformSamples_fused_inplace &&
                inner.can_fuse(innerSampleType, innerFuseMode, context.inner)) {
                inner.sample_fused_results(<any>result, innerLocations, context.inner, innerSampleType, innerFuseMode)

                this.transformSamples_fused_inplace(
                    result,
                    innerLocations,
                    outerLocations,
                    context
                )
            }
            else {
                const innerSamples = context.inner[VectorSampleFunction](inner, innerLocations, context.inner)

                const outerSamples = <OuterSampleVector><unknown>transformSampleVectorFunction.call(<any>this, <any>innerSamples, <any>innerLocations, <any>outerLocations, context)

                fuseVectors(
                    sampleType,
                    this.field.elementType,
                    this.field.fuseMode,
                    [outerSamples],
                    outerContext[MultiObjectsIDsKey],
                    result,
                    true
                )
            }
        }
        else {
            inner.sample_fused_results(<any>result, innerLocations, context.inner, <FieldPointType<InnerSampleElementType>><unknown>sampleType, <FuseMode<InnerSampleFuseMode>><unknown>fuseMode)
        }
    }

    @vectorized(TransformingSampleDomain._sample_vectorized)
    sample(outerLocation: OuterLocation, outerContext: OuterContext): OuterSample {
        const innerContext = this.transformContext(outerContext)
        const context = { outer: outerContext, inner: innerContext }
        const innerLocation = this.transformLocation(outerLocation, context)
        const innerSample = this.inner.sample(innerLocation, innerContext)
        return this.transformSample(innerSample, innerLocation, outerLocation, context)
    }

    private static _sample_vectorized<
        Objects extends MultiObjectsTemplate = MultiObjectsTemplate,
        ObjIDsT extends IndicesTypedArray = Uint32Array,
        ObjIDsContainer extends FieldPointVectorContainerStatic<ObjIDsT> = FieldPointVectorContainerStatic<ObjIDsT>,
        OuterLocation extends FieldPoint = FieldPoint,
        OuterLocationElementType extends FieldPoint = OuterLocation,
        OuterLocationFuseMode extends FieldPoint = OuterLocation,
        OuterLocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        OuterSample extends FieldPoint = FieldPoint,
        OuterSampleElementType extends FieldPoint = OuterSample,
        OuterSampleFuseMode extends FieldPoint = OuterSample,
        OuterSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        OuterContext extends
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode> =
            SamplingContext<OuterLocation, OuterLocationElementType, OuterLocationFuseMode>,
        OuterLocationVector extends
            FieldPointVector<OuterLocationElementType, OuterLocationContainer> =
            FieldPointVector<OuterLocationElementType, OuterLocationContainer>,
        OuterSampleVector extends
            FieldPointVectorWithMultiObjects<
                    OuterSampleElementType,
                    OuterSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    OuterSampleElementType,
                    OuterSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        OuterVectorContext extends
            FusedVectorSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector
                > =
            FusedVectorSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector
                >,
        InnerLocation extends FieldPoint = FieldPoint,
        InnerLocationElementType extends FieldPoint = InnerLocation,
        InnerLocationFuseMode extends FieldPoint = InnerLocation,
        InnerLocationContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        InnerSample extends FieldPoint = FieldPoint,
        InnerSampleElementType extends FieldPoint = InnerSample,
        InnerSampleFuseMode extends FieldPoint = InnerSample,
        InnerSampleContainer extends FieldPointVectorContainerStatic = FieldPointVectorContainerStatic,
        InnerContext extends
            SamplingContext<InnerLocation, InnerLocationElementType, InnerLocationFuseMode> =
            TransformingDefaultInnerSamplingContext<
                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterContext
                >,
        InnerLocationVector extends
            FieldPointVector<InnerLocationElementType, InnerLocationContainer> =
            FieldPointVector<InnerLocationElementType, InnerLocationContainer>,
        InnerSampleVector extends
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    InnerSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                > =
            FieldPointVectorWithMultiObjects<
                    InnerSampleElementType,
                    InnerSampleContainer,
                    ObjIDsT,
                    ObjIDsContainer
                >,
        InnerVectorContext extends
            FusedVectorSamplingContext<
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector
                > =
            FusedVectorSamplingContext<
                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector
                >,
        >(
            this: TransformingSampleDomain<
                    Objects,
                    ObjIDsT,
                    ObjIDsContainer,

                    OuterLocation,
                    OuterLocationElementType,
                    OuterLocationFuseMode,
                    OuterLocationContainer,
                    OuterSample,
                    OuterSampleElementType,
                    OuterSampleFuseMode,
                    OuterSampleContainer,
                    OuterContext,
                    OuterLocationVector,
                    OuterSampleVector,
                    OuterVectorContext,

                    InnerLocation,
                    InnerLocationElementType,
                    InnerLocationFuseMode,
                    InnerLocationContainer,
                    InnerSample,
                    InnerSampleElementType,
                    InnerSampleFuseMode,
                    InnerSampleContainer,
                    InnerContext,
                    InnerLocationVector,
                    InnerSampleVector,
                    InnerVectorContext
                >,
            outerLocations: OuterLocationVector,
            outerContext: OuterVectorContext
        ): OuterSampleVector {
        const innerContext = <InnerVectorContext><unknown>this.transformContext(outerContext)
        if (outerContext[MultiObjectsIDsKey]) innerContext[MultiObjectsIDsKey] = outerContext[MultiObjectsIDsKey]
        makeVectorSamplingContext<
                InnerLocation,
                InnerLocationElementType,
                InnerLocationFuseMode,
                InnerLocationContainer,
                InnerSample,
                InnerSampleElementType,
                InnerSampleFuseMode,
                InnerSampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer,
                InnerContext,
                InnerLocationVector,
                InnerSampleVector,
                InnerVectorContext
            >(this.inner.field, innerContext, outerContext[MultiObjectsIDsKey])

        const context = { outer: outerContext, inner: innerContext }

        const transformLocationVectorFunction = new FieldPointVectorFunction<
                {
                    transformLocation(
                        location: OuterLocation,
                        context: { outer: SamplingContext, inner: SamplingContext }
                    ): InnerLocation
                },
                "transformLocation",
                (
                    location: OuterLocation,
                    context: { outer: SamplingContext, inner: SamplingContext }
                ) => InnerLocation,
                [OuterLocationElementType, undefined],
                InnerLocationElementType,
                [OuterLocationContainer, undefined],
                InnerLocationContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer
            >(
                "transformLocation",
                [
                    <OuterLocationElementType extends FieldPoint ? FieldPointType<OuterLocationElementType> : OuterLocationElementType>outerContext[SampleDomainLocationFieldKey].elementType,
                    undefined
                ],
                <InnerLocationElementType extends FieldPoint ? FieldPointType<InnerLocationElementType> : undefined>innerContext[SampleDomainLocationFieldKey].elementType,
                [1, MultiObjectsIDsKey]
            )

        const transformSampleVectorFunction = new FieldPointVectorFunction<
                {
                    transformSample(
                        sample: InnerSample,
                        innerLocation: InnerLocation,
                        outerLocation: OuterLocation,
                        context: { outer: OuterVectorContext, inner: InnerVectorContext }
                    ): OuterSample
                },
                "transformSample",
                (
                    sample: InnerSample,
                    innerLocation: InnerLocation,
                    outerLocation: OuterLocation,
                    context: { outer: OuterVectorContext, inner: InnerVectorContext }
                ) => OuterSample,
                [
                    InnerSampleElementType,
                    InnerLocationElementType,
                    OuterLocationElementType,
                    undefined
                ],
                OuterSampleElementType,
                [
                    InnerSampleContainer,
                    InnerLocationContainer,
                    OuterLocationContainer,
                    undefined
                ],
                OuterSampleContainer,
                Objects,
                ObjIDsT,
                ObjIDsContainer
            >(
                "transformSample",
                [
                    <InnerSampleElementType extends FieldPoint ? FieldPointType<InnerSampleElementType> : InnerSampleElementType>this.inner.field.elementType,
                    <InnerLocationElementType extends FieldPoint ? FieldPointType<InnerLocationElementType> : InnerLocationElementType>context.inner[SampleDomainLocationFieldKey].elementType,
                    <OuterLocationElementType extends FieldPoint ? FieldPointType<OuterLocationElementType> : OuterLocationElementType>context.outer[SampleDomainLocationFieldKey].elementType,
                    undefined
                ],
                <OuterSampleElementType extends FieldPoint ? FieldPointType<OuterSampleElementType> : undefined>this.field.elementType,
                [3, "outer", MultiObjectsIDsKey]
            )

        const innerLocations = (this.transformsLocation ?? true) ? <InnerLocationVector><unknown>transformLocationVectorFunction.call(this as any, <any>outerLocations, context) : <InnerLocationVector><unknown>outerLocations
        const innerSamples = <InnerSampleVector>innerContext[VectorSampleFunction](this.inner, innerLocations, innerContext)
        return (this.transformsSample ?? true) ? <OuterSampleVector><unknown>transformSampleVectorFunction.call(this as any, <any>innerSamples, <any>innerLocations, <any>outerLocations, context) : <OuterSampleVector><unknown>innerSamples
    }
}